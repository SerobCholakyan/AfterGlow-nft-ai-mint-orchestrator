import { Contract } from "ethers";

export class AITierService {
  private oracle: Contract;

  constructor(oracle: Contract) {
    this.oracle = oracle;
  }

  async getTier(address: string): Promise<number> {
    const tier = await this.oracle.tierOf(address);
    return Number(tier);
  }

  async hasTier(address: string, requiredTier: number): Promise<boolean> {
    return await this.oracle.hasTier(address, requiredTier);
  }
}
