import { Contract } from "ethers";

export class TBAService {
  private module: Contract;
  private implementation: string;

  constructor(module: Contract, implementation: string) {
    this.module = module;
    this.implementation = implementation;
  }

  async getOrCreateAccount(
    tokenContract: string,
    tokenId: string | number,
    salt: number,
    initData: string = "0x"
  ): Promise<string> {
    const tx = await this.module.getOrCreateAccount(
      this.implementation,
      tokenContract,
      tokenId,
      salt,
      initData
    );
    await tx.wait();

    const account = await this.module.accountOf(
      this.implementation,
      tokenContract,
      tokenId,
      salt
    );

    return account;
  }
}
