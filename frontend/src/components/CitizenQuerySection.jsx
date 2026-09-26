import React, { useState } from "react";
import { Sparkles, Send, User, HelpCircle, ArrowRight } from "lucide-react";

const SAMPLE_QUERIES = [
  {
    label: "🌾 Small Farmer (UP)",
    text: "I am a 35-year-old small farmer living in Uttar Pradesh. I have 2 acres of agricultural land and an annual household income of about ₹1.2 Lakh. What government support can I get?"
  },
  {
    label: "👵 Elderly Widow (Bihar)",
    text: "I am a 65 year old widow residing in rural Bihar with no steady income source and living in a kutcha house."
  },
  {
    label: "🎓 College Student (OBC)",
    text: "I am a 20 year old OBC female student from Maharashtra pursuing degree college. Family annual income is ₹1.8 Lakh."
  },
  {
    label: "🛒 Urban Street Vendor",
    text: "I am a 28 year old street food vendor in Delhi needing working capital to expand my cart."
  },
  {
    label: "👧 Girl Child Savings",
    text: "I want to open a government savings scheme for my 5 year old daughter to fund her future higher education."
  },
  {
    label: "♿ Divyangjan Entrepreneur",
    text: "I am a 30 year old person with physical disability seeking loan support to start a computer repair shop."
  }
];

export default function CitizenQuerySection({ onSubmit, isLoading }) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSubmit(inputText);
  };

  const handleSelectSample = (text) => {
    setInputText(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-5">
      <div>
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Describe Your Situation or Need in Natural Language</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Find Government Schemes You Appear to Qualify For
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Tell us about your age, location, occupation, family income, or specific support needed. Gemini will extract your details, and our verified rules engine will calculate matching schemes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-slate-50/50">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'I am a 38-year-old farmer in Madhya Pradesh with 1.8 acres of land and ₹90,000 yearly income. Are there any schemes for farming assistance and family health?'"
            rows={4}
            className="w-full p-4 bg-transparent resize-none outline-none text-slate-800 placeholder-slate-400 text-sm sm:text-base leading-relaxed"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/70 border-t border-slate-200/70 rounded-b-xl">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              English, Hindi, or mixed language accepted
            </span>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Analyzing & Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Eligibility</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick sample scenarios */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Or try a sample citizen persona:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.text)}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/70 rounded-lg text-slate-700 font-medium transition-all text-left"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
