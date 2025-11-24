import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { NeuralSyncGame, NeuralSyncGame__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  player: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("NeuralSyncGame")) as NeuralSyncGame__factory;
  const contract = (await factory.deploy()) as NeuralSyncGame;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("NeuralSyncGame", function () {
  let signers: Signers;
  let contract: NeuralSyncGame;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], player: ethSigners[1] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("NeuralSyncGame unit tests can only run against the FHEVM mock (hardhat network)");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("stores encrypted round data and allows player decryption", async function () {
    const encryptedChoice = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add32(1)
      .encrypt();

    const tx = await contract
      .connect(signers.player)
      .play(encryptedChoice.handles[0], encryptedChoice.inputProof);
    await tx.wait();

    const round = await contract.getLastRound(signers.player.address);
    expect(round[2]).to.be.greaterThan(0n);

    const systemChoice = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      round[0],
      contractAddress,
      signers.player,
    );
    const isSynced = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      round[1],
      contractAddress,
      signers.player,
    );

    expect([0, 1]).to.include(Number(systemChoice));
    expect([0, 1]).to.include(Number(isSynced));
  });
});

