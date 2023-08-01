import { Router } from "express";
import { analyzeBpmn } from "./bpmn-analyzer.controller";
import multer from "multer";

const router = Router();
const upload = multer();
router.route("/").post(upload.single("bpmnFile"), analyzeBpmn);

export default router;
