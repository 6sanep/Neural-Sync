const DEFAULT_GAME_ADDRESS = "0x786AE7f804e7CFD55e4Bab6f4a812980Bb8c705C" as const;
const DEFAULT_EXPLORER_BASE = "https://sepolia.etherscan.io/address";
const DEFAULT_GITHUB_URL = "https://github.com/6sanep/Neural-Sync";

export const gameConfig = {
  // Fallback to the known Sepolia deployment so we don't require env vars in production
  contractAddress: (process.env.NEXT_PUBLIC_GAME_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_GAME_ADDRESS,
  explorerBase: process.env.NEXT_PUBLIC_EXPLORER_BASE ?? DEFAULT_EXPLORER_BASE,
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL ?? DEFAULT_GITHUB_URL,
};

export const contractLink = gameConfig.contractAddress
  ? `${gameConfig.explorerBase}/${gameConfig.contractAddress}`
  : undefined;

