import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let genAIInstance = null;

function getAIClient() {
  if (!genAIInstance && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    try {
      genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch (e) {
      console.warn("[VectorSearchService] Could not initialize Gemini client for embeddings:", e.message);
    }
  }
  return genAIInstance;
}

/**
 * Computes Cosine Similarity between two numeric vectors.
 * Returns value between -1.0 and 1.0 (typically 0.0 to 1.0 for positive embeddings).
 */
export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Semantic semantic-hash dictionary for deterministic offline fallback embedding.
 * Dimension: 256. Uses subword hash projection and domain semantic clustering.
 */
const EMBEDDING_DIM = 256;

// Domain concept mapping for robust bilingual semantic retrieval
const CONCEPT_SYNONYMS = {
  education: ["college", "school", "fees", "scholarship", "tuition", "study", "student", "hostel", "degree", "diploma", "engineering", "medical", "kalloori", "padipu", "கல்வி", "படிப்பு", "கல்லூரி", "மாணவர்", "மாணவி", "உதவித்தொகை"],
  agriculture: ["farmer", "crop", "damage", "loss", "flood", "rain", "drip", "irrigation", "tractor", "fertilizer", "kisan", "vivasayi", "payir", "sedham", "வேளாண்மை", "விவசாயி", "பயிர்", "மழை", "சேதம்", "விவசாய"],
  health: ["medical", "hospital", "surgery", "insurance", "treatment", "disease", "health", "doctor", "cmchis", "maruthuvam", "மருத்துவம்", "காப்பீடு", "சிகிச்சை", "அறுவை"],
  women: ["woman", "women", "girl", "mother", "widow", "marriage", "sewing", "magalir", "urimai", "thogai", "pen", "மகளிர்", "பெண்", "விதவை", "திருமணம்", "தையல்"],
  business: ["business", "msme", "loan", "subsidy", "entrepreneur", "shop", "vendor", "street", "svanidhi", "pmegp", "vishwakarma", "suya", "thozhil", "வணிகம்", "சுயதொழில்", "கடன்", "மானியம்"],
  pension: ["pension", "old", "senior", "elderly", "destitute", "aged", "retirement", "ignops", "oap", "muthiyor", "முதியோர்", "ஓய்வூதியம்", "ஆதரவற்ற"],
  disability: ["disability", "disabled", "handicapped", "wheelchair", "pwd", "assistive", "matruthranali", "மாற்றுத்திறனாளி"],
  housing: ["house", "housing", "shelter", "pmay", "home", "veedu", "வீடு", "வீட்டுவசதி"]
};

function deterministicFallbackEmbedding(text = "") {
  const vec = new Float32Array(EMBEDDING_DIM);
  if (!text || typeof text !== "string") return Array.from(vec);

  const clean = text.toLowerCase().replace(/[^a-z0-9\s\u0B80-\u0BFF]/g, " ");
  const words = clean.split(/\s+/).filter(Boolean);

  // 1. Subword & Token Hash Projection
  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % EMBEDDING_DIM;
    vec[idx] += 1.0;

    // Character 3-grams
    for (let i = 0; i < word.length - 2; i++) {
      let gHash = word.charCodeAt(i) * 31 + word.charCodeAt(i + 1) * 17 + word.charCodeAt(i + 2);
      const gIdx = Math.abs(gHash) % EMBEDDING_DIM;
      vec[gIdx] += 0.4;
    }
  });

  // 2. Semantic Cluster Alignment
  let clusterOffset = 180;
  Object.entries(CONCEPT_SYNONYMS).forEach(([concept, syns], cIdx) => {
    const bucket = (clusterOffset + cIdx * 9) % EMBEDDING_DIM;
    let conceptHits = 0;
    syns.forEach(syn => {
      if (clean.includes(syn)) {
        conceptHits += 1;
      }
    });
    if (conceptHits > 0) {
      vec[bucket] += (conceptHits * 2.5);
      vec[(bucket + 1) % EMBEDDING_DIM] += (conceptHits * 1.5);
      vec[(bucket + 2) % EMBEDDING_DIM] += (conceptHits * 1.0);
    }
  });

  // 3. L2 Normalization
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vec[i] = vec[i] / norm;
    }
  }

  return Array.from(vec);
}

/**
 * Generates an embedding vector for a given text snippet.
 * Prioritizes Gemini text-embedding-004 API when configured; falls back to deterministic vectorizer.
 */
export async function generateEmbedding(text = "") {
  if (!text || typeof text !== "string" || !text.trim()) {
    return new Array(EMBEDDING_DIM).fill(0);
  }

  const aiClient = getAIClient();
  if (aiClient) {
    try {
      const embeddingModel = aiClient.getGenerativeModel({ model: "text-embedding-004" });
      const result = await embeddingModel.embedContent(text.slice(0, 2048));
      if (result && result.embedding && Array.isArray(result.embedding.values)) {
        return result.embedding.values;
      }
    } catch (err) {
      // Fall through to deterministic fallback if rate limited or network issue
      console.warn(`[VectorSearchService] Gemini embedContent fallback triggered (${err.message})`);
    }
  }

  return deterministicFallbackEmbedding(text);
}

/**
 * Lightweight, In-Memory and File-Persisted Vector Store Abstraction.
 * Easy to run, zero external DB dependencies, fully modular.
 */
export class VectorSearchService {
  constructor(options = {}) {
    this.name = options.name || "default_vector_store";
    this.documents = []; // Array of { id, text, metadata, vector }
    this.isInitialized = false;
    this.isServiceAvailable = true; // Can be toggled for testing fallback
  }

  /**
   * Clears all stored vectors.
   */
  clear() {
    this.documents = [];
    this.isInitialized = false;
  }

  /**
   * Adds a single document with its vector and metadata.
   */
  addDocument({ id, text, metadata = {}, vector }) {
    if (!id) throw new Error("Document must have a valid 'id'.");
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error(`Document ${id} must have a valid embedding vector.`);
    }

    // Replace if existing
    const existingIdx = this.documents.findIndex(d => d.id === id);
    const docEntry = {
      id,
      text: text || "",
      metadata: metadata || {},
      vector
    };

    if (existingIdx >= 0) {
      this.documents[existingIdx] = docEntry;
    } else {
      this.documents.push(docEntry);
    }
    this.isInitialized = true;
  }

  /**
   * Bulk add documents.
   */
  addDocuments(docs = []) {
    docs.forEach(doc => this.addDocument(doc));
  }

  /**
   * Performs semantic similarity search against all stored vectors.
   * 
   * @param {Array<number>} queryVector - Query embedding vector
   * @param {number} topK - Maximum number of candidate results
   * @param {Function} [filterFn] - Optional metadata filter function
   * @returns {Array<{ id, schemeId, similarity, metadata }>}
   */
  similaritySearch(queryVector, topK = 10, filterFn = null) {
    if (!this.isServiceAvailable) {
      throw new Error("VectorSearchService is currently unavailable (simulated or offline).");
    }

    if (!Array.isArray(queryVector) || queryVector.length === 0 || this.documents.length === 0) {
      return [];
    }

    const scored = [];
    for (const doc of this.documents) {
      if (filterFn && typeof filterFn === "function" && !filterFn(doc.metadata)) {
        continue;
      }

      const sim = cosineSimilarity(queryVector, doc.vector);
      scored.push({
        id: doc.id,
        schemeId: doc.metadata?.schemeId || doc.id,
        similarity: Number(sim.toFixed(4)),
        metadata: doc.metadata
      });
    }

    // Sort by descending cosine similarity
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, topK);
  }

  /**
   * Returns total indexed documents count.
   */
  size() {
    return this.documents.length;
  }

  /**
   * Check if vector store has indexed data and is ready.
   */
  isReady() {
    return this.isInitialized && this.documents.length > 0;
  }

  /**
   * Serializes the index to disk.
   */
  saveIndex(filePath) {
    const data = JSON.stringify({
      version: "1.0",
      createdAt: new Date().toISOString(),
      count: this.documents.length,
      documents: this.documents
    });
    fs.writeFileSync(filePath, data, "utf-8");
  }

  /**
   * Deserializes the index from disk.
   */
  loadIndex(filePath) {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.documents)) {
        this.documents = parsed.documents;
        this.isInitialized = true;
        return true;
      }
    } catch (err) {
      console.warn(`[VectorSearchService] Could not load vector cache from ${filePath}:`, err.message);
    }
    return false;
  }
}

// Global default instance for the backend application
export const defaultVectorStore = new VectorSearchService({ name: "schemes_rag_store" });
