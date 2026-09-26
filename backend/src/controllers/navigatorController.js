import { extractCitizenProfile, generateCitizenExplanation } from "../services/geminiService.js";
import { evaluateEligibility, getVerifiedSchemes } from "../services/eligibilityEngine.js";
import { searchAndRecommendSchemes } from "../../services/schemeSearchService.js";
import { processCitizenRecommendation } from "../../services/recommendationWorkflowService.js";

/**
 * Phase 5 Endpoint: POST /api/recommend
 * Full end-to-end workflow:
 * Natural language message -> Gemini extraction -> Validation -> Deterministic eligibility check -> Ranked results
 */
export async function handleCitizenRecommend(req, res) {
  try {
    const { message, language, profile } = req.body || {};

    // Validation: Message must be a non-empty string
    if (!req.body || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Invalid request payload. 'message' must be a non-empty string describing the citizen's situation.",
        needsMoreInformation: true,
        missingInformation: [
          {
            field: "message",
            message: "Please describe your situation, age, occupation, or government support needed."
          }
        ],
        profile: profile || {},
        results: []
      });
    }

    const response = await processCitizenRecommendation(message.trim(), language, profile);
    return res.json(response);
  } catch (error) {
    console.error("[Controller] Error in handleCitizenRecommend:", error.message);
    return res.status(500).json({
      error: "Internal server error while processing recommendation request.",
      needsMoreInformation: false,
      missingInformation: [],
      profile: {},
      results: []
    });
  }
}

/**
 * Phase 4 Endpoint: POST /api/schemes/recommend
 * Directly discovers and recommends schemes from a structured profile object
 */
export function handleRecommendSchemes(req, res) {
  try {
    const { profile } = req.body || {};

    // Validation: Profile must be a valid object
    if (!req.body || profile === undefined || profile === null || typeof profile !== "object" || Array.isArray(profile)) {
      return res.status(400).json({
        error: "Invalid request payload. 'profile' must be a valid JSON object.",
        results: [],
        total: 0
      });
    }

    const results = searchAndRecommendSchemes(profile);

    return res.json({
      results,
      total: results.length
    });
  } catch (error) {
    console.error("[Controller] Error in handleRecommendSchemes:", error);
    return res.status(500).json({
      error: "Internal server error while recommending schemes.",
      results: [],
      total: 0
    });
  }
}

export async function handleCitizenQuery(req, res) {
  try {
    const { query, currentProfile = {} } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Please provide a valid query string." });
    }

    const citizenProfile = await extractCitizenProfile(query, currentProfile);
    const evaluatedSchemes = evaluateEligibility(citizenProfile);
    const summary = await generateCitizenExplanation(citizenProfile, evaluatedSchemes);

    const missingFieldMap = new Map();
    evaluatedSchemes
      .filter(s => s.status === "POTENTIALLY_ELIGIBLE")
      .forEach(s => {
        s.missing_fields.forEach(mf => {
          if (!missingFieldMap.has(mf.field)) {
            missingFieldMap.set(mf.field, mf);
          }
        });
      });

    return res.json({
      success: true,
      citizenProfile,
      summary,
      results: evaluatedSchemes,
      missingFields: Array.from(missingFieldMap.values()),
      meta: {
        totalEvaluated: evaluatedSchemes.length,
        eligibleCount: evaluatedSchemes.filter(s => s.status === "ELIGIBLE").length,
        potentialCount: evaluatedSchemes.filter(s => s.status === "POTENTIALLY_ELIGIBLE").length,
        ineligibleCount: evaluatedSchemes.filter(s => s.status === "INELIGIBLE").length
      }
    });
  } catch (error) {
    console.error("[Controller] Error handling query:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error processing navigator request."
    });
  }
}

export function handleProfileRecalculate(req, res) {
  try {
    const { profile = {} } = req.body;
    const evaluatedSchemes = evaluateEligibility(profile);

    const missingFieldMap = new Map();
    evaluatedSchemes
      .filter(s => s.status === "POTENTIALLY_ELIGIBLE")
      .forEach(s => {
        s.missing_fields.forEach(mf => {
          if (!missingFieldMap.has(mf.field)) {
            missingFieldMap.set(mf.field, mf);
          }
        });
      });

    return res.json({
      success: true,
      citizenProfile: profile,
      results: evaluatedSchemes,
      missingFields: Array.from(missingFieldMap.values()),
      meta: {
        totalEvaluated: evaluatedSchemes.length,
        eligibleCount: evaluatedSchemes.filter(s => s.status === "ELIGIBLE").length,
        potentialCount: evaluatedSchemes.filter(s => s.status === "POTENTIALLY_ELIGIBLE").length,
        ineligibleCount: evaluatedSchemes.filter(s => s.status === "INELIGIBLE").length
      }
    });
  } catch (error) {
    console.error("[Controller] Error recalculating profile:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during recalculation."
    });
  }
}

export function handleGetSchemes(req, res) {
  try {
    const schemes = getVerifiedSchemes();
    return res.json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to load verified schemes repository."
    });
  }
}
