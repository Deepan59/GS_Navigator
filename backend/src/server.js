import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import navigatorRoutes from "./routes/navigatorRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file if present
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Last-Mile Government Service Navigator Backend",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api", navigatorRoutes);

// Serve Frontend static assets in production if dist exists
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next();
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 GS Navigator running on port ${PORT}`);
  console.log(`🔑 Gemini API configured: ${process.env.GEMINI_API_KEY ? "YES" : "NO (Running heuristic fallback)"}`);
});
