import { Router } from "express";
import { analyzeBpmn, updateCognitivWeights } from "./bpmn-analyzer.controller";
import multer from "multer";

const router = Router();
const upload = multer();
router.route("/upload").post(upload.single("bpmnFile"), analyzeBpmn);
router.route("/update-weights").post(updateCognitivWeights);

export default router;
