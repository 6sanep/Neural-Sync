import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Add global polyfill for @zama-fhe/relayer-sdk (client-side only)
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'global': 'globalThis',
        })
      );
    }
    
    // Externalize @zama-fhe/relayer-sdk on server-side to prevent SSR issues
    if (isServer) {
      config.externals.push({
        '@zama-fhe/relayer-sdk': 'commonjs @zama-fhe/relayer-sdk',
        '@zama-fhe/relayer-sdk/web': 'commonjs @zama-fhe/relayer-sdk/web',
      });
    }
    
    // Ignore optional wagmi connector dependencies we don't use
    config.externals.push({
      '@base-org/account': 'commonjs @base-org/account',
      '@coinbase/wallet-sdk': 'commonjs @coinbase/wallet-sdk',
      '@gemini-wallet/core': 'commonjs @gemini-wallet/core',
      '@metamask/sdk': 'commonjs @metamask/sdk',
      'porto': 'commonjs porto',
      'porto/internal': 'commonjs porto/internal',
      '@safe-global/safe-apps-sdk': 'commonjs @safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider': 'commonjs @safe-global/safe-apps-provider',
      '@walletconnect/ethereum-provider': 'commonjs @walletconnect/ethereum-provider',
    });
    return config;
  },
};

export default nextConfig;
