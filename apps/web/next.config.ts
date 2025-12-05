import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Required headers for WASM multi-threading in @zama-fhe/relayer-sdk
  // Using 'credentialless' for COEP to allow cross-origin requests to Zama relayer
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
  
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
    
    // Client-side: inject global polyfill for browser compatibility
    // Some dependencies (like @zama-fhe/relayer-sdk) expect Node.js 'global'
    if (!isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          global: 'globalThis',
        })
      );
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
