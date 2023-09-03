import { Engine } from "bpmn-engine";
import BPMNModdle from "bpmn-moddle";
import * as elements from "bpmn-elements";
import Serializer, { TypeResolver } from "moddle-context-serializer";

// Define the types of BPMN elements to be considered as tasks
const taskTypes: string[] = [
  "bpmn:Task",
  "bpmn:UserTask",
  "bpmn:BusinessRuleTask",
  "bpmn:ServiceTask",
  "bpmn:SendTask",
];

// Define the types of BPMN gateways to be considered
const gatewayTypes: string[] = [
  "bpmn:ParallelGateway",
  "bpmn:InclusiveGateway",
  "bpmn:ExclusiveGateway",
];

const eventTypes: string[] = ["bpmn:StartEvent", "bpmn:EndEvent"];

const dataTypes: string[] = [
  "bpmn:DataObjectReference",
  "bpmn:DataStoreReference",
];

const operators: string[] = [
  ...taskTypes,
  ...gatewayTypes,
  ...eventTypes,
  "bpmn:SubProcess",
];
const operands: string[] = [...dataTypes];
export interface WeightsDataI {
  sequences: number;
  xor2: number;
  xorGT2: number;
  and: number;
  or: number;
  subprocess: number;
  multipleInstance: number;
}

export interface AnalyzedDataI {
  elementCount: number;
  cfc: number;
  cop: number;
  ccm: number;
  fifo: number;
  hal: HalsteadDataI;
}

export interface HalsteadDataI {
  processLengthN: number;
  processVolumeV: number;
  processDifficultyD: number;
}

let cognitiveWeights: WeightsDataI = {
  sequences: 1,
  xor2: 2,
  xorGT2: 3,
  and: 4,
  or: 7,
  subprocess: 2,
  multipleInstance: 6,
};

const calculatedBPMNs: {
  bpmnName: string;
  calculatedData: AnalyzedDataI;
  cognitiveWeights: WeightsDataI;
}[] = [];

export function addNewCalculatedBPMN(
  calculatedData: AnalyzedDataI,
  bpmnName: string
): void {
  calculatedBPMNs.push({ bpmnName, calculatedData, cognitiveWeights });
}

export function updateWeights(newWeights: WeightsDataI): void {
  cognitiveWeights = newWeights;
}

export function resetCalculatedBPMNS() {
  calculatedBPMNs.length = 0;
}

export function getCalculatedBPMNs(): {
  bpmnName: string;
  calculatedData: AnalyzedDataI;
  cognitiveWeights: WeightsDataI;
}[] {
  return calculatedBPMNs;
}

// Function to count various BPMN elements within a parsed BPMN object
export function countElements(parsedBpmn: any): number {
  // Initialize the count of elements
  let elementCount = 0;

  // Assuming all activities are modeled as BPMN tasks
  const rootElement = parsedBpmn.rootElement;

  // Check if the root element is of type 'bpmn:Definitions'
  if (rootElement.$type === "bpmn:Definitions") {
    // Retrieve the processes from the root elements
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    // Iterate through each process to count elements without flows
    for (const process of processes) {
      // Filter out elements that are not 'bpmn:SequenceFlow'
      const elementsWithoutFlows =
        process.flowElements?.filter((element: any) => {
          if (
            element.$type !== "bpmn:SequenceFlow" &&
            element.$type !== "bpmn:DataObjectReference"
          ) {
            return true;
          } else {
            if (element.conditionExpression) {
              return true;
            } else {
              return false;
            }
          }
        }) ?? [];
      // Increment the count with the number of elements without flows
      elementCount += elementsWithoutFlows.length;
    }
  }
  // If the root element is of type 'bpmn:Process'
  else if (rootElement.$type === "bpmn:Process") {
    // Filter tasks from flow elements based on task types
    const tasks =
      rootElement.flowElements?.filter((element: any) =>
        taskTypes.includes(element.$type)
      ) ?? [];
    // Increment the count with the number of identified tasks
    elementCount += tasks.length;
  }

  // Log the total element count and return it
  console.log("Element Count:", elementCount);
  return elementCount;
}
// Function to count activities (tasks) within a parsed BPMN object
export function countActivities(parsedBpmn: any): number {
  // Initialize the activity count
  let activityCount = 0;
  const rootElement = parsedBpmn.rootElement;

  // Check if the root element is of type 'bpmn:Definitions'
  if (rootElement.$type === "bpmn:Definitions") {
    // Retrieve the processes from the root elements
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    // Iterate through each process to count tasks
    for (const process of processes) {
      // Filter tasks from flow elements based on task types
      const tasks =
        process.flowElements?.filter((element: any) => {
          return taskTypes.includes(element.$type);
        }) ?? [];
      // Increment the activity count with the number of tasks
      activityCount += tasks.length;
    }
  }
  // If the root element is of type 'bpmn:Process'
  else if (rootElement.$type === "bpmn:Process") {
    // Filter tasks from flow elements based on task types
    const tasks =
      rootElement.flowElements?.filter((element: any) =>
        taskTypes.includes(element.$type)
      ) ?? [];
    // Increment the activity count with the number of tasks
    activityCount += tasks.length;
  }

  // Log the total activity count and return it
  console.log("Activity Count:", activityCount);
  return activityCount;
}

// Function to calculate control flow complexity of a parsed BPMN object
export function calculateControllFlowComplexity(parsedBpmn: any): number {
  // Calculate the complexity components
  const openingParallelGateways = countParallelGateways(
    getOpeningGatewaysOfType(parsedBpmn, "bpmn:ParallelGateway")
  );
  const outgoingPathsExclusiveGateways = countOutgoingWaysOfExclusiveGateways(
    getOpeningGatewaysOfType(parsedBpmn, "bpmn:ExclusiveGateway")
  );
  const twoPowOutgoingPathsMinusOneInclusiveGateways =
    countOutgoingWaysOfInclusiveGateways(
      getOpeningGatewaysOfType(parsedBpmn, "bpmn:InclusiveGateway")
    );

  // Calculate and return the total control flow complexity
  return (
    openingParallelGateways +
    outgoingPathsExclusiveGateways +
    twoPowOutgoingPathsMinusOneInclusiveGateways
  );
}

// Function to get opening gateways of a specific type from parsed BPMN
export function getOpeningGatewaysOfType(
  parsedBpmn: any,
  type: string
): [string, number][] {
  let gateways: [string, number][] = [];
  const references = parsedBpmn.references;
  references.forEach(
    (ref: { element: { $type: string; id: string }; property: string }) => {
      if (ref.element.$type === type && ref.property === "bpmn:outgoing") {
        // If a gateway is already in the list, update its outgoing count
        if (gateways.filter((x) => x[0] === ref.element.id).length > 0) {
          gateways.filter((x) => x[0] === ref.element.id)[0][1]++;
        }
        // If a gateway is not in the list, add it with an outgoing count of 1
        else {
          gateways.push([ref.element.id, 1]);
        }
      }
    }
  );

  // Filter out opening gateways with more than one outgoing path
  const openingGateways = gateways.filter((x) => x[1] > 1);
  return openingGateways;
}

// Function to count opening parallel gateways
export function countParallelGateways(
  openingParallelGateways: [string, number][]
): number {
  // Log and return the count of opening parallel gateways
  console.log("Opening Parallel Gateways:", openingParallelGateways.length);
  return openingParallelGateways.length;
}
// Function to count the total number of outgoing paths of exclusive gateways
export function countOutgoingWaysOfExclusiveGateways(
  openingExclusiveGateways: [string, number][]
): number {
  // Calculate the total number of outgoing paths by summing up the second element of each tuple
  const outgoingPathsExclusiveGateways = openingExclusiveGateways.reduce(
    (prev, curr) => prev + curr[1],
    0
  );

  // Log the result and return the total outgoing paths count
  console.log(
    "Outgoing paths exclusive Gateways:",
    outgoingPathsExclusiveGateways
  );
  return outgoingPathsExclusiveGateways;
}

// Function to count the total number of outgoing paths of inclusive gateways
export function countOutgoingWaysOfInclusiveGateways(
  openingInclusiveGateways: [string, number][]
): number {
  // Calculate the total number of outgoing paths using the 2^n - 1 formula
  const outgoingPathsInclusiveGateways = openingInclusiveGateways.reduce(
    (prev, curr) => prev + (Math.pow(2, curr[1]) - 1),
    0
  );

  // Log the result and return the total outgoing paths count
  console.log("2^n - 1 inclusive Gateways:", outgoingPathsInclusiveGateways);
  return outgoingPathsInclusiveGateways;
}

// Function to calculate Cognitive weight based on gateways and subprocesses
export async function calculateCognitiveWeight(
  parsedBpmn: any,
  xmlBpmn: any
): Promise<number> {
  // Calculate weights for different gateway types and subprocesses
  const paths = (await getPaths(xmlBpmn)) ?? [];
  const sequences = getSequences(paths).length;

  const sequencesWeight = sequences * cognitiveWeights.sequences;
  const xorWeight = calcXORWeight(
    getOpeningGatewaysOfType(parsedBpmn, "bpmn:ExclusiveGateway")
  );
  const andWeight = calcParallelWeight(
    getOpeningGatewaysOfType(parsedBpmn, "bpmn:ParallelGateway")
  );
  const orWeight = calcInclusiveWeight(
    getOpeningGatewaysOfType(parsedBpmn, "bpmn:InclusiveGateway")
  );

  const subprocessWeight = calcSubprocessWeight(countSubprocesses(parsedBpmn));

  const multipleInstanceActivityWeight =
    countMultipleInstanceActivities(parsedBpmn) *
    cognitiveWeights.multipleInstance;

  // Calculate and return the total Kognitive weight
  return (
    xorWeight +
    andWeight +
    orWeight +
    subprocessWeight +
    sequencesWeight +
    multipleInstanceActivityWeight
  );
}

function getSequences(paths: any[]): any {
  const result: any[] = [];
  for (let i = 0; i < paths.length; i++) {
    const pattern: any[] = [];
    const sequence = paths[i].sequence;
    for (let j = 0; j < sequence.length; j++) {
      if (
        sequence[j].type === "bpmn:Task" &&
        (pattern.length === 0 ||
          pattern[pattern.length - 1].type === "bpmn:SequenceFlow")
      ) {
        pattern.push(sequence[j]);
      } else if (
        sequence[j].type === "bpmn:SequenceFlow" &&
        pattern.length !== 0 &&
        pattern[pattern.length - 1].type === "bpmn:Task"
      ) {
        pattern.push(sequence[j]);
      } else {
        if (pattern.length > 2) {
          result.push([...pattern]);
        }
        pattern.length = 0;
      }
    }
  }
  const mappedToID = result.map((x) => x.map((y: any) => y.id));
  const unique = filterDuplicatePatterns(mappedToID);
  console.log("Unique Sequences Count: ", unique.length);
  return unique;
}

function filterDuplicatePatterns(patterns: any[]) {
  const uniquePatterns: any[] = [];
  const seenPatterns: any = {};

  patterns.forEach((pattern) => {
    const patternStr = JSON.stringify(pattern);
    if (!seenPatterns[patternStr]) {
      seenPatterns[patternStr] = true;
      uniquePatterns.push(pattern);
    }
  });

  return uniquePatterns;
}

// Function to calculate the weight of XOR gateways based on outgoing paths
export function calcXORWeight(
  openingExclusiveGateways: [string, number][]
): number {
  // Calculate the weight of XOR gateways based on outgoing paths count
  const weightOutgoingPathsExclusiveGateways = openingExclusiveGateways.reduce(
    (prev, curr) =>
      prev + (curr[1] === 2 ? cognitiveWeights.xor2 : cognitiveWeights.xorGT2),
    0
  );

  // Log the result and return the calculated weight
  console.log(
    "Weight outgoing paths exclusive Gateways:",
    weightOutgoingPathsExclusiveGateways
  );
  return weightOutgoingPathsExclusiveGateways;
}

// Function to calculate the weight of parallel gateways based on their count
export function calcParallelWeight(
  openingParallelGateways: [string, number][]
): number {
  // Calculate the weight of parallel gateways based on their count
  const weightParallelGateways =
    openingParallelGateways.length * cognitiveWeights.and;

  // Log the result and return the calculated weight
  console.log("Weight parallel Gateways:", weightParallelGateways);
  return weightParallelGateways;
}

// Function to calculate the weight of inclusive gateways based on their count
export function calcInclusiveWeight(
  openingInclusiveGateways: [string, number][]
): number {
  // Calculate the weight of inclusive gateways based on their count
  const weightInclusiveGateways =
    openingInclusiveGateways.length * cognitiveWeights.or;

  // Log the result and return the calculated weight
  console.log("Weight inclusive Gateways:", weightInclusiveGateways);
  return weightInclusiveGateways;
}

// Function to count the number of subprocesses in the BPMN diagram
export function countSubprocesses(parsedBpmn: any): number {
  // Initialize the subprocess count
  let subprocessCount = 0;
  const rootElement = parsedBpmn.rootElement;

  // Check if the root element is of type 'bpmn:Definitions'
  if (rootElement.$type === "bpmn:Definitions") {
    // Retrieve the processes from the root elements
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    // Iterate through each process to count subprocesses
    for (const process of processes) {
      // Filter subprocesses from flow elements based on their type
      const subprocesses =
        process.flowElements?.filter(
          (element: any) => element.$type === "bpmn:SubProcess"
        ) ?? [];
      // Increment the subprocess count with the number of subprocesses
      subprocessCount += subprocesses.length;
    }
  }
  // If the root element is of type 'bpmn:Process'
  else if (rootElement.$type === "bpmn:Process") {
    // Filter subprocesses from flow elements based on their type
    const subprocesses =
      rootElement.flowElements?.filter(
        (element: any) => element.$type === "bpmn:SubProcess"
      ) ?? [];
    // Increment the subprocess count with the number of subprocesses
    subprocessCount += subprocesses.length;
  }

  // Log the total subprocess count and return it
  console.log("Subprocess Count:", subprocessCount);
  return subprocessCount;
}

// Function to calculate the weight of subprocesses based on their count
export function calcSubprocessWeight(subprocessCount: number): number {
  // Calculate the weight of subprocesses based on their count
  const subprocessWeight = subprocessCount * cognitiveWeights.subprocess;

  // Log the result and return the calculated weight
  console.log("Subprocess Weight:", subprocessWeight);
  return subprocessWeight;
}

export function countMultipleInstanceActivities(parsedBpmn: any): number {
  // Initialize the subprocess count
  let subprocessCount = 0;
  const rootElement = parsedBpmn.rootElement;

  // Check if the root element is of type 'bpmn:Definitions'
  if (rootElement.$type === "bpmn:Definitions") {
    // Retrieve the processes from the root elements
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    // Iterate through each process to count subprocesses
    for (const process of processes) {
      // Filter subprocesses from flow elements based on their type
      const subprocesses =
        process.flowElements?.filter(
          (element: any) =>
            taskTypes.includes(element.$type) &&
            element.loopCharacteristics?.$type ===
              "bpmn:MultiInstanceLoopCharacteristics"
        ) ?? [];
      // Increment the subprocess count with the number of subprocesses
      subprocessCount += subprocesses.length;
    }
  }
  // If the root element is of type 'bpmn:Process'
  else if (rootElement.$type === "bpmn:Process") {
    // Filter subprocesses from flow elements based on their type
    const subprocesses =
      rootElement.flowElements?.filter(
        (element: any) =>
          taskTypes.includes(element.$type) &&
          element.loopCharacteristics?.$type ===
            "bpmn:MultiInstanceLoopCharacteristics"
      ) ?? [];
    // Increment the subprocess count with the number of subprocesses
    subprocessCount += subprocesses.length;
  }

  // Log the total subprocess count and return it
  console.log("MultiInstanceActivity Count:", subprocessCount);
  return subprocessCount;
}

// Function to calculate the FiFo complexity based on subprocess count
export function calculateFiFo(parsedBpmn: any): number {
  // Calculate FiFo complexity using the formula 2^n
  const fifoValue = 1 + countSubprocesses(parsedBpmn);
  return Math.pow(fifoValue, 2);
}

// Function to calculate Halstead metrics based on BPMN operators
export function calculateHalstead(parsedBpmn: any): HalsteadDataI {
  // Get all BPMN operators from the parsed BPMN
  const allOperators = getOperators(parsedBpmn);
  const allOperands = getOperands(parsedBpmn);

  // Calculate N1 (total operator count) and n1 (unique operator count)
  const N1 = allOperators.length;
  const n1 = new Set(allOperators).size;

  const N2 = allOperands.length;
  const n2 = new Set(allOperands).size;

  // Log and return Halstead metrics
  console.log("Unique operator/operand count: ", n1, n2);
  console.log("All operator/operand count: ", N1, N2);
  const processLengthN = n1 * Math.log2(n1) + n2 * Math.log2(n2);
  const processVolumeV = (N1 + N2) * Math.log2(n1 + n2);

  const processDifficultyD = (n1 / 2) * (N2 / n2);
  return { processLengthN, processVolumeV, processDifficultyD };
}

// Function to get all BPMN operators from the parsed BPMN
export function getOperators(parsedBpmn: any): string[] {
  const elements = [];
  const rootElement = parsedBpmn.rootElement;

  // Check if the root element is of type 'bpmn:Definitions'
  if (rootElement.$type === "bpmn:Definitions") {
    // Retrieve the processes from the root elements
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    // Iterate through each process to get BPMN operators
    for (const process of processes) {
      // Filter BPMN operators from flow elements based on types
      const el =
        process.flowElements?.filter((element: any) =>
          operators.includes(element.$type)
        ) ?? [];
      // Append the filtered elements to the array
      elements.push(...el);
    }
  }
  // If the root element is of type 'bpmn:Process'
  else if (rootElement.$type === "bpmn:Process") {
    // Filter BPMN operators from flow elements based on types
    const el =
      rootElement.flowElements?.filter((element: any) =>
        operators.includes(element.$type)
      ) ?? [];
    // Append the filtered elements to the array
    elements.push(...el);
  }

  // Extract and return the BPMN types of the elements
  return elements.map((x) => x.$type);
}

export function getOperands(parsedBpmn: any): string[] {
  const elements = [];
  const rootElement = parsedBpmn.rootElement;

  // Check if the root element is of type 'bpmn:Definitions'
  if (rootElement.$type === "bpmn:Definitions") {
    // Retrieve the processes from the root elements
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    // Iterate through each process to get BPMN operators
    for (const process of processes) {
      // Filter BPMN operators from flow elements based on types
      const el =
        process.flowElements?.filter((element: any) =>
          operands.includes(element.$type)
        ) ?? [];
      // Append the filtered elements to the array
      elements.push(...el);
    }
  }
  // If the root element is of type 'bpmn:Process'
  else if (rootElement.$type === "bpmn:Process") {
    // Filter BPMN operators from flow elements based on types
    const el =
      rootElement.flowElements?.filter((element: any) =>
        operands.includes(element.$type)
      ) ?? [];
    // Append the filtered elements to the array
    elements.push(...el);
  }

  // Extract and return the BPMN types of the elements
  return elements.map((x) => x.$type);
}

export async function calcCountOfPaths(xmlBpmn: any): Promise<number> {
  const paths = (await getPaths(xmlBpmn)).length;
  return paths;
}

// Async function to retrieve paths using BPMN engine
export const getPaths = async (xmlBpmn: any) => {
  try {
    const moddleContext = await new BPMNModdle({
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    }).fromXML(xmlBpmn);
    const sourceContext = Serializer(moddleContext, TypeResolver(elements));
    const engine = Engine({
      sourceContext,
    });

    const [definition] = await engine.getDefinitions();
    const shakenStarts: any = definition.shake();
    const sequences = [];
    for (const key in shakenStarts) {
      sequences.push(...shakenStarts[key]);
    }
    return sequences;
  } catch (error) {
    console.log(error);
    console.warn("GetPaths Error");
    return [];
  }
};
