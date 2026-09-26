/**
 * Phase 3: Deterministic Scheme Eligibility Evaluation Service
 * 
 * Rules:
 * 1. Never guess missing citizen information.
 * 2. Missing information must be reported separately in `missingCriteria`.
 * 3. A missing value must NOT automatically become true.
 * 4. Pure JavaScript logic independent from LLM/Gemini.
 * 5. Fully reusable across API routes and unit test suites.
 */

/**
 * Evaluates a single scheme against a citizen profile.
 * 
 * @param {Object} citizenProfile - Extracted or user-supplied citizen data
 * @param {Object} scheme - Scheme definition object from schemes.json
 * @returns {Object} Structured evaluation result
 */
export function checkEligibility(citizenProfile = {}, scheme = {}) {
  const schemeId = scheme.id || "UNKNOWN";
  const eligibility = scheme.eligibility || {};

  const matchedCriteria = [];
  const failedCriteria = [];
  const missingCriteria = [];

  // Helper to normalize strings for comparison
  const normalize = (str) => (str ? String(str).toLowerCase().trim() : "");

  // 1. Age Evaluation
  const minAge = eligibility.age?.min ?? null;
  const maxAge = eligibility.age?.max ?? null;

  if (minAge !== null || maxAge !== null) {
    if (citizenProfile.age === undefined || citizenProfile.age === null || citizenProfile.age === "") {
      missingCriteria.push({
        criterion: "age",
        requirement: `Age must be ${minAge !== null && maxAge !== null ? `between ${minAge} and ${maxAge}` : minAge !== null ? `${minAge} or above` : `up to ${maxAge}`} years`,
        message: "Age is missing from citizen profile"
      });
    } else {
      const citizenAge = Number(citizenProfile.age);
      if (isNaN(citizenAge)) {
        failedCriteria.push(`Invalid age value provided: '${citizenProfile.age}'`);
      } else if (minAge !== null && citizenAge < minAge) {
        failedCriteria.push(`Age is ${citizenAge}, which is below the minimum required age of ${minAge} years`);
      } else if (maxAge !== null && citizenAge > maxAge) {
        failedCriteria.push(`Age is ${citizenAge}, which exceeds the maximum eligible age of ${maxAge} years`);
      } else {
        matchedCriteria.push(`Age (${citizenAge} years) meets published age range (${minAge ?? 0} to ${maxAge ?? "no upper limit"})`);
      }
    }
  }

  // 2. Gender Evaluation
  const genderList = eligibility.gender || [];
  const activeGenders = genderList
    .map(normalize)
    .filter(g => g && g !== "any" && g !== "all");

  if (activeGenders.length > 0) {
    if (!citizenProfile.gender) {
      missingCriteria.push({
        criterion: "gender",
        requirement: `Designated specifically for: ${genderList.join(", ")}`,
        message: "Gender is not specified in citizen profile"
      });
    } else {
      const userGender = normalize(citizenProfile.gender);
      if (activeGenders.includes(userGender)) {
        matchedCriteria.push(`Gender (${citizenProfile.gender}) matches target beneficiary criteria (${genderList.join(", ")})`);
      } else {
        failedCriteria.push(`Scheme is reserved for ${genderList.join(", ")}; citizen indicated ${citizenProfile.gender}`);
      }
    }
  }

  // 3. Occupation Evaluation
  const occList = eligibility.occupation || [];
  const activeOccs = occList
    .map(normalize)
    .filter(o => o && o !== "any" && o !== "all");

  if (activeOccs.length > 0) {
    if (!citizenProfile.occupation) {
      missingCriteria.push({
        criterion: "occupation",
        requirement: `Requires occupation among: ${occList.join(", ")}`,
        message: "Occupation / employment status is not specified"
      });
    } else {
      const userOcc = normalize(citizenProfile.occupation).replace(/[\s_-]+/g, "");
      const matchesOcc = activeOccs.some(allowed => {
        const normAllowed = allowed.replace(/[\s_-]+/g, "");
        return userOcc.includes(normAllowed) || normAllowed.includes(userOcc);
      });

      if (matchesOcc) {
        matchedCriteria.push(`Occupation (${citizenProfile.occupation}) matches qualifying category (${occList.join(", ")})`);
      } else {
        failedCriteria.push(`Scheme requires occupation in [${occList.join(", ")}]; current occupation is listed as '${citizenProfile.occupation}'`);
      }
    }
  }

  // 4. Student Status Evaluation
  if (eligibility.student === true) {
    if (citizenProfile.is_student === undefined && citizenProfile.student === undefined) {
      // Check if occupation is student
      const userOcc = normalize(citizenProfile.occupation);
      if (userOcc.includes("student") || userOcc.includes("scholar") || userOcc.includes("college")) {
        matchedCriteria.push("Active student enrollment confirmed from occupation");
      } else {
        missingCriteria.push({
          criterion: "student",
          requirement: "Requires active enrollment as a student in a recognized educational institution",
          message: "Student enrollment status is not specified"
        });
      }
    } else {
      const isStudent = Boolean(citizenProfile.is_student ?? citizenProfile.student);
      if (isStudent) {
        matchedCriteria.push("Active student status verified");
      } else {
        failedCriteria.push("Scheme requires active student status");
      }
    }
  }

  // 5. Annual Income Evaluation
  const incomeMax = eligibility.annualIncomeMax ?? null;
  if (incomeMax !== null && incomeMax !== undefined) {
    const rawIncome = citizenProfile.annual_income ?? citizenProfile.annualIncome;
    if (rawIncome === undefined || rawIncome === null || rawIncome === "") {
      missingCriteria.push({
        criterion: "annualIncome",
        requirement: `Annual household income must not exceed ₹${Number(incomeMax).toLocaleString("en-IN")}`,
        message: "Annual income is not specified in citizen profile"
      });
    } else {
      const userIncome = Number(rawIncome);
      if (isNaN(userIncome)) {
        failedCriteria.push(`Invalid annual income value provided: '${rawIncome}'`);
      } else if (userIncome <= incomeMax) {
        matchedCriteria.push(`Annual income (₹${userIncome.toLocaleString("en-IN")}) is within ceiling (₹${Number(incomeMax).toLocaleString("en-IN")})`);
      } else {
        failedCriteria.push(`Annual income of ₹${userIncome.toLocaleString("en-IN")} exceeds the maximum eligibility cap of ₹${Number(incomeMax).toLocaleString("en-IN")}`);
      }
    }
  }

  // 6. State / Residence Evaluation
  const stateList = eligibility.states || [];
  const activeStates = stateList
    .map(normalize)
    .filter(s => s && s !== "all" && s !== "india");

  if (activeStates.length > 0) {
    const userState = citizenProfile.state || citizenProfile.residence;
    if (!userState) {
      missingCriteria.push({
        criterion: "state",
        requirement: `Resident of: ${stateList.join(", ")}`,
        message: "State / location of residence is not specified"
      });
    } else {
      const normUserState = normalize(userState);
      const isStateEligible = activeStates.some(allowed => allowed === normUserState || normUserState.includes(allowed) || allowed.includes(normUserState));
      if (isStateEligible) {
        matchedCriteria.push(`State of residence (${userState}) satisfies geographic requirement`);
      } else {
        failedCriteria.push(`Scheme is restricted to residents of [${stateList.join(", ")}]; citizen resides in ${userState}`);
      }
    }
  }

  // 7. Social Category / Caste Evaluation
  const catList = eligibility.categories || [];
  const activeCats = catList
    .map(normalize)
    .filter(c => c && c !== "all");

  if (activeCats.length > 0) {
    const userCat = citizenProfile.category || citizenProfile.social_category;
    if (!userCat) {
      missingCriteria.push({
        criterion: "category",
        requirement: `Applies to social categories: ${catList.join(", ")}`,
        message: "Social category / caste is not specified"
      });
    } else {
      const normCat = normalize(userCat);
      const isCatEligible = activeCats.some(allowed => allowed === normCat);
      if (isCatEligible) {
        matchedCriteria.push(`Social category (${userCat}) matches designated group`);
      } else {
        failedCriteria.push(`Scheme is reserved for [${catList.join(", ")}]; citizen category is ${userCat}`);
      }
    }
  }

  // Calculate totals and potential match status
  // Rule: potentialMatch is true if there are ZERO failed criteria.
  const potentialMatch = failedCriteria.length === 0;
  const matchCount = matchedCriteria.length;
  const totalApplicableCriteria = matchCount + failedCriteria.length + missingCriteria.length;

  return {
    schemeId,
    schemeName: scheme.name || schemeId,
    potentialMatch,
    matchedCriteria,
    failedCriteria,
    missingCriteria,
    matchCount,
    totalApplicableCriteria
  };
}

/**
 * Evaluates a list of schemes against a citizen profile and sorts results.
 * 
 * @param {Object} citizenProfile - Extracted citizen data
 * @param {Array} schemesList - Array of scheme objects
 * @returns {Array} List of evaluated schemes
 */
export function evaluateAllSchemes(citizenProfile = {}, schemesList = []) {
  const evaluated = schemesList.map(scheme => {
    const check = checkEligibility(citizenProfile, scheme);
    return {
      ...scheme,
      evaluation: check,
      potentialMatch: check.potentialMatch,
      matchCount: check.matchCount,
      totalApplicableCriteria: check.totalApplicableCriteria,
      matchedCriteria: check.matchedCriteria,
      failedCriteria: check.failedCriteria,
      missingCriteria: check.missingCriteria
    };
  });

  // Sort: Potential matches first (ordered by matchCount descending), followed by failed matches
  evaluated.sort((a, b) => {
    if (a.potentialMatch !== b.potentialMatch) {
      return a.potentialMatch ? -1 : 1;
    }
    return b.matchCount - a.matchCount;
  });

  return evaluated;
}
