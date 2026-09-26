export const translations = {
  en: {
    // Navigation & Header
    appTitle: "myScheme Navigator",
    appTagline: "National Public Services & Welfare Discovery Platform",
    verifiedSchemes: "Verified Schemes",
    activeRegistry: "Active Registry",
    resetBtn: "New Search",
    languageSwitcher: "Language",
    govIndia: "Government of India / Tamil Nadu",

    // Disclaimer
    disclaimerTitle: "Important Citizen Advisory Notice",
    disclaimerBody: "This platform is an independent citizen advisory navigator designed to help discover published government schemes. It does NOT officially approve eligibility. All formal eligibility determinations and benefit approvals are made solely by designated government authorities.",

    // Hero Section
    heroBadge: "🇮🇳 AI-Powered Public Welfare Discovery",
    heroTitle: "Find Government Schemes Based on Eligibility",
    heroSubtitle: "Discover central and state government schemes tailored to your real-life needs. Tell us your situation in English, தமிழ், or Tanglish, or explore by categories.",
    heroCta: "Find Schemes For You",
    heroStepsTitle: "Easy 3-Step Scheme Discovery",
    step1Title: "1. Enter Details",
    step1Desc: "Share your age, occupation, income or need in English, Tamil, or Tanglish.",
    step2Title: "2. Deterministic Matching",
    step2Desc: "Our engine checks published government rules without guessing.",
    step3Title: "3. Apply on Official Portal",
    step3Desc: "Review required documents and apply directly on verified gov portals.",
    heroPersonaLabel: "Or try a quick citizen scenario:",
    personas: [
      {
        label: "🎓 College Student",
        query: "எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்."
      },
      {
        label: "🗣️ Tanglish: College Hostel",
        query: "enakku kalloori padikurathuku hostel matrum scholarship udhavi thevai."
      },
      {
        label: "🌾 Farmer Crop Damage",
        query: "I'm a farmer and my crop was damaged. What government support might be available?"
      },
      {
        label: "👩‍💼 Women Entrepreneur",
        query: "I am a woman in Tamil Nadu looking to start a small tailoring business and need loan subsidy."
      },
      {
        label: "👵 Senior Citizen Pension",
        query: "65 year old destitute citizen in Tamil Nadu needing old age monthly pension."
      },
      {
        label: "🏥 Healthcare & Surgery",
        query: "Low income family looking for free government health insurance for hospital surgery."
      }
    ],

    // Categories
    categoriesTitle: "Explore Schemes by Category",
    categoriesSubtitle: "Browse verified welfare programs classified across core sectors",
    categories: {
      all: "All Categories",
      agriculture: "Agriculture & Rural",
      education: "Education & Learning",
      health: "Health & Wellness",
      business: "Business & MSME",
      women: "Women & Child",
      social: "Social Welfare & Pension",
      energy: "Energy & Environment",
      housing: "Housing & Shelter",
      skills: "Skills & Employment",
      disability: "Differently Abled"
    },

    // Chat Assistant
    chatTitle: "AI Assisted Scheme Discovery",
    chatSubtitle: "Chat naturally in English, தமிழ், or Tanglish. We extract your profile to evaluate published criteria.",
    chatPlaceholder: "Describe your situation in English, தமிழ் or Tanglish (e.g. 'enakku kalloori padikurathuku hostel matrum scholarship thevai')...",
    chatSendBtn: "Find Schemes",
    chatEvaluating: "Evaluating published criteria against 100+ schemes...",
    chatResetBtn: "Clear",
    liveProfileTitle: "Understood Profile Parameters",
    profileFields: {
      age: "Age",
      gender: "Gender",
      occupation: "Occupation",
      annual_income: "Annual Income",
      state: "State",
      category: "Category",
      is_student: "Student",
      has_disability: "Disability",
      land_holding_acres: "Land (Acres)",
      intent: "Primary Need"
    },

    // Missing Info Section
    missingInfoTitle: "Additional Information Needed for Complete Evaluation",
    missingInfoSubtitle: "Providing these details will help verify eligibility for additional published schemes:",
    missingInfoSubmitBtn: "Update Details & Re-evaluate",

    // Results Page & Sidebar Filters
    resultsTitle: "Discovered Government Schemes",
    resultsSubtitle: "Evaluated strictly against published government guidelines.",
    searchPlaceholder: "Search schemes by keyword (English, தமிழ், or Tanglish)...",
    filterHeading: "Filter Schemes",
    clearFiltersBtn: "Clear All Filters",
    filterState: "State / Jurisdiction",
    filterLevel: "Scheme Level",
    filterCategoryLabel: "Sector / Category",
    filterBeneficiary: "Target Beneficiary",
    filterStatus: "Eligibility Status",
    sortByLabel: "Sort by",
    sortBestMatch: "Best Match",
    sortAlphabetical: "Alphabetical (A-Z)",
    sortMostCriteria: "Most Criteria Matched",
    tabAll: "All Schemes",
    tabEligible: "Appears Eligible",
    tabNeedsInfo: "Requires Info",
    tabCatalog: "Full Catalog",
    totalMatchesLabel: "Schemes found",
    viewDetailsBtn: "View Details & Rules",
    officialWebsiteBtn: "Apply on Official Portal",
    
    // Status Badges & Compliant Wording
    statusAppearsEligible: "You appear to meet published criteria",
    statusPotentiallyEligible: "Potentially relevant scheme",
    statusDisqualified: "Does not meet published criteria",
    
    // Basic Details Intake (Step 1)
    basicDetails: {
      stepBadge: "Step 1 of 2: Basic Profile",
      title: "Tell Us About Yourself",
      subtitle: "Enter your basic parameters first so we can accurately check eligibility criteria across 100+ central & Tamil Nadu schemes.",
      ageLabel: "Your Age (Years)",
      agePlaceholder: "Enter age (e.g. 21)",
      genderLabel: "Gender",
      genderMale: "Male",
      genderFemale: "Female",
      genderTransgender: "Transgender",
      stateLabel: "State / UT of Residence",
      occupationLabel: "Primary Occupation / Status",
      incomeLabel: "Annual Household Income",
      categoryLabel: "Social Category / Caste Group",
      disabilityLabel: "Are you Differently-Abled (PwD)?",
      yes: "Yes",
      no: "No",
      proceedToChat: "Continue to Step 2: Describe Your Situation ➔",
      skipToChat: "Skip to Chat directly",
      editBasicDetails: "Edit Basic Details",
      profileCaptured: "Basic Profile Captured",
      step2Title: "Step 2 of 2: Describe Your Situation & Needs",
      step2Subtitle: "Tell our AI Assistant what specific support you are looking for (scholarship, crop loss, business loan, pension, hospital aid, etc.)",
      quickPromptsTitle: "Suggested Situations For You:",
      occupations: {
        student: "Student / College / School",
        farmer: "Farmer / Agriculture",
        business: "Small Business / MSME",
        artisan: "Artisan / Craftsman",
        vendor: "Street Vendor / Small Trader",
        unemployed: "Unemployed / Job Seeker",
        senior: "Senior Citizen / Retired (60+)",
        homemaker: "Homemaker / Destitute / Widow",
        worker: "Daily Wage Worker / Laborer"
      },
      incomeBrackets: {
        under1L: "Under ₹1,00,000 (Low Income / BPL)",
        between1L_25L: "₹1,00,000 - ₹2,50,000",
        between25L_5L: "₹2,50,000 - ₹5,00,000",
        between5L_8L: "₹5,00,000 - ₹8,00,000",
        above8L: "Above ₹8,00,000"
      },
      categories: {
        all: "Any / Not Listed",
        general: "General / OC",
        obc: "OBC / BC / MBC",
        sc: "SC (Scheduled Caste)",
        st: "ST (Scheduled Tribe)",
        ews: "EWS (Economically Weaker Section)"
      }
    },

    // Scheme Modal Tabs
    modalTabOverview: "Overview & Details",
    modalTabBenefits: "Benefits",
    modalTabEligibility: "Eligibility Criteria",
    modalTabApplication: "Application & Documents",
    matchedCriteriaTitle: "Published Criteria Matched",
    missingCriteriaTitle: "Criteria Requiring Verification",
    failedCriteriaTitle: "Non-Matching Criteria",
    benefitsTitle: "Key Scheme Benefits",
    documentsTitle: "Required Documents",
    sourceTitle: "Official Government Source",
    departmentLabel: "Ministry / Department",
    levelLabel: "Level",
    stateLabel: "State / UT",
    closeBtn: "Close",
    lastVerifiedLabel: "Last Verified",
    howToApplyTitle: "Application Process",
    onlineApplication: "Online Application via Official Portal"
  },
  ta: {
    // Navigation & Header
    appTitle: "அரசு நலத்திட்ட வழிகாட்டி",
    appTagline: "தேசிய மற்றும் தமிழ்நாடு அரசு நலத்திட்ட கண்டறிதல் தளம்",
    verifiedSchemes: "சரிபார்க்கப்பட்ட திட்டங்கள்",
    activeRegistry: "செயலில் உள்ள பட்டியல்",
    resetBtn: "புதிய தேடல்",
    languageSwitcher: "மொழி",
    govIndia: "இந்திய அரசு / தமிழ்நாடு அரசு",

    // Disclaimer
    disclaimerTitle: "முக்கிய குடிமக்கள் வழிகாட்டுதல் அறிவிப்பு",
    disclaimerBody: "இந்த தளம் பொதுவில் வெளியிடப்பட்ட அரசு நலத்திட்டங்களை மக்கள் எளிதாக அறிந்துகொள்ள உதவும் ஓர் சுயாதீன ஆலோசனை கருவியாகும். இது அதிகாரப்பூர்வமாக தகுதியை உறுதி செய்யாது. இறுதியான தகுதி மற்றும் பயன் ஒப்புதல் சம்பந்தப்பட்ட அரசு துறையினரால் மட்டுமே வழங்கப்படும்.",

    // Hero Section
    heroBadge: "🇮🇳 AI-மூலம் இயங்கும் நலத்திட்ட கண்டறிதல் தளம்",
    heroTitle: "உங்களுக்குரிய அரசு நலத்திட்டங்களை கண்டறியுங்கள்",
    heroSubtitle: "மத்திய மற்றும் மாநில அரசு நலத்திட்டங்களை உங்கள் உண்மைத் தேவைகளுக்கேற்ப கண்டறியுங்கள். உங்கள் சூழ்நிலையை தமிழ், Tanglish அல்லது ஆங்கிலத்தில் பகிருங்கள்.",
    heroCta: "உங்களுக்கான திட்டங்களை தேடுங்கள்",
    heroStepsTitle: "எளிதான 3-படி திட்ட கண்டறிதல்",
    step1Title: "1. விவரங்களை உள்ளிடுக",
    step1Desc: "உங்கள் வயது, தொழில், வருமானம் அல்லது தேவையை தமிழ், Tanglish அல்லது ஆங்கிலத்தில் பகிருங்கள்.",
    step2Title: "2. துல்லியமான விதி சரிபார்ப்பு",
    step2Desc: "எங்கள் தளம் அரசு விதிகளோடு ஒப்பிட்டு துல்லியமாக சரிபார்க்கிறது.",
    step3Title: "3. அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்கவும்",
    step3Desc: "தேவையான ஆவணங்களை தயார் செய்து நேரடியாக அரசு தளத்தில் விண்ணப்பிக்கவும்.",
    heroPersonaLabel: "அல்லது மாதிரி கேள்வியை தேர்ந்தெடுக்கவும்:",
    personas: [
      {
        label: "🎓 கல்லூரி படிப்பு உதவி",
        query: "எனக்கு கல்லூரி படிப்புக்கு அரசு உதவி வேண்டும்."
      },
      {
        label: "🗣️ Tanglish: கல்லூரி & விடுதி",
        query: "enakku kalloori padikurathuku hostel matrum scholarship udhavi thevai."
      },
      {
        label: "🌾 பயிர் சேதமடைந்த விவசாயி",
        query: "நான் ஒரு விவசாயி, எனது பயிர் மழையால் சேதமடைந்துள்ளது. என்ன அரசு உதவி கிடைக்கும்?"
      },
      {
        label: "👩‍💼 மகளிர் தொழில் கடன் & மானியம்",
        query: "நான் தமிழ்நாட்டில் சுயதொழில் தொடங்க விரும்பும் பெண். அரசு கடனுதவி மற்றும் மானியம் தேவை."
      },
      {
        label: "👵 முதியோர் ஓய்வூதியம்",
        query: "65 வயது ஆதரவற்ற முதியவர், முதியோர் மாதாந்திர உதவித்தொகை தேவை."
      },
      {
        label: "🏥 முதலமைச்சர் மருத்துவ காப்பீடு",
        query: "ஏழை குடும்பத்தினருக்கு அறுவை சிகிச்சை மற்றும் மருத்துவ உதவிக்கான அரசு காப்பீட்டு திட்டம் தேவை."
      }
    ],

    // Categories
    categoriesTitle: "பிரிவுகள் வாரியாக அரசு திட்டங்கள்",
    categoriesSubtitle: "முக்கிய துறைகள் வாரியாக வகைப்படுத்தப்பட்ட சரிபார்க்கப்பட்ட திட்டங்கள்",
    categories: {
      all: "அனைத்து பிரிவுகளும்",
      agriculture: "விவசாயம் & ஊரகம்",
      education: "கல்வி & படிப்பு",
      health: "மருத்துவம் & நல்வாழ்வு",
      business: "வணிகம் & MSME",
      women: "மகளிர் & குழந்தைகள்",
      social: "சமூக நலம் & ஓய்வூதியம்",
      energy: "மின்சாரம் & சுற்றுச்சூழல்",
      housing: "வீட்டு வசதி",
      skills: "திறன் & வேலைவாய்ப்பு",
      disability: "மாற்றுத்திறனாளிகள் நலம்"
    },

    // Chat Assistant
    chatTitle: "AI நலத்திட்ட வழிகாட்டி உரையாடல்",
    chatSubtitle: "தமிழ், Tanglish அல்லது ஆங்கிலத்தில் இயல்பாக உரையாடுங்கள். உங்கள் விவரங்களை நாங்கள் பகுப்பாய்வு செய்வோம்.",
    chatPlaceholder: "தமிழ், Tanglish அல்லது English-ல் எழுதவும் (எ.கா: 'enakku kalloori padikurathuku hostel matrum scholarship thevai')...",
    chatSendBtn: "திட்டங்களை காண்க",
    chatEvaluating: "100+ திட்டங்களின் அரசு விதிகள் மதிப்பீடு செய்யப்படுகின்றன...",
    chatResetBtn: "அழி",
    liveProfileTitle: "புரிந்துகொள்ளப்பட்ட சுயவிவரம்",
    profileFields: {
      age: "வயது",
      gender: "பாலினம்",
      occupation: "தொழில்",
      annual_income: "ஆண்டு வருமானம்",
      state: "மாநிலம்",
      category: "பிரிவு",
      is_student: "மாணவர் நிலை",
      has_disability: "மாற்றுத்திறனாளி",
      land_holding_acres: "நிலம் (ஏக்கர்)",
      intent: "முதன்மை தேவை"
    },

    // Missing Info Section
    missingInfoTitle: "முழு மதிப்பீட்டிற்கு கூடுதல் தகவல்கள் தேவைப்படுகின்றன",
    missingInfoSubtitle: "கீழ்க்கண்ட விவரங்களை அளிப்பதன் மூலம் நீங்கள் கூடுதல் அரசு திட்டங்களுக்கு தகுதியானவரா என்பதை உறுதிசெய்யலாம்:",
    missingInfoSubmitBtn: "விவரங்களை புதுப்பித்து மீண்டும் சரிபார்க்கவும்",

    // Results Page & Sidebar Filters
    resultsTitle: "கண்டறியப்பட்ட அரசு நலத்திட்டங்கள்",
    resultsSubtitle: "அரசு வெளியிட்டுள்ள வழிகாட்டு நெறிமுறைகளின்படி மதிப்பீடு செய்யப்பட்டுள்ளது.",
    searchPlaceholder: "திட்ட பெயர் அல்லது முக்கிய சொல் மூலம் தேடுங்கள் (English / தமிழ் / Tanglish)...",
    filterHeading: "வடிகட்டிகள்",
    clearFiltersBtn: "அனைத்து வடிகட்டிகளையும் நீக்கு",
    filterState: "மாநிலம் / ஆளுகை",
    filterLevel: "திட்ட நிலை",
    filterCategoryLabel: "துறை / பிரிவு",
    filterBeneficiary: "பயனாளிகள்",
    filterStatus: "தகுதி நிலை",
    sortByLabel: "வரிசைப்படுத்து",
    sortBestMatch: "சிறந்த பொருத்தம்",
    sortAlphabetical: "அகர வரிசை (A-Z)",
    sortMostCriteria: "அதிக விதிகள் பொருந்தியவை",
    tabAll: "அனைத்து திட்டங்கள்",
    tabEligible: "பொருந்தக்கூடியவை",
    tabNeedsInfo: "கூடுதல் தகவல் தேவை",
    tabCatalog: "முழு பட்டியல்",
    totalMatchesLabel: "திட்டங்கள் காணப்படுகின்றன",
    viewDetailsBtn: "முழு விவரங்கள் & விதிகள்",
    officialWebsiteBtn: "அதிகாரப்பூர்வ இணையதளத்தில் விண்ணப்பிக்கவும்",
    
    // Status Badges & Compliant Wording
    statusAppearsEligible: "வெளியிடப்பட்ட தகுதி விதிகளுடன் நீங்கள் பொருந்துகிறீர்கள்",
    statusPotentiallyEligible: "சாத்தியமான பொருத்தமுள்ள திட்டம்",
    statusDisqualified: "வெளியிடப்பட்ட தகுதி விதிகளுடன் பொருந்தவில்லை",
    
    // Basic Details Intake (Step 1)
    basicDetails: {
      stepBadge: "படி 1 / 2: அடிப்படை விவரங்கள்",
      title: "உங்களைப் பற்றிய விவரங்கள்",
      subtitle: "100+ மத்திய மற்றும் தமிழ்நாடு அரசு நலத்திட்டங்களின் தகுதி விதிகளோடு ஒப்பிட உங்கள் அடிப்படை விவரங்களை உள்ளிடுங்கள்.",
      ageLabel: "உங்கள் வயது (ஆண்டுகள்)",
      agePlaceholder: "வயதை உள்ளிடவும் (எ.கா. 21)",
      genderLabel: "பாலினம்",
      genderMale: "ஆண்",
      genderFemale: "பெண்",
      genderTransgender: "திருநங்கை",
      stateLabel: "வசிக்கும் மாநிலம் / இருப்பிடம்",
      occupationLabel: "முதன்மை தொழில் / தற்போதைய நிலை",
      incomeLabel: "குடும்ப ஆண்டு வருமானம்",
      categoryLabel: "சமூகப் பிரிவு / வகுப்பு",
      disabilityLabel: "மாற்றுத்திறனாளியா (PwD)?",
      yes: "ஆம்",
      no: "இல்லை",
      proceedToChat: "தொடரவும்: படி 2 - சூழ்நிலையை விவரிக்க ➔",
      skipToChat: "நேரடியாக அரட்டைக்கு செல்லவும்",
      editBasicDetails: "அடிப்படை விவரங்களை மாற்றுக",
      profileCaptured: "அடிப்படை விவரங்கள் சேமிக்கப்பட்டன",
      step2Title: "படி 2 / 2: உங்கள் தேவை அல்லது சூழ்நிலையை விவரிக்கவும்",
      step2Subtitle: "உங்களுக்குத் தேவையான அரசு உதவி என்ன என்பதை AI வழிகாட்டியிடம் இயல்பாகக் கூறவும் (கல்வி உதவி, பயிர் சேதம், தொழில் கடன், ஓய்வூதியம், மருத்துவ உதவி, முதலியன)",
      quickPromptsTitle: "உங்களுக்கான பரிந்துரைக்கப்பட்ட சூழ்நிலைகள்:",
      occupations: {
        student: "மாணவர் / கல்லூரி / பள்ளி",
        farmer: "விவசாயி / வேளாண் தொழில்",
        business: "சுயதொழில் / குறுந்தொழில் / MSME",
        artisan: "கைவினைஞர் / பாரம்பரிய தொழில்",
        vendor: "சாலையோர வியாபாரி / சிறு வணிகர்",
        unemployed: "வேலையில்லாதவர் / வேலை தேடுபவர்",
        senior: "முதியோர் / ஓய்வுபெற்றவர் (60+)",
        homemaker: "குடும்பத் தலைவி / ஆதரவற்ற பெண் / விதவை",
        worker: "தினக்கூலித் தொழிலாளி / உடலுழைப்பு"
      },
      incomeBrackets: {
        under1L: "₹1 லட்சத்திற்குள் (மிகவும் ஏழை / BPL)",
        between1L_25L: "₹1,00,000 - ₹2,50,000",
        between25L_5L: "₹2,50,000 - ₹5,00,000",
        between5L_8L: "₹5,00,000 - ₹8,00,000",
        above8L: "₹8 லட்சத்திற்கு மேல்"
      },
      categories: {
        all: "அனைத்து பிரிவுகளும் / பட்டியலிடப்படாதவை",
        general: "பொதுப் பிரிவு (General / OC)",
        obc: "பிற்படுத்தப்பட்டோர் (OBC / BC / MBC)",
        sc: "பட்டியலினத்தவர் (SC)",
        st: "பழங்குடியினர் (ST)",
        ews: "பொருளாதாரத்தில் பின்தங்கியோர் (EWS)"
      }
    },

    // Scheme Modal Tabs
    modalTabOverview: "கண்ணோட்டம் & விவரங்கள்",
    modalTabBenefits: "திட்ட பலன்கள்",
    modalTabEligibility: "தகுதி விதிகள்",
    modalTabApplication: "விண்ணப்பிக்கும் முறை & ஆவணங்கள்",
    matchedCriteriaTitle: "பொருந்திய அரசு தகுதி விதிகள்",
    missingCriteriaTitle: "சரிபார்க்கப்பட வேண்டிய விதிகள்",
    failedCriteriaTitle: "பொருந்தாத தகுதி விதிகள்",
    benefitsTitle: "திட்டத்தின் முக்கிய பலன்கள்",
    documentsTitle: "தேவையான ஆவணங்கள்",
    sourceTitle: "அதிகாரப்பூர்வ அரசு ஆதாரம்",
    departmentLabel: "அரசு துறை",
    levelLabel: "நிலை",
    stateLabel: "மாநிலம் / இருப்பிடம்",
    closeBtn: "மூடு",
    lastVerifiedLabel: "கடைசியாக சரிபார்க்கப்பட்டது",
    howToApplyTitle: "விண்ணப்பிக்கும் முறை",
    onlineApplication: "அதிகாரப்பூர்வ இணையதளம் மூலம் ஆன்லைனில் விண்ணப்பிக்கவும்"
  }
};
