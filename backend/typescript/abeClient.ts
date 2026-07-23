// ABE Client → deterministic interface to RealEstateABE
// All calls are bounded, WAD‑safe, and constitutionally clean.

import { ContaminationScrubber } from "./contaminationScrubber";
import { EncodedREInput } from "./wadBridge";

export class ABEClient {
  private contract: any;

  constructor(contractInstance: any) {
    this.contract = contractInstance;
  }

  async fileAndEvaluate(rawInput: EncodedREInput) {
    const clean = ContaminationScrubber.scrubInput(rawInput);

    const tx = await this.contract.fileAndEvaluate(clean);
    const receipt = await tx.wait();

    return {
      txId: receipt.events?.find(e => e.event === "TransactionFiled")?.args?.txId,
      verdict: receipt.events?.find(e => e.event === "REDecision")?.args?.verdict,
      score: receipt.events?.find(e => e.event === "REDecision")?.args?.score
    };
  }

  async registerChild(childAddress: string) {
    const tx = await this.contract.registerChild(childAddress);
    const receipt = await tx.wait();

    return {
      idx: receipt.events?.find(e => e.event === "ChildRegistered")?.args?.idx,
      child: receipt.events?.find(e => e.event === "ChildRegistered")?.args?.child,
      verified: receipt.events?.find(e => e.event === "ChildRegistered")?.args?.verified
    };
  }

  async getUserTransactions(user: string): Promise<bigint[]> {
    return await this.contract.userTransactions(user);
  }

  async totalTransactions(): Promise<bigint> {
    return await this.contract.totalTransactions();
  }

  async hardViolationCount(): Promise<bigint> {
    return await this.contract.hardViolationCount();
  }
}
