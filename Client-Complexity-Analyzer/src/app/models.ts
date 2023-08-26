export interface AnalyzedDataI {
  elementCount: number;
  cfc: number;
  ccm: number;
  fifo: number;
  hal: {
    processLengthN: number;
    processVolumeV: number;
    processDifficultyD: number;
  };
}

export interface WeightsDataI {
  sequences: number;
  xor2: number;
  xorGT2: number;
  and: number;
  or: number;
  subprocess: number;
  multipleInstance: number;
}
