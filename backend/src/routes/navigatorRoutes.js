import express from "express";
import {
  handleCitizenQuery,
  handleProfileRecalculate,
  handleGetSchemes,
  handleRecommendSchemes,
  handleCitizenRecommend,
  handleDebugRecommendFlow
} from "../controllers/navigatorController.js";

const router = express.Router();

// Complete End-to-End Workflow: Natural Language Message -> Gemini NLU -> Validation -> Deterministic Rules Engine
router.post("/recommend", handleCitizenRecommend);

// Development / Debug Diagnostic Endpoint for RAG and Workflow Inspection
router.post("/debug/recommend-flow", handleDebugRecommendFlow);

// Scheme Discovery via Structured Profile
router.post("/schemes/recommend", handleRecommendSchemes);

// Interactive Navigator Endpoints
router.post("/navigate", handleCitizenQuery);
router.post("/evaluate-profile", handleProfileRecalculate);
router.get("/schemes", handleGetSchemes);

export default router;
