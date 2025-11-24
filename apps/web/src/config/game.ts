export const gameConfig = {
  contractAddress: process.env.NEXT_PUBLIC_GAME_ADDRESS as `0x${string}` | undefined,
  explorerBase: process.env.NEXT_PUBLIC_EXPLORER_BASE ?? "https://sepolia.etherscan.io/address",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",
};

export const contractLink = gameConfig.contractAddress
  ? `${gameConfig.explorerBase}/${gameConfig.contractAddress}`
  : undefined;

