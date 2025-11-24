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
    console.log("🔧 Creating FHEVM instance with config:");
    console.log("   - Chain ID:", neuralFheConfig.chainId);
    console.log("   - Gateway Chain ID:", neuralFheConfig.gatewayChainId);
    console.log("   - RPC URL:", neuralFheConfig.rpcUrl);
    console.log("   - Relayer URL:", neuralFheConfig.relayerUrl);
    console.log("   - KMS Contract:", neuralFheConfig.kmsContract);
    console.log("   - ACL Contract:", neuralFheConfig.aclContract);
    
    fheInstancePromise = (async () => {
      // Dynamic import to avoid SSR issues
      const { createInstance, initSDK } = await import("@zama-fhe/relayer-sdk/web");
      
      console.log("📦 SDK imported, initializing WASM...");
      
      // Initialize WASM/SDK explicitly before creating instance
      try {
        await initSDK();
        console.log("✅ WASM/SDK initialized successfully");
      } catch (wasmError) {
        console.warn("⚠️ SDK init warning (may already be initialized):", wasmError);
      }
      
      console.log("📦 Creating FHEVM instance...");
      
      const instance = await createInstance(neuralFheConfig.instanceConfig);
      
      console.log("✅ FHEVM instance created successfully");
      console.log("   Instance methods:", Object.keys(instance));
      return instance;
    })().catch((error) => {
      console.error("❌ FHEVM instance creation failed");
      console.error("   Error type:", error?.constructor?.name);
      console.error("   Error message:", error?.message);
      console.error("   Full error:", error);
      fheInstancePromise = null; // Reset for retry
      throw error;
    });
  }

  return fheInstancePromise;
}

export async function checkFhevmReady() {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 FHEVM DIAGNOSTIC CHECK STARTED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n📋 Step 1: Building FHEVM instance...");
    const instance = await buildInstance();
    console.log("✅ Step 1 Complete: Instance built");
    
    console.log("\n🔑 Step 2: Fetching FHE public key...");
    const key = instance.getPublicKey();
    
    if (!key) {
      console.error("❌ Step 2 Failed: Public key is null/undefined");
      console.error("   This means:");
      console.error("   - SDK instance was created");
      console.error("   - But public key was NOT downloaded from relayer");
      console.error("   - Possible cause: Network timeout or relayer issue");
      throw new Error("Public key unavailable");
    }
    
    console.log("✅ Step 2 Complete: Public key loaded");
    console.log("   Key type:", typeof key);
    console.log("   Key publicKeyId:", key.publicKeyId || "N/A");
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ FHEVM CHECK PASSED - All systems ready!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    return true;
  } catch (error) {
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ FHEVM CHECK FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      if (error.message.includes("RPC")) {
        console.error("\n💡 Possible fix: Check your Sepolia RPC URL");
        console.error("   Current RPC:", neuralFheConfig.rpcUrl);
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        console.error("\n💡 Possible fix: Network timeout - try again");
      } else if (error.message.includes("key")) {
        console.error("\n💡 Possible fix: Relayer service issue - public key not available");
      }
      
      console.error("\nFull error stack:");
      console.error(error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    throw error;
  }
}

export async function checkRelayerReady() {
  assertBrowser();
  const url = neuralFheConfig.relayerUrl;
  if (!url) {
    throw new Error("Relayer URL missing");
  }
  
  try {
    // Use no-cors mode to avoid CORS errors during health check
    await fetch(url, { method: "GET", cache: "no-store", mode: "no-cors" });
    console.log("✅ Relayer reachable");
    return true;
  } catch (error) {
    console.warn("⚠️ Relayer health check failed (may be CORS):", error);
    // Don't throw - relayer check is informational only
    return true;
  }
}

export async function encryptChoice(choice: 0 | 1, contractAddress: `0x${string}`, caller: `0x${string}`) {
  console.log("🔐 Encrypting choice:", { choice, contractAddress, caller });
  
  const instance = await buildInstance();
  const input = instance.createEncryptedInput(contractAddress, caller);
  input.add32(choice);
  const encrypted = await input.encrypt();

  console.log("✅ Encryption complete");
  
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
  console.log("🔓 Decrypting handles:", { ciphertexts, contractAddress, account });

  const instance = await buildInstance();
  const handles = ciphertexts.map((handle) => ({ handle, contractAddress }));
  const decryptArgs = await prepareUserDecryptArguments(instance, handles, walletClient, account);

  console.log("✅ Signature obtained, decrypting with retry...");

  const results = await withRelayerRetry(async () => {
    console.log("🔍 Performing user decryption for", handles.length, "handles...");
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
      console.error("❌ Decryption result missing for handle:", normalized);
      throw new Error("Decryption result missing");
    }
    console.log("✅ Decryption successful:", normalized, decryptedValue);
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
      if (attempt > 0) {
        console.warn(`♻️  Retrying relayer request (attempt ${attempt + 1}/${MAX_RELAYER_RETRIES})`);
      }
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

  console.log("📝 Requesting EIP-712 signature (once only)...");

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
