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
      className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer hover:border-blue-400 ${
        isFullyMatched
          ? "border-emerald-300 ring-1 ring-emerald-500/20"
          : isNeedsInfo
          ? "border-amber-300 ring-1 ring-amber-500/20"
          : "border-slate-200 opacity-80"
      }`}
    >
      {/* Top Header Strip */}
      <div
        className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-bold ${
          isFullyMatched
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : isNeedsInfo
            ? "bg-amber-50 text-amber-900 border-amber-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {isFullyMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {isNeedsInfo && <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />}
          {isDisqualified && <XCircle className="w-4 h-4 text-slate-500 shrink-0" />}
          <span>
            {isFullyMatched && t("statusAppearsEligible")}
            {isNeedsInfo && `${t("statusPotentiallyEligible")} (${language === "ta" ? "கூடுதல் தகவல் தேவை" : "More Info Needed"})`}
            {isDisqualified && t("statusDisqualified")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white border border-slate-200 text-slate-700">
            {scheme.level || "Tamil Nadu"}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white border border-slate-200 text-blue-700">
            {scheme.category || "General"}
          </span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-6 space-y-4 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug hover:text-blue-700 transition-colors">
              {scheme.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{scheme.department || "Government Department"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectDetails(scheme);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer shadow-2xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{language === "ta" ? "முழு திட்ட தகவல்" : "View Scheme Details"}</span>
            </button>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <span>{language === "ta" ? "அரசு தளம்" : "Official Portal"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Short Description */}
        {scheme.description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {scheme.description}
          </p>
        )}

        {/* Key Benefits Highlight */}
        {benefits.length > 0 && (
          <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100/80 space-y-1">
            <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-blue-600" />
              <span>{t("benefitsTitle")}:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              {benefits[0]}
            </p>
          </div>
        )}

        {/* Quick Criteria Highlights */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          {eligibility.matchedCriteria && eligibility.matchedCriteria.slice(0, 3).map((c, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{c}</span>
            </span>
          ))}
          {eligibility.missingCriteria && eligibility.missingCriteria.slice(0, 2).map((c, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-amber-600" />
              <span>{c}</span>
            </span>
          ))}
        </div>

        {/* Toggle Detailed Breakdown Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? (language === "ta" ? "விதி சரிபார்ப்பை மறை" : "Hide Rules Breakdown") : (language === "ta" ? "விதி சரிபார்ப்பை விரிவாக்கு" : "View Eligibility & Document Rules")}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
            <span>{language === "ta" ? "விவரங்களை காண கிளிக் செய்யவும்" : "Click card for full details"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Expanded Rules & Documents */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150" onClick={(e) => e.stopPropagation()}>
            {/* Matched Criteria */}
            {eligibility.matchedCriteria && eligibility.matchedCriteria.length > 0 && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("matchedCriteriaTitle")} ({eligibility.matchedCriteria.length})</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {eligibility.matchedCriteria.map((c, idx) => (
                    <div key={idx} className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80 text-emerald-950 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Criteria */}
            {eligibility.missingCriteria && eligibility.missingCriteria.length > 0 && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t("missingCriteriaTitle")} ({eligibility.missingCriteria.length})</span>
                </h5>
                <div className="space-y-1.5 text-xs">
                  {eligibility.missingCriteria.map((c, idx) => (
                    <div key={idx} className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 text-amber-950 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents Checklist */}
            {requiredDocs.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t("documentsTitle")} ({requiredDocs.length})</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {requiredDocs.map((doc, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checkedDocs[doc])}
                        onChange={(e) => toggleDoc(e, doc)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span className={checkedDocs[doc] ? "line-through text-slate-400 font-medium" : "font-medium"}>
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
