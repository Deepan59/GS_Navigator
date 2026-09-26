import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  VectorSearchService, 
  defaultVectorStore, 
  generateEmbedding 
} from "./vectorSearchService.js";
import { loadSchemesData } from "./schemeSearchService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE_PATH = path.resolve(__dirname, "../data/rag_index_cache.json");

/**
 * Converts a structured scheme JSON object into a rich, searchable textual representation.
 * Preserves all domain nuances (benefits, eligibility conditions, department, target beneficiaries, documents).
 */
export function buildSchemeSearchableText(scheme = {}) {
  const parts = [];

  if (scheme.name) parts.push(`Scheme Name: ${scheme.name}`);
  if (scheme.category) parts.push(`Category: ${scheme.category}`);
  if (scheme.department) parts.push(`Department: ${scheme.department}`);
  if (scheme.level || scheme.state) parts.push(`Jurisdiction: ${scheme.level || ""} ${scheme.state || ""}`);
  if (scheme.description) parts.push(`Description: ${scheme.description}`);

  if (Array.isArray(scheme.benefits) && scheme.benefits.length > 0) {
    parts.push(`Key Benefits: ${scheme.benefits.join("; ")}`);
  }

  const elig = scheme.eligibility || {};
  const eligParts = [];
  if (elig.age) eligParts.push(`Age limit: Min ${elig.age.min ?? "Any"}, Max ${elig.age.max ?? "Any"}`);
  if (Array.isArray(elig.gender) && elig.gender.length > 0) eligParts.push(`Gender: ${elig.gender.join(", ")}`);
  if (Array.isArray(elig.occupation) && elig.occupation.length > 0) eligParts.push(`Occupation: ${elig.occupation.join(", ")}`);
  if (elig.student !== undefined && elig.student !== null) eligParts.push(`Student status: ${elig.student ? "Student required" : "Non-student"}`);
  if (elig.annualIncomeMax) eligParts.push(`Income ceiling: ₹${elig.annualIncomeMax}`);
  if (Array.isArray(elig.categories) && elig.categories.length > 0) eligParts.push(`Social categories: ${elig.categories.join(", ")}`);
  if (Array.isArray(elig.states) && elig.states.length > 0) eligParts.push(`Applicable states: ${elig.states.join(", ")}`);
  if (Array.isArray(elig.otherConditions) && elig.otherConditions.length > 0) eligParts.push(`Special conditions: ${elig.otherConditions.join("; ")}`);

  if (eligParts.length > 0) {
    parts.push(`Eligibility Criteria: ${eligParts.join(" | ")}`);
  }

  if (Array.isArray(scheme.requiredDocuments) && scheme.requiredDocuments.length > 0) {
    parts.push(`Required Documents: ${scheme.requiredDocuments.join(", ")}`);
  }

  if (scheme.source) {
    parts.push(`Official Source: ${scheme.source.name || ""} ${scheme.source.url || ""}`);
  }

  return parts.join("\n");
}

/**
 * Initializes the RAG knowledge base.
 * Loads cached vector index if available, or indexes all schemes from schemes.json.
 */
export async function initRagKnowledgeBase({
  forceRebuild = false,
  vectorStore = defaultVectorStore,
  customSchemes = null,
  cachePath = CACHE_FILE_PATH
} = {}) {
  // If already ready and not forcing rebuild, return
  if (vectorStore.isReady() && !forceRebuild) {
    return { status: "ready", count: vectorStore.size(), cached: true };
  }

  // Attempt to load from disk cache if not forcing rebuild
  if (!forceRebuild && cachePath && fs.existsSync(cachePath)) {
    const loaded = vectorStore.loadIndex(cachePath);
    if (loaded && vectorStore.size() > 0) {
      console.log(`[RAGService] Loaded ${vectorStore.size()} scheme embeddings from cache.`);
      return { status: "ready", count: vectorStore.size(), cached: true };
    }
  }

  console.log("[RAGService] Building RAG Vector Index from schemes.json...");
  const schemes = customSchemes || loadSchemesData();

  if (!Array.isArray(schemes) || schemes.length === 0) {
    console.warn("[RAGService] No schemes available to index.");
    return { status: "empty", count: 0 };
  }

  vectorStore.clear();

  // Index each scheme
  for (const scheme of schemes) {
    if (!scheme || !scheme.id) continue;
    const searchableText = buildSchemeSearchableText(scheme);
    const vector = await generateEmbedding(searchableText);

    vectorStore.addDocument({
      id: scheme.id,
      text: searchableText,
      metadata: {
        schemeId: scheme.id,
        schemeName: scheme.name,
        category: scheme.category,
        state: scheme.state,
        department: scheme.department,
        level: scheme.level
      },
      vector
    });
  }

  // Save index cache
  if (cachePath) {
    try {
      const dir = path.dirname(cachePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      vectorStore.saveIndex(cachePath);
      console.log(`[RAGService] Saved vector index cache (${vectorStore.size()} items) to ${cachePath}`);
    } catch (err) {
      console.warn("[RAGService] Could not write vector cache:", err.message);
    }
  }

  console.log(`[RAGService] RAG Knowledge Base built successfully with ${vectorStore.size()} schemes.`);
  return { status: "ready", count: vectorStore.size(), cached: false };
}

/**
 * Performs semantic similarity search against the RAG knowledge base.
 * Returns candidate scheme IDs and their similarity scores.
 * 
 * NOTE: Vector similarity is used ONLY for candidate discovery, NEVER as eligibility.
 * 
 * @param {string} queryText - Citizen query or situation description
 * @param {number} [topK] - Max candidates to return (defaults to RAG_TOP_K or 10)
 * @param {VectorSearchService} [vectorStore] - Vector database instance
 * @returns {Promise<{ query: string, candidates: Array<{ schemeId: string, similarity: number, name: string, category: string }> }>}
 */
export async function searchCandidateSchemes(
  queryText, 
  topK = null, 
  vectorStore = defaultVectorStore
) {
  const configuredTopK = topK || parseInt(process.env.RAG_TOP_K, 10) || 10;

  if (!queryText || typeof queryText !== "string" || !queryText.trim()) {
    return {
      query: "",
      candidates: []
    };
  }

  try {
    // Ensure index is loaded
    if (!vectorStore.isReady()) {
      await initRagKnowledgeBase({ vectorStore });
    }

    const queryVector = await generateEmbedding(queryText.trim());
    const rawResults = vectorStore.similaritySearch(queryVector, configuredTopK);

    const candidates = rawResults.map(item => ({
      schemeId: item.schemeId,
      similarity: item.similarity,
      name: item.metadata?.schemeName || item.schemeId,
      category: item.metadata?.category || "",
      department: item.metadata?.department || ""
    }));

    return {
      query: queryText.trim(),
      candidates
    };
  } catch (error) {
    console.warn("[RAGService] Semantic search failed or vector store unavailable:", error.message);
    // Return empty candidates list to allow graceful fallback to structured search
    return {
      query: queryText.trim(),
      candidates: [],
      error: error.message
    };
  }
}
