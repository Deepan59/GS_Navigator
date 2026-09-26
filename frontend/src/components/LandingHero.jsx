import React from "react";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, BookOpen, Layers, Search, FileCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LandingHero({ onStartAssistant, onSelectSamplePrompt, totalSchemes = 100 }) {
  const { t, translations, language } = useLanguage();
  const personas = translations.personas || [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-semibold tracking-wide backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t("heroBadge")}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              {t("heroSubtitle")}
            </p>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartAssistant}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>{t("heroCta")}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Persona Chips */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">
              {t("heroPersonaLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {personas.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSamplePrompt(chip.query)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-blue-100 hover:text-white transition-all text-left font-medium cursor-pointer shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Scheme Discovery Process */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          {t("heroStepsTitle")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t("step1Title")}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t("step1Desc")}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t("step2Title")}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t("step2Desc")}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t("step3Title")}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t("step3Desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
