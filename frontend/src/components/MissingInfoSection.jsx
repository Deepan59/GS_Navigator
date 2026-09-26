import React, { useState } from "react";
import { HelpCircle, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function MissingInfoSection({ missingInfo = [], onProvideInfo, isLoading }) {
  const [answers, setAnswers] = useState({});
  const { t, language } = useLanguage();

  if (!missingInfo || missingInfo.length === 0) return null;

  const handleInputChange = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    const parts = [];
    if (answers.age) parts.push(`My age is ${answers.age}`);
    if (answers.state) parts.push(`I reside in ${answers.state}`);
    if (answers.annual_income) parts.push(`My annual household income is Rs. ${answers.annual_income}`);
    if (answers.occupation) parts.push(`My occupation is ${answers.occupation}`);

    if (parts.length > 0) {
      onProvideInfo(parts.join(". "));
    }
  };

  return (
    <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            {t("missingInfoTitle")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {t("missingInfoSubtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {missingInfo.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 bg-white/90 dark:bg-slate-800/90 p-3 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            <span className="font-medium">{item.message || item.requirement || item.field}</span>
          </div>
        ))}
      </div>

      {/* Quick Fill Form */}
      <form onSubmit={handleQuickSubmit} className="pt-2 border-t border-amber-200/60 dark:border-amber-800/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {missingInfo.some(m => m.field === "age") && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === "ta" ? "உங்கள் வயது" : "Your Age"}
            </label>
            <input
              type="number"
              placeholder={language === "ta" ? "எ.கா. 25" : "e.g. 25"}
              value={answers.age || ""}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {missingInfo.some(m => m.field === "annual_income") && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === "ta" ? "ஆண்டு வருமானம் (₹)" : "Annual Household Income (₹)"}
            </label>
            <input
              type="number"
              placeholder={language === "ta" ? "எ.கா. 120000" : "e.g. 120000"}
              value={answers.annual_income || ""}
              onChange={(e) => handleInputChange("annual_income", e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {missingInfo.some(m => m.field === "state") && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === "ta" ? "மாநிலம்" : "State / UT"}
            </label>
            <input
              type="text"
              placeholder={language === "ta" ? "எ.கா. Tamil Nadu" : "e.g. Tamil Nadu"}
              value={answers.state || ""}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {missingInfo.some(m => m.field === "occupation_or_intent" || m.field === "occupation") && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === "ta" ? "தொழில் / உதவி வகை" : "Occupation or Purpose"}
            </label>
            <input
              type="text"
              placeholder={language === "ta" ? "எ.கா. விவசாயி / மாணவர்" : "e.g. Farmer, Student, Artisan"}
              value={answers.occupation || ""}
              onChange={(e) => handleInputChange("occupation", e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        <div className="sm:col-span-2 pt-2">
          <button
            type="submit"
            disabled={isLoading || Object.keys(answers).length === 0}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{t("missingInfoSubmitBtn")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
