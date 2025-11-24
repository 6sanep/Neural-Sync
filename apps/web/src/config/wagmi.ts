import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const rpcUrl =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://eth-sepolia.g.alchemy.com/v2/placeholder";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    // Single injected connector – lets the browser decide which extension (MetaMask / OKX / etc.)
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "Neural Sync",
        description: "FHE-powered reality synchronization game",
        url: typeof window !== "undefined" ? window.location.origin : "https://neural-sync.app",
        icons: [],
      },
    }),
    coinbaseWallet({
      appName: "Neural Sync",
      appLogoUrl: "",
    }),
  ],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
});
