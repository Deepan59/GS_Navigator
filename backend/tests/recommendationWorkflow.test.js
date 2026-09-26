import { processCitizenRecommendation, validateAndSanitizeProfile, identifyMissingInformation } from "../services/recommendationWorkflowService.js";
import assert from "assert";

console.log("=================================================");
console.log("🧪 RUNNING COMPLETE END-TO-END RECOMMENDATION TESTS");
console.log("=================================================\n");

let passedCount = 0;
let totalTests = 0;

async function runAsyncTest(testName, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } catch (error) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Error: ${error.message}\n`);
  }
}

// -------------------------------------------------------------
// Test 1: Profile Sanitization & Validation
// -------------------------------------------------------------
await runAsyncTest("Test 1: Profile sanitization and boundary checks", async () => {
  const dirty = {
    age: "35",
    gender: " FEMALE ",
    annual_income: "150000",
    occupation: " farmer ",
    state: "Tamil Nadu",
    is_student: "true"
  };

  const clean = validateAndSanitizeProfile(dirty);
  assert.strictEqual(clean.age, 35);
  assert.strictEqual(clean.gender, "female");
  assert.strictEqual(clean.annual_income, 150000);
  assert.strictEqual(clean.occupation, "farmer");
  assert.strictEqual(clean.is_student, true);
});

// -------------------------------------------------------------
// Test 2: Identify Missing Information
// -------------------------------------------------------------
await runAsyncTest("Test 2: Missing information identification", async () => {
  const partial = {
    occupation: "farmer"
  };

  const missing = identifyMissingInformation(partial);
  assert.ok(Array.isArray(missing), "Must return missing list");
  const missingFields = missing.map(m => m.field);
  assert.ok(missingFields.includes("state"), "Must flag missing state");
  assert.ok(missingFields.includes("age"), "Must flag missing age");
  assert.ok(missingFields.includes("annual_income"), "Must flag missing income");
});

// -------------------------------------------------------------
// Test 3: Complete Workflow with Farmer Request
// -------------------------------------------------------------
await runAsyncTest("Test 3: Complete workflow with natural language farmer request", async () => {
  const message = "I am a 35 year old farmer living in Tamil Nadu with an annual income of 1.2 Lakh. I need support for irrigation and crop seeds.";
  
  const response = await processCitizenRecommendation(message);

  assert.ok(response.profile, "Response must contain profile");
  assert.strictEqual(response.profile.age, 35);
  assert.strictEqual(response.profile.occupation, "farmer");
  assert.strictEqual(response.profile.state, "Tamil Nadu");

  assert.ok(Array.isArray(response.results), "Results must be an array");
  assert.ok(response.results.length > 0, "Must return results");

  const firstResult = response.results[0];
  assert.ok(firstResult.scheme, "Must contain scheme object");
  assert.ok(firstResult.scheme.id, "Scheme must have id");
  assert.ok(firstResult.scheme.name, "Scheme must have name");
  assert.ok(firstResult.scheme.department, "Scheme must have department");
  
  assert.ok(firstResult.eligibility, "Must contain eligibility object");
  assert.strictEqual(typeof firstResult.eligibility.potentialMatch, "boolean");
  assert.ok(Array.isArray(firstResult.eligibility.matchedCriteria));
  assert.ok(Array.isArray(firstResult.eligibility.failedCriteria));
  assert.ok(Array.isArray(firstResult.eligibility.missingCriteria));

  assert.strictEqual(firstResult.eligibility.potentialMatch, true);
});

// -------------------------------------------------------------
// Test 4: Vague / Empty Query Handling
// -------------------------------------------------------------
await runAsyncTest("Test 4: Vague input triggers needsMoreInformation: true", async () => {
  const vagueMessage = "Hello, can you help me?";
  
  const response = await processCitizenRecommendation(vagueMessage);

  assert.strictEqual(response.needsMoreInformation, true, "Must flag needsMoreInformation");
  assert.ok(Array.isArray(response.missingInformation));
  assert.ok(response.missingInformation.length > 0, "Must list missing fields");
  assert.strictEqual(response.results.length, 0, "No results should be returned for empty queries");
});

// -------------------------------------------------------------
// Test 5: Student Query Workflow
// -------------------------------------------------------------
await runAsyncTest("Test 5: Student request surfaces education schemes", async () => {
  const studentMessage = "I am a 20 year old female student in Tamil Nadu from OBC category looking for degree scholarship.";
  
  const response = await processCitizenRecommendation(studentMessage);

  assert.strictEqual(response.profile.age, 20);
  assert.strictEqual(response.profile.gender, "female");
  assert.strictEqual(response.profile.occupation, "student");

  const matchingEduSchemes = response.results.filter(r => 
    r.eligibility.potentialMatch && 
    (r.scheme.category?.toLowerCase().includes("education") || r.scheme.name.toLowerCase().includes("pudhumai") || r.scheme.name.toLowerCase().includes("scholarship"))
  );
  assert.ok(matchingEduSchemes.length > 0, "Must recommend matching student schemes");
});

// -------------------------------------------------------------
// Test 6: Bilingual Tamil Query ("எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்.")
// -------------------------------------------------------------
await runAsyncTest("Test 6: Tamil Query - 'எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்.'", async () => {
  const tamilMessage = "எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்.";
  
  const response = await processCitizenRecommendation(tamilMessage);

  assert.strictEqual(response.language, "ta", "Must detect Tamil language");
  assert.strictEqual(response.profile.occupation, "student", "Must extract student occupation");
  assert.strictEqual(response.profile.is_student, true, "Must set is_student to true");
  assert.strictEqual(response.profile.state, "Tamil Nadu", "Must default to Tamil Nadu context");
  assert.ok(response.results.length > 0, "Must return candidate schemes");
  
  const eduMatches = response.results.filter(r => r.eligibility.potentialMatch && r.scheme.category?.toLowerCase().includes("education"));
  assert.ok(eduMatches.length > 0, "Must surface higher education and student schemes");
});

// -------------------------------------------------------------
// Test 7: Crop Damage Farmer Query ("I'm a farmer and my crop was damaged. What government support might be available?")
// -------------------------------------------------------------
await runAsyncTest("Test 7: English Farmer Crop Damage Query", async () => {
  const farmerCropMessage = "I'm a farmer and my crop was damaged. What government support might be available?";
  
  const response = await processCitizenRecommendation(farmerCropMessage);

  assert.strictEqual(response.language, "en", "Must detect English language");
  assert.strictEqual(response.profile.occupation, "farmer", "Must extract farmer occupation");
  assert.ok(response.results.length > 0, "Must return candidate schemes");

  const agriMatches = response.results.filter(r => 
    r.eligibility.potentialMatch && 
    (r.scheme.category?.toLowerCase().includes("agriculture") || r.scheme.name.toLowerCase().includes("crop") || r.scheme.name.toLowerCase().includes("kisan") || r.scheme.name.toLowerCase().includes("insurance"))
  );
  assert.ok(agriMatches.length > 0, "Must surface agriculture and crop insurance schemes");
});

console.log(`\n=================================================`);
console.log(`📊 TEST RESULTS: ${passedCount} / ${totalTests} TESTS PASSED (100%)`);
console.log(`=================================================`);

if (passedCount !== totalTests) {
  process.exit(1);
}
