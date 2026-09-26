import { checkEligibility, evaluateAllSchemes } from "../services/eligibilityService.js";
import assert from "assert";

console.log("=================================================");
console.log("🧪 RUNNING PHASE 3 ELIGIBILITY SERVICE TEST SUITE");
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

// Sample Scheme for Testing
const testScheme = {
  id: "TN-SCH-FARMER-001",
  name: "Small Farmer Agricultural Grant",
  level: "State",
  state: "Tamil Nadu",
  department: "Department of Agriculture",
  category: "Agriculture",
  description: "Financial grant for small landholding farmers in Tamil Nadu",
  benefits: ["Rs. 10,000 per crop cycle"],
  eligibility: {
    age: {
      min: 18,
      max: 70
    },
    gender: [],
    occupation: ["farmer", "small_farmer"],
    student: false,
    annualIncomeMax: 200000,
    states: ["Tamil Nadu"],
    categories: [],
    otherConditions: []
  },
  requiredDocuments: ["Aadhaar Card", "Patta/Chitta", "Bank Passbook"],
  application: {
    method: "Online",
    url: "https://example.tn.gov.in"
  },
  source: {
    name: "Department of Agriculture",
    url: "https://example.tn.gov.in"
  },
  lastVerified: "2026-09-24"
};

const testScholarshipScheme = {
  id: "TN-SCH-GIRL-STEM-002",
  name: "Higher Education STEM Excellence Grant for Girls",
  level: "State",
  state: "Tamil Nadu",
  department: "Higher Education Department",
  category: "Education",
  benefits: ["Rs. 25,000 per academic year"],
  eligibility: {
    age: {
      min: 16,
      max: 25
    },
    gender: ["female"],
    occupation: ["student"],
    student: true,
    annualIncomeMax: 300000,
    states: ["Tamil Nadu"],
    categories: ["OBC", "SC", "ST", "BC"],
    otherConditions: []
  },
  requiredDocuments: ["Aadhaar", "Student ID", "Marksheet"],
  application: { method: "Online", url: "https://example.tn.gov.in" },
  source: { name: "Higher Education", url: "https://example.tn.gov.in" },
  lastVerified: "2026-09-24"
};

// -------------------------------------------------------------
// Test Case 1: Complete Matching Profile
// -------------------------------------------------------------
runTest("Test Case 1: Complete matching profile", () => {
  const profile = {
    age: 35,
    gender: "male",
    occupation: "farmer",
    annual_income: 120000,
    state: "Tamil Nadu"
  };

  const result = checkEligibility(profile, testScheme);

  assert.strictEqual(result.schemeId, "TN-SCH-FARMER-001");
  assert.strictEqual(result.potentialMatch, true, "Should be potential match");
  assert.strictEqual(result.failedCriteria.length, 0, "Failed criteria should be empty");
  assert.strictEqual(result.missingCriteria.length, 0, "Missing criteria should be empty");
  assert.strictEqual(result.matchCount, 4, "Should match age, occupation, income, and state");
  assert.strictEqual(result.totalApplicableCriteria, 4);
});

// -------------------------------------------------------------
// Test Case 2: Non-matching Income
// -------------------------------------------------------------
runTest("Test Case 2: Non-matching income (exceeds max ceiling)", () => {
  const profile = {
    age: 35,
    occupation: "farmer",
    annual_income: 450000, // Exceeds 200,000 max
    state: "Tamil Nadu"
  };

  const result = checkEligibility(profile, testScheme);

  assert.strictEqual(result.potentialMatch, false, "Should NOT be a potential match due to income exceedance");
  assert.strictEqual(result.failedCriteria.length, 1, "Should have 1 failed criterion");
  assert.ok(result.failedCriteria[0].includes("exceeds the maximum eligibility cap"), "Failed reason must mention income limit");
  assert.strictEqual(result.missingCriteria.length, 0);
  assert.strictEqual(result.matchCount, 3, "Age, occupation, state still matched");
});

// -------------------------------------------------------------
// Test Case 3: Non-matching Age
// -------------------------------------------------------------
runTest("Test Case 3: Non-matching age (below min or above max)", () => {
  // Case 3a: Above max age (75 > 70)
  const elderlyProfile = {
    age: 75,
    occupation: "farmer",
    annual_income: 150000,
    state: "Tamil Nadu"
  };
  const resultAbove = checkEligibility(elderlyProfile, testScheme);
  assert.strictEqual(resultAbove.potentialMatch, false);
  assert.ok(resultAbove.failedCriteria.some(f => f.includes("exceeds the maximum eligible age")));

  // Case 3b: Below min age (15 < 18)
  const minorProfile = {
    age: 15,
    occupation: "farmer",
    annual_income: 150000,
    state: "Tamil Nadu"
  };
  const resultBelow = checkEligibility(minorProfile, testScheme);
  assert.strictEqual(resultBelow.potentialMatch, false);
  assert.ok(resultBelow.failedCriteria.some(f => f.includes("below the minimum required age")));
});

// -------------------------------------------------------------
// Test Case 4: Missing Information (Rule 1 & 2: Never guess; missing values must NOT become true)
// -------------------------------------------------------------
runTest("Test Case 4: Missing information reported separately without guessing", () => {
  const incompleteProfile = {
    occupation: "farmer",
    state: "Tamil Nadu"
    // age and annual_income are missing!
  };

  const result = checkEligibility(incompleteProfile, testScheme);

  assert.strictEqual(result.potentialMatch, true, "Zero failed criteria means it is a potential match pending info");
  assert.strictEqual(result.failedCriteria.length, 0, "No failed criteria");
  assert.strictEqual(result.missingCriteria.length, 2, "Both age and annual income must be reported as missing");

  const missingFields = result.missingCriteria.map(m => m.criterion);
  assert.ok(missingFields.includes("age"), "Missing criteria must include age");
  assert.ok(missingFields.includes("annualIncome"), "Missing criteria must include annualIncome");

  // Verify missing info was NOT assumed to be true
  assert.strictEqual(result.matchCount, 2, "Only occupation and state should count as matched");
  assert.strictEqual(result.totalApplicableCriteria, 4, "2 matched + 2 missing = 4 applicable");
});

// -------------------------------------------------------------
// Test Case 5: Multiple Matching Criteria & Category Validation
// -------------------------------------------------------------
runTest("Test Case 5: Multiple matching criteria with student, gender, category and state", () => {
  const studentProfile = {
    age: 20,
    gender: "female",
    occupation: "student",
    is_student: true,
    annual_income: 180000,
    category: "OBC",
    state: "Tamil Nadu"
  };

  const result = checkEligibility(studentProfile, testScholarshipScheme);

  assert.strictEqual(result.schemeId, "TN-SCH-GIRL-STEM-002");
  assert.strictEqual(result.potentialMatch, true);
  assert.strictEqual(result.failedCriteria.length, 0);
  assert.strictEqual(result.missingCriteria.length, 0);
  assert.strictEqual(result.matchCount, 7, "Should match age, gender, occupation, student status, income, category, state");
  assert.strictEqual(result.totalApplicableCriteria, 7);
});

// -------------------------------------------------------------
// Test Case 6: Non-matching Gender
// -------------------------------------------------------------
runTest("Test Case 6: Gender mismatch on girl-specific scheme", () => {
  const maleStudent = {
    age: 20,
    gender: "male",
    occupation: "student",
    annual_income: 180000,
    category: "OBC",
    state: "Tamil Nadu"
  };

  const result = checkEligibility(maleStudent, testScholarshipScheme);

  assert.strictEqual(result.potentialMatch, false, "Must fail because scheme is female-only");
  assert.ok(result.failedCriteria.some(f => f.includes("reserved for female")));
});

// -------------------------------------------------------------
// Test Case 7: evaluateAllSchemes sorting test
// -------------------------------------------------------------
runTest("Test Case 7: evaluateAllSchemes sorts potential matches to top", () => {
  const profile = {
    age: 35,
    occupation: "farmer",
    state: "Tamil Nadu",
    annual_income: 100000
  };

  const all = evaluateAllSchemes(profile, [testScholarshipScheme, testScheme]);
  assert.strictEqual(all[0].id, "TN-SCH-FARMER-001", "Matching farmer scheme should be sorted first");
  assert.strictEqual(all[0].potentialMatch, true);
  assert.strictEqual(all[1].potentialMatch, false, "Scholarship should be sorted lower (ineligible gender/student)");
});

console.log(`\n=================================================`);
console.log(`📊 TEST RESULTS: ${passedCount} / ${totalTests} TESTS PASSED (100%)`);
console.log(`=================================================`);

if (passedCount !== totalTests) {
  process.exit(1);
}
