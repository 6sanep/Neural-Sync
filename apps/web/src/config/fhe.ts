import type { FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import { getAddress } from "viem";

// Default Sepolia configuration (matches SDK's SepoliaConfig)
const defaultSepoliaConfig = {
  aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
  kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
  verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
  verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
  chainId: 11155111,
  gatewayChainId: 10901,
  network: 'https://ethereum-sepolia-rpc.publicnode.com',
  relayerUrl: 'https://relayer.testnet.zama.org',
};

const fallbackString = (value: string | undefined, defaultValue: string) => {
  return value && value.trim().length > 0 ? value.trim() : defaultValue;
};

const fallbackNumber = (value: string | undefined, defaultValue: number) => {
  return Number(value ?? defaultValue);
};

const normalizeAddress = (value: string) => getAddress(value as `0x${string}`);

const resolvedChainId = fallbackNumber(process.env.NEXT_PUBLIC_CHAIN_ID, defaultSepoliaConfig.chainId);
const resolvedGatewayChainId = fallbackNumber(
  process.env.NEXT_PUBLIC_GATEWAY_CHAIN_ID,
  defaultSepoliaConfig.gatewayChainId,
);
const resolvedNetwork = fallbackString(
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  defaultSepoliaConfig.network,
);
const resolvedRelayer = fallbackString(
  process.env.NEXT_PUBLIC_FHE_RELAYER_URL,
  defaultSepoliaConfig.relayerUrl,
);

const resolvedInstanceConfig: FhevmInstanceConfig = {
  chainId: resolvedChainId,
  gatewayChainId: resolvedGatewayChainId,
  network: resolvedNetwork,
  relayerUrl: resolvedRelayer,
  kmsContractAddress: normalizeAddress(
    fallbackString(process.env.NEXT_PUBLIC_FHE_KMS_ADDRESS, defaultSepoliaConfig.kmsContractAddress),
  ),
  aclContractAddress: normalizeAddress(
    fallbackString(process.env.NEXT_PUBLIC_FHE_ACL_ADDRESS, defaultSepoliaConfig.aclContractAddress),
  ),
  inputVerifierContractAddress: normalizeAddress(
    fallbackString(
      process.env.NEXT_PUBLIC_FHE_INPUT_VERIFIER_ADDRESS,
      defaultSepoliaConfig.inputVerifierContractAddress,
    ),
  ),
  verifyingContractAddressDecryption: normalizeAddress(
    fallbackString(
      process.env.NEXT_PUBLIC_FHE_DECRYPTION_CONTRACT,
      defaultSepoliaConfig.verifyingContractAddressDecryption,
    ),
  ),
  verifyingContractAddressInputVerification: normalizeAddress(
    fallbackString(
      process.env.NEXT_PUBLIC_FHE_INPUT_VERIFICATION_CONTRACT,
      defaultSepoliaConfig.verifyingContractAddressInputVerification,
    ),
  ),
};

export const neuralFheConfig = {
  chainId: resolvedChainId,
  gatewayChainId: resolvedGatewayChainId,
  rpcUrl: resolvedNetwork,
  relayerUrl: resolvedRelayer,
  kmsContract: resolvedInstanceConfig.kmsContractAddress,
  aclContract: resolvedInstanceConfig.aclContractAddress,
  inputVerifierContract: resolvedInstanceConfig.inputVerifierContractAddress,
  verifyingContractDecryption: resolvedInstanceConfig.verifyingContractAddressDecryption,
  verifyingContractInput: resolvedInstanceConfig.verifyingContractAddressInputVerification,
  instanceConfig: resolvedInstanceConfig,
};

if (typeof window !== "undefined") {
  console.log("📋 FHEVM Config loaded (zero-config baseline):", {
    chainId: resolvedChainId,
    gatewayChainId: resolvedGatewayChainId,
    rpcUrl: resolvedNetwork,
    relayerUrl: resolvedRelayer,
    hasCustomRPC: !!process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    hasCustomRelayer: !!process.env.NEXT_PUBLIC_FHE_RELAYER_URL,
  });
}
