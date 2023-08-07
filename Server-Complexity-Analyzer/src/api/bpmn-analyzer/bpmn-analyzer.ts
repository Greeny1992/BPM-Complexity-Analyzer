const taskTypes: string[] = [
  "bpmn:Task",
  "bpmn:UserTask",
  "bpmn:BusinessRuleTask",
  "bpmn:ServiceTask",
  "bpmn:SendTask",
];

const gatewayTypes: string[] = [
  "bpmn:ParallelGateway",
  "bpmn:InclusiveGateway",
  "bpmn:ExclusiveGateway",
];

export function countActivities(parsedBpmn: any): number {
  let activityCount = 0;
  // Assuming all activities are modeled as BPMN tasks
  const rootElement = parsedBpmn.rootElement;
  if (rootElement.$type === "bpmn:Definitions") {
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    for (const process of processes) {
      const tasks =
        process.flowElements?.filter((element: any) => {
          console.log(element.name, element.$type);
          return taskTypes.includes(element.$type);
        }) ?? [];
      activityCount += tasks.length;
    }
  } else if (rootElement.$type === "bpmn:Process") {
    const tasks =
      rootElement.flowElements?.filter((element: any) =>
        taskTypes.includes(element.$type)
      ) ?? [];
    activityCount += tasks.length;
  }

  console.log("Activity Count:", activityCount);
  return activityCount;
}

export function calculateControllFlowComplexity(parsedBpmn: any): number {
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
  return (
    openingParallelGateways +
    outgoingPathsExclusiveGateways +
    twoPowOutgoingPathsMinusOneInclusiveGateways
  );
}

export function getOpeningGatewaysOfType(
  parsedBpmn: any,
  type: string
): [string, number][] {
  let gateways: [string, number][] = [];
  const references = parsedBpmn.references;
  for (let refI = 0; refI < references.length; refI++) {
    const ref = references[refI];
    if (ref.element.$type === type) {
      if (gateways.filter((x) => x[0] === ref.element.id).length > 0) {
        if (ref.property === "bpmn:outgoing") {
          gateways.filter((x) => x[0] === ref.element.id)[0][1]++;
        }
      } else {
        if (ref.property === "bpmn:outgoing")
          gateways.push([ref.element.id, 1]);
      }
    }
  }

  const openingGateways = gateways.filter((x) => x[1] > 1);
  return openingGateways;
}

export function countParallelGateways(
  openingParallelGateways: [string, number][]
): number {
  console.log("Opening Parallel Gateways:", openingParallelGateways.length);
  return openingParallelGateways.length;
}

export function countOutgoingWaysOfExclusiveGateways(
  openingExclusiveGateways: [string, number][]
): number {
  const outgoingPathsExclusiveGateways = openingExclusiveGateways.reduce(
    (prev, curr) => prev + curr[1],
    0
  );
  console.log(
    "Outgoing paths exclusive Gateways:",
    outgoingPathsExclusiveGateways
  );
  return outgoingPathsExclusiveGateways;
}

export function countOutgoingWaysOfInclusiveGateways(
  openingInclusiveGateways: [string, number][]
): number {
  const outgoingPathsInclusiveGateways = openingInclusiveGateways.reduce(
    (prev, curr) => prev + (Math.pow(2, curr[1]) - 1),
    0
  );
  console.log("2^n - 1 inclusive Gateways:", outgoingPathsInclusiveGateways);
  return outgoingPathsInclusiveGateways;
}

export function calculateKognitiveWeight(parsedBpmn: any): number {
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
  return xorWeight + andWeight + orWeight + subprocessWeight;
}

export function calcXORWeight(
  openingExclusiveGateways: [string, number][]
): number {
  const weightOutgoingPathsExclusiveGateways = openingExclusiveGateways.reduce(
    (prev, curr) => prev + (curr[1] === 2 ? 2 : 3),
    0
  );
  console.log(
    "Weight outgoing paths exclusive Gateways:",
    weightOutgoingPathsExclusiveGateways
  );
  return weightOutgoingPathsExclusiveGateways;
}

export function calcParallelWeight(
  openingParallelGateways: [string, number][]
): number {
  const weightParallelGateways = openingParallelGateways.length * 4;
  console.log("Weight parallel Gateways:", weightParallelGateways);
  return weightParallelGateways;
}

export function calcInclusiveWeight(
  openingInclusiveGateways: [string, number][]
): number {
  const weightInclusiveGateways = openingInclusiveGateways.length * 7;
  console.log("Weight inclusive Gateways:", weightInclusiveGateways);
  return weightInclusiveGateways;
}

export function countSubprocesses(parsedBpmn: any): number {
  let subprocessCount = 0;
  // Assuming all activities are modeled as BPMN tasks
  const rootElement = parsedBpmn.rootElement;
  if (rootElement.$type === "bpmn:Definitions") {
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    for (const process of processes) {
      const subprocesses =
        process.flowElements?.filter(
          (element: any) => element.$type === "bpmn:SubProcess"
        ) ?? [];
      subprocessCount += subprocesses.length;
    }
  } else if (rootElement.$type === "bpmn:Process") {
    const subprocesses =
      rootElement.flowElements?.filter(
        (element: any) => element.$type === "bpmn:SubProcess"
      ) ?? [];
    subprocessCount += subprocesses.length;
  }

  console.log("Subprocess Count:", subprocessCount);
  return subprocessCount;
}

export function calcSubprocessWeight(subprocessCount: number): number {
  const subprocessWeight = subprocessCount * 2;
  console.log("Subprocess Weight:", subprocessWeight);
  return subprocessWeight;
}

export function calculateFiFo(parsedBpmn: any): number {
  return Math.pow(2, countSubprocesses(parsedBpmn));
}

export function calculateHalstead(parsedBpmn: any): {} {
  const allOperators = getOperators(parsedBpmn);
  const N1 = allOperators.length;
  const n1 = new Set(allOperators).size;
  console.log("Unique operator count: ", n1);
  console.log("All operator count: ", N1);
  const processLengthN = n1 * Math.log2(n1);
  const processVolumeV = N1 * Math.log2(n1);
  const processDifficultyD = n1 / 2;
  return { processLengthN, processVolumeV, processDifficultyD };
}

export function getOperators(parsedBpmn: any): string[] {
  const elements = [];
  // Assuming all activities are modeled as BPMN tasks
  const rootElement = parsedBpmn.rootElement;
  if (rootElement.$type === "bpmn:Definitions") {
    const processes = rootElement.rootElements.filter(
      (element: any) => element.$type === "bpmn:Process"
    );

    for (const process of processes) {
      const el =
        process.flowElements?.filter((element: any) => {
          return (
            taskTypes.includes(element.$type) ||
            gatewayTypes.includes(element.$type)
          );
        }) ?? [];
      elements.push(...el);
    }
  } else if (rootElement.$type === "bpmn:Process") {
    const el =
      rootElement.flowElements?.filter((element: any) =>
        taskTypes.includes(element.$type)
      ) ?? [];
    elements.push(...el);
  }

  return elements.map((x) => x.$type);
}
