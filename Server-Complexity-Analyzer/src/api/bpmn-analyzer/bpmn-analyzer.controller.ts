// Import necessary modules and functions
import { Request, Response } from "express";
import {
  calculateControllFlowComplexity,
  calculateCognitiveWeight,
  calculateFiFo,
  calculateHalstead,
  countElements,
  getPaths,
  updateWeights,
  calcCountOfPaths,
  AnalyzedDataI,
  addNewCalculatedBPMN,
  getCalculatedBPMNs,
} from "./bpmn-analyzer";
const bpmnModdle = require("bpmn-moddle");

// Endpoint handler for analyzing BPMN files
export const analyzeBpmn = async (req: Request, res: Response) => {
  // Convert uploaded BPMN file buffer to string
  const bpmnFileBuffer = req.file.buffer.toString();
  const fileName = req.file.originalname;
  // Initialize bpmn-moddle for BPMN XML parsing
  const moddle = new bpmnModdle();

  try {
    // Parse the BPMN XML using bpmn-moddle
    const parsedBpmn = await moddle.fromXML(bpmnFileBuffer);

    // Calculate various metrics using BPMN analysis functions
    const elementCount = countElements(parsedBpmn);
    const cfc = calculateControllFlowComplexity(parsedBpmn);
    const ccm = await calculateCognitiveWeight(parsedBpmn, bpmnFileBuffer);
    const fifo = calculateFiFo(parsedBpmn);
    const hal = calculateHalstead(parsedBpmn);
    const cop = await calcCountOfPaths(parsedBpmn, bpmnFileBuffer);

    const calculatedData: AnalyzedDataI = {
      elementCount,
      cfc,
      ccm,
      fifo,
      hal,
      cop,
    };
    addNewCalculatedBPMN(calculatedData, fileName);
    // Send calculated metrics as a response
    res.send({ elementCount, cfc, ccm, fifo, hal, cop });
  } catch (error) {
    // Log and handle errors
    console.error(error); // Log the error for debugging purposes
    res
      .status(500)
      .send("An error occurred while processing the BPMN file. " + error);
  }
};

export const updateCognitivWeights = async (req: Request, res: Response) => {
  updateWeights(req.body);
  res.send();
};

export const getAllCalculatedData = async (req: Request, res: Response) => {
  res.send({ data: getCalculatedBPMNs() });
};
