// Evaluation Pipeline → deterministic scoring + verdict assembly
// All arithmetic is WAD‑scaled, bounded, and constitutionally safe.

import {
  computeCompositeScore,
  applyHardViolationBounds,
  computeVerdict,
  WAD
} from "../wad/wadMath";

export interface ChildResult {
  score: bigint;
  valid: boolean;
  hv: boolean;
}

export class EvaluationPipeline {
  static evaluateChildren(results: ChildResult[], weights: number[]) {
    const scores: bigint[] = [];
    let hvCount = 0;

    for (const r of results) {
      const s = r.score < 0n ? 0n : r.score > WAD ? WAD : r.score;
      scores.push(s);
      if (r.hv) hvCount++;
    }

    let composite = computeCompositeScore(scores, weights);
    composite = applyHardViolationBounds(composite, hvCount);

    const verdict = computeVerdict(composite);

    return {
      composite,
      verdict,
      hvCount
    };
  }
}
