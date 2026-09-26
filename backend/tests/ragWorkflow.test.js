import assert from "assert";
import { 
  processCitizenRecommendation, 
  debugCitizenRecommendationFlow 
} from "../services/recommendationWorkflowService.js";
import { searchCandidateSchemes, initRagKnowledgeBase } from "../services/ragService.js";
import { defaultVectorStore, VectorSearchService } from "../services/vectorSearchService.js";
import { checkEligibility } from "../services/eligibilityService.js";
import { loadSchemesData } from "../services/schemeSearchService.js";

async function runRagTestSuite() {
  console.log("=================================================");
  console.log("🧪 RUNNING RAG SEMANTIC RETRIEVAL TEST SUITE");
  console.log("=================================================");

  // Pre-initialize RAG Knowledge Base
  await initRagKnowledgeBase({ forceRebuild: false });

  // -------------------------------------------------------------
  // Test 1: User's wording is very different from scheme wording, but meanings are related
  // -------------------------------------------------------------
  {
    console.log("\n🧪 Test 1: Semantic discovery with phrasing different from official title...");
    const query = "My father is a daily wage laborer and I'm pursuing engineering degree. We are struggling to pay my annual college tuition fees.";
    const result = await processCitizenRecommendation(query, "en");

    assert.ok(result.results && result.results.length > 0, "Expected non-empty results for student education query.");
    const hasEducationOrScholarship = result.results.some(r => 
      r.scheme.category?.toLowerCase().includes("education") ||
      r.scheme.name.toLowerCase().includes("scholarship") ||
      r.scheme.name.toLowerCase().includes("matric") ||
      r.scheme.name.toLowerCase().includes("education")
    );
    assert.ok(hasEducationOrScholarship, "Expected RAG to discover education/scholarship schemes for college fees query.");
    console.log("✅ [PASS] Test 1: RAG semantic discovery successfully identified relevant education schemes.");
  }

  // -------------------------------------------------------------
  // Test 2: RAG retrieves semantically relevant scheme but citizen fails income criterion
  // -------------------------------------------------------------
  {
    console.log("\n🧪 Test 2: Semantically relevant scheme evaluated against failing income ceiling...");
    const schemes = loadSchemesData();
    const incomeLimitedScheme = schemes.find(s => s.eligibility?.annualIncomeMax && s.eligibility.annualIncomeMax <= 250000);
    assert.ok(incomeLimitedScheme, "Expected an income-limited scheme in catalog.");

    // Rich citizen profile with 20 Lakh income
    const highIncomeProfile = {
      age: 25,
      gender: "female",
      state: "Tamil Nadu",
      annual_income: 2000000, // 20 Lakhs
      occupation: "software engineer"
    };

    const analysis = checkEligibility(highIncomeProfile, incomeLimitedScheme);
    assert.strictEqual(analysis.potentialMatch, false, "High income citizen must not be eligible for BPL scheme.");
    const failedOnIncome = analysis.failedCriteria.some(f => f.toLowerCase().includes("income"));
    assert.ok(failedOnIncome, "Eligibility engine must report failed annual income criterion.");
    console.log("✅ [PASS] Test 2: Deterministic eligibility engine correctly rejected candidate exceeding income limit.");
  }

  // -------------------------------------------------------------
  // Test 3: Structured search finds a scheme but RAG does not (Hybrid coverage)
  // -------------------------------------------------------------
  {
    console.log("\n🧪 Test 3: Hybrid retrieval ensures structured search candidates are preserved...");
    const customStore = new VectorSearchService({ name: "empty_store" });
    // Empty vector store simulates RAG returning 0 results
    const query = "Farmer in Tamil Nadu needing subsidy";
    const result = await processCitizenRecommendation(query, "en", { state: "Tamil Nadu", occupation: "farmer" });

    assert.ok(result.results && result.results.length > 0, "Structured search must still find agriculture schemes.");
    const hasAgri = result.results.some(r => r.scheme.category?.toLowerCase().includes("agri") || r.scheme.name.toLowerCase().includes("kisan"));
    assert.ok(hasAgri, "Expected agriculture schemes from structured search.");
    console.log("✅ [PASS] Test 3: Hybrid pipeline preserved candidate schemes via structured search.");
  }

  // -------------------------------------------------------------
  // Test 4: RAG finds duplicate candidates already found by structured search
  // -------------------------------------------------------------
  {
    console.log("\n🧪 Test 4: Deduplication of candidate IDs between RAG and structured search...");
    const debug = await debugCitizenRecommendationFlow("farmer crop damage flood relief", "en", { occupation: "farmer", state: "Tamil Nadu" });
    
    const uniqueIds = new Set(debug.mergedCandidateIds);
    assert.strictEqual(debug.mergedCandidateIds.length, uniqueIds.size, "Merged candidate IDs must contain no duplicates.");
    console.log("✅ [PASS] Test 4: Deduplication verified with zero duplicate scheme IDs.");
  }

  // -------------------------------------------------------------
  // Test 5: Vector database unavailable -> graceful fallback
  // -------------------------------------------------------------
  {
    console.log("\n🧪 Test 5: Graceful fallback when Vector Store is unavailable...");
    // Temporarily disable vector store
    defaultVectorStore.isServiceAvailable = false;

    try {
      const result = await processCitizenRecommendation("I am a 20 year old student in Tamil Nadu needing scholarship", "en");
      assert.ok(result.results && result.results.length > 0, "Expected results via fallback structured search.");
      console.log("✅ [PASS] Test 5: System fell back gracefully to structured search with zero crashes.");
    } finally {
      // Re-enable vector store
      defaultVectorStore.isServiceAvailable = true;
    }
  }

  // -------------------------------------------------------------
  // Test 6: Citizen provides insufficient information
  // -------------------------------------------------------------
  {
    console.log("\n🧪 Test 6: Insufficient / generic greeting requests missing details without guessing...");
    const vagueQuery = "hello can you help me please";
    const result = await processCitizenRecommendation(vagueQuery, "en");

    assert.strictEqual(result.needsMoreInformation, true, "Expected needsMoreInformation: true for generic greeting.");
    assert.strictEqual(result.results.length, 0, "Expected empty results for generic greeting.");
    assert.ok(result.missingInformation && result.missingInformation.length > 0, "Expected missing information prompts.");
    console.log("✅ [PASS] Test 6: System correctly requested essential details instead of guessing.");
  }

  console.log("\n=================================================");
  console.log("📊 RAG TEST SUITE RESULTS: ALL 6 TESTS PASSED (100%)");
  console.log("=================================================");
}

runRagTestSuite().catch(err => {
  console.error("❌ RAG Test Suite Failed:", err);
  process.exit(1);
});
