import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIInstance = null;

function getAIModel() {
  if (!genAIInstance && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  if (genAIInstance) {
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
    return genAIInstance.getGenerativeModel({ model: modelName });
  }
  return null;
}

/**
 * Detects if a text contains Tamil characters or Tamil keywords.
 */
export function detectLanguage(text = "") {
  if (!text) return "en";
  const hasTamilUnicode = /[\u0B80-\u0BFF]/.test(text);
  const tamilKeywords = /\b(tamil|tamilnadu|vanakkam|kalloori|padipu|vivasayi|magalir|arasu|thogai)\b/i;
  return (hasTamilUnicode || tamilKeywords.test(text)) ? "ta" : "en";
}

/**
 * Fallback heuristic extractor with robust bilingual (English & Tamil) support.
 * Works deterministically offline and when no Gemini API key is configured.
 */
export function heuristicExtractCitizenProfile(userText = "") {
  const text = userText.toLowerCase();
  const detectedLang = detectLanguage(userText);

  const profile = {
    age: null,
    gender: null,
    occupation: null,
    annual_income: null,
    land_holding_acres: null,
    state: null,
    category: null,
    marital_status: null,
    has_disability: null,
    is_student: null,
    is_bpl: null,
    primary_need: null,
    language: detectedLang
  };

  // 1. Age extraction (English & Tamil)
  const ageMatch = text.match(/(\b\d{1,2}\b)\s*(?:years?\s*old|yr|yo|age|\s*साल|வயது|ஆண்டு|வருடம்)/i) ||
                   text.match(/(?:age\s*is|aged|age|வயது)\s*[:=]?s*(\b\d{1,2}\b)/i);
  if (ageMatch) {
    profile.age = parseInt(ageMatch[1], 10);
  }

  // 2. Gender extraction (English & Tamil)
  if (/\b(female|woman|girl|mother|widow|lady|mahila|aurat)\b/i.test(text) ||
      /(பெண்|மகளிர்|விதவை|தாய்|சகோதரி|மனைவி|மாணவி|குடும்பத்தலைவி)/.test(text)) {
    profile.gender = "female";
  } else if (/\b(male|man|boy|father|gentleman|purush)\b/i.test(text) ||
             /(ஆண்|மாணவர்|தந்தை|சகோதரன்|கணவன்)/.test(text)) {
    profile.gender = "male";
  }

  // 3. Marital Status
  if (/\bwidow(?:ed)?\b/i.test(text) || /(விதவை|கணவனை\s*இழந்த)/.test(text)) {
    profile.marital_status = "widow";
    profile.gender = "female";
  } else if (/\bmarried\b/i.test(text) || /(திருமணமான|மனைவி|கணவன்)/.test(text)) {
    profile.marital_status = "married";
  } else if (/\b(single|unmarried)\b/i.test(text) || /(திருமணமாகாத|இளம்பெண்)/.test(text)) {
    profile.marital_status = "single";
  }

  // 4. Occupation & Specific Needs extraction (English & Tamil)
  // Student / College / Education
  if (/\b(student|studying|college|school|scholar|scholarship|higher education)\b/i.test(text) ||
      /(கல்லூரி|படிப்பு|படிக்க|மாணவர்|மாணவி|மாணவர்கள்|கல்வி|பள்ளி|ஸ்காலர்ஷிப்|கல்விக்கட்டணம்)/.test(text)) {
    profile.occupation = "student";
    profile.is_student = true;
    profile.primary_need = detectedLang === "ta" 
      ? "கல்லூரி மேற்படிப்பு அரசு உதவித்தொகை மற்றும் கல்வி உதவி" 
      : "College higher education scholarship and financial assistance";
  }
  // Farmer / Agriculture / Crop Damage
  else if (/\b(farmer|kisan|agriculture|cultivator|farming|crop|damaged|disaster|harvest|yield)\b/i.test(text) ||
           /(விவசாயி|விவசாயம்|பயிர்|சேதம்|சேதமடைந்துள்ளது|பயிர்க்கடன்|பயிர்\s*காப்பீடு|வேளாண்|வேளாண்மை|விவசாய\s*நிலம்|மழை\s*சேதம்|வறட்சி)/.test(text)) {
    profile.occupation = "farmer";
    if (/crop|damage|சேதம்|காப்பீடு|disaster|loss/i.test(text)) {
      profile.primary_need = detectedLang === "ta"
        ? "பயிர் சேத நிவாரணம் மற்றும் விவசாய காப்பீட்டு உதவி"
        : "Crop damage relief, disaster compensation and agriculture insurance support";
    } else {
      profile.primary_need = detectedLang === "ta"
        ? "விவசாய நலத்திட்டங்கள் மற்றும் இடுபொருள் மானியம்"
        : "Farmer welfare assistance, input subsidy and financial grants";
    }
  }
  // Street Vendor
  else if (/\b(street vendor|vendor|hawker|thela|rehri)\b/i.test(text) || /(தெருவோர\s*வியாபாரி|வியாபாரம்)/.test(text)) {
    profile.occupation = "street_vendor";
  }
  // Artisan / Craftsman
  else if (/\b(artisan|craftsman|weaver|carpenter|potter|blacksmith)\b/i.test(text) || /(நெசவாளர்|கைவினைஞர்|தச்சர்|கொல்லர்)/.test(text)) {
    profile.occupation = "artisan";
  }
  // Small business / Entrepreneur / SHG
  else if (/\b(small business|shopkeeper|dukaan|entrepreneur|store owner|startup|shg)\b/i.test(text) || /(சுயதொழில்|தொழில்\s*முனைவோர்|கடை|சுயஉதவிக்குழு)/.test(text)) {
    profile.occupation = "small_business_owner";
    profile.primary_need = detectedLang === "ta"
      ? "தொழில் தொடங்குவதற்கான மானியக் கடன் மற்றும் உதவி"
      : "Business startup subsidy and micro-enterprise loan";
  }
  // Unemployed
  else if (/\b(unemployed|no job|berozgar)\b/i.test(text) || /(வேலையில்லாத|வேலைவாய்ப்பு)/.test(text)) {
    profile.occupation = "unemployed";
  }
  // Daily wage worker / Construction
  else if (/\b(daily wage|laborer|labourer|majdoor|mazdoor|construction worker)\b/i.test(text) || /(கூலி\s*தொழிலாளி|கட்டுமான\s*தொழிலாளி|உடலுழைப்பு)/.test(text)) {
    profile.occupation = "daily_wage_worker";
  }

  // 5. Income extraction (English & Tamil)
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lpa|லட்சம்|இலட்சம்)/i);
  const directIncomeMatch = text.match(/(?:income|earning|salary|कमाई|आय|வருமானம்|சம்பளம்)(?:\s*is)?(?:\s*of)?\s*(?:rs\.?|inr|₹|ரூபாய்|ரூ\.?)?\s*(\d+[\d,]*)/i);
  if (lakhMatch) {
    profile.annual_income = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (directIncomeMatch) {
    const rawVal = directIncomeMatch[1].replace(/,/g, "");
    profile.annual_income = parseInt(rawVal, 10);
  } else if (/low income|poor|bpl|below poverty line|gareeb|ஏழை|வறுமை|வறுமைக்கோடு/i.test(text)) {
    profile.is_bpl = true;
    profile.annual_income = 80000;
  }

  // 6. Land Holding in acres
  const landMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:acres?|acre|एकड़|ஏக்கர்)/i);
  const bighaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bigha|बीघा)/i);
  if (landMatch) {
    profile.land_holding_acres = parseFloat(landMatch[1]);
  } else if (bighaMatch) {
    profile.land_holding_acres = parseFloat((parseFloat(bighaMatch[1]) * 0.62).toFixed(2));
  }

  // 7. Disability extraction
  if (/\b(disabled|disability|divyang|handicapped|blind|deaf|pwd)\b/i.test(text) ||
      /(மாற்றுத்திறனாளி|ஊனம்|பார்வையற்ற)/.test(text)) {
    profile.has_disability = true;
  }

  // 8. Social Category extraction
  if (/\b(sc|scheduled caste)\b/i.test(text) || /(ஆதிதிராவிடர்|பட்டியலின)/.test(text)) {
    profile.category = "SC";
  } else if (/\b(st|scheduled tribe)\b/i.test(text) || /(பழங்குடியினர்)/.test(text)) {
    profile.category = "ST";
  } else if (/\b(obc|other backward class|bc|mbc)\b/i.test(text) || /(பிற்படுத்தப்பட்ட|மிகவும்\s*பிற்படுத்தப்பட்ட)/.test(text)) {
    profile.category = "OBC";
  } else if (/\b(ews|economically weaker section)\b/i.test(text)) {
    profile.category = "EWS";
  } else if (/\b(general category|general)\b/i.test(text) || /(பொதுப்பிரிவு)/.test(text)) {
    profile.category = "General";
  }

  // 9. State of residence
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "UP",
    "Uttarakhand", "West Bengal", "Delhi"
  ];
  for (const st of states) {
    const reg = new RegExp(`\\b${st}\\b`, "i");
    if (reg.test(text)) {
      profile.state = st === "UP" ? "Uttar Pradesh" : st;
      break;
    }
  }

  // Tamil script mentions or Tamil Nadu districts imply Tamil Nadu
  if (!profile.state) {
    if (/(தமிழ்நாடு|தமிழ்\s*நாடு|சென்னை|மதுரை|கோவை|கோயம்புத்தூர்|திருச்சி|சேலம்|திருநெல்வேலி|ஈரோடு|வேலூர்|தஞ்சாவூர்|திண்டுக்கல்)/.test(text) ||
        /[\u0B80-\u0BFF]/.test(text)) {
      profile.state = "Tamil Nadu";
    }
  }

  if (!profile.primary_need) {
    profile.primary_need = userText.slice(0, 150);
  }

  return profile;
}

/**
 * Extracts structured citizen information using Gemini API with bilingual English/Tamil intelligence.
 * Adheres strictly to rule: LLM only extracts structured profile, does NOT decide eligibility.
 */
export async function extractCitizenProfile(userText, currentProfile = {}) {
  const model = getAIModel();
  const detectedLang = detectLanguage(userText);

  if (!model) {
    console.log("[GeminiService] Using heuristic bilingual extractor (Gemini key not configured or fallback active).");
    const extracted = heuristicExtractCitizenProfile(userText);
    return { ...currentProfile, ...cleanObject(extracted), language: detectedLang };
  }

  const prompt = `
You are an expert bilingual citizen intake assistant for the Indian Government Scheme Navigator.
The citizen's request may be written in English, Tamil (தமிழ் script), or Tamil transliterated in English (Tanglish).

Existing profile data:
${JSON.stringify(currentProfile, null, 2)}

User request:
"${userText}"

Extract and return a valid JSON object matching this schema:
{
  "age": number or null (e.g. 35),
  "gender": string or null ("male", "female", "other"),
  "occupation": string or null (e.g. "farmer", "student", "street_vendor", "artisan", "small_business_owner", "unemployed", "daily_wage_worker", "retired"),
  "annual_income": number or null (total household annual income in INR, e.g. 150000),
  "land_holding_acres": number or null (total agricultural land in acres, e.g. 2.5),
  "state": string or null (Indian State/UT, e.g. "Tamil Nadu", "Uttar Pradesh", "Karnataka"),
  "category": string or null ("SC", "ST", "OBC", "EWS", "General"),
  "marital_status": string or null ("single", "married", "widow", "divorced"),
  "has_disability": boolean or null,
  "is_student": boolean or null,
  "is_bpl": boolean or null,
  "primary_need": string or null (brief English summary of what citizen is seeking),
  "language": "en" or "ta" (language used by citizen)
}

IMPORTANT RULES:
1. Always output standard English values for keys and categories (e.g. occupation: "student" or "farmer", state: "Tamil Nadu", gender: "female").
2. If the user writes in Tamil script (e.g. "எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்"), understand that occupation="student", is_student=true, state="Tamil Nadu", language="ta".
3. If the user writes "I'm a farmer and my crop was damaged", understand that occupation="farmer", primary_need="Crop damage relief and agriculture insurance", language="en".
4. Only extract information explicitly mentioned or unambiguously implied. Leave unmentioned fields as null.
5. Output ONLY valid JSON, without any commentary.
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("```json")) {
      text = text.substring(7);
    }
    if (text.startsWith("```")) {
      text = text.substring(3);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    
    const parsed = JSON.parse(text.trim());
    return { ...currentProfile, ...cleanObject(parsed), language: parsed.language || detectedLang };
  } catch (error) {
    console.error("[GeminiService] Error calling Gemini API:", error.message);
    const fallback = heuristicExtractCitizenProfile(userText);
    return { ...currentProfile, ...cleanObject(fallback), language: detectedLang };
  }
}

/**
 * Generates an empathetic conversational overview and follow-up guidance in the citizen's chosen language.
 * Strict rule: Grounded strictly on the deterministic evaluation results.
 */
export async function generateCitizenExplanation(citizenProfile, evaluatedSchemes, language = "en") {
  const eligibleSchemes = evaluatedSchemes.filter(s => s.status === "ELIGIBLE" || s.potentialMatch);
  const potentialSchemes = evaluatedSchemes.filter(s => s.status === "POTENTIALLY_ELIGIBLE" || (!s.potentialMatch && s.missingCriteria?.length > 0));

  const activeLang = language || citizenProfile.language || detectLanguage(citizenProfile.primary_need || "");
  const model = getAIModel();

  if (!model) {
    return generateHeuristicExplanation(citizenProfile, eligibleSchemes, potentialSchemes, activeLang);
  }

  const prompt = `
You are a helpful, polite Indian public service counselor speaking ${activeLang === "ta" ? "in Tamil (தமிழ்)" : "in English"}.
Summarize the scheme evaluation results for a citizen in clear, respectful ${activeLang === "ta" ? "Tamil" : "English"}.

Citizen Profile:
${JSON.stringify(citizenProfile, null, 2)}

Evaluation Summary:
- Schemes where citizen appears to meet published criteria (${eligibleSchemes.length}): ${eligibleSchemes.map(s => s.name).join(", ") || "None"}
- Schemes requiring more information (${potentialSchemes.length}): ${potentialSchemes.map(s => s.name).join(", ") || "None"}

CRITICAL RULES:
1. NEVER claim the citizen is officially approved or guaranteed benefits. Always state "You appear to meet the published criteria" (${activeLang === "ta" ? "வெளியிடப்பட்ட தகுதி விதிகளுடன் நீங்கள் பொருந்துகிறீர்கள்" : "You appear to meet the published criteria"}).
2. Emphasize that final decision rests with the designated government department.
3. Keep official scheme names (e.g. "Pudhumai Penn", "PM-KISAN", "Kalaignar Magalir Urimai Thogai") intact and identifiable.
4. Provide a supportive, clear 2-3 paragraph summary.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim() || generateHeuristicExplanation(citizenProfile, eligibleSchemes, potentialSchemes, activeLang);
  } catch (err) {
    console.warn("[GeminiService] Explanation generation fallback:", err.message);
    return generateHeuristicExplanation(citizenProfile, eligibleSchemes, potentialSchemes, activeLang);
  }
}

function generateHeuristicExplanation(citizenProfile, eligibleSchemes, potentialSchemes, language = "en") {
  if (language === "ta") {
    let summary = "";
    if (eligibleSchemes.length > 0) {
      summary += `நீங்கள் வழங்கிய தகவல்களின் அடிப்படையில், **${eligibleSchemes.length} அரசு நலத்திட்டங்களின்** தகுதி விதிகளோடு நீங்கள் பொருந்துகிறீர்கள் (எ.கா. **${eligibleSchemes[0].name}**).\n\n`;
    } else {
      summary += `உங்கள் விவரங்கள் அரசு நலத்திட்டங்களின் வழிகாட்டுதல்களோடு ஒப்பிடப்பட்டு பகுப்பாய்வு செய்யப்பட்டுள்ளது.\n\n`;
    }

    if (potentialSchemes.length > 0) {
      summary += `கூடுதலாக **${potentialSchemes.length} சாத்தியமான நலத்திட்டங்கள்** உங்களுக்கு உதவக்கூடும். உங்கள் தகுதியை முழுமையாக உறுதி செய்ய, திட்ட அட்டைகளில் குறிப்பிடப்பட்டுள்ள கூடுதல் விவரங்களை சரிபார்க்கவும்.\n\n`;
    }

    summary += `*குறிப்பு: இந்த வழிகாட்டி பொதுவில் வெளியிடப்பட்ட அரசு விதிகளின் அடிப்படையில் மட்டுமே ஆலோசனை வழங்குகிறது. அதிகாரப்பூர்வ தகுதி மற்றும் அனுமதி அரசு துறையின் நேரடி சரிபார்ப்புக்கு உட்பட்டது.*`;
    return summary;
  }

  let summary = "";
  if (eligibleSchemes.length > 0) {
    summary += `Based on the details you provided, you appear to meet the published eligibility criteria for **${eligibleSchemes.length} government scheme(s)**, including **${eligibleSchemes[0].name}**.\n\n`;
  } else {
    summary += `We analyzed the current published guidelines against your details.\n\n`;
  }

  if (potentialSchemes.length > 0) {
    summary += `We also found **${potentialSchemes.length} potentially relevant scheme(s)** that might benefit you. To confirm whether you qualify, please fill in or verify the missing profile fields highlighted on each scheme card.\n\n`;
  }

  summary += `*Note: This platform provides advisory guidance based on publicly available criteria. Formal approval requires verification by designated government authorities.*`;

  return summary;
}

function cleanObject(obj) {
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}
