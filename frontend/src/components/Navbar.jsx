import React from "react";
import { Building2, RefreshCw, BookOpen, ShieldCheck, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({ onReset, healthInfo, totalSchemes = 100 }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Tricolor Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Gov Emblem Branding & myScheme Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/20">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none">
                my<span className="text-emerald-600">Scheme</span>
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                AI Navigator
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
              {t("appTagline")}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === "en"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("ta")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === "ta"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              தமிழ்
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalSchemes} {t("verifiedSchemes")}</span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title={t("resetBtn")}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t("resetBtn")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
