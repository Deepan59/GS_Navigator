# AI Last-Mile Government Service Navigator with Hybrid RAG

An AI-powered citizen discovery platform designed for Indian citizens to discover relevant central and state government schemes based on their real-life needs and published eligibility criteria.

---

## 🏛️ Core Architecture Principles

1. **RAG is ONLY for Candidate Discovery**: Semantic vector search discovers candidate schemes that may relate to a citizen's expressed situation or colloquial phrasing.
2. **Deterministic Eligibility Rules Engine**: The LLM (*Gemini*) and Vector Search do **NOT** decide eligibility or invent criteria. All eligibility checks are executed deterministically by the backend rules engine (`eligibilityService.js`).
3. **Single Source of Truth**: [`schemes.json`](backend/data/schemes.json) is the verified source of truth for schemes, eligibility rules, benefits, documents, and official portal URLs.
4. **No Raw Vector Similarity as Eligibility**: Similarity scores are used exclusively for ranking candidate discovery internally and are never presented to citizens as "eligibility percentages".
5. **Role of Gemini AI**: Natural Language Understanding (NLU), structured citizen attribute extraction from colloquial English & Tamil queries, generating follow-up guidance, and conversational summaries without inventing facts.
6. **Bilingual Intelligence**: Full native support for English and தமிழ்.
7. **Advisory Compliance**: Uses transparent phrases such as *"You appear to meet published criteria"* or *"Potentially relevant"* and never falsely claims official government authorization.

---

## 🧠 Hybrid RAG Architecture

```
                                  [ Citizen Natural Language Request ]
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │      Gemini / Heuristic NLU & Extraction         │
                        │    (Extracts Age, Income, Gender, State, Need)   │
                        └─────────────────────────┬────────────────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         │                                                 │
                         ▼                                                 ▼
        ┌──────────────────────────────────┐             ┌──────────────────────────────────┐
        │       RAG Semantic Search        │             │    Existing Structured Search    │
        │   (Embeddings + Vector Store)    │             │   (Keywords, Category, Demogr.)  │
        └────────────────┬─────────────────┘             └─────────────────┬────────────────┘
                         │                                                 │
                         └────────────────────────┬────────────────────────┘
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │          Merge & Deduplicate Candidates          │
                        │      (Preserving verified scheme records)        │
                        └─────────────────────────┬────────────────────────┘
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │      DETERMINISTIC ELIGIBILITY RULES ENGINE      │
                        │    (Evaluates Age, Gender, Income, PwD, State)   │
                        │   *Source of Truth: schemes.json (Unchanged)*    │
                        └─────────────────────────┬────────────────────────┘
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │      Final Ranked Results & Gemini Explanations  │
                        │   (Potential Matches, Criteria Match Breakdown)  │
                        └──────────────────────────────────────────────────┘
```

---

## 🔍 Why RAG is Used in this Project

1. **Vocabulary Mismatch Resolution**: Citizens describe real-world problems in colloquial terms (e.g. *"Heavy rain flooded my field and crops died"* or *"Struggling to pay my college fees"*), whereas government schemes have official nomenclature (e.g. *"Pradhan Mantri Fasal Bima Yojana"* or *"Post-Matric Scholarship for BC/MBC"*).
2. **Semantic Similarity vs. Eligibility Verification**:
   - **RAG Semantic Search**: Discovers *relevance* (which schemes are about this topic).
   - **Deterministic Rules Engine**: Verifies *eligibility* (whether the citizen meets published criteria like age ceilings, income thresholds, state residence, etc.).

---

## 🗄️ Vector Database & Embeddings Pipeline

* **Vector Search Service (`vectorSearchService.js`)**:
  - Modular vector store abstraction providing in-memory index + persistent cache (`backend/data/rag_index_cache.json`).
  - Implements cosine similarity search with optional metadata filtering.
  - Zero bulky external database daemons required for deployment.
* **Embeddings**:
  - Primary: Google Gemini `text-embedding-004` (when `GEMINI_API_KEY` is configured).
  - Fallback: High-dimensional deterministic semantic embedding generator (256-dimensional subword & domain cluster hashing with L2 normalization) ensuring offline and CI/CD test suite operation.
* **Searchable Document Representation**:
  Each scheme is converted into a rich textual document combining Scheme Name, Description, Category, Department, Jurisdiction, Key Benefits, Eligibility Criteria, Required Documents, and Official Source.

---

## 🔄 Rebuilding the RAG Index

Whenever `schemes.json` is modified or updated with new government schemes, rebuild the vector index:

```bash
cd backend
npm run build:rag
```

This will parse `schemes.json`, generate embeddings, and save the updated vector cache to `backend/data/rag_index_cache.json`.

---

## 🛡️ Graceful Fallback Mechanism

If the vector database is unavailable or embedding service encounters a network error:
1. RAG returns an empty candidate list and logs a diagnostic warning.
2. The workflow automatically continues using **Structured Search candidates**.
3. Candidates are evaluated by the deterministic eligibility engine with **zero application crashes**.

---

## ⚙️ Environment Variables

Create `.env` in `backend/` (see `.env.example`):

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash-latest
RAG_TOP_K=10
```

> **Security Note**: All `.env` and `.env.*` files are excluded from Git via `.gitignore`.

---

## 🛠️ Development & Debug Tools

To inspect the intermediate stages of the Hybrid RAG pipeline, use the diagnostic endpoint:

`POST http://localhost:5000/api/debug/recommend-flow`

**Payload:**
```json
{
  "message": "I am a college student needing scholarship in Tamil Nadu",
  "language": "en"
}
```

**Response:**
```json
{
  "query": "I am a college student needing scholarship in Tamil Nadu",
  "extractedProfile": { "occupation": "student", "is_student": true, "state": "Tamil Nadu" },
  "ragCandidates": [
    { "schemeId": "post-matric-scholarship-15", "similarity": 0.89, "name": "Post-Matric Scholarship" }
  ],
  "structuredCandidates": [
    { "schemeId": "post-matric-scholarship-15", "name": "Post-Matric Scholarship" }
  ],
  "mergedCandidateIds": ["post-matric-scholarship-15"],
  "eligibilityResults": [ ... ]
}
```

---

## 🚀 How to Run Locally

### 1. Run Backend Server & Tests

```bash
cd backend
npm install
npm test
npm run dev
```

Runs on: **`http://localhost:5000`**

### 2. Run Frontend Client

```bash
cd frontend
npm install
npm run dev
```

Runs on: **`http://localhost:3000`**

---

## 🧪 Test Suite

Run the full automated test suite (25 tests across all engines):

```bash
cd backend
npm test
```

* **Phase 3 Tests**: Eligibility Engine criteria matching & boundary tests.
* **Phase 4 Tests**: Structured Scheme Search & catalog priority tests.
* **Phase 5 Tests**: End-to-end NLU workflow & bilingual recommendation tests.
* **RAG Workflow Tests**: Semantic phrasing, failing income criteria, hybrid fallback, candidate deduplication, and missing info handling.
