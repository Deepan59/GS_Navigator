import React from "react";
import { Building2, ShieldCheck, Moon, Sun, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ totalSchemes = 100 }) {
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-200 w-full overflow-hidden">
      {/* Top Tricolor Banner */}
      <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Gov Emblem Branding & myScheme Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs border border-slate-700/50 shrink-0">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base md:text-lg tracking-tight leading-none truncate">
              my<span className="text-emerald-600 dark:text-emerald-400">Scheme</span>
            </span>
            <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 uppercase tracking-wider leading-none shrink-0">
              AI Nav
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </button>

          {/* Language Switcher: Compact Toggle on Mobile, Split Pills on Desktop */}
          {/* Mobile Single-Tap Toggle */}
          <button
            onClick={toggleLanguage}
            className="sm:hidden px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            title="Toggle Language / மொழி மாற்றுக"
          >
            <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>{language === "en" ? "தமிழ்" : "EN"}</span>
          </button>

          {/* Desktop Dual-Pill Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ta")}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === "ta"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Total verified schemes badge (desktop only) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-300 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{totalSchemes} {t("verifiedSchemes")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
