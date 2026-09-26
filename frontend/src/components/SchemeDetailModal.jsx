import React, { useState, useEffect } from "react";
import { X, ExternalLink, Building2, CheckCircle2, ShieldCheck, FileText, Gift, Info, FileCheck, Check, ArrowRight, MapPin, Tag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function SchemeDetailModal({ scheme, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [checkedDocs, setCheckedDocs] = useState({});
  const { t, language } = useLanguage();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!scheme) return null;

  const officialUrl = scheme.application?.url || scheme.source?.url || "https://www.tn.gov.in";
  const benefits = Array.isArray(scheme.benefits) ? scheme.benefits : [scheme.benefits || scheme.description].filter(Boolean);
  const requiredDocs = scheme.requiredDocuments || [];
  const eligibility = scheme.eligibility || {};

  const toggleDoc = (doc) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const getAgeText = () => {
    if (eligibility.age?.min && eligibility.age?.max) {
      return `${eligibility.age.min} - ${eligibility.age.max} ${language === "ta" ? "வயது" : "years"}`;
    }
    if (eligibility.age?.min) {
      return `${language === "ta" ? "குறைந்தபட்சம்" : "Min"} ${eligibility.age.min} ${language === "ta" ? "வயது" : "years"}`;
    }
    if (eligibility.age?.max) {
      return `${language === "ta" ? "அதிகபட்சம்" : "Max"} ${eligibility.age.max} ${language === "ta" ? "வயது" : "years"}`;
    }
    return language === "ta" ? "குறிப்பிட்ட வயது வரம்பு இல்லை" : "No specific age bar";
  };

  const getGenderText = () => {
    if (Array.isArray(eligibility.gender) && eligibility.gender.length > 0) {
      return eligibility.gender.map(g => g === "female" ? (language === "ta" ? "பெண்கள்" : "Female") : g === "male" ? (language === "ta" ? "ஆண்கள்" : "Male") : g).join(", ");
    }
    return language === "ta" ? "அனைத்து பாலினத்தவரும்" : "All genders";
  };

  const getIncomeText = () => {
    if (eligibility.annualIncomeMax) {
      return `${language === "ta" ? "ஆண்டுக்கு ₹" : "Up to ₹"}${Number(eligibility.annualIncomeMax).toLocaleString("en-IN")}`;
    }
    return language === "ta" ? "வருமான வரம்பு இல்லை" : "No income ceiling";
  };

  const getOccText = () => {
    if (Array.isArray(eligibility.occupation) && eligibility.occupation.length > 0) {
      return eligibility.occupation.join(", ");
    }
    return language === "ta" ? "அனைத்து தொழில்களும்" : "Any occupation";
  };

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-2.5 sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3.5 sm:px-6 sm:py-5 flex items-start justify-between gap-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                {scheme.level || "Tamil Nadu"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-slate-800 text-slate-300 uppercase tracking-wider border border-slate-700">
                {scheme.category || "General"}
              </span>
            </div>
            <h2 className="text-base sm:text-2xl font-extrabold leading-snug text-white">
              {scheme.name}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{scheme.department || "Government Department"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer border border-slate-700"
            title="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 4 Interactive Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 sm:px-6 overflow-x-auto gap-1 sm:gap-2 shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("modalTabOverview")}
          </button>
          <button
            onClick={() => setActiveTab("benefits")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "benefits"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("modalTabBenefits")}
          </button>
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "eligibility"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("modalTabEligibility")}
          </button>
          <button
            onClick={() => setActiveTab("application")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "application"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("modalTabApplication")} ({requiredDocs.length})
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {language === "ta" ? "திட்ட விளக்கம் & நோக்கம்" : "Scheme Objectives & Overview"}
                </h4>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {scheme.description || (language === "ta" ? "திட்ட விவரங்கள் அதிகாரப்பூர்வ அரசாணை அடிப்படையில் தொகுக்கப்பட்டுள்ளன." : "Detailed welfare scheme guidelines formulated per official government gazette.")}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs block font-bold">{t("departmentLabel")}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{scheme.department || "Public Welfare Department"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs block font-bold">{t("levelLabel")}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{scheme.level} ({scheme.state || "All India"})</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-1 text-xs text-amber-950 dark:text-amber-200">
                <h5 className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{t("sourceTitle")}</span>
                </h5>
                <p className="font-semibold">{scheme.source?.name || scheme.department}</p>
                {scheme.lastVerified && (
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">{t("lastVerifiedLabel")}: {scheme.lastVerified}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BENEFITS */}
          {activeTab === "benefits" && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("benefitsTitle")}</span>
              </h4>
              <div className="space-y-2.5">
                {benefits.map((b, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:text-emerald-400 mt-1.5 shrink-0"></span>
                    <span className="text-emerald-950 dark:text-emerald-200 font-bold leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ELIGIBILITY CRITERIA */}
          {activeTab === "eligibility" && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === "ta" ? "வெளியிடப்பட்ட அரசு தகுதி விதிகள்" : "Published Eligibility Criteria Breakdown"}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold">{t("profileFields")?.age || "Age"}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{getAgeText()}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold">{t("profileFields")?.gender || "Gender"}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white capitalize">{getGenderText()}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold">{t("profileFields")?.annual_income || "Income Ceiling"}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{getIncomeText()}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold">{t("profileFields")?.occupation || "Target Occupation"}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white capitalize">{getOccText()}</span>
                </div>
              </div>

              {eligibility.otherConditions && eligibility.otherConditions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">{language === "ta" ? "கூடுதல் நிபந்தனைகள்" : "Special Conditions"}</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {eligibility.otherConditions.map((cond, i) => (
                      <li key={i} className="leading-relaxed font-medium">{cond}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: APPLICATION & DOCUMENTS */}
          {activeTab === "application" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t("howToApplyTitle")}</span>
                </h4>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
                  {scheme.application?.method || t("onlineApplication")}. {language === "ta" ? "கீழே உள்ள அதிகாரப்பூர்வ இணையதள இணைப்பை பயன்படுத்தி விண்ணப்பிக்கலாம்." : "Visit the designated government portal using the official link below to submit your application."}
                </div>
              </div>

              {requiredDocs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t("documentsTitle")} ({requiredDocs.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === "ta" ? "விண்ணப்பிக்க தேவையான ஆவணங்களை சரிபார்க்கவும்:" : "Check off documents as you prepare your application:"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {requiredDocs.map((doc, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checkedDocs[doc])}
                          onChange={() => toggleDoc(doc)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className={checkedDocs[doc] ? "line-through text-slate-400 dark:text-slate-500 font-semibold" : "font-semibold text-slate-800 dark:text-slate-200"}>
                          {doc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            {t("closeBtn")}
          </button>
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span>{t("officialWebsiteBtn")}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
