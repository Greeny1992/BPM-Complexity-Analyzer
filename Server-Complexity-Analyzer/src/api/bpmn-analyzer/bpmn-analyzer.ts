const taskTypes: string[] = [
  "bpmn:Task",
  "bpmn:UserTask",
  "bpmn:BusinessRuleTask",
  "bpmn:ServiceTask",
  "bpmn:SendTask",
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
  const openingParallelGateways = countParallelGateways(parsedBpmn);
  const outgoingPathsExclusiveGateways =
    countOutgoingWaysOfExclusiveGateways(parsedBpmn);
  const twoPowOutgoingPathsMinusOneInclusiveGateways =
    countOutgoingWaysOfInclusiveGateways(parsedBpmn);
  return (
    openingParallelGateways +
    outgoingPathsExclusiveGateways +
    twoPowOutgoingPathsMinusOneInclusiveGateways
  );
}

export function countParallelGateways(parsedBpmn: any): number {
  let parallelGateways: [string, number][] = [];
  // Assuming all activities are modeled as BPMN tasks
  const references = parsedBpmn.references;
  for (let refI = 0; refI < references.length; refI++) {
    const ref = references[refI];
    if (ref.element.$type === "bpmn:ParallelGateway") {
      if (parallelGateways.filter((x) => x[0] === ref.element.id).length > 0) {
        if (ref.property === "bpmn:outgoing") {
          parallelGateways.filter((x) => x[0] === ref.element.id)[0][1]++;
        }
      } else {
        if (ref.property === "bpmn:outgoing")
          parallelGateways.push([ref.element.id, 1]);
      }
    }
  }

  const openingParallelGateways = parallelGateways.filter(
    (x) => x[1] > 1
  ).length;

  console.log("Opening Parallel Gateways:", openingParallelGateways);
  return openingParallelGateways;
}

export function countOutgoingWaysOfExclusiveGateways(parsedBpmn: any): number {
  let exclusiveGateways: [string, number][] = [];
  // Assuming all activities are modeled as BPMN tasks
  const references = parsedBpmn.references;
  for (let refI = 0; refI < references.length; refI++) {
    const ref = references[refI];
    if (ref.element.$type === "bpmn:ExclusiveGateway") {
      if (exclusiveGateways.filter((x) => x[0] === ref.element.id).length > 0) {
        if (ref.property === "bpmn:outgoing") {
          exclusiveGateways.filter((x) => x[0] === ref.element.id)[0][1]++;
        }
      } else {
        if (ref.property === "bpmn:outgoing")
          exclusiveGateways.push([ref.element.id, 1]);
      }
    }
  }

  const openingExclusivGateways = exclusiveGateways.filter((x) => x[1] > 1);
  const outgoingPathsExclusiveGateways = openingExclusivGateways.reduce(
    (prev, curr) => prev + curr[1],
    0
  );
  console.log(
    "Outgoing paths exclusive Gateways:",
    outgoingPathsExclusiveGateways
  );
  return outgoingPathsExclusiveGateways;
}

export function countOutgoingWaysOfInclusiveGateways(parsedBpmn: any): number {
  let inclusiveGateways: [string, number][] = [];
  // Assuming all activities are modeled as BPMN tasks
  const references = parsedBpmn.references;
  for (let refI = 0; refI < references.length; refI++) {
    const ref = references[refI];
    if (ref.element.$type === "bpmn:InclusiveGateway") {
      if (inclusiveGateways.filter((x) => x[0] === ref.element.id).length > 0) {
        if (ref.property === "bpmn:outgoing") {
          inclusiveGateways.filter((x) => x[0] === ref.element.id)[0][1]++;
        }
      } else {
        if (ref.property === "bpmn:outgoing")
          inclusiveGateways.push([ref.element.id, 1]);
      }
    }
  }

  const openingInclusiveGateways = inclusiveGateways.filter((x) => x[1] > 1);
  const outgoingPathsInclusiveGateways = openingInclusiveGateways.reduce(
    (prev, curr) => prev + (Math.pow(2, curr[1]) - 1),
    0
  );
  console.log("2^n - 1 inclusive Gateways:", outgoingPathsInclusiveGateways);
  return outgoingPathsInclusiveGateways;
}

export function calculateKognitiveWeight(parsedBpmn: any): number {
  const xorWeight = countXORWeiht(parsedBpmn);
  return xorWeight;
}

export function countXORWeiht(parsedBpmn: any): number {
  let exclusiveGateways: [string, number][] = [];
  // Assuming all activities are modeled as BPMN tasks
  const references = parsedBpmn.references;
  for (let refI = 0; refI < references.length; refI++) {
    const ref = references[refI];
    if (ref.element.$type === "bpmn:ExclusiveGateway") {
      if (exclusiveGateways.filter((x) => x[0] === ref.element.id).length > 0) {
        if (ref.property === "bpmn:outgoing") {
          exclusiveGateways.filter((x) => x[0] === ref.element.id)[0][1]++;
        }
      } else {
        if (ref.property === "bpmn:outgoing")
          exclusiveGateways.push([ref.element.id, 1]);
      }
    }
  }

  const openingExclusivGateways = exclusiveGateways.filter((x) => x[1] > 1);
  const weightOutgoingPathsExclusiveGateways = openingExclusivGateways.reduce(
    (prev, curr) => prev + (curr[1] === 2 ? 2 : 3),
    0
  );
  console.log(
    "Weight outgoing paths exclusive Gateways:",
    weightOutgoingPathsExclusiveGateways
  );
  return weightOutgoingPathsExclusiveGateways;
}
