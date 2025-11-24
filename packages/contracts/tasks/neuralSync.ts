import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const CONTRACT_NAME = "NeuralSyncGame";

task("game:address", "Print the deployed NeuralSyncGame address").setAction(async (_args, hre) => {
  const deployment = await hre.deployments.get(CONTRACT_NAME);
  console.log(`${CONTRACT_NAME} address: ${deployment.address}`);
});

task("game:play", "Encrypts a pill selection and plays a round")
  .addParam("choice", "0 for Red pill, 1 for Blue pill")
  .addOptionalParam("address", "Optional NeuralSyncGame contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;

    const choice = parseInt(taskArguments.choice, 10);
    if (choice !== 0 && choice !== 1) {
      throw new Error("Choice must be either 0 (Red) or 1 (Blue)");
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get(CONTRACT_NAME);

    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const encryptedChoice = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add32(choice)
      .encrypt();

    const tx = await contract.connect(signer).play(encryptedChoice.handles[0], encryptedChoice.inputProof);
    console.log(`Neural Sync round submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Status: ${receipt?.status}`);
  });

task("game:last-round", "Decrypt the latest round for the first signer or specified player")
  .addOptionalParam("player", "Player address to inspect (default: first signer)")
  .addOptionalParam("address", "Optional NeuralSyncGame contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get(CONTRACT_NAME);

    const signer = (await ethers.getSigners())[0];
    const target = taskArguments.player ?? signer.address;

    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);
    const round = await contract.getLastRound(target);

    if (round[2] === 0n) {
      console.log("No round recorded for this address yet.");
      return;
    }

    const systemChoice = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      round[0],
      deployment.address,
      signer,
    );

    const matchFlag = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      round[1],
      deployment.address,
      signer,
    );

    console.log(`Round #${round[2]} for ${target}`);
    console.log(`System choice : ${systemChoice === 0 ? "Red Pill" : "Blue Pill"}`);
    console.log(`Is synced     : ${matchFlag === 1 ? "YES" : "NO"}`);
  });

