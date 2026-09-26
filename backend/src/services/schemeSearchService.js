import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkEligibility } from "./eligibilityService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedSchemes = null;

/**
 * Loads verified schemes from schemes.json
 */
export function loadSchemesData() {
  if (!cachedSchemes) {
    const primaryPath = path.resolve(__dirname, "../data/schemes.json");
    const fallbackPath = path.resolve(__dirname, "../src/data/schemes.json");
    const targetPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;

    const raw = fs.readFileSync(targetPath, "utf-8").replace(/^\uFEFF/, "");
    cachedSchemes = JSON.parse(raw);
  }
  return cachedSchemes;
}

/**
 * Searches and discovers candidate schemes based on citizen profile and intent.
 * 
 * Rules:
 * 1. Uses deterministic filtering and keyword/category matching (no vector DB / RAG).
 * 2. Never eliminates a potentially relevant scheme merely because an optional field is missing.
 * 3. Passes candidates through eligibilityService for rigorous deterministic analysis.
 * 
 * @param {Object} citizenProfile - Profile with intent, occupation, age, state, etc.
 * @param {Array} [allSchemes] - Optional override of schemes catalog
 * @returns {Array} List of discovered schemes with attached eligibility analysis
 */
export function searchAndRecommendSchemes(citizenProfile = {}, allSchemes = null) {
  const schemes = allSchemes || loadSchemesData();

  if (!Array.isArray(schemes) || schemes.length === 0) {
    return [];
  }

  const queryText = (
    citizenProfile.intent ||
    citizenProfile.purpose ||
    citizenProfile.primary_need ||
    citizenProfile.query ||
    ""
  ).toLowerCase().trim();

  const userKeywords = queryText ? queryText.split(/\s+/).filter(w => w.length > 2) : [];
  const userOccupation = (citizenProfile.occupation || "").toLowerCase().trim();
  const userCategory = (citizenProfile.category || "").toLowerCase().trim();
  const userState = (citizenProfile.state || citizenProfile.residence || "").toLowerCase().trim();
  const isStudent = citizenProfile.is_student === true || citizenProfile.student === true || userOccupation.includes("student");

  // Step 1: Filter and score candidate schemes
  const scoredSchemes = schemes.map((scheme) => {
    let relevanceScore = 0;
    const schemeText = [
      scheme.name,
      scheme.department,
      scheme.category,
      scheme.description,
      ...(scheme.benefits || []),
      ...(scheme.eligibility?.otherConditions || [])
    ].join(" ").toLowerCase();

    // 1. Purpose / Intent / Keyword match
    if (userKeywords.length > 0) {
      userKeywords.forEach(keyword => {
        if (schemeText.includes(keyword)) {
          relevanceScore += 3;
        }
      });
    }

    // 2. Category matching
    if (citizenProfile.preferred_category || citizenProfile.categoryInterest) {
      const prefCat = (citizenProfile.preferred_category || citizenProfile.categoryInterest).toLowerCase();
      if ((scheme.category || "").toLowerCase().includes(prefCat)) {
        relevanceScore += 5;
      }
    }

    // 3. Occupation matching
    if (userOccupation && scheme.eligibility?.occupation?.length > 0) {
      const matchOcc = scheme.eligibility.occupation.some(occ => {
        const norm = occ.toLowerCase();
        return norm.includes(userOccupation) || userOccupation.includes(norm);
      });
      if (matchOcc) {
        relevanceScore += 5;
      }
    }

    // 4. Student status matching
    if (isStudent && (scheme.category?.toLowerCase().includes("education") || scheme.eligibility?.student === true)) {
      relevanceScore += 4;
    }

    // 5. State / Geographic relevance
    const schemeStates = (scheme.eligibility?.states || []).map(s => s.toLowerCase());
    if (scheme.level?.toLowerCase() === "central" || schemeStates.includes("all") || schemeStates.includes("india")) {
      relevanceScore += 1;
    } else if (userState && schemeStates.some(s => s.includes(userState) || userState.includes(s))) {
      relevanceScore += 2;
    }

    // Step 2: Run deterministic eligibility analysis
    const eligibilityAnalysis = checkEligibility(citizenProfile, scheme);

    // Boost score if potentialMatch is true
    if (eligibilityAnalysis.potentialMatch) {
      relevanceScore += (eligibilityAnalysis.matchCount * 2);
    } else {
      // Disqualified scheme gets negative weight
      relevanceScore -= 10;
    }

    return {
      ...scheme,
      relevanceScore,
      eligibilityAnalysis,
      // Top-level aliases for direct frontend/API consumption
      potentialMatch: eligibilityAnalysis.potentialMatch,
      matchedCriteria: eligibilityAnalysis.matchedCriteria,
      failedCriteria: eligibilityAnalysis.failedCriteria,
      missingCriteria: eligibilityAnalysis.missingCriteria,
      matchCount: eligibilityAnalysis.matchCount,
      totalApplicableCriteria: eligibilityAnalysis.totalApplicableCriteria
    };
  });

  // Step 3: Sort candidate schemes
  // Priority: 
  // 1. potentialMatch === true first
  // 2. Number of matched criteria (descending)
  // 3. Relevance score (descending)
  scoredSchemes.sort((a, b) => {
    if (a.potentialMatch !== b.potentialMatch) {
      return a.potentialMatch ? -1 : 1;
    }
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    return b.relevanceScore - a.relevanceScore;
  });

  return scoredSchemes;
}
