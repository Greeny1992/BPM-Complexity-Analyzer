import { Router } from "express";
import {
  analyzeBpmn,
  getAllCalculatedData,
  resetEvalutation,
  updateCognitivWeights,
} from "./bpmn-analyzer.controller";
import multer from "multer";

const router = Router();
const upload = multer();
router.route("/upload").post(upload.single("bpmnFile"), analyzeBpmn);
router.route("/update-weights").post(updateCognitivWeights);
router.route("/calculated-data").get(getAllCalculatedData);
router.route("/reset").delete(resetEvalutation);
export default router;
