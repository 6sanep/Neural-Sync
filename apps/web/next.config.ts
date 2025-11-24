import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Polyfills for Node.js modules not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Server-side: externalize FHE SDK to prevent SSR issues
    if (isServer) {
      config.externals.push('@zama-fhe/relayer-sdk/web');
    }
    
    // Ignore optional wagmi connector dependencies we don't use
    // These are peer deps of @wagmi/connectors that we don't need
    config.resolve.alias = {
      ...config.resolve.alias,
      '@base-org/account': false,
      '@coinbase/wallet-sdk': false,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      'porto': false,
      'porto/internal': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      '@walletconnect/ethereum-provider': false,
    };
    
    return config;
  },
};

export default nextConfig;
