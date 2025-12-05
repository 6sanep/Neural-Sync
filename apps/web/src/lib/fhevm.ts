import type { Hex, WalletClient } from "viem";
import { bytesToHex, getAddress } from "viem";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/web";
import { neuralFheConfig } from "@/config/fhe";

let fheInstancePromise: Promise<FhevmInstance> | null = null;
const RETRYABLE_RELAY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_RELAYER_RETRIES = 4;
const RELAYER_RETRY_DELAY_MS = 2000;
const DEFAULT_DECRYPT_DURATION_DAYS = 365;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeHandle = (handle: Hex | string) => {
  const value = handle.toString();
  const prefixed = value.startsWith("0x") ? value : `0x${value}`;
  return prefixed.toLowerCase() as Hex;
};

const parseDecryptedValue = (value: unknown) => {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (typeof value === "string") {
    return Number(BigInt(value));
  }
  throw new Error("Unsupported decrypted value type");
};

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("FHEVM is only available in the browser");
  }
}

async function buildInstance() {
  assertBrowser();

  if (!fheInstancePromise) {
    fheInstancePromise = (async () => {
      const { createInstance, initSDK } = await import("@zama-fhe/relayer-sdk/web");
      
      try {
        await initSDK();
      } catch {
        // SDK may already be initialized
      }
      
      return await createInstance(neuralFheConfig.instanceConfig);
    })().catch((error) => {
      fheInstancePromise = null;
      throw error;
    });
  }

  return fheInstancePromise;
}

export async function checkFhevmReady() {
  const instance = await buildInstance();
  const key = instance.getPublicKey();
  
  if (!key) {
    throw new Error("Public key unavailable");
  }
  
  return true;
}

export async function checkRelayerReady() {
  assertBrowser();
  const url = neuralFheConfig.relayerUrl;
  if (!url) {
    throw new Error("Relayer URL missing");
  }
  
  try {
    await fetch(url, { method: "GET", cache: "no-store", mode: "no-cors" });
    return true;
  } catch {
    return true;
  }
}

export async function encryptChoice(choice: 0 | 1, contractAddress: `0x${string}`, caller: `0x${string}`) {
  const instance = await buildInstance();
  const input = instance.createEncryptedInput(contractAddress, caller);
  input.add32(choice);
  const encrypted = await input.encrypt();

  return {
    handle: bytesToHex(encrypted.handles[0]),
    inputProof: bytesToHex(encrypted.inputProof),
  };
}

async function decryptHandlesInternal(
  ciphertexts: Hex[],
  contractAddress: `0x${string}`,
  account: `0x${string}`,
  walletClient: WalletClient,
) {
  const instance = await buildInstance();
  const handles = ciphertexts.map((handle) => ({ handle, contractAddress }));
  const decryptArgs = await prepareUserDecryptArguments(instance, handles, walletClient, account);

  const results = await withRelayerRetry(async () => {
    return await instance.userDecrypt(
      handles,
      decryptArgs.keypair.privateKey,
      decryptArgs.keypair.publicKey,
      decryptArgs.signature,
      decryptArgs.contractAddresses,
      account,
      decryptArgs.startTimestamp,
      decryptArgs.durationDays,
    );
  });

  return ciphertexts.map((handle) => {
    const normalized = normalizeHandle(handle);
    const decryptedValue = results[normalized];
    if (decryptedValue === undefined) {
      throw new Error("Decryption result missing");
    }
    return parseDecryptedValue(decryptedValue);
  });
}

const extractStatusCode = (error: unknown): number | undefined => {
  if (error && typeof error === "object") {
    const maybeStatus = (error as { status?: unknown }).status;
    if (typeof maybeStatus === "number") {
      return maybeStatus;
    }
    const cause = (error as { cause?: unknown }).cause;
    if (cause && typeof cause === "object" && "status" in (cause as Record<string, unknown>)) {
      const causeStatus = (cause as { status?: unknown }).status;
      if (typeof causeStatus === "number") {
        return causeStatus;
      }
    }
  }
  return undefined;
};

const shouldRetryRelayer = (error: unknown) => {
  const status = extractStatusCode(error);
  if (status && RETRYABLE_RELAY_STATUSES.has(status)) {
    return true;
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("relayer respond") || message.includes("fetch") || message.includes("network");
};

async function withRelayerRetry<T>(operation: () => Promise<T>) {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < MAX_RELAYER_RETRIES) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (!shouldRetryRelayer(error) || attempt >= MAX_RELAYER_RETRIES) {
        throw error;
      }
      await sleep(RELAYER_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
}

export async function decryptHandles(
  ciphertexts: Hex[],
  contractAddress: `0x${string}`,
  account: `0x${string}`,
  walletClient: WalletClient,
) {
  return decryptHandlesInternal(ciphertexts, contractAddress, account, walletClient);
}

export async function decryptHandle(
  ciphertext: Hex,
  contractAddress: `0x${string}`,
  account: `0x${string}`,
  walletClient: WalletClient,
) {
  const [value] = await decryptHandles([ciphertext], contractAddress, account, walletClient);
  return value;
}

type DecryptPreparation = {
  keypair: { publicKey: string; privateKey: string };
  contractAddresses: string[];
  signature: `0x${string}`;
  startTimestamp: number;
  durationDays: number;
};

async function prepareUserDecryptArguments(
  instance: FhevmInstance,
  handles: { handle: Hex; contractAddress: `0x${string}` }[],
  walletClient: WalletClient,
  account: `0x${string}`,
): Promise<DecryptPreparation> {
  const keypair = instance.generateKeypair();
  const startTimestamp = Math.floor(Date.now() / 1000);
  const durationDays = DEFAULT_DECRYPT_DURATION_DAYS;
  const contractAddresses = buildDeterministicContractAddressesList(handles.map((pair) => pair.contractAddress));

  const typedData = instance.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
  );

  const typedDataTypes = typedData.types as Record<string, { name: string; type: string }[]>;

  const signature = await walletClient.signTypedData({
    account,
    domain: {
      ...typedData.domain,
      verifyingContract: typedData.domain.verifyingContract as `0x${string}`,
    },
    primaryType: typedData.primaryType as "UserDecryptRequestVerification",
    types: {
      UserDecryptRequestVerification: typedDataTypes.UserDecryptRequestVerification,
    },
    message: typedData.message as Record<string, unknown>,
  });

  return {
    keypair,
    contractAddresses,
    signature,
    startTimestamp,
    durationDays,
  };
}

function buildDeterministicContractAddressesList(contractAddresses: `0x${string}`[]) {
  const unique = new Set<string>();
  for (const addr of contractAddresses) {
    unique.add(getAddress(addr));
  }
  return [...unique].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}
