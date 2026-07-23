// Backend Entry → wires WADBridge + Scrubber + ABEClient + Pipeline
// Deterministic, bounded, constitutional.

import { WADBridge } from "./wadBridge";
import { ContaminationScrubber } from "./contaminationScrubber";
import { ABEClient } from "./abeClient";
import { EvaluationPipeline } from "./evaluationPipeline";

export class RealEstateABEBackend {
  private abe: ABEClient;

  constructor(contractInstance: any) {
    this.abe = new ABEClient(contractInstance);
  }

  async registerChild(childAddress: string) {
    return await this.abe.registerChild(childAddress);
  }

  async evaluate(raw: {
    transactionType: number;
    propertyRef: string;
    censusTract: string;
    appraisal: bigint[];
    hmda: bigint[];
    respa: bigint[];
    redlining: bigint[];
    fairLending: bigint[];
    title: bigint[];
    displacement: bigint[];
  }) {
    const encoded = WADBridge.encode(
      {
        appraisal: raw.appraisal,
        hmda: raw.hmda,
        respa: raw.respa,
        redlining: raw.redlining,
        fairLending: raw.fairLending,
        title: raw.title,
        displacement: raw.displacement
      },
      {
        transactionType: raw.transactionType,
        propertyRef: raw.propertyRef,
        censusTract: raw.censusTract
      }
    );

    const clean = ContaminationScrubber.scrubInput(encoded);
    const result = await this.abe.fileAndEvaluate(clean);

    return result;
  }

  async pipeline(childrenResults: {
    score: bigint;
    valid: boolean;
    hv: boolean;
  }[], weights: number[]) {
    return EvaluationPipeline.evaluateChildren(childrenResults, weights);
  }
}
