import { Router } from "express";
import { getExample } from "./bpmn-analyzer.controller";

const router = Router();
router.route("/").post(getExample);

export default router;
