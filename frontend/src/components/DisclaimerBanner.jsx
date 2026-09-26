import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function DisclaimerBanner() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 p-4 text-amber-950 dark:text-amber-200 shadow-2xs flex items-start gap-3.5 text-xs sm:text-sm transition-colors">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
          <span>{t("disclaimerTitle")}</span>
        </p>
        <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
          {t("disclaimerBody")}
        </p>
      </div>
    </div>
  );
}
