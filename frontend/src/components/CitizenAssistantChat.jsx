import React, { useState } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  MessageSquare,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CitizenAssistantChat({
  onSendMessage,
  isLoading,
  error,
  conversationHistory = [],
  extractedProfile = {},
  onReset,
  onEditBasicDetails
}) {
  const [inputText, setInputText] = useState("");
  const { t, language } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText("");
    onSendMessage(msg);
  };

  const handleQuickPromptClick = (promptText) => {
    if (isLoading) return;
    setInputText("");
    onSendMessage(promptText);
  };

  const hasExtractedDetails = Object.keys(extractedProfile).length > 0;
  const profileFields = t("profileFields") || {};
  const b = t("basicDetails") || {};

  // Generate contextual suggested prompts based on occupation and profile
  const getContextualPrompts = () => {
    const occ = (extractedProfile.occupation || "").toLowerCase();
    const isTa = language === "ta";

    if (occ.includes("student") || extractedProfile.is_student) {
      return isTa ? [
        "எனக்கு கல்லூரி படிப்புக்கு கல்வி உதவித்தொகை மற்றும் கட்டணச் சலுகை வேண்டும்.",
        "மாணவர்களுக்கான இலவச மடிக்கணினி திட்டம் மற்றும் தங்கும் விடுதி உதவி.",
        "புதுமைப் பெண் திட்டம் - அரசு பள்ளி மாணவிகளுக்கான ₹1000 உதவித்தொகை."
      ] : [
        "I need a college scholarship for higher education tuition and exam fees.",
        "Free laptop scheme and hostel accommodation aid for students.",
        "Post-matric scholarship and educational grant for backward classes."
      ];
    }

    if (occ.includes("farm") || occ.includes("agri")) {
      return isTa ? [
        "நான் ஒரு விவசாயி, எனது பயிர் மழையால் சேதமடைந்துள்ளது. இழப்பீட்டு உதவி தேவை.",
        "சொட்டு நீர் பாசனம் மற்றும் சோலார் பம்புசெட் மானியம் பெற வேண்டும்.",
        "பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN) ₹6000 ஆண்டு உதவித்தொகை."
      ] : [
        "I'm a farmer and my crop was damaged by flood/unseasonal rain.",
        "Drip irrigation subsidy and solar water pump assistance.",
        "PM Kisan ₹6,000 annual installment and fertilizer subsidy."
      ];
    }

    if (occ.includes("business") || occ.includes("vendor") || occ.includes("artisan")) {
      return isTa ? [
        "சுயதொழில் தொடங்க 35% அரசு மானியத்துடன் கூடிய கடன் (PMEGP).",
        "சாலையோர வியாபாரிகளுக்கான பிரதம மந்திரி ஸ்வநிதி கடன் திட்டம் (PM SVANidhi).",
        "கைவினைஞர்களுக்கான பிரதம மந்திரி விஸ்வகர்மா திட்டம் மற்றும் உபகரண உதவி."
      ] : [
        "I want to start a small business and need a loan with government subsidy (PMEGP).",
        "PM SVANidhi collateral-free working capital loan for street vendors.",
        "PM Vishwakarma financial support and modern toolkit grant for artisans."
      ];
    }

    if (occ.includes("senior") || (extractedProfile.age && extractedProfile.age >= 60)) {
      return isTa ? [
        "60 வயது முதியோர் மாதாந்திர ஓய்வூதியம் (OAP) மற்றும் உதவித்தொகை.",
        "முதலமைச்சர் விரிவான மருத்துவ காப்பீட்டு திட்டம் (CMCHIS) இலவச சிகிச்சை.",
        "மூத்த குடிமக்களுக்கான உதவி உபகரணங்கள் மற்றும் கண் சிகிச்சை."
      ] : [
        "Monthly Indira Gandhi National Old Age Pension Scheme (IGNOAPS / OAP).",
        "Free hospital surgeries under Chief Minister's Comprehensive Health Insurance.",
        "Senior citizen assistive living devices and welfare pension."
      ];
    }

    if (extractedProfile.gender === "female" || occ.includes("homemaker")) {
      return isTa ? [
        "கலைஞர் மகளிர் உரிமைத் திட்டம் - குடும்பத் தலைவிகளுக்கு மாதம் ₹1000.",
        "சத்தியவாணி முத்து அம்மையார் நினைவு இலவச தையல் இயந்திரம் வழங்கும் திட்டம்.",
        "மகளிர் சுயஉதவிக் குழு கடன் உதவி மற்றும் சிறுதொழில் மானியம்."
      ] : [
        "Kalaignar Magalir Urimai Thogai ₹1000 monthly basic income for women heads.",
        "Free sewing machine scheme for destitute widows and women entrepreneurs.",
        "Women Self-Help Group (SHG) bank credit linkage and livelihood subsidy."
      ];
    }

    // Default general prompts
    return isTa ? [
      "எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்.",
      "நான் ஒரு விவசாயி, எனது பயிர் சேதமடைந்துள்ளது. என்ன உதவி கிடைக்கும்?",
      "ஏழை குடும்பத்தினருக்கு இலவச மருத்துவ சிகிச்சை மற்றும் காப்பீடு தேவை."
    ] : [
      "I need a college education scholarship for tuition fees.",
      "I'm a farmer and my crop was damaged. What government support might be available?",
      "Low income family looking for free government healthcare and hospital surgery."
    ];
  };

  const contextualPrompts = getContextualPrompts();

  return (
    <div
      id="citizen-assistant-section"
      className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-white leading-tight flex items-center gap-1.5 sm:gap-2">
              <span>{t("chatTitle")}</span>
              {hasExtractedDetails && (
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
                  {b.stepBadge ? "Step 2 of 2" : "Active"}
                </span>
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {t("chatSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditBasicDetails && (
            <button
              onClick={onEditBasicDetails}
              className="text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700/50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{b.editBasicDetails || "Edit Details"}</span>
            </button>
          )}

          {conversationHistory.length > 0 && (
            <button
              onClick={onReset}
              className="text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t("chatResetBtn")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Understood Profile Attributes Preview Bar */}
      {hasExtractedDetails && (
        <div className="bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {b.profileCaptured || t("liveProfileTitle")}
            </span>
            {onEditBasicDetails && (
              <button
                type="button"
                onClick={onEditBasicDetails}
                className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 cursor-pointer underline underline-offset-2"
              >
                <Edit3 className="w-3 h-3" />
                <span>{b.editBasicDetails || "Edit Details"}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {extractedProfile.age && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                {profileFields.age || "Age"}: <strong>{extractedProfile.age} yrs</strong>
              </span>
            )}
            {extractedProfile.gender && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                {profileFields.gender || "Gender"}: <strong className="capitalize">{extractedProfile.gender}</strong>
              </span>
            )}
            {extractedProfile.occupation && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                {profileFields.occupation || "Occupation"}: <strong className="capitalize">{extractedProfile.occupation}</strong>
              </span>
            )}
            {extractedProfile.state && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                {profileFields.state || "State"}: <strong>{extractedProfile.state}</strong>
              </span>
            )}
            {extractedProfile.annual_income !== undefined && extractedProfile.annual_income !== null && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                {profileFields.annual_income || "Income"}: <strong>₹{Number(extractedProfile.annual_income).toLocaleString("en-IN")}</strong>
              </span>
            )}
            {extractedProfile.category && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                {profileFields.category || "Category"}: <strong>{extractedProfile.category}</strong>
              </span>
            )}
            {extractedProfile.has_disability && (
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium">
                <strong>{language === "ta" ? "மாற்றுத்திறனாளி (PwD)" : "Differently Abled"}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Conversation Stream */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[380px] sm:max-h-[420px] overflow-y-auto">
        {conversationHistory.length === 0 ? (
          <div className="py-4 sm:py-6 text-center space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-base">
                {hasExtractedDetails 
                  ? (language === "ta" ? "உங்கள் சூழ்நிலை அல்லது தேவையை விவரிக்கவும்" : "Describe Your Specific Need or Situation")
                  : (language === "ta" ? "உங்கள் தேவையை இங்கே பகிருங்கள்" : "How can we assist you today?")}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {hasExtractedDetails
                  ? (language === "ta"
                      ? "உங்கள் அடிப்படை விவரங்கள் பதியப்பட்டுள்ளன. உங்களுக்கு என்ன உதவி தேவை என்பதை தமிழ், Tanglish அல்லது ஆங்கிலத்தில் விவரிக்கவும் (எ.கா: 'kalloori hostel matrum scholarship thevai', 'vivasayi payir sedham')."
                      : "We've captured your basic profile! Now describe your need in English, தமிழ், or Tanglish (e.g. 'enakku kalloori hostel thevai', 'scholarship assistance', 'crop damage relief').")
                  : (language === "ta"
                      ? "கல்லூரி படிப்பு, பயிர் சேதம், தொழில் கடன் போன்ற தேவைகளை தமிழ், Tanglish அல்லது ஆங்கிலத்தில் எழுதலாம்."
                      : "Type your situation in everyday English, தமிழ், or Tanglish. We evaluate verified government criteria deterministically.")}
              </p>
            </div>

            {/* Contextual Quick Suggestions */}
            <div className="pt-2 text-left max-w-xl mx-auto space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{b.quickPromptsTitle || "Suggested Situations For You:"}</span>
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {contextualPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPromptClick(prompt)}
                    className="w-full text-left p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-slate-600 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-white font-medium transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <span className="leading-snug">{prompt}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0 text-xs">➔</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          conversationHistory.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 sm:gap-3 ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {item.role !== "user" && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  item.role === "user"
                    ? "bg-blue-700 dark:bg-blue-600 text-white rounded-tr-none shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                }`}
              >
                {item.text}
              </div>
              {item.role === "user" && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5 sm:gap-3 text-slate-500 dark:text-slate-400 text-xs py-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span className="text-[11px] sm:text-xs">{t("chatEvaluating")}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t("chatPlaceholder")}
            disabled={isLoading}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">{t("chatSendBtn")}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
