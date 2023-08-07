import { Request, Response } from "express";
import { CustomError } from "../models/custom-error.model";
import {
  countActivities,
  calculateControllFlowComplexity,
  calculateKognitiveWeight,
  calculateFiFo,
  calculateHalstead,
} from "./bpmn-analyzer";
const bpmnModdle = require("bpmn-moddle");

export const analyzeBpmn = async (req: Request, res: Response) => {
  // Step 1: Parse BPMN File (assuming BPMN data is sent as a string in the 'bpmnData' field of the request body)
  const bpmnFileBuffer = req.file.buffer.toString(); // This will give you the BPMN file content as a string
  const moddle = new bpmnModdle();

  try {
    const parsedBpmn = await moddle.fromXML(bpmnFileBuffer);
    const activityCount = countActivities(parsedBpmn);
    const cfc = calculateControllFlowComplexity(parsedBpmn);
    const ccm = calculateKognitiveWeight(parsedBpmn);
    const fifo = calculateFiFo(parsedBpmn);
    const hal = calculateHalstead(parsedBpmn);
    res.send({ activityCount, cfc, ccm, fifo, hal });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).send("An error occurred while processing the BPMN file.");
  }
};
