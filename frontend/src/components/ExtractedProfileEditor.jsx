import React, { useState, useEffect } from "react";
import { UserCheck, Edit3, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

export default function ExtractedProfileEditor({ profile, onUpdateProfile, isRecalculating }) {
  const [formData, setFormData] = useState(profile || {});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(profile || {});
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAndRecalculate = (e) => {
    e?.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const hasData = Object.keys(profile || {}).some(k => profile[k] !== null && profile[k] !== undefined && profile[k] !== "");

  if (!hasData && !isEditing) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 px-5 py-3.5 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-700" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Structured Citizen Profile
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            (Extracted by Gemini & Verified against criteria)
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-3 py-1 rounded-md shadow-2xs hover:bg-blue-50 transition-colors"
        >
          {isEditing ? "Cancel Edit" : "Edit / Refine Profile"}
        </button>
      </div>

      <div className="p-5">
        {isEditing ? (
          <form onSubmit={handleSaveAndRecalculate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.age ?? ""}
                onChange={(e) => handleChange("age", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 35"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender ?? ""}
                onChange={(e) => handleChange("gender", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
              >
                <option value="">Not Specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
              <select
                value={formData.occupation ?? ""}
                onChange={(e) => handleChange("occupation", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
              >
                <option value="">Not Specified</option>
                <option value="farmer">Farmer / Agriculturalist</option>
                <option value="small_business_owner">Small Business / Shopkeeper</option>
                <option value="artisan">Artisan / Craftsman / Potter / Weaver</option>
                <option value="street_vendor">Street Vendor / Hawker</option>
                <option value="daily_wage_worker">Daily Wage / Laborer</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired / Senior Citizen</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Household Income (₹)</label>
              <input
                type="number"
                value={formData.annual_income ?? ""}
                onChange={(e) => handleChange("annual_income", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agri Land Holding (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={formData.land_holding_acres ?? ""}
                onChange={(e) => handleChange("land_holding_acres", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 2.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State of Residence</label>
              <input
                type="text"
                value={formData.state ?? ""}
                onChange={(e) => handleChange("state", e.target.value || null)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
              <select
                value={formData.category ?? ""}
                onChange={(e) => handleChange("category", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
              >
                <option value="">Not Specified / General</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marital Status</label>
              <select
                value={formData.marital_status ?? ""}
                onChange={(e) => handleChange("marital_status", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
              >
                <option value="">Not Specified</option>
                <option value="single">Single / Unmarried</option>
                <option value="married">Married</option>
                <option value="widow">Widow / Widower</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:col-span-2 md:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.has_disability === true}
                  onChange={(e) => handleChange("has_disability", e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium">Person with Disability (Divyangjan)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_student === true}
                  onChange={(e) => handleChange("is_student", e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium">Currently Enrolled Student</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_bpl === true}
                  onChange={(e) => handleChange("is_bpl", e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium">BPL / Ration Card Holder</span>
              </label>
            </div>

            <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRecalculating}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-sm flex items-center gap-2"
              >
                {isRecalculating ? "Calculating..." : "Save & Recalculate Schemes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {profile.age && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                <span>Age:</span> <strong className="text-blue-800">{profile.age} yrs</strong>
              </span>
            )}
            {profile.gender && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 capitalize">
                <span>Gender:</span> <strong className="text-blue-800">{profile.gender}</strong>
              </span>
            )}
            {profile.occupation && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                <span>Occupation:</span> <strong className="text-blue-800">{profile.occupation.replace(/_/g, " ")}</strong>
              </span>
            )}
            {profile.annual_income !== null && profile.annual_income !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                <span>Income:</span> <strong className="text-blue-800">₹{Number(profile.annual_income).toLocaleString("en-IN")}/yr</strong>
              </span>
            )}
            {profile.land_holding_acres !== null && profile.land_holding_acres !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                <span>Land:</span> <strong className="text-blue-800">{profile.land_holding_acres} Acres</strong>
              </span>
            )}
            {profile.state && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                <span>State:</span> <strong className="text-blue-800">{profile.state}</strong>
              </span>
            )}
            {profile.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                <span>Category:</span> <strong className="text-blue-800">{profile.category}</strong>
              </span>
            )}
            {profile.marital_status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 capitalize">
                <span>Marital:</span> <strong className="text-blue-800">{profile.marital_status}</strong>
              </span>
            )}
            {profile.has_disability && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-semibold border border-amber-200">
                <span>Disability / Divyangjan</span>
              </span>
            )}
            {profile.is_student && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-xs font-semibold border border-indigo-200">
                <span>Student</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
