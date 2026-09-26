import React, { useState, useMemo } from "react";
import SchemeCard from "./SchemeCard";
import { Filter, Search, CheckCircle2, HelpCircle, Layers, Sparkles, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function ResultsPage({ results = [], onSelectDetails, selectedCategoryFilter, onClearCategoryFilter }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryFilter || "all");
  const [selectedStateFilter, setSelectedStateFilter] = useState("all");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");
  const { t, language } = useLanguage();

  // Sync external category filter
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setSelectedCategory(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const categories = useMemo(() => {
    const set = new Set();
    results.forEach((item) => {
      const s = item.scheme || item;
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  }, [results]);

  const filteredAndSortedResults = useMemo(() => {
    const filtered = results.filter((item) => {
      const scheme = item.scheme || item;
      const eligibility = item.eligibility || {
        potentialMatch: item.potentialMatch,
        missingCriteria: item.missingCriteria || []
      };

      // 1. Tab Filter
      if (activeTab === "eligible") {
        if (!eligibility.potentialMatch || (eligibility.missingCriteria && eligibility.missingCriteria.length > 0)) {
          return false;
        }
      } else if (activeTab === "needs_info") {
        if (!eligibility.potentialMatch || !eligibility.missingCriteria || eligibility.missingCriteria.length === 0) {
          return false;
        }
      }

      // 2. Category Filter (exact or substring)
      if (selectedCategory !== "all") {
        const cat = (scheme.category || "").toLowerCase();
        if (!cat.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 3. Level Filter
      if (selectedLevelFilter !== "all") {
        if ((scheme.level || "").toLowerCase() !== selectedLevelFilter.toLowerCase()) {
          return false;
        }
      }

      // 4. State Filter
      if (selectedStateFilter !== "all") {
        if (selectedStateFilter === "tamil_nadu") {
          const st = (scheme.state || scheme.level || "").toLowerCase();
          if (!st.includes("tamil")) return false;
        } else if (selectedStateFilter === "central") {
          const lvl = (scheme.level || "").toLowerCase();
          if (!lvl.includes("central") && !lvl.includes("india")) return false;
        }
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullText = [
          scheme.name,
          scheme.department,
          scheme.category,
          scheme.description,
          ...(scheme.benefits || [])
        ].join(" ").toLowerCase();

        if (!fullText.includes(q)) return false;
      }

      return true;
    });

    // Sort logic
    return filtered.sort((a, b) => {
      const aScheme = a.scheme || a;
      const bScheme = b.scheme || b;
      const aElig = a.eligibility || a;
      const bElig = b.eligibility || b;

      if (sortBy === "alphabetical") {
        return aScheme.name.localeCompare(bScheme.name);
      }
      if (sortBy === "most_criteria") {
        const aCount = aElig.matchedCriteria?.length || 0;
        const bCount = bElig.matchedCriteria?.length || 0;
        return bCount - aCount;
      }
      // default: best_match (potential matches first, then match count)
      const aPot = aElig.potentialMatch ? 1 : 0;
      const bPot = bElig.potentialMatch ? 1 : 0;
      if (bPot !== aPot) return bPot - aPot;
      return (bElig.matchedCriteria?.length || 0) - (aElig.matchedCriteria?.length || 0);
    });
  }, [results, activeTab, selectedCategory, selectedLevelFilter, selectedStateFilter, searchQuery, sortBy]);

  const fullyEligibleCount = results.filter(r => (r.eligibility?.potentialMatch || r.potentialMatch) && (r.eligibility?.missingCriteria?.length === 0 || !r.eligibility?.missingCriteria)).length;
  const needsInfoCount = results.filter(r => (r.eligibility?.potentialMatch || r.potentialMatch) && (r.eligibility?.missingCriteria?.length > 0)).length;

  const handleResetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStateFilter("all");
    setSelectedLevelFilter("all");
    setSortBy("best_match");
    if (onClearCategoryFilter) onClearCategoryFilter();
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedStateFilter !== "all" || selectedLevelFilter !== "all" || searchQuery !== "" || activeTab !== "all";

  return (
    <div className="space-y-6">
      {/* Section Header with myScheme Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("resultsTitle")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t("resultsSubtitle")} ({filteredAndSortedResults.length} of {results.length} {t("totalMatchesLabel")})
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{t("sortByLabel")}:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="best_match">{t("sortBestMatch")}</option>
            <option value="most_criteria">{t("sortMostCriteria")}</option>
            <option value="alphabetical">{t("sortAlphabetical")}</option>
          </select>
        </div>
      </div>

      {/* Main Container: Left Sidebar Filters + Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Faceted Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("filterHeading")}</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                >
                  {t("clearFiltersBtn")}
                </button>
              )}
            </div>

            {/* State / Jurisdiction Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {t("filterState")}
              </label>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">{language === "ta" ? "அனைத்து மாநிலங்கள் / மத்திய" : "All States & Central"}</option>
                <option value="tamil_nadu">Tamil Nadu ({language === "ta" ? "தமிழ்நாடு" : "Tamil Nadu"})</option>
                <option value="central">Central Govt ({language === "ta" ? "மத்திய அரசு" : "Central"})</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {t("filterCategoryLabel")}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">{t("categories")?.all || "All Categories"}</option>
                <option value="Agriculture">{language === "ta" ? "விவசாயம் (Agriculture)" : "Agriculture & Rural"}</option>
                <option value="Education">{language === "ta" ? "கல்வி (Education)" : "Education & Scholarships"}</option>
                <option value="Healthcare">{language === "ta" ? "மருத்துவம் (Healthcare)" : "Health & Wellness"}</option>
                <option value="MSME">{language === "ta" ? "வணிகம் & MSME (Business)" : "Business & MSME"}</option>
                <option value="Women">{language === "ta" ? "மகளிர் (Women Welfare)" : "Women & Child"}</option>
                <option value="Social">{language === "ta" ? "சமூக நலம் (Social Welfare)" : "Social Welfare & Pension"}</option>
                <option value="Housing">{language === "ta" ? "வீட்டு வசதி (Housing)" : "Housing & Shelter"}</option>
                <option value="Energy">{language === "ta" ? "மின்சாரம் & சூரிய ஒளி" : "Energy & Environment"}</option>
              </select>
            </div>

            {/* Scheme Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {t("filterLevel")}
              </label>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="level"
                    checked={selectedLevelFilter === "all"}
                    onChange={() => setSelectedLevelFilter("all")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{language === "ta" ? "அனைத்தும்" : "All Levels"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="level"
                    checked={selectedLevelFilter === "Tamil Nadu"}
                    onChange={() => setSelectedLevelFilter("Tamil Nadu")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>State (Tamil Nadu)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="level"
                    checked={selectedLevelFilter === "Central"}
                    onChange={() => setSelectedLevelFilter("Central")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Central Government</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Schemes Catalog & Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Search Bar & Tabs */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tabs Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "all"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {t("tabAll")} ({results.length})
              </button>
              <button
                onClick={() => setActiveTab("eligible")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "eligible"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t("tabEligible")} ({fullyEligibleCount})</span>
              </button>
              <button
                onClick={() => setActiveTab("needs_info")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "needs_info"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t("tabNeedsInfo")} ({needsInfoCount})</span>
              </button>
            </div>
          </div>

          {/* Active filter badge if category is selected */}
          {selectedCategory !== "all" && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Active Filter:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span>{selectedCategory}</span>
                <button onClick={() => setSelectedCategory("all")} className="hover:text-red-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          )}

          {/* Scheme Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedResults.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  {language === "ta" ? "பொருத்தமான திட்டங்கள் எதுவும் காணப்படவில்லை" : "No matching schemes found"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {language === "ta" ? "தேடல் வினவல் அல்லது வடிகட்டிகளை மாற்றி முயற்சிக்கவும்." : "Try adjusting your search query or clearing the active filters."}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-colors"
                >
                  {t("clearFiltersBtn")}
                </button>
              </div>
            ) : (
              filteredAndSortedResults.map((item, index) => (
                <SchemeCard
                  key={item.scheme?.id || item.id || index}
                  item={item}
                  onSelectDetails={onSelectDetails}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
