import { Request, Response } from "express";
const bpmnModdle = require("bpmn-moddle");

export const analyzeBpmn = async (req: Request, res: Response) => {
  // Step 1: Parse BPMN File (assuming BPMN data is sent as a string in the 'bpmnData' field of the request body)
  const bpmnFileBuffer = req.file.buffer.toString(); // This will give you the BPMN file content as a string
  const activityCount = await countActivities(bpmnFileBuffer);
  res.send({ activityCount });
};

async function countActivities(bpmnData: string): Promise<number> {
  const moddle = new bpmnModdle();

  const parsedBpmn = await moddle.fromXML(bpmnData);

  let activityCount = 0;

  // Assuming all activities are modeled as BPMN tasks
  const rootElement = parsedBpmn.rootElement;
  if (rootElement.$type === "bpmn:Definitions") {
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    for (const process of processes) {
      const tasks = process.flowElements.filter(
        (element: any) => element.$type === "bpmn:Task"
      );
      activityCount += tasks.length;
    }
  } else if (rootElement.$type === "bpmn:Process") {
    const tasks = rootElement.flowElements.filter(
      (element: any) => element.$type === "bpmn:Task"
    );
    activityCount += tasks.length;
  }

  console.log("Activity Count:", activityCount);
  return activityCount;
}
