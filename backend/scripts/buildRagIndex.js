import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initRagKnowledgeBase } from "../services/ragService.js";
import { defaultVectorStore } from "../services/vectorSearchService.js";
import { loadSchemesData } from "../services/schemeSearchService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  console.log("=========================================");
  console.log("🧠 RAG Knowledge Base Indexing Pipeline");
  console.log("=========================================");

  const schemes = loadSchemesData();
  console.log(`Loaded ${schemes.length} schemes from schemes.json`);

  const startTime = Date.now();
  const result = await initRagKnowledgeBase({
    forceRebuild: true,
    vectorStore: defaultVectorStore,
    customSchemes: schemes
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Indexing completed in ${duration}s.`);
  console.log(`📊 Total Documents Indexed: ${result.count}`);
  console.log("=========================================");
}

main().catch((err) => {
  console.error("❌ RAG Indexing failed:", err);
  process.exit(1);
});
