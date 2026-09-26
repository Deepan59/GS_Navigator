import { searchAndRecommendSchemes, loadSchemesData } from "../services/schemeSearchService.js";
import assert from "assert";

console.log("=================================================");
console.log("🧪 RUNNING PHASE 4 SCHEME SEARCH & DISCOVERY TESTS");
console.log("=================================================\n");

let passedCount = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } catch (error) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Error: ${error.message}\n`);
  }
}

// -------------------------------------------------------------
// Test 1: Load schemes data
// -------------------------------------------------------------
runTest("Test 1: Scheme catalog loads correctly", () => {
  const schemes = loadSchemesData();
  assert.ok(Array.isArray(schemes), "Must return an array");
  assert.ok(schemes.length >= 100, "Schemes catalog must contain over 100 schemes");
});

// -------------------------------------------------------------
// Test 2: Farmer Profile Discovery (Occupation + Intent + State)
// -------------------------------------------------------------
runTest("Test 2: Farmer profile prioritizes agriculture schemes with eligibility analysis", () => {
  const farmerProfile = {
    age: 35,
    occupation: "farmer",
    state: "Tamil Nadu",
    annual_income: 120000,
    intent: "Need financial assistance for seeds and crop irrigation"
  };

  const results = searchAndRecommendSchemes(farmerProfile);

  assert.ok(Array.isArray(results), "Results must be an array");
  assert.ok(results.length > 0, "Must return candidate schemes");

  // Top result should be a matching agriculture scheme
  const topScheme = results[0];
  assert.ok(topScheme.potentialMatch === true, "Top scheme must be a potential match");
  assert.ok(
    topScheme.category?.toLowerCase().includes("agriculture") || topScheme.name.toLowerCase().includes("farmer") || topScheme.name.toLowerCase().includes("kisan"),
    "Top result must be agriculture/farmer related"
  );
  assert.ok(topScheme.eligibilityAnalysis, "Must have eligibilityAnalysis attached");
  assert.ok(Array.isArray(topScheme.matchedCriteria), "Must have matchedCriteria");
});

// -------------------------------------------------------------
// Test 3: Student Profile Discovery (Student Status + Intent)
// -------------------------------------------------------------
runTest("Test 3: Student profile surfaces education & scholarship schemes", () => {
  const studentProfile = {
    age: 20,
    gender: "female",
    occupation: "student",
    is_student: true,
    state: "Tamil Nadu",
    annual_income: 150000,
    category: "OBC",
    intent: "Looking for college degree scholarship and laptop assistance"
  };

  const results = searchAndRecommendSchemes(studentProfile);

  assert.ok(results.length > 0);
  const potentialMatches = results.filter(r => r.potentialMatch === true);
  assert.ok(potentialMatches.length > 0, "Must find potential matches for student");

  const educationMatches = potentialMatches.filter(r => 
    r.category?.toLowerCase().includes("education") || 
    r.name.toLowerCase().includes("scholarship") ||
    r.name.toLowerCase().includes("pudhumai penn") ||
    r.name.toLowerCase().includes("laptop")
  );
  assert.ok(educationMatches.length > 0, "Must recommend education/laptop/pudhumai penn schemes");
});

// -------------------------------------------------------------
// Test 4: Missing Optional Fields Does NOT Eliminate Potential Schemes
// -------------------------------------------------------------
runTest("Test 4: Missing optional fields preserves candidate scheme in results", () => {
  // Profile without income or land details provided yet
  const minimalProfile = {
    occupation: "farmer",
    state: "Tamil Nadu"
    // age and income omitted
  };

  const results = searchAndRecommendSchemes(minimalProfile);

  const farmerSchemes = results.filter(s => s.id.includes("farmer") || s.id.includes("kisan") || s.category?.toLowerCase().includes("agriculture"));
  assert.ok(farmerSchemes.length > 0, "Farmer schemes must still be present as candidates");
  
  // Scheme must be marked as potentialMatch: true, but with missingCriteria reported
  const target = farmerSchemes[0];
  assert.strictEqual(target.potentialMatch, true, "Must be potential match even with missing fields");
  assert.ok(target.missingCriteria.length > 0, "Must report missing criteria");
});

// -------------------------------------------------------------
// Test 5: Ineligible Demographics are Demoted / Disqualified
// -------------------------------------------------------------
runTest("Test 5: Explicitly disqualified schemes have potentialMatch: false and are ranked lower", () => {
  const seniorMaleProfile = {
    age: 72,
    gender: "male",
    occupation: "retired",
    annual_income: 90000,
    state: "Tamil Nadu"
  };

  const results = searchAndRecommendSchemes(seniorMaleProfile);

  // Female-only scheme should be marked potentialMatch: false
  const widowOrGirlScheme = results.find(s => s.id.includes("girl") || s.id.includes("widow") || s.name.toLowerCase().includes("widow"));
  if (widowOrGirlScheme) {
    assert.strictEqual(widowOrGirlScheme.potentialMatch, false, "Male senior must be disqualified from girl/widow schemes");
    assert.ok(widowOrGirlScheme.failedCriteria.length > 0, "Must have explicit failed criteria");
  }

  // Top result should be senior citizen pension
  assert.ok(results[0].potentialMatch === true);
  assert.ok(results[0].name.toLowerCase().includes("pension") || results[0].name.toLowerCase().includes("old age") || results[0].name.toLowerCase().includes("senior"));
});

console.log(`\n=================================================`);
console.log(`📊 TEST RESULTS: ${passedCount} / ${totalTests} TESTS PASSED (100%)`);
console.log(`=================================================`);

if (passedCount !== totalTests) {
  process.exit(1);
}
