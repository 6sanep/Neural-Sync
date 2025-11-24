"use client";

declare global {
  interface Window {
    okxwallet?: unknown;
    ethereum?: any;
    __originalEthereum?: any;
  }
}

const isBrowser = () => typeof window !== "undefined";

export function getMetaMaskProvider() {
  if (!isBrowser()) return undefined;

  const ethereum = window.ethereum;
  if (!ethereum) return undefined;

  const providers = (ethereum as any).providers;
  if (providers?.length) {
    const provider = providers.find(
      (p: any) => p?.isMetaMask && !p?.isOkxWallet && !p?.isBraveWallet,
    );
    if (provider) {
      return provider;
    }
  }

  if (ethereum.isMetaMask && !(ethereum as any).isOkxWallet && !(ethereum as any).isBraveWallet) {
    return ethereum;
  }

  return undefined;
}

export function getOkxProvider() {
  if (!isBrowser()) return undefined;

  if (window.okxwallet) {
    return window.okxwallet;
  }

  if (window.ethereum && (window.ethereum as any).isOkxWallet) {
    return window.ethereum;
  }

  return undefined;
}

export function isCoinbaseInstalled() {
  if (!isBrowser()) return false;

  // Check for Coinbase Wallet extension
  if (window.ethereum) {
    const ethereum = window.ethereum as any;
    
    // Check providers array first
    if (ethereum.providers?.length) {
      return ethereum.providers.some((p: any) => p?.isCoinbaseWallet);
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

