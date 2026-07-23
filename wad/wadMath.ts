// WAD math for RealEstateABE
// Weak Arithmetic Decidability: all arithmetic is deterministic, bounded, and contamination‑free.

export const WAD: bigint = 10n ** 18n;

// Basic ops

export function wadAdd(a: bigint, b: bigint): bigint {
  return a + b;
}

export function wadSub(a: bigint, b: bigint): bigint {
  return a >= b ? a - b : 0n; // subSat
}

export function wadMul(a: bigint, b: bigint): bigint {
  // raw multiply, caller responsible for scaling
  return a * b;
}

export function wadDiv(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error("div/0");
  return a / b;
}

// WAD‑scaled mulDiv: (a * b) / d with WAD normalization
export function wadMulDiv(a: bigint, b: bigint, d: bigint): bigint {
  if (d === 0n) throw new Error("div/0");
  return (a * b) / d;
}

// WAD‑scaled multiply: (a * b) / WAD
export function wadMulWad(a: bigint, b: bigint): bigint {
  return (a * b) / WAD;
}

// WAD‑scaled divide: (a * WAD) / b
export function wadDivWad(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error("div/0");
  return (a * WAD) / b;
}

// Clamp helpers

export function wadMin(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function wadMax(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

export function wadClamp(a: bigint, lo: bigint, hi: bigint): bigint {
  if (a < lo) return lo;
  if (a > hi) return hi;
  return a;
}

// Composite score helpers (mirroring Solidity logic)

export function computeCompositeScore(
  scores: bigint[],
  weights: number[]
): bigint {
  if (scores.length !== weights.length) {
    throw new Error("length mismatch");
  }

  let total: bigint = 0n;
  let weightSum = 0;

  for (let i = 0; i < scores.length; i++) {
    const w = BigInt(weights[i]);
    total += scores[i] * w;
    weightSum += weights[i];
  }

  if (weightSum === 0) throw new Error("weightSum/0");

  return total / BigInt(weightSum); // WAD‑scaled scores assumed
}

// Hard violation bounding (2e17, 4e17)

export const HV_BOUND_DOUBLE: bigint = 2n * (10n ** 17n); // 0.2 WAD
export const HV_BOUND_SINGLE: bigint = 4n * (10n ** 17n); // 0.4 WAD

export function applyHardViolationBounds(
  compositeScore: bigint,
  hvCount: number
): bigint {
  if (hvCount >= 2) {
    return wadMin(compositeScore, HV_BOUND_DOUBLE);
  } else if (hvCount === 1) {
    return wadMin(compositeScore, HV_BOUND_SINGLE);
  }
  return compositeScore;
}

// Verdict thresholds (0, 1, 2, 3)

export const VERDICT_3: bigint = 85n * (10n ** 16n); // 0.85 WAD
export const VERDICT_2: bigint = 60n * (10n ** 16n); // 0.60 WAD
export const VERDICT_1: bigint = 35n * (10n ** 16n); // 0.35 WAD

export function computeVerdict(score: bigint): number {
  if (score >= VERDICT_3) return 3;
  if (score >= VERDICT_2) return 2;
  if (score >= VERDICT_1) return 1;
  return 0;
}
