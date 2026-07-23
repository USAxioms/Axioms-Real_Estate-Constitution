// Contamination Scrubber
// All inbound values must be WAD‑bounded, numeric‑safe, and constitutionally clean.

import { WAD, wadClamp } from "../wad/wadMath";

export class ContaminationScrubber {
  static scrubBigint(v: bigint): bigint {
    if (v < 0n) return 0n;
    if (v > WAD * 1000n) return WAD * 1000n;
    return v;
  }

  static scrubArray(arr: bigint[]): bigint[] {
    const out: bigint[] = [];
    for (const v of arr) {
      out.push(ContaminationScrubber.scrubBigint(v));
    }
    return out;
  }

  static scrubString(s: string): string {
    return s.trim().slice(0, 256); // bounded reference length
  }

  static scrubInput(input: {
    transactionType: number;
    propertyRef: string;
    censusTract: string;
    appraisalParams: bigint[];
    hmdaParams: bigint[];
    respaParams: bigint[];
    redliningParams: bigint[];
    fairLendingParams: bigint[];
    titleParams: bigint[];
    displacementParams: bigint[];
  }) {
    return {
      transactionType: input.transactionType,
      propertyRef: ContaminationScrubber.scrubString(input.propertyRef),
      censusTract: ContaminationScrubber.scrubString(input.censusTract),

      appraisalParams: ContaminationScrubber.scrubArray(input.appraisalParams),
      hmdaParams: ContaminationScrubber.scrubArray(input.hmdaParams),
      respaParams: ContaminationScrubber.scrubArray(input.respaParams),
      redliningParams: ContaminationScrubber.scrubArray(input.redliningParams),
      fairLendingParams: ContaminationScrubber.scrubArray(input.fairLendingParams),
      titleParams: ContaminationScrubber.scrubArray(input.titleParams),
      displacementParams: ContaminationScrubber.scrubArray(input.displacementParams)
    };
  }
}
