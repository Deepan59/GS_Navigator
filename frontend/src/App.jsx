import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import DisclaimerBanner from "./components/DisclaimerBanner";
import BasicDetailsForm from "./components/BasicDetailsForm";
import CitizenAssistantChat from "./components/CitizenAssistantChat";
import MissingInfoSection from "./components/MissingInfoSection";
import ResultsPage from "./components/ResultsPage";
import SchemeDetailModal from "./components/SchemeDetailModal";
import { submitCitizenMessage, checkBackendHealth, fetchAllSchemes, recommendSchemesByProfile } from "./services/api";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const [currentStep, setCurrentStep] = useState("basic_details"); // 'basic_details' | 'chat_assistant'
  const [conversationHistory, setConversationHistory] = useState([]);
  const [extractedProfile, setExtractedProfile] = useState({});
  const [missingInfo, setMissingInfo] = useState([]);
  const [hasEvaluatedResults, setHasEvaluatedResults] = useState(false);
  const [results, setResults] = useState([]);
  const [rawAllSchemes, setRawAllSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [healthInfo, setHealthInfo] = useState(null);
  const [totalCatalogCount, setTotalCatalogCount] = useState(100);
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    checkBackendHealth().then(setHealthInfo);
    fetchAllSchemes()
      .then((data) => {
        if (data && data.count) setTotalCatalogCount(data.count);
        if (data && Array.isArray(data.schemes)) {
          setRawAllSchemes(data.schemes);
        }
      })
      .catch(() => {});
  }, []);

  const handleBasicDetailsSubmit = async (profile) => {
    setExtractedProfile(profile);
    setCurrentStep("chat_assistant");
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Pre-evaluate matching schemes based on structured basic profile
      const data = await recommendSchemesByProfile(profile);
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        setResults(data.results);
      }
    } catch (err) {
      console.warn("Initial profile pre-filter error:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById("citizen-intake-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSendMessage = async (userText) => {
    setIsLoading(true);
    setErrorMessage("");
    setHasEvaluatedResults(true);

    const updatedHistory = [...conversationHistory, { role: "user", text: userText }];
    setConversationHistory(updatedHistory);
    setCurrentStep("chat_assistant");

    try {
      const response = await submitCitizenMessage(userText, extractedProfile, language);

      if (response.language && response.language !== language) {
        setLanguage(response.language);
      }

      if (response.profile) {
        setExtractedProfile(prev => ({ ...prev, ...response.profile }));
      }

      setMissingInfo(response.missingInformation || []);

      if (response.results && Array.isArray(response.results)) {
        setResults(response.results);
      }

      const activeLang = response.language || language;
      let assistantReply = "";
      if (response.needsMoreInformation && response.results.length === 0) {
        assistantReply = activeLang === "ta"
          ? "நன்றி. உங்களுக்குரிய அரசு திட்டங்களை கண்டறிய உங்கள் வயது, வசிக்கும் மாநிலம், தொழில் அல்லது குடும்ப ஆண்டு வருமானம் போன்ற கூடுதல் விவரங்களை கூற முடியுமா?"
          : "Thank you. To help you discover specific government schemes, could you tell me a little more about your situation? (e.g., your age, state of residence, occupation, or annual income).";
      } else {
        const potentialMatches = (response.results || []).filter(r => r.eligibility?.potentialMatch || r.potentialMatch);
        assistantReply = activeLang === "ta"
          ? `உங்கள் அடிப்படை மற்றும் குறிப்பிட்ட தேவை விவரங்களை அரசு வழிகாட்டுதல்களோடு ஒப்பிட்டு ${potentialMatches.length} பொருத்தமான நலத்திட்டங்களை கண்டறிந்துள்ளேன்.\n\nகீழே உள்ள முடிவுகளில் நீங்கள் எந்தெந்த தகுதி விதிகளோடு பொருந்துகிறீர்கள் மற்றும் தேவையான ஆவணங்களை பார்வையிடலாம்.`
          : `I evaluated your profile and situational needs against published government guidelines and discovered ${potentialMatches.length} potentially relevant scheme(s).\n\nReview the breakdown below to see which published criteria you appear to meet and any additional documents required.`;
      }

      setConversationHistory([...updatedHistory, { role: "assistant", text: assistantReply }]);

      if (response.results && response.results.length > 0) {
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    } catch (err) {
      console.error("Workflow request failed:", err);
      setErrorMessage(err.message || "Unable to reach the scheme evaluation server. Please try again.");
      setConversationHistory([
        ...updatedHistory,
        {
          role: "assistant",
          text: language === "ta"
            ? "திட்டங்களை மதிப்பீடு செய்வதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
            : "I encountered an issue evaluating schemes. Please try submitting again or check your internet connection."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssistant = () => {
    setCurrentStep("basic_details");
    document.getElementById("citizen-intake-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReset = () => {
    setCurrentStep("basic_details");
    setConversationHistory([]);
    setExtractedProfile({});
    setMissingInfo([]);
    setSelectedCategoryFilter("all");
    setErrorMessage("");
    setHasEvaluatedResults(false);
    setResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar
        onReset={handleReset}
        healthInfo={healthInfo}
        totalSchemes={totalCatalogCount}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 overflow-x-hidden">
        {/* Important Advisory Disclaimer Banner */}
        <DisclaimerBanner />

        {/* 1. Landing Hero Banner with 3-Step Process */}
        <LandingHero
          onStartAssistant={handleStartAssistant}
          onSelectSamplePrompt={(query) => {
            setCurrentStep("chat_assistant");
            handleStartAssistant();
            handleSendMessage(query);
          }}
          totalSchemes={totalCatalogCount}
        />

        {/* 2. 2-Step Citizen Intake Section */}
        <div id="citizen-intake-section">
          {currentStep === "basic_details" ? (
            <BasicDetailsForm
              initialProfile={extractedProfile}
              onSubmitBasicDetails={handleBasicDetailsSubmit}
              onSkipToChat={() => setCurrentStep("chat_assistant")}
            />
          ) : (
            <CitizenAssistantChat
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              error={errorMessage}
              conversationHistory={conversationHistory}
              extractedProfile={extractedProfile}
              onReset={handleReset}
              onEditBasicDetails={() => setCurrentStep("basic_details")}
            />
          )}
        </div>

        {/* 4. Missing Information Questions */}
        {missingInfo.length > 0 && results.length > 0 && (
          <MissingInfoSection
            missingInfo={missingInfo}
            onProvideInfo={handleSendMessage}
            isLoading={isLoading}
          />
        )}

        {/* 5. Discovered Matching Schemes (Evaluated based on citizen's specific situation) */}
        {hasEvaluatedResults && results.length > 0 && (
          <div id="results-section">
            <ResultsPage
              results={results}
              onSelectDetails={(scheme) => setSelectedSchemeForModal(scheme)}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter("all")}
            />
          </div>
        )}
      </main>

      {/* Scheme Details Modal (4 Tabs like myScheme) */}
      {selectedSchemeForModal && (
        <SchemeDetailModal
          scheme={selectedSchemeForModal}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 text-center text-xs text-slate-500 dark:text-slate-400 mt-16 transition-colors">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-200">
            myScheme AI Navigator • {language === "ta" ? "தேசிய நலத்திட்ட கண்டறிதல் தளம்" : "National Citizen Welfare Discovery Platform"}
          </p>
          <p className="text-slate-400 dark:text-slate-500">
            {language === "ta"
              ? "பொதுவில் வெளியிடப்பட்ட அரசு வழிகாட்டுதல்களின் அடிப்படையில் மட்டுமே இயங்குகிறது • அதிகாரப்பூர்வ ஒப்புதல் சம்பந்தப்பட்ட அரசு துறையினரால் மட்டுமே வழங்கப்படும்"
              : "Operates deterministically on published government criteria • Formal approvals by designated government authorities"}
          </p>
        </div>
      </footer>
    </div>
  );
}
