import { extractCitizenProfile, generateCitizenExplanation, detectLanguage } from "./geminiService.js";
import { searchAndRecommendSchemes, loadSchemesData } from "./schemeSearchService.js";
import { checkEligibility } from "./eligibilityService.js";
import { searchCandidateSchemes } from "./ragService.js";

const GREETING_WORDS = new Set(["hi", "hello", "hey", "help", "please", "namaste", "vanakkam", "வணக்கம்", "pranam", "test", "can", "you", "me"]);

function isSubstantiveIntent(text) {
  if (!text || typeof text !== "string") return false;
  const words = text.toLowerCase().replace(/[^a-z0-9\s\u0B80-\u0BFF]/g, "").split(/\s+/).filter(Boolean);
  const nonGreetings = words.filter(w => !GREETING_WORDS.has(w));
  return nonGreetings.length >= 2;
}

/**
 * Validates and sanitizes the extracted citizen profile.
 */
export function validateAndSanitizeProfile(rawProfile = {}) {
  const sanitized = {};

  // Validate Age (0 to 120)
  if (rawProfile.age !== undefined && rawProfile.age !== null && rawProfile.age !== "") {
    const ageNum = Number(rawProfile.age);
    if (!isNaN(ageNum) && ageNum >= 0 && ageNum <= 120) {
      sanitized.age = Math.round(ageNum);
    }
  }

  // Validate Gender
  if (typeof rawProfile.gender === "string" && rawProfile.gender.trim()) {
    const g = rawProfile.gender.toLowerCase().trim();
    if (["male", "female", "transgender", "other"].includes(g)) {
      sanitized.gender = g;
    }
  }

  // Validate Occupation
  if (typeof rawProfile.occupation === "string" && rawProfile.occupation.trim()) {
    sanitized.occupation = rawProfile.occupation.trim();
  }

  // Validate Annual Income (positive number)
  if (rawProfile.annual_income !== undefined && rawProfile.annual_income !== null && rawProfile.annual_income !== "") {
    const incomeNum = Number(rawProfile.annual_income);
    if (!isNaN(incomeNum) && incomeNum >= 0) {
      sanitized.annual_income = Math.round(incomeNum);
    }
  }

  // Validate State
  if (typeof rawProfile.state === "string" && rawProfile.state.trim()) {
    sanitized.state = rawProfile.state.trim();
  }

  // Validate Category
  if (typeof rawProfile.category === "string" && rawProfile.category.trim()) {
    sanitized.category = rawProfile.category.trim();
  }

  // Validate Student Status
  if (rawProfile.is_student !== undefined && rawProfile.is_student !== null) {
    sanitized.is_student = Boolean(rawProfile.is_student);
  } else if (rawProfile.student !== undefined && rawProfile.student !== null) {
    sanitized.is_student = Boolean(rawProfile.student);
  }

  // Validate Disability
  if (rawProfile.has_disability !== undefined && rawProfile.has_disability !== null) {
    sanitized.has_disability = Boolean(rawProfile.has_disability);
  }

  // Validate Marital Status
  if (typeof rawProfile.marital_status === "string" && rawProfile.marital_status.trim()) {
    sanitized.marital_status = rawProfile.marital_status.toLowerCase().trim();
  }

  // Validate Land Holding
  if (rawProfile.land_holding_acres !== undefined && rawProfile.land_holding_acres !== null) {
    const land = Number(rawProfile.land_holding_acres);
    if (!isNaN(land) && land >= 0) {
      sanitized.land_holding_acres = land;
    }
  }

  // Pass-through substantive primary intent/need
  const rawIntent = rawProfile.primary_need || rawProfile.intent;
  if (isSubstantiveIntent(rawIntent)) {
    sanitized.intent = rawIntent.trim();
  }

  if (rawProfile.language) {
    sanitized.language = rawProfile.language;
  }

  return sanitized;
}

/**
 * Identifies core missing information needed for meaningful scheme discovery.
 * Returns bilingual English/Tamil messages.
 */
export function identifyMissingInformation(profile = {}, language = "en") {
  const missing = [];
  const isTa = language === "ta" || profile.language === "ta";

  // Check occupation or substantive intent
  if (!profile.occupation && !profile.intent) {
    missing.push({
      field: "occupation_or_intent",
      message: isTa 
        ? "உங்கள் தொழில் அல்லது தேவையான அரசு உதவி வகையை குறிப்பிடவும் (எ.கா. விவசாயம், கல்லூரி படிப்பு, மகளிர் சுயதொழில், ஓய்வூதியம்)."
        : "Please specify your occupation or the specific type of government support you need (e.g., farming grant, education scholarship, healthcare, pension)."
    });
  }

  // Check state of residence
  if (!profile.state) {
    missing.push({
      field: "state",
      message: isTa
        ? "மாநில நலத்திட்டங்களை கண்டறிய நீங்கள் வசிக்கும் மாநிலத்தை (எ.கா. தமிழ்நாடு) குறிப்பிடவும்."
        : "Please provide your state or UT of residence to discover state-specific welfare programs."
    });
  }

  // Check age
  if (profile.age === undefined || profile.age === null) {
    missing.push({
      field: "age",
      message: isTa
        ? "வயது வரம்பு தகுதியை சரிபார்க்க உங்கள் வயதை உள்ளிடவும்."
        : "Please provide your age to evaluate age-linked eligibility requirements."
    });
  }

  // Check annual income
  if (profile.annual_income === undefined || profile.annual_income === null) {
    missing.push({
      field: "annual_income",
      message: isTa
        ? "வருமான வரம்பு தகுதியை சரிபார்க்க உங்கள் குடும்ப ஆண்டு வருமானத்தை குறிப்பிடவும்."
        : "Please mention approximate annual household income to check income ceiling thresholds."
    });
  }

  return missing;
}

/**
 * Executes the complete End-to-End Hybrid Recommendation Workflow:
 * 1. Gemini / heuristic NLU -> structured profile extraction
 * 2. RAG Semantic Retrieval -> Candidate schemes based on natural language meaning
 * 3. Structured search -> Candidate schemes based on rule/keyword matching
 * 4. Merge & Deduplicate candidates
 * 5. Deterministic eligibility engine -> Checks published criteria (Pass, Fail, Missing)
 * 6. Return verified results
 */
export async function processCitizenRecommendation(userMessage, preferredLanguage = null, existingProfile = {}) {
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("Citizen message cannot be empty.");
  }

  const detectedLang = detectLanguage(userMessage);
  const activeLanguage = preferredLanguage || detectedLang;

  console.log(`[Workflow] Processing citizen request (length: ${userMessage.length} chars, language: ${activeLanguage})`);

  // Step 1: Extract structured profile via Gemini (or deterministic heuristic fallback)
  const rawProfile = await extractCitizenProfile(userMessage.trim());
  rawProfile.language = activeLanguage;

  // Merge with pre-collected basic details (Step 1 questionnaire), letting freshly extracted query details supplement it
  const mergedProfile = {
    ...(existingProfile || {}),
    ...rawProfile
  };

  if (existingProfile && typeof existingProfile === "object") {
    for (const [k, v] of Object.entries(existingProfile)) {
      if (v !== undefined && v !== null && (mergedProfile[k] === undefined || mergedProfile[k] === null)) {
        mergedProfile[k] = v;
      }
    }
  }
  mergedProfile.language = activeLanguage;

  // Step 2: Validate and sanitize the profile
  const validatedProfile = validateAndSanitizeProfile(mergedProfile);
  validatedProfile.language = activeLanguage;

  // Step 3: Identify missing critical information
  const missingInfo = identifyMissingInformation(validatedProfile, activeLanguage);

  // Check if citizen provided at least some identifying details
  const hasSubstantiveInfo = Boolean(
    validatedProfile.occupation ||
    validatedProfile.intent ||
    validatedProfile.age !== undefined ||
    validatedProfile.state ||
    validatedProfile.annual_income !== undefined ||
    validatedProfile.gender ||
    validatedProfile.category ||
    validatedProfile.is_student
  );

  // If the query is just a greeting or devoid of details, return needsMoreInformation: true
  if (!hasSubstantiveInfo) {
    console.log("[Workflow] Query is too vague or generic greeting. Requesting essential details.");
    return {
      needsMoreInformation: true,
      language: activeLanguage,
      profile: validatedProfile,
      missingInformation: missingInfo,
      results: []
    };
  }

  // Load schemes from schemes.json
  const allSchemes = loadSchemesData();
  const schemesById = new Map(allSchemes.map(s => [s.id, s]));

  // Step 4: Hybrid Candidate Retrieval (RAG Semantic Search + Structured Search)
  let ragCandidates = [];
  try {
    const ragResult = await searchCandidateSchemes(userMessage);
    ragCandidates = ragResult.candidates || [];
    console.log(`[Workflow] RAG retrieved ${ragCandidates.length} semantic candidate(s).`);
  } catch (ragErr) {
    console.warn("[Workflow] RAG search encountered error, falling back strictly to structured search:", ragErr.message);
    ragCandidates = [];
  }

  // Run existing structured search (filter strictly to topic/keyword/occupation relevant candidates)
  const structuredResults = searchAndRecommendSchemes(validatedProfile, allSchemes)
    .filter(s => s.topicRelevanceScore > 0);
  console.log(`[Workflow] Structured search retrieved ${structuredResults.length} topic-relevant candidate(s).`);

  // Map topic scores for candidate sorting
  const topicScoreMap = new Map();
  structuredResults.forEach(s => topicScoreMap.set(s.id, s.topicRelevanceScore || 0));

  // Merge and Deduplicate candidates preserving discovery order
  const mergedCandidateIds = [];
  const seenIds = new Set();

  // Add RAG candidate IDs (semantically discovered get high priority score)
  let rankBonus = 20;
  for (const c of ragCandidates) {
    if (c.schemeId && schemesById.has(c.schemeId)) {
      topicScoreMap.set(c.schemeId, (topicScoreMap.get(c.schemeId) || 0) + rankBonus);
      rankBonus = Math.max(5, rankBonus - 1);
      if (!seenIds.has(c.schemeId)) {
        seenIds.add(c.schemeId);
        mergedCandidateIds.push(c.schemeId);
      }
    }
  }

  // Add structured search candidate IDs (keyword & rule discovered)
  for (const s of structuredResults) {
    if (s.id && !seenIds.has(s.id)) {
      seenIds.add(s.id);
      mergedCandidateIds.push(s.id);
    }
  }

  // If neither RAG nor structured search found candidates, fallback to top scored candidate schemes
  if (mergedCandidateIds.length === 0) {
    const topScored = searchAndRecommendSchemes(validatedProfile, allSchemes).slice(0, 10);
    topScored.forEach(s => mergedCandidateIds.push(s.id));
  }

  // Step 5: Deterministic Eligibility Engine Evaluation for candidate schemes
  // IMPORTANT: Vector similarity is NEVER equated with eligibility.
  const evaluatedCandidates = mergedCandidateIds.map((schemeId) => {
    const fullScheme = schemesById.get(schemeId);
    const eligibilityAnalysis = checkEligibility(validatedProfile, fullScheme);

    return {
      scheme: fullScheme,
      eligibilityAnalysis,
      potentialMatch: eligibilityAnalysis.potentialMatch,
      matchedCriteria: eligibilityAnalysis.matchedCriteria,
      failedCriteria: eligibilityAnalysis.failedCriteria,
      missingCriteria: eligibilityAnalysis.missingCriteria,
      matchCount: eligibilityAnalysis.matchCount,
      totalApplicableCriteria: eligibilityAnalysis.totalApplicableCriteria
    };
  });

  // Filter to only relevant schemes (eligible or potential matches)
  // If some schemes are potential matches, filter out completely disqualified schemes
  const potentialMatches = evaluatedCandidates.filter(item => item.potentialMatch === true);
  const finalCandidates = potentialMatches.length > 0 ? potentialMatches : evaluatedCandidates;

  // Step 6: Sort by deterministic eligibility outcome & topic relevance:
  // 1. potentialMatch === true first
  // 2. Topic/Semantic relevance score (descending)
  // 3. Number of matched criteria (descending)
  // 4. Failed criteria count (ascending)
  finalCandidates.sort((a, b) => {
    if (a.potentialMatch !== b.potentialMatch) {
      return a.potentialMatch ? -1 : 1;
    }
    const aTopic = topicScoreMap.get(a.scheme.id) || 0;
    const bTopic = topicScoreMap.get(b.scheme.id) || 0;
    if (bTopic !== aTopic) {
      return bTopic - aTopic;
    }
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    return a.failedCriteria.length - b.failedCriteria.length;
  });

  // Filter strictly to candidates that have topic/semantic relevance to the user's situation
  const topicRelevant = finalCandidates.filter(item => (topicScoreMap.get(item.scheme.id) || 0) > 0);
  const targetedResults = topicRelevant.length > 0 ? topicRelevant : finalCandidates.slice(0, 10);

  // Step 7: Format response strictly per specification
  const formattedResults = targetedResults.map((item) => {
    const s = item.scheme;
    const schemeData = {
      id: s.id,
      name: s.name,
      level: s.level,
      state: s.state,
      department: s.department,
      category: s.category,
      description: s.description,
      benefits: s.benefits || [],
      eligibility: s.eligibility || {},
      requiredDocuments: s.requiredDocuments || [],
      application: s.application || {},
      source: s.source || {},
      lastVerified: s.lastVerified || ""
    };

    const missingCriteriaStrings = (item.missingCriteria || []).map(mc => {
      if (typeof mc === "string") return mc;
      return `${mc.criterion}: ${mc.requirement || mc.message}`;
    });

    return {
      scheme: schemeData,
      eligibility: {
        potentialMatch: Boolean(item.potentialMatch),
        matchedCriteria: item.matchedCriteria || [],
        failedCriteria: item.failedCriteria || [],
        missingCriteria: missingCriteriaStrings
      }
    };
  });

  const needsMoreInformation = missingInfo.length > 0;
  const potentialMatchCount = formattedResults.filter(r => r.eligibility.potentialMatch).length;

  console.log(`[Workflow] Evaluation complete. Merged ${formattedResults.length} candidate(s), found ${potentialMatchCount} potential match(es).`);

  return {
    needsMoreInformation,
    language: activeLanguage,
    profile: validatedProfile,
    missingInformation: missingInfo,
    results: formattedResults
  };
}

/**
 * Diagnostic function for development/debug endpoint.
 */
export async function debugCitizenRecommendationFlow(userMessage, preferredLanguage = null, existingProfile = {}) {
  const detectedLang = detectLanguage(userMessage);
  const activeLanguage = preferredLanguage || detectedLang;

  const rawProfile = await extractCitizenProfile(userMessage.trim());
  const mergedProfile = { ...(existingProfile || {}), ...rawProfile, language: activeLanguage };
  const validatedProfile = validateAndSanitizeProfile(mergedProfile);

  const allSchemes = loadSchemesData();
  const schemesById = new Map(allSchemes.map(s => [s.id, s]));

  // 1. RAG Candidates
  let ragResult = { query: userMessage, candidates: [] };
  try {
    ragResult = await searchCandidateSchemes(userMessage);
  } catch (e) {
    ragResult.error = e.message;
  }

  // 2. Structured Candidates
  const structuredResults = searchAndRecommendSchemes(validatedProfile, allSchemes);

  // 3. Merged
  const mergedCandidateIds = [];
  const seen = new Set();
  (ragResult.candidates || []).forEach(c => {
    if (!seen.has(c.schemeId)) {
      seen.add(c.schemeId);
      mergedCandidateIds.push(c.schemeId);
    }
  });
  structuredResults.forEach(s => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      mergedCandidateIds.push(s.id);
    }
  });

  // 4. Eligibility Results
  const eligibilityResults = mergedCandidateIds.map(id => {
    const s = schemesById.get(id);
    return {
      schemeId: id,
      schemeName: s?.name,
      analysis: s ? checkEligibility(validatedProfile, s) : null
    };
  });

  return {
    query: userMessage,
    language: activeLanguage,
    extractedProfile: validatedProfile,
    ragCandidates: ragResult.candidates || [],
    structuredCandidates: structuredResults.map(s => ({ schemeId: s.id, name: s.name })),
    mergedCandidateIds,
    eligibilityResults
  };
}

