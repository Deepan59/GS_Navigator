import { extractCitizenProfile, generateCitizenExplanation, detectLanguage } from "./geminiService.js";
import { searchAndRecommendSchemes } from "./schemeSearchService.js";
import { checkEligibility } from "./eligibilityService.js";

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
 * Executes the complete End-to-End Recommendation Workflow with Bilingual Intelligence.
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

  // If existingProfile had explicit values and rawProfile didn't override with valid ones, preserve them
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

  // Step 4: Search schemes deterministically
  const candidateSchemes = searchAndRecommendSchemes(validatedProfile);

  // Step 5: Format response strictly per specification
  const formattedResults = candidateSchemes.map((item) => {
    const schemeData = {
      id: item.id,
      name: item.name,
      level: item.level,
      state: item.state,
      department: item.department,
      category: item.category,
      description: item.description,
      benefits: item.benefits || [],
      eligibility: item.eligibility || {},
      requiredDocuments: item.requiredDocuments || [],
      application: item.application || {},
      source: item.source || {},
      lastVerified: item.lastVerified || ""
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

  console.log(`[Workflow] Evaluation complete. Found ${formattedResults.length} schemes (${formattedResults.filter(r => r.eligibility.potentialMatch).length} potential matches).`);

  return {
    needsMoreInformation,
    language: activeLanguage,
    profile: validatedProfile,
    missingInformation: missingInfo,
    results: formattedResults
  };
}
