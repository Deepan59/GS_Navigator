import React, { useState } from "react";
import { 
  User, 
  Calendar, 
  Briefcase, 
  IndianRupee, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Award,
  HeartHandshake
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function BasicDetailsForm({
  initialProfile = {},
  onSubmitBasicDetails,
  onSkipToChat
}) {
  const { t, language } = useLanguage();
  const b = t("basicDetails") || {};

  const [age, setAge] = useState(initialProfile.age || "");
  const [gender, setGender] = useState(initialProfile.gender || "male");
  const [state, setState] = useState(initialProfile.state || "Tamil Nadu");
  const [occupation, setOccupation] = useState(initialProfile.occupation || "");
  const [incomeBracket, setIncomeBracket] = useState(
    initialProfile.annual_income !== undefined 
      ? getBracketFromIncome(initialProfile.annual_income) 
      : "between1L_25L"
  );
  const [customIncome, setCustomIncome] = useState(
    initialProfile.annual_income !== undefined ? initialProfile.annual_income : 150000
  );
  const [category, setCategory] = useState(initialProfile.category || "OBC");
  const [hasDisability, setHasDisability] = useState(
    initialProfile.has_disability === true ? "yes" : "no"
  );

  function getBracketFromIncome(val) {
    const num = Number(val);
    if (num < 100000) return "under1L";
    if (num <= 250000) return "between1L_25L";
    if (num <= 500000) return "between25L_5L";
    if (num <= 800000) return "between5L_8L";
    return "above8L";
  }

  const handleIncomeSelect = (bracketKey) => {
    setIncomeBracket(bracketKey);
    let approxAmount = 150000;
    if (bracketKey === "under1L") approxAmount = 80000;
    else if (bracketKey === "between1L_25L") approxAmount = 180000;
    else if (bracketKey === "between25L_5L") approxAmount = 350000;
    else if (bracketKey === "between5L_8L") approxAmount = 650000;
    else if (bracketKey === "above8L") approxAmount = 900000;
    setCustomIncome(approxAmount);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const profile = {
      age: age ? Number(age) : undefined,
      gender: gender,
      state: state,
      occupation: occupation || undefined,
      is_student: occupation === "student",
      annual_income: customIncome !== undefined ? Number(customIncome) : undefined,
      category: category,
      has_disability: hasDisability === "yes"
    };

    onSubmitBasicDetails(profile);
  };

  const occupationsList = [
    { key: "student", label: b.occupations?.student || "Student", icon: "🎓" },
    { key: "farmer", label: b.occupations?.farmer || "Farmer", icon: "🌾" },
    { key: "business", label: b.occupations?.business || "Small Business / MSME", icon: "💼" },
    { key: "artisan", label: b.occupations?.artisan || "Artisan / Craftsman", icon: "🔨" },
    { key: "vendor", label: b.occupations?.vendor || "Street Vendor", icon: "🏪" },
    { key: "unemployed", label: b.occupations?.unemployed || "Unemployed / Job Seeker", icon: "🔍" },
    { key: "senior", label: b.occupations?.senior || "Senior Citizen", icon: "👵" },
    { key: "homemaker", label: b.occupations?.homemaker || "Homemaker / Widow", icon: "👩" },
    { key: "worker", label: b.occupations?.worker || "Daily Wage Worker", icon: "🛠️" }
  ];

  const incomeOptions = [
    { key: "under1L", label: b.incomeBrackets?.under1L || "Under ₹1,00,000", badge: "BPL / Low Income" },
    { key: "between1L_25L", label: b.incomeBrackets?.between1L_25L || "₹1,00,000 - ₹2,50,000", badge: "Middle Lower" },
    { key: "between25L_5L", label: b.incomeBrackets?.between25L_5L || "₹2,50,000 - ₹5,00,000", badge: "Middle" },
    { key: "between5L_8L", label: b.incomeBrackets?.between5L_8L || "₹5,00,000 - ₹8,00,000", badge: "Upper Middle" },
    { key: "above8L", label: b.incomeBrackets?.above8L || "Above ₹8,00,000", badge: "General" }
  ];

  const categoryOptions = [
    { key: "OBC", label: b.categories?.obc || "OBC / BC / MBC" },
    { key: "SC", label: b.categories?.sc || "SC (Scheduled Caste)" },
    { key: "ST", label: b.categories?.st || "ST (Scheduled Tribe)" },
    { key: "EWS", label: b.categories?.ews || "EWS (Economically Weaker)" },
    { key: "General", label: b.categories?.general || "General / OC" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{b.stepBadge || "Step 1 of 2: Basic Profile"}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {b.title || "Tell Us About Yourself"}
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {b.subtitle || "Enter your basic parameters first so we can accurately check eligibility criteria across 100+ central & Tamil Nadu schemes."}
            </p>
          </div>

          <button
            type="button"
            onClick={onSkipToChat}
            className="text-[11px] sm:text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
          >
            {b.skipToChat || "Skip to Chat directly"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Grid of Core Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          
          {/* 1. Age Input with Presets */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{b.ageLabel || "Your Age (Years)"}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <input
                type="number"
                min="1"
                max="110"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={b.agePlaceholder || "e.g. 21"}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {/* Quick Age Presets */}
              <div className="grid grid-cols-5 gap-1.5">
                {["18", "21", "30", "45", "60"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAge(preset)}
                    className={`py-1.5 text-center rounded-lg border text-[11px] sm:text-xs font-semibold cursor-pointer transition-colors ${
                      age === preset
                        ? "bg-blue-700 text-white border-blue-700 font-bold shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {preset} yrs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Gender Selection */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{b.genderLabel || "Gender"}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { key: "male", label: b.genderMale || "Male", icon: "👨" },
                { key: "female", label: b.genderFemale || "Female", icon: "👩" },
                { key: "transgender", label: b.genderTransgender || "Transgender", icon: "⚧️" }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGender(item.key)}
                  className={`py-2 px-1 sm:py-2.5 sm:px-3 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all ${
                    gender === item.key
                      ? "bg-blue-50 dark:bg-blue-900/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 shadow-xs font-bold"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                  }`}
                >
                  <span className="text-sm sm:text-base shrink-0">{item.icon}</span>
                  <span className="text-[11px] sm:text-xs md:text-sm leading-tight text-center truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. State / UT Selection */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{b.stateLabel || "State / UT of Residence"}</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
            >
              <option value="Tamil Nadu">Tamil Nadu (தமிழ்நாடு)</option>
              <option value="Central">Central Schemes / All India (அனைத்திந்திய மத்திய அரசு)</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Other">Other States & Union Territories</option>
            </select>
          </div>

          {/* 4. Social Category */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{b.categoryLabel || "Social Category / Caste Group"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-2 rounded-xl border text-[11px] sm:text-xs font-semibold text-center cursor-pointer transition-all flex items-center justify-center ${
                    category === cat.key
                      ? "bg-blue-50 dark:bg-blue-900/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Occupation / Status (Grid of Badges) */}
        <div className="space-y-3 pt-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{b.occupationLabel || "Primary Occupation / Status"}</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {occupationsList.map((occ) => (
              <button
                key={occ.key}
                type="button"
                onClick={() => setOccupation(occ.key)}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2 sm:gap-2.5 ${
                  occupation === occ.key
                    ? "bg-blue-50 dark:bg-blue-900/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 shadow-xs font-bold"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                }`}
              >
                <span className="text-base sm:text-lg shrink-0">{occ.icon}</span>
                <span className="text-[11px] sm:text-xs md:text-sm leading-tight">{occ.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Income Brackets */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{b.incomeLabel || "Annual Household Income"}</span>
            </label>
            <span className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
              Approx: ₹{Number(customIncome).toLocaleString("en-IN")} / yr
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
            {incomeOptions.map((inc) => (
              <button
                key={inc.key}
                type="button"
                onClick={() => handleIncomeSelect(inc.key)}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left cursor-pointer transition-all ${
                  incomeBracket === inc.key
                    ? "bg-blue-50 dark:bg-blue-900/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {inc.label}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {inc.badge}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 7. Differently Abled Status */}
        <div className="space-y-3 pt-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{b.disabilityLabel || "Are you Differently-Abled (PwD)?"}</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
            <button
              type="button"
              onClick={() => setHasDisability("no")}
              className={`py-2 px-4 rounded-xl border text-xs sm:text-sm font-semibold text-center cursor-pointer transition-all ${
                hasDisability === "no"
                  ? "bg-blue-50 dark:bg-blue-900/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 font-bold"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {b.no || "No"}
            </button>
            <button
              type="button"
              onClick={() => setHasDisability("yes")}
              className={`py-2 px-4 rounded-xl border text-xs sm:text-sm font-semibold text-center cursor-pointer transition-all ${
                hasDisability === "yes"
                  ? "bg-blue-50 dark:bg-blue-900/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 font-bold"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {b.yes || "Yes"}
            </button>
          </div>
        </div>

        {/* Submit / Proceed Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{language === "ta" ? "உங்கள் தகவல்கள் பாதுகாப்பானது & அரசு விதிகளோடு மட்டுமே ஒப்பிடப்படும்." : "Details remain strictly private & evaluated against official criteria."}</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-95"
          >
            <span>{b.proceedToChat || "Continue to Step 2: Describe Your Situation ➔"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
