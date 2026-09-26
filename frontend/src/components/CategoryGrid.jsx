import React from "react";
import { 
  Sprout, 
  GraduationCap, 
  HeartPulse, 
  Briefcase, 
  Users, 
  ShieldAlert, 
  Zap, 
  Home, 
  Wrench, 
  Accessibility, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const CORE_CATEGORIES = [
  {
    id: "agriculture",
    nameEn: "Agriculture & Rural",
    nameTa: "விவசாயம் & ஊரகம்",
    icon: Sprout,
    color: "emerald",
    bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900",
    iconBg: "bg-emerald-600 text-white",
    filterTerm: "Agriculture",
    count: 17
  },
  {
    id: "education",
    nameEn: "Education & Learning",
    nameTa: "கல்வி & படிப்பு",
    icon: GraduationCap,
    color: "blue",
    bg: "bg-blue-50 hover:bg-blue-100/80 border-blue-200 text-blue-900",
    iconBg: "bg-blue-600 text-white",
    filterTerm: "Education",
    count: 23
  },
  {
    id: "health",
    nameEn: "Health & Wellness",
    nameTa: "மருத்துவம் & நல்வாழ்வு",
    icon: HeartPulse,
    color: "rose",
    bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-900",
    iconBg: "bg-rose-600 text-white",
    filterTerm: "Healthcare",
    count: 8
  },
  {
    id: "business",
    nameEn: "Business & MSME",
    nameTa: "வணிகம் & MSME",
    icon: Briefcase,
    color: "indigo",
    bg: "bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 text-indigo-900",
    iconBg: "bg-indigo-600 text-white",
    filterTerm: "MSME",
    count: 6
  },
  {
    id: "women",
    nameEn: "Women & Child",
    nameTa: "மகளிர் & குழந்தைகள்",
    icon: Users,
    color: "purple",
    bg: "bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-900",
    iconBg: "bg-purple-600 text-white",
    filterTerm: "Women",
    count: 12
  },
  {
    id: "social",
    nameEn: "Social Welfare & Pension",
    nameTa: "சமூக நலம் & ஓய்வூதியம்",
    icon: ShieldAlert,
    color: "amber",
    bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900",
    iconBg: "bg-amber-600 text-white",
    filterTerm: "Social",
    count: 14
  },
  {
    id: "housing",
    nameEn: "Housing & Shelter",
    nameTa: "வீட்டு வசதி",
    icon: Home,
    color: "teal",
    bg: "bg-teal-50 hover:bg-teal-100/80 border-teal-200 text-teal-900",
    iconBg: "bg-teal-600 text-white",
    filterTerm: "Housing",
    count: 6
  },
  {
    id: "skills",
    nameEn: "Skills & Employment",
    nameTa: "திறன் & வேலைவாய்ப்பு",
    icon: Wrench,
    color: "cyan",
    bg: "bg-cyan-50 hover:bg-cyan-100/80 border-cyan-200 text-cyan-900",
    iconBg: "bg-cyan-600 text-white",
    filterTerm: "Skill",
    count: 5
  },
  {
    id: "energy",
    nameEn: "Energy & Environment",
    nameTa: "மின்சாரம் & சுற்றுச்சூழல்",
    icon: Zap,
    color: "yellow",
    bg: "bg-yellow-50 hover:bg-yellow-100/80 border-yellow-200 text-yellow-950",
    iconBg: "bg-amber-500 text-white",
    filterTerm: "Energy",
    count: 4
  },
  {
    id: "disability",
    nameEn: "Differently Abled Welfare",
    nameTa: "மாற்றுத்திறனாளிகள் நலம்",
    icon: Accessibility,
    color: "sky",
    bg: "bg-sky-50 hover:bg-sky-100/80 border-sky-200 text-sky-900",
    iconBg: "bg-sky-600 text-white",
    filterTerm: "Disability",
    count: 3
  }
];

export default function CategoryGrid({ onSelectCategory }) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t("categoriesTitle")}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("categoriesSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CORE_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const displayName = language === "ta" ? cat.nameTa : cat.nameEn;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.filterTerm)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-100 dark:hover:border-slate-700 ${cat.bg}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${cat.iconBg}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                  {cat.count}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 dark:text-white">
                  {displayName}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
