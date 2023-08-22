// Import necessary modules and functions
import { Request, Response } from "express";
import {
  calculateControllFlowComplexity,
  calculateKognitiveWeight,
  calculateFiFo,
  calculateHalstead,
  countElements,
  getPaths,
} from "./bpmn-analyzer";
const bpmnModdle = require("bpmn-moddle");

// Endpoint handler for analyzing BPMN files
export const analyzeBpmn = async (req: Request, res: Response) => {
  // Convert uploaded BPMN file buffer to string
  const bpmnFileBuffer = req.file.buffer.toString();

  // Initialize bpmn-moddle for BPMN XML parsing
  const moddle = new bpmnModdle();

  try {
    // Parse the BPMN XML using bpmn-moddle
    const parsedBpmn = await moddle.fromXML(bpmnFileBuffer);
    console.log(JSON.stringify(parsedBpmn));

    // Calculate various metrics using BPMN analysis functions
    const elementCount = countElements(parsedBpmn);
    const cfc = calculateControllFlowComplexity(parsedBpmn);
    const ccm = calculateKognitiveWeight(parsedBpmn);
    const fifo = calculateFiFo(parsedBpmn);
    const hal = calculateHalstead(parsedBpmn);

    // Retrieve and log BPMN paths using getPaths function
    await getPaths(bpmnFileBuffer);

    // Send calculated metrics as a response
    res.send({ elementCount, cfc, ccm, fifo, hal });
  } catch (error) {
    // Log and handle errors
    console.error(error); // Log the error for debugging purposes
    res.status(500).send("An error occurred while processing the BPMN file.");
  }
};
