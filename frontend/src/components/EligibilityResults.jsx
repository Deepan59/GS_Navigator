import React, { useState } from "react";
import SchemeCard from "./SchemeCard";
import { Sparkles, CheckCircle2, HelpCircle, Layers, AlertCircle } from "lucide-react";

export default function EligibilityResults({ results, summary, missingFields, onUpdateField }) {
  const [filterTab, setFilterTab] = useState("all-matching");

  if (!results || results.length === 0) {
    return null;
  }

  const eligibleSchemes = results.filter(s => s.status === "ELIGIBLE");
  const potentialSchemes = results.filter(s => s.status === "POTENTIALLY_ELIGIBLE");
  const ineligibleSchemes = results.filter(s => s.status === "INELIGIBLE");

  let displayedSchemes = [];
  if (filterTab === "eligible") {
    displayedSchemes = eligibleSchemes;
  } else if (filterTab === "potential") {
    displayedSchemes = potentialSchemes;
  } else if (filterTab === "all-matching") {
    displayedSchemes = [...eligibleSchemes, ...potentialSchemes];
  } else {
    displayedSchemes = results;
  }

  return (
    <div className="space-y-6">
      {/* AI Conversational Summary */}
      {summary && (
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>AI Public Service Counselor Summary</span>
          </div>
          <p className="text-sm sm:text-base text-blue-50/95 leading-relaxed whitespace-pre-line font-normal">
            {summary}
          </p>
        </div>
      )}

      {/* Filter Tabs & Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTab("all-matching")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              filterTab === "all-matching"
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Relevant Schemes ({eligibleSchemes.length + potentialSchemes.length})
          </button>

          <button
            onClick={() => setFilterTab("eligible")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filterTab === "eligible"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Appears Eligible ({eligibleSchemes.length})</span>
          </button>

          <button
            onClick={() => setFilterTab("potential")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filterTab === "potential"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Requires More Info ({potentialSchemes.length})</span>
          </button>

          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === "all"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Show All Catalog ({results.length})
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Showing {displayedSchemes.length} scheme(s)
        </span>
      </div>

      {/* Scheme Cards Grid */}
      {displayedSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-semibold text-slate-800">No schemes found in this filter</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching tabs or refining your citizen profile details to explore other government opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onQuickUpdateField={onUpdateField}
            />
          ))}
        </div>
      )}
    </div>
  );
}
