"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isMetaMaskInstalled, isOkxInstalled, isCoinbaseInstalled } from "@/lib/wallet-providers";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId: string) => void;
}

type WalletId = "metaMask" | "okx" | "coinbaseWallet";

const walletInfo: Record<WalletId, { name: string; checkInstalled: () => boolean }> = {
  metaMask: {
    name: "MetaMask",
    checkInstalled: isMetaMaskInstalled,
  },
  okx: {
    name: "OKX Wallet",
    checkInstalled: isOkxInstalled,
  },
  coinbaseWallet: {
    name: "Coinbase Wallet",
    checkInstalled: isCoinbaseInstalled,
  },
};

const displayWallets: WalletId[] = ["metaMask", "okx", "coinbaseWallet"];

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [installedWallets, setInstalledWallets] = useState<Record<WalletId, boolean>>({
    metaMask: false,
    okx: false,
    coinbaseWallet: false,
  });

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setInstalledWallets((prev) => ({
        ...prev,
        metaMask: walletInfo.metaMask.checkInstalled(),
        okx: walletInfo.okx.checkInstalled(),
        coinbaseWallet: walletInfo.coinbaseWallet.checkInstalled(),
      }));
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClick = (walletId: WalletId) => {
    const isInstalled = installedWallets[walletId];
    if (!isInstalled) {
      const walletName = walletInfo[walletId].name;
      toast.error(`${walletName} is not installed. Please install the browser extension first.`);
      return;
    }

    onConnect(walletId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative rounded-lg border-2 border-bio-green/30 bg-black p-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-mono text-xl font-bold uppercase tracking-widest text-bio-green drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
                  Connect Wallet
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Wallet List */}
              <div className="space-y-3">
                {displayWallets.map((id) => {
                  const info = walletInfo[id];
                  const isInstalled = installedWallets[id];

                  return (
                    <button
                      key={id}
                      onClick={() => handleClick(id)}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-md border bg-black/50 p-4 font-mono text-left transition-all",
                        isInstalled
                          ? "border-bio-green/30 hover:border-bio-green hover:bg-bio-green/10 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                          : "border-slate-700/30 cursor-not-allowed opacity-50",
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <p className="font-bold text-white">{info.name}</p>
                        {!isInstalled && (
                          <span className="text-xs text-red-400">Not Installed</span>
                        )}
                      </div>
                      {isInstalled && (
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-bio-green/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
