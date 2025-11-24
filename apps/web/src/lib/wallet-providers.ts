"use client";

interface EthereumProvider {
  isMetaMask?: boolean;
  isOkxWallet?: boolean;
  isBraveWallet?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: EthereumProvider[];
}

declare global {
  interface Window {
    okxwallet?: unknown;
    ethereum?: EthereumProvider;
    __originalEthereum?: EthereumProvider;
  }
}

const isBrowser = () => typeof window !== "undefined";

export function getMetaMaskProvider() {
  if (!isBrowser()) return undefined;

  const ethereum = window.ethereum;
  if (!ethereum) return undefined;

  const providers = ethereum.providers;
  if (providers?.length) {
    const provider = providers.find(
      (p) => p?.isMetaMask && !p?.isOkxWallet && !p?.isBraveWallet,
    );
    if (provider) {
      return provider;
    }
  }

  if (ethereum.isMetaMask && !ethereum.isOkxWallet && !ethereum.isBraveWallet) {
    return ethereum;
  }

  return undefined;
}

export function getOkxProvider() {
  if (!isBrowser()) return undefined;

  if (window.okxwallet) {
    return window.okxwallet;
  }

  if (window.ethereum?.isOkxWallet) {
    return window.ethereum;
  }

  return undefined;
}

export function isCoinbaseInstalled() {
  if (!isBrowser()) return false;

  // Check for Coinbase Wallet extension
  if (window.ethereum) {
    const ethereum = window.ethereum;
    
    // Check providers array first
    if (ethereum.providers?.length) {
      return ethereum.providers.some((p) => p?.isCoinbaseWallet);
    }
    
    // Check single provider
    if (ethereum.isCoinbaseWallet) {
      return true;
    }
  }

  return false;
}

export const isMetaMaskInstalled = () => Boolean(getMetaMaskProvider());

export const isOkxInstalled = () => Boolean(getOkxProvider());

