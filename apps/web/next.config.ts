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
    
    return config;
  },
};

export default nextConfig;
