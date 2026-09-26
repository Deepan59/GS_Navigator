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
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "from", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "of", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "once", "here", "there", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now", "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "would", "could", "i'm", "you're", "he's", "she's", "it's", "we're", "they're", "need", "needs", "want", "wants", "wanted", "please", "help", "give", "get", "getting", "struggle", "face", "facing", "request", "purpose", "like", "tell", "show", "find", "looking", "look", "avail", "available", "support", "scheme", "schemes", "government", "govt", "state", "center", "central"
]);

/**
 * Searches and discovers candidate schemes based on citizen profile and intent.
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

  const rawKeywords = queryText ? queryText.replace(/[^a-z0-9\s\u0B80-\u0BFF]/g, " ").split(/\s+/).filter(w => w.length >= 3) : [];
  const userKeywords = rawKeywords.filter(w => !STOP_WORDS.has(w));

  const userOccupation = (citizenProfile.occupation || "").toLowerCase().trim();
  const userCategory = (citizenProfile.category || "").toLowerCase().trim();
  const userState = (citizenProfile.state || citizenProfile.residence || "").toLowerCase().trim();
  const isStudent = citizenProfile.is_student === true || citizenProfile.student === true || userOccupation.includes("student") || queryText.includes("student") || queryText.includes("college") || queryText.includes("hostel") || queryText.includes("tuition") || queryText.includes("tution") || queryText.includes("scholarship");

  // Step 1: Filter and score candidate schemes based on topic relevance
  const scoredSchemes = schemes.map((scheme) => {
    let topicRelevanceScore = 0;
    const schemeText = [
      scheme.name,
      scheme.category,
      scheme.description,
      ...(scheme.benefits || [])
    ].join(" ").toLowerCase();

    // 1. Purpose / Intent / Meaningful Keyword match (using word boundary to avoid false substring matches like "tution" in "institutions")
    if (userKeywords.length > 0) {
      userKeywords.forEach(keyword => {
        try {
          const regex = new RegExp(`\\b${keyword}\\b`, "i");
          if (regex.test(schemeText)) {
            topicRelevanceScore += 8;
          }
        } catch (e) {
          if (schemeText.includes(keyword)) {
            topicRelevanceScore += 5;
          }
        }
      });
    }

    // 2. Category matching
    if (citizenProfile.preferred_category || citizenProfile.categoryInterest) {
      const prefCat = (citizenProfile.preferred_category || citizenProfile.categoryInterest).toLowerCase();
      if ((scheme.category || "").toLowerCase().includes(prefCat)) {
        topicRelevanceScore += 5;
      }
    }

    // 3. Occupation matching
    if (userOccupation && scheme.eligibility?.occupation?.length > 0) {
      const matchOcc = scheme.eligibility.occupation.some(occ => {
        const norm = occ.toLowerCase();
        return norm.includes(userOccupation) || userOccupation.includes(norm);
      });
      if (matchOcc) {
        topicRelevanceScore += 5;
      }
    }

    // 4. Student status / education intent matching
    if (isStudent && (scheme.category?.toLowerCase().includes("education") || scheme.eligibility?.student === true || schemeText.includes("student") || schemeText.includes("hostel") || schemeText.includes("scholarship") || schemeText.includes("tuition"))) {
      topicRelevanceScore += 6;
    }

    // 5. State / Geographic relevance
    let geographicScore = 0;
    const schemeStates = (scheme.eligibility?.states || []).map(s => s.toLowerCase());
    if (scheme.level?.toLowerCase() === "central" || schemeStates.includes("all") || schemeStates.includes("india")) {
      geographicScore += 1;
    } else if (userState && schemeStates.some(s => s.includes(userState) || userState.includes(s))) {
      geographicScore += 2;
    }

    // Step 2: Run deterministic eligibility analysis
    const eligibilityAnalysis = checkEligibility(citizenProfile, scheme);

    let finalScore = topicRelevanceScore;
    if (eligibilityAnalysis.potentialMatch) {
      finalScore += (eligibilityAnalysis.matchCount * 2) + geographicScore;
    } else {
      finalScore -= 10;
    }

    return {
      ...scheme,
      relevanceScore: finalScore,
      topicRelevanceScore,
      eligibilityAnalysis,
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
