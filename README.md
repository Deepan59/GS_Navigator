# AI Last-Mile Government Service Navigator

An AI-powered citizen discovery platform designed for Indian citizens to discover relevant central and state government schemes based on their real-life needs and published eligibility criteria.

---

## 🏛️ Core Architecture Principles

1. **Deterministic Eligibility Rules Engine**: The LLM (*Gemini*) does **NOT** decide eligibility or invent criteria. All eligibility checks are executed deterministically by the backend rules engine.
2. **Single Source of Truth**: [`schemes.json`](backend/src/data/schemes.json) is the verified source of truth for schemes, eligibility rules, benefits, documents, and official portal URLs.
3. **Role of Gemini AI**: Natural Language Understanding (NLU), structured citizen attribute extraction from colloquial queries, generating follow-up guidance, and conversational summaries.
4. **Advisory Compliance**: The system uses terms like *"You appear to meet the published criteria"* or *"Potentially relevant"* and never falsely claims official government authorization.
5. **Verified Official Portals**: Every scheme card provides direct links to the official government portal.

---

## 📁 Project Structure

```
GS_Navigator/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── navigatorController.js   # Handles intake, recalculation, catalog endpoints
│   │   ├── data/
│   │   │   └── schemes.json             # Source of truth: verified schemes & criteria
│   │   ├── routes/
│   │   │   └── navigatorRoutes.js       # Express routes (/navigate, /evaluate-profile, /schemes)
│   │   ├── services/
│   │   │   ├── eligibilityEngine.js     # Deterministic criteria evaluation engine
│   │   │   └── geminiService.js         # Gemini NLU extractor + heuristic fallback
│   │   └── server.js                    # Express app & health check
│   ├── .env.example                     # Environment configuration template
│   ├── .env                             # Environment file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CitizenQuerySection.jsx  # Natural language intake & preset personas
│   │   │   ├── DisclaimerBanner.jsx     # Official advisory notice
│   │   │   ├── EligibilityResults.jsx   # Results filtering & AI counselor summary
│   │   │   ├── ExtractedProfileEditor.jsx # Interactive profile view & live editor
│   │   │   ├── Navbar.jsx               # Header with engine & Gemini status
│   │   │   └── SchemeCard.jsx           # Scheme details, matched criteria, docs checklist
│   │   ├── services/
│   │   │   └── api.js                   # Backend API client
│   │   ├── App.jsx                      # Main app container
│   │   ├── index.css                    # Global styling
│   │   └── main.jsx                     # Vite entry point
│   ├── index.html                       # HTML template with Tailwind CSS
│   ├── vite.config.js                   # Vite dev server with proxy to backend
│   └── package.json
├── package.json                         # Root helper scripts
└── README.md
```

---

## 🚀 How to Run

### 1. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables (`backend/.env`):
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: If `GEMINI_API_KEY` is not provided, the backend automatically switches to its built-in deterministic heuristic extractor, allowing immediate testing without an API key!

Start the backend server:
```bash
npm start
# or for auto-reloading dev mode:
npm run dev
```
Backend will run at: **`http://localhost:5000`**

---

### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at: **`http://localhost:3000`**

---

## 🧪 Current Features Implemented

- **Natural Language Intake**: Citizens can express their situation in plain English, Hindi, or mixed phrasing (e.g., *"I am a 35-year-old farmer in UP with 2 acres of land and 1.2 Lakh income"*).
- **Preset Citizen Personas**: 1-click test buttons for Farmers, Widows, Students, Vendors, Savings for Girl Child, and Disabled Entrepreneurs.
- **AI Structured Profile Extraction**: Gemini maps raw text to structured parameters (`age`, `gender`, `occupation`, `annual_income`, `land_holding_acres`, `state`, `category`, `marital_status`, `has_disability`, `is_student`, `is_bpl`).
- **Deterministic Rules Evaluation**: Checks published eligibility guidelines without model hallucination.
- **Color-Coded Status Badges**:
  - 🟢 **Appears to meet published criteria**
  - 🟡 **Potentially relevant (Requires missing information)**
  - ⚪ **Does not meet published criteria**
- **Interactive Citizen Profile Refinement**: Allows citizens/field operators to live-edit extracted values and recalculate results in real time.
- **Interactive Required Documents Checklist**: Citizen can mark which documents they have prepared.
- **Official Government Links**: Every scheme provides direct access to its verified government portal.
