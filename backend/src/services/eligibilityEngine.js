import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single source of truth: backend/data/schemes.json (with fallback to local data dir)
let cachedSchemes = null;

export function getVerifiedSchemes() {
  if (!cachedSchemes) {
    const primaryPath = path.resolve(__dirname, "../../data/schemes.json");
    const fallbackPath = path.resolve(__dirname, "../data/schemes.json");
    const activePath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;

    let raw = fs.readFileSync(activePath, "utf-8");
    raw = raw.replace(/^\uFEFF/, "");
    cachedSchemes = JSON.parse(raw);
  }
  return cachedSchemes;
}

/**
 * Deterministic eligibility evaluation engine for standardized scheme schema.
 * Evaluates published criteria without LLM hallucination.
 * 
 * @param {Object} citizenProfile - Extracted citizen attributes
 * @param {Array} [schemes] - Optional override of schemes
 * @returns {Array} List of evaluated schemes
 */
export function evaluateEligibility(citizenProfile = {}, schemes = null) {
  const verifiedSchemes = schemes || getVerifiedSchemes();

  const results = verifiedSchemes.map((scheme) => {
    const matchedReasons = [];
    const unmetReasons = [];
    const missingFields = [];

    const eligibility = scheme.eligibility || {};

    // 1. Age Check
    const minAge = eligibility.age?.min ?? null;
    const maxAge = eligibility.age?.max ?? null;

    if (minAge !== null || maxAge !== null) {
      if (citizenProfile.age === undefined || citizenProfile.age === null) {
        missingFields.push({
          field: "age",
          label: "Age",
          description: `Scheme requires age between ${minAge ?? 0} and ${maxAge ?? "any"} years`
        });
      } else {
        const age = Number(citizenProfile.age);
        if (minAge !== null && age < minAge) {
          unmetReasons.push(`Age is ${age}, but minimum required age is ${minAge} years.`);
        } else if (maxAge !== null && age > maxAge) {
          unmetReasons.push(`Age is ${age}, but maximum eligible age is ${maxAge} years.`);
        } else {
          matchedReasons.push(`Age (${age} yrs) satisfies published criteria (${minAge ?? 0} - ${maxAge ?? "no upper limit"}).`);
        }
      }
    }

    // 2. Gender Check
    const genderCriteria = eligibility.gender || [];
    if (genderCriteria.length > 0 && !genderCriteria.includes("any") && !genderCriteria.includes("ALL")) {
      if (!citizenProfile.gender) {
        missingFields.push({
          field: "gender",
          label: "Gender",
          description: `Designated for: ${genderCriteria.join(", ")}`
        });
      } else {
        const userGender = citizenProfile.gender.toLowerCase().trim();
        const allowed = genderCriteria.map(g => g.toLowerCase().trim());
        if (allowed.includes(userGender)) {
          matchedReasons.push(`Gender (${citizenProfile.gender}) matches target beneficiary criteria.`);
        } else {
          unmetReasons.push(`Scheme is designated for ${genderCriteria.join(", ")}; applicant identified as ${citizenProfile.gender}.`);
        }
      }
    } else {
      matchedReasons.push("Open to all genders.");
    }

    // 3. Occupation Check
    const occCriteria = eligibility.occupation || [];
    if (occCriteria.length > 0 && !occCriteria.includes("any") && !occCriteria.includes("ALL")) {
      if (!citizenProfile.occupation) {
        missingFields.push({
          field: "occupation",
          label: "Occupation",
          description: `Requires occupation among: ${occCriteria.join(", ")}`
        });
      } else {
        const userOcc = citizenProfile.occupation.toLowerCase().replace(/[\s_-]+/g, "");
        const matchesOcc = occCriteria.some((allowed) => {
          const normAllowed = allowed.toLowerCase().replace(/[\s_-]+/g, "");
          return userOcc.includes(normAllowed) || normAllowed.includes(userOcc);
        });

        if (matchesOcc) {
          matchedReasons.push(`Occupation (${citizenProfile.occupation}) matches designated target.`);
        } else {
          unmetReasons.push(`Designated for ${occCriteria.join(", ")}; applicant occupation is '${citizenProfile.occupation}'.`);
        }
      }
    }

    // 4. Annual Income Check
    const incomeMax = eligibility.annualIncomeMax ?? null;
    if (incomeMax !== null && incomeMax !== undefined) {
      if (citizenProfile.annual_income === undefined || citizenProfile.annual_income === null) {
        missingFields.push({
          field: "annual_income",
          label: "Annual Household Income (INR)",
          description: `Income ceiling is ₹${Number(incomeMax).toLocaleString("en-IN")}`
        });
      } else {
        const income = Number(citizenProfile.annual_income);
        if (income <= incomeMax) {
          matchedReasons.push(`Annual income (₹${income.toLocaleString("en-IN")}) is within the limit of ₹${incomeMax.toLocaleString("en-IN")}.`);
        } else {
          unmetReasons.push(`Reported income of ₹${income.toLocaleString("en-IN")} exceeds the maximum eligibility cap of ₹${incomeMax.toLocaleString("en-IN")}.`);
        }
      }
    }

    // 5. Student Status Check
    if (eligibility.student === true) {
      if (citizenProfile.is_student === undefined || citizenProfile.is_student === null) {
        if (citizenProfile.occupation && /student|scholar|learner/i.test(citizenProfile.occupation)) {
          matchedReasons.push("Student status verified from occupation.");
        } else {
          missingFields.push({
            field: "is_student",
            label: "Student Status",
            description: "Scheme requires active enrollment as a student"
          });
        }
      } else if (citizenProfile.is_student === true) {
        matchedReasons.push("Active student enrollment confirmed.");
      } else {
        unmetReasons.push("Requires active student enrollment in an educational institution.");
      }
    }

    // 6. Caste / Category Check
    const catCriteria = eligibility.categories || [];
    if (catCriteria.length > 0 && !catCriteria.includes("ALL")) {
      if (!citizenProfile.category) {
        missingFields.push({
          field: "category",
          label: "Social Category (SC/ST/OBC/General)",
          description: `Scheme applies to: ${catCriteria.join(", ")}`
        });
      } else {
        const cat = citizenProfile.category.toUpperCase().trim();
        const allowedCats = catCriteria.map(c => c.toUpperCase().trim());
        if (allowedCats.includes(cat)) {
          matchedReasons.push(`Social category (${citizenProfile.category}) is eligible.`);
        } else {
          unmetReasons.push(`Scheme is reserved for ${catCriteria.join(", ")}; applicant reported ${citizenProfile.category}.`);
        }
      }
    }

    // 7. State Check
    const stateCriteria = eligibility.states || [];
    if (stateCriteria.length > 0 && !stateCriteria.includes("ALL") && !stateCriteria.includes("India")) {
      if (!citizenProfile.state) {
        missingFields.push({
          field: "state",
          label: "State of Residence",
          description: `Applicable to residents of: ${stateCriteria.join(", ")}`
        });
      } else {
        const userState = citizenProfile.state.toLowerCase().trim();
        const allowedStates = stateCriteria.map(s => s.toLowerCase().trim());
        if (allowedStates.includes(userState)) {
          matchedReasons.push(`Resident in eligible state (${citizenProfile.state}).`);
        } else {
          unmetReasons.push(`Scheme is for ${stateCriteria.join(", ")}; applicant is in ${citizenProfile.state}.`);
        }
      }
    }

    // Classification
    let status;
    let statusLabel;
    let score = 0;

    if (unmetReasons.length > 0) {
      status = "INELIGIBLE";
      statusLabel = "Does not meet published criteria";
      score = 0;
    } else if (missingFields.length > 0) {
      status = "POTENTIALLY_ELIGIBLE";
      statusLabel = "Potentially relevant (Requires missing information)";
      score = matchedReasons.length / (matchedReasons.length + missingFields.length);
    } else {
      status = "ELIGIBLE";
      statusLabel = "You appear to meet the published criteria";
      score = 1.0;
    }

    // Normalized scheme presentation fields
    return {
      ...scheme,
      ministry: scheme.department,
      brief_description: scheme.description,
      financial_benefit: Array.isArray(scheme.benefits) ? scheme.benefits[0] : scheme.benefits,
      official_url: scheme.application?.url || scheme.source?.url || "https://www.india.gov.in",
      required_documents: scheme.requiredDocuments || [],
      status,
      status_label: statusLabel,
      score,
      matched_reasons: matchedReasons,
      unmet_reasons: unmetReasons,
      missing_fields: missingFields
    };
  });

  const priority = { ELIGIBLE: 1, POTENTIALLY_ELIGIBLE: 2, INELIGIBLE: 3 };
  results.sort((a, b) => {
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status];
    }
    return b.score - a.score;
  });

  return results;
}
