import React, { useState } from "react";
import {
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  XCircle,
  FileText,
  Building2,
  Gift,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Eye,
  ArrowRight,
  Info
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function SchemeCard({ item, onSelectDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState({});
  const { t, language } = useLanguage();

  const scheme = item.scheme || item;
  const eligibility = item.eligibility || {
    potentialMatch: item.potentialMatch,
    matchedCriteria: item.matchedCriteria || [],
    failedCriteria: item.failedCriteria || [],
    missingCriteria: item.missingCriteria || []
  };

  const isPotential = eligibility.potentialMatch === true;
  const isFullyMatched = isPotential && (eligibility.missingCriteria?.length === 0 || !eligibility.missingCriteria);
  const isNeedsInfo = isPotential && (eligibility.missingCriteria?.length > 0);
  const isDisqualified = !isPotential;

  const toggleDoc = (e, doc) => {
    e.stopPropagation();
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const officialUrl = scheme.application?.url || scheme.source?.url || "https://www.tn.gov.in";
  const benefits = Array.isArray(scheme.benefits) ? scheme.benefits : [scheme.benefits || scheme.description];
  const requiredDocs = scheme.requiredDocuments || [];

  return (
    <div
      onClick={() => onSelectDetails(scheme)}
      className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 ${
        isFullyMatched
          ? "border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20"
          : isNeedsInfo
          ? "border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-500/20"
          : "border-slate-200 dark:border-slate-800 opacity-80"
      }`}
    >
      {/* Top Header Strip */}
      <div
        className={`px-3 py-1.5 sm:px-4 sm:py-2 border-b flex items-center justify-between gap-2 text-[11px] sm:text-xs font-bold ${
          isFullyMatched
            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60"
            : isNeedsInfo
            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
        }`}
      >
        <div 
          className="flex items-center gap-1.5 shrink-0" 
          title={isFullyMatched ? t("statusAppearsEligible") : isNeedsInfo ? t("statusPotentiallyEligible") : t("statusDisqualified")}
        >
          {isFullyMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          {isNeedsInfo && <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
          {isDisqualified && <XCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            {scheme.level || "Tamil Nadu"}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300">
            {scheme.category || "General"}
          </span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 text-slate-800 dark:text-slate-200">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-lg font-bold sm:font-extrabold text-slate-900 dark:text-white leading-snug hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
            {scheme.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{scheme.department || "Government Department"}</span>
          </p>
        </div>

        {/* Short Description */}
        {scheme.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {scheme.description}
          </p>
        )}

        {/* Key Benefits Highlight */}
        {benefits.length > 0 && (
          <div className="bg-blue-50/60 dark:bg-blue-950/30 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-blue-100/80 dark:border-blue-900/50 space-y-0.5">
            <div className="text-[10px] sm:text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t("benefitsTitle")}:</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
              {benefits[0]}
            </p>
          </div>
        )}

        {/* Quick Criteria Highlights */}
        <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
          {eligibility.matchedCriteria && eligibility.matchedCriteria.slice(0, 2).map((c, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md sm:rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">{c}</span>
            </span>
          ))}
          {eligibility.missingCriteria && eligibility.missingCriteria.slice(0, 1).map((c, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md sm:rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium flex items-center gap-1">
              <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">{c}</span>
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectDetails(scheme);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer shadow-2xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{language === "ta" ? "முழு விவரங்கள்" : "View Detailed Information"}</span>
            </button>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <span>{language === "ta" ? "அரசு தளம்" : "Official Portal"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center sm:justify-end gap-1 cursor-pointer py-1"
          >
            <span>{isExpanded ? (language === "ta" ? "சுருக்கவும்" : "Hide Rules") : (language === "ta" ? "விதி சரிபார்ப்பு" : "Quick Rules")}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded Rules & Documents */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150 text-xs" onClick={(e) => e.stopPropagation()}>
            {/* Matched Criteria */}
            {eligibility.matchedCriteria && eligibility.matchedCriteria.length > 0 && (
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("matchedCriteriaTitle")} ({eligibility.matchedCriteria.length})</span>
                </h5>
                <div className="grid grid-cols-1 gap-1.5">
                  {eligibility.matchedCriteria.map((c, idx) => (
                    <div key={idx} className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 flex items-start gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Criteria */}
            {eligibility.missingCriteria && eligibility.missingCriteria.length > 0 && (
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{t("missingCriteriaTitle")} ({eligibility.missingCriteria.length})</span>
                </h5>
                <div className="space-y-1.5">
                  {eligibility.missingCriteria.map((c, idx) => (
                    <div key={idx} className="bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/80 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 flex items-start gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1 shrink-0"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents Checklist */}
            {requiredDocs.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span>{t("documentsTitle")} ({requiredDocs.length})</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  {requiredDocs.map((doc, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checkedDocs[doc])}
                        onChange={(e) => toggleDoc(e, doc)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3 h-3"
                      />
                      <span className={checkedDocs[doc] ? "line-through text-slate-400 dark:text-slate-500 font-medium" : "font-medium"}>
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
    </div>
  );
}
