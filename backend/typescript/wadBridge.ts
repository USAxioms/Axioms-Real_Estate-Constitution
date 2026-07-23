// WAD Bridge → deterministic transport layer between backend + RealEstateABE
// Weak Arithmetic Decidability: all numeric transforms are WAD‑scaled + bounded.

import {
  WAD,
  wadMulWad,
  wadDivWad,
  wadClamp,
  wadMin,
  wadMax
} from "../wad/wadMath";

export interface REInputParams {
  appraisal: bigint[];
  hmda: bigint[];
  respa: bigint[];
  redlining: bigint[];
  fairLending: bigint[];
  title: bigint[];
  displacement: bigint[];
}

export interface EncodedREInput {
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
}

export class WADBridge {
  static encodeParams(params: bigint[]): bigint[] {
    const out: bigint[] = [];
    for (const p of params) {
      const v = wadClamp(p, 0n, WAD * 1000n); // bounded input
      out.push(v);
    }
    return out;
  }

  static encode(input: REInputParams, meta: {
    transactionType: number;
    propertyRef: string;
    censusTract: string;
  }): EncodedREInput {

    return {
      transactionType: meta.transactionType,
      propertyRef: meta.propertyRef,
      censusTract: meta.censusTract,

      appraisalParams: WADBridge.encodeParams(input.appraisal),
      hmdaParams: WADBridge.encodeParams(input.hmda),
      respaParams: WADBridge.encodeParams(input.respa),
      redliningParams: WADBridge.encodeParams(input.redlining),
      fairLendingParams: WADBridge.encodeParams(input.fairLending),
      titleParams: WADBridge.encodeParams(input.title),
      displacementParams: WADBridge.encodeParams(input.displacement)
    };
  }

  static normalizeScore(raw: bigint): bigint {
    return wadClamp(raw, 0n, WAD); // score ∈ [0, 1e18]
  }

  static normalizeArray(arr: bigint[]): bigint[] {
    return arr.map(v => WADBridge.normalizeScore(v));
  }

  static scaleUp(v: bigint): bigint {
    return wadMulWad(v, WAD); // v * WAD / WAD = v (placeholder for future transforms)
  }

  static scaleDown(v: bigint): bigint {
    return wadDivWad(v, WAD); // (v * WAD) / WAD = v (placeholder)
  }
}
