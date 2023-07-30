import { Router } from "express";
import BPMNAnalyzerRoutes from "./bpmn-analyzer/bpmn-analyzer.routes";

const router = Router();
router.use("/upload", BPMNAnalyzerRoutes);

export default router;
