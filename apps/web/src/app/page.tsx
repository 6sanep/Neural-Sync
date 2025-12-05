"use client";

import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { StatusBoard, type StatusItem } from "@/components/status-board";
import { NeuralCore } from "@/components/neural-core";
import { CapsuleButton } from "@/components/capsule-button";
import { MatrixRain } from "@/components/matrix-rain";
import { GlitchHeader } from "@/components/glitch-header";
import { WalletModal } from "@/components/wallet-modal";
import { contractLink, gameConfig } from "@/config/game";
import { truncateAddress, delay, cn } from "@/lib/utils";
import { checkFhevmReady, checkRelayerReady, decryptHandles, encryptChoice } from "@/lib/fhevm";
import { neuralSyncGameAbi } from "@/abi/neuralSyncGame";
import { useNeuralSession, type Phase, type Pill } from "@/store/neural-session";
import { Github } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const {
    hasStarted,
    phase,
    playerChoice,
    systemChoice,
    txHash,
    setHasStarted,
    setPhase,
    setPlayerChoice,
    setSystemChoice,
    setTxHash,
    reset,
  } = useNeuralSession();

  const gameSectionRef = useRef<HTMLDivElement>(null);
  const contractAddress = gameConfig.contractAddress;
  const sepoliaId = sepolia.id;

  const { status: fheStatus } = useQuery({
    queryKey: ["fhevm-ready", isConnected, chainId],
    queryFn: () => checkFhevmReady(),
    enabled: isConnected && chainId === sepoliaId,
    retry: 1,
  });

  const { status: relayerStatus } = useQuery({
    queryKey: ["relayer-health", isConnected],
    queryFn: () => checkRelayerReady(),
    enabled: isConnected,
    retry: 1,
  });

  // FHEVM ready is the critical requirement; relayer check is informational only
  const diagnosticsReady = fheStatus === "success";
  const canStart = isConnected && chainId === sepoliaId && diagnosticsReady;

  const connectWallet = async (walletId?: string) => {
    try {
      // Map UI wallet id -> wagmi connector id
      const targetId =
        walletId === "walletConnect"
          ? "walletConnect"
          : walletId === "coinbaseWallet"
            ? "coinbaseWallet"
            : "injected"; // metaMask / okx / default

      const connector =
        connectors.find((c) => c.id === targetId) ?? connectors.find((c) => c.type === "injected");

      if (!connector) {
        toast.error("No wallet connector available");
        return;
      }

      const result = await connectAsync({ connector });

      if (result.chainId !== sepoliaId && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: sepoliaId });
          toast.success("Wallet synced & switched to Sepolia");
        } catch {
          toast.warning("Connected, but failed to switch to Sepolia. Please switch manually.");
        }
      } else {
        toast.success("Wallet synced");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const isUserRejection =
        message.toLowerCase().includes("user rejected") ||
        message.toLowerCase().includes("user denied") ||
        message.toLowerCase().includes("user cancelled") ||
        message.toLowerCase().includes("connection request reset");

      if (!isUserRejection) {
        toast.error(message || "Failed to connect wallet");
      }
    }
  };

  // Auto-activate session when wallet is connected and ready
  useEffect(() => {
    if (canStart && !hasStarted) {
      setHasStarted(true);
      if (phase === "idle") {
        setPhase("ready");
      }
    }
  }, [canStart, hasStarted, phase, setHasStarted, setPhase]);

  const statusMessage = useMemo(() => {
    switch (phase) {
      case "ready":
        return "Choose your pill to see if the System is in neural sync with your desired reality.";
      case "encrypting":
        return "Encoding your choice through the homomorphic veil…";
      case "waiting":
        return "Submitting encrypted resonance to Sepolia relays.";
      case "decrypting":
        return "Decrypting the system's decision through wallet attestation.";
      case "synced":
        return "Neural Sync Successful. Welcome to the New World.";
      case "desynced":
        return "Neural Sync Failed. You do not belong to this world.";
      case "error":
        return "TRANSMISSION FAILED. RECALIBRATE AND RETRY.";
      default:
        return "Connect, verify, and start to challenge the Neural Core.";
    }
  }, [phase]);

  const statusItems: StatusItem[] = [
    {
      label: "FHEVM",
      status: isConnected 
        ? (fheStatus === "success" ? "STABLE" : fheStatus === "error" ? "ERROR" : "SCANNING") 
        : "IDLE",
      tone: isConnected 
        ? (fheStatus === "success" ? "ready" : fheStatus === "error" ? "error" : "warning")
        : "warning",
      value: "",
      hint: fheStatus === "success" 
        ? "FHEVM public key loaded" 
        : "Initializing FHE encryption",
    },
    {
      label: "RELAYER",
      status: isConnected 
        ? (relayerStatus === "success" ? "STABLE" : relayerStatus === "error" ? "ERROR" : "SCANNING") 
        : "IDLE",
      tone: isConnected 
        ? (relayerStatus === "success" ? "ready" : relayerStatus === "error" ? "error" : "warning")
        : "warning",
      value: "",
      hint: relayerStatus === "error"
        ? "Relayer check failed (CORS), but FHE will work"
        : "Checking Zama relayer",
    },
    {
      label: "NETWORK",
      status: isConnected 
        ? (chainId === sepoliaId ? "SEPOLIA" : "WRONG NETWORK") 
        : "NOT DETECTED",
      tone: isConnected 
        ? (chainId === sepoliaId ? "ready" : "warning") 
        : "warning",
      value: "",
      hint: "Auto-switch enforced on connect",
    },
    {
      label: "WALLET",
      status: isConnected && address ? truncateAddress(address) : "NOT CONNECTED",
      tone: isConnected ? "ready" : "warning",
      value: "",
      copyValue: address ?? undefined,
      hint: "Tap copy icon",
    },
    {
      label: "CONTRACT",
      status: contractAddress ? truncateAddress(contractAddress) : "NOT DEPLOYED",
      tone: contractAddress ? "ready" : "warning",
      value: "",
      href: contractAddress ? contractLink : undefined,
      hint: "Sepolia deployment target",
    },
    {
      label: "GITHUB",
      status: <Github size={18} />,
      value: "",
      href: gameConfig.githubUrl || "#",
      tone: "ready",
      hint: "View source code",
    },
  ];

  useEffect(() => {
    if (!isConnected) {
      reset();
      setIsSubmitting(false);
    }
  }, [isConnected, reset]);


  const handleStart = () => {
    if (!canStart) {
      toast.error("Connect wallet & verify FHE services first.");
      return;
    }
    // Reset game state and clear previous choices
    setPlayerChoice(null);
    setSystemChoice(null);
    setTxHash(null);
    setHasStarted(true);
    setPhase("ready");
    
    // Smooth scroll to game section with a slight delay to allow rendering
    setTimeout(() => {
      if (gameSectionRef.current) {
        const yOffset = -40; // Offset to leave some space at the top
        const element = gameSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const simulateRound = async (pill: Pill) => {
    await delay(1200);
    setPhase("waiting");
    const system = Math.random() > 0.5 ? "RED" : "BLUE";
    setSystemChoice(system as Pill);
    setPhase(system === pill ? "synced" : "desynced");
    toast.warning("Set NEXT_PUBLIC_GAME_ADDRESS to enable live rounds.");
  };

  const submitChoice = async (pill: Pill) => {
    if (isSubmitting) return;
    if (!isConnected || !address) {
      toast.error("Connect wallet first.");
      return;
    }
    if (chainId !== sepoliaId && switchChainAsync) {
      await switchChainAsync({ chainId: sepoliaId });
    }

    setPlayerChoice(pill);
    setSystemChoice(null);
    setIsSubmitting(true);
    setPhase("encrypting");

    try {
      if (!contractAddress || !publicClient) {
        setTxHash(null);
        await simulateRound(pill);
        return;
      }

      const fetchLastRound = async () =>
        (await publicClient.readContract({
          address: contractAddress,
          abi: neuralSyncGameAbi,
          functionName: "getLastRound",
          args: [address],
        })) as [`0x${string}`, `0x${string}`, bigint];

      const existingRound = await fetchLastRound();
      const previousRoundId = existingRound?.[2] ?? 0n;

      const encrypted = await encryptChoice(pill === "RED" ? 0 : 1, contractAddress, address);
      setPhase("waiting");
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: neuralSyncGameAbi,
        functionName: "play",
        args: [encrypted.handle, encrypted.inputProof],
      });
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });

      const round = await (async () => {
        const INITIAL_DELAY_MS = 15000;
        const POLL_DELAY_MS = 3000;
        const MAX_ATTEMPTS = 3;

        await delay(INITIAL_DELAY_MS);

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
          const candidate = await fetchLastRound();
          const roundId = candidate?.[2] ?? 0n;
          if (roundId !== 0n && roundId > previousRoundId) {
            return candidate;
          }
          await delay(POLL_DELAY_MS);
        }

        throw new Error("Round result still syncing. Please retry in a moment.");
      })();

      setPhase("decrypting");

      if (!walletClient) {
        throw new Error("Wallet client unavailable for decryption");
      }

      const [choiceValue, matchValue] = await decryptHandles([round[0], round[1]], contractAddress, address, walletClient);
      const revealed = choiceValue === 0 ? "RED" : "BLUE";

      setSystemChoice(revealed as Pill);
      setPhase(matchValue === 1 ? "synced" : "desynced");
    } catch (error) {
      console.error(error);
      
      // Detect whether the user cancelled the transaction
      const message = error instanceof Error ? error.message : "";
      const isUserRejection = message.toLowerCase().includes("user rejected") || 
                              message.toLowerCase().includes("user denied") ||
                              message.toLowerCase().includes("user cancelled") ||
                              message.toLowerCase().includes("rejected the request") ||
                              message.toLowerCase().includes("transaction was rejected");
      
      if (!isUserRejection) {
        toast.error(message || "Neural sync failed");
        setPhase("error");
      } else {
        setPhase("ready");
        setPlayerChoice(null);
        setSystemChoice(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePhase: Phase = hasStarted ? phase : "idle";
  const capsuleDisabled = !hasStarted || isSubmitting || phase === "waiting";

  // Auto-scroll when result appears
  useEffect(() => {
    if (systemChoice && gameSectionRef.current) {
      const yOffset = -40; 
      const element = gameSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [systemChoice]);

  return (
    <>
      <MatrixRain />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16 lg:px-10">
        <section className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-2 lg:mt-6">
              <div className="h-2 w-2 animate-pulse rounded-full bg-bio-green shadow-[0_0_8px_#39FF14]" />
              <p className="font-mono text-xs font-bold tracking-[0.4em] text-bio-green">
                SECURE LINK :: SEPOLIA :: POWERED BY FHE
              </p>
            </div>
            
            <div className="-mt-4">
              <GlitchHeader />
              <div className="relative mt-6 max-w-xl border-l-2 border-bio-green/30 pl-6">
                <p className="leading-relaxed font-mono text-sm space-y-3">
                  <span className="block text-slate-400 drop-shadow-[0_0_3px_rgba(148,163,184,0.5)] font-bold">&gt; INITIALIZING SEQUENCE...</span>
                  <span className="block text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] font-bold">&gt; Choose your pill.</span>
                  <span className="block text-bio-purple drop-shadow-[0_0_5px_rgba(138,43,226,0.8)] font-bold">&gt; Select the reality you wish to sync with.</span>
                  <span className="block text-bio-green drop-shadow-[0_0_5px_rgba(57,255,20,0.8)] font-bold">&gt; See if the System chooses you.</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {!isConnected ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-none border border-bio-green bg-transparent px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-bio-green transition-all hover:bg-bio-green/10 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                >
                  <span className="relative z-10">CONNECT WALLET</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-bio-green/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              ) : (
                <button
                  onClick={() => disconnect()}
                  className="rounded-none border border-white/20 bg-black/40 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Terminate Session
                </button>
              )}

              <button
                onClick={handleStart}
                disabled={!canStart}
                className="group relative flex items-center gap-2 overflow-hidden rounded-none border border-bio-cyan bg-bio-cyan/10 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-bio-cyan transition-all hover:bg-bio-cyan/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-700 disabled:shadow-none"
              >
                <span className="relative z-10">Engage Neural Core</span>
                <div className="absolute inset-0 translate-y-full bg-gradient-to-t from-bio-cyan/20 to-transparent transition-transform duration-300 group-hover:translate-y-0" />
              </button>
            </div>

          </div>

          <div className="w-full max-w-sm lg:w-80 lg:mt-6">
            <StatusBoard items={statusItems} />
          </div>
        </section>

        <section
          ref={gameSectionRef}
          className="glass-panel relative flex min-h-[600px] flex-col items-center justify-center gap-12 overflow-hidden rounded-xl border border-bio-green/20 bg-black/80 px-6 py-16 text-center backdrop-blur-xl"
        >
          {/* Background decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.05)_1px,transparent_1px)] bg-[length:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.6em] text-slate-500">
              {"// Core System Status"}
            </p>
            <NeuralCore phase={activePhase} systemChoice={systemChoice} />
            {phase === "error" ? (
              <div className="max-w-md font-mono text-sm leading-loose text-bio-green/80 drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">
                <span>TRANSMISSION FAILED. RECALIBRATE AND </span>
                <button
                  onClick={handleStart}
                  className="inline-flex items-center font-bold text-bio-cyan hover:text-white transition-colors underline decoration-bio-cyan/50 hover:decoration-white decoration-2 underline-offset-4"
                >
                  RETRY
                </button>
                <span>.</span>
              </div>
            ) : phase === "synced" || phase === "desynced" ? (
              <div className="max-w-md font-mono text-sm leading-loose drop-shadow-[0_0_10px_rgba(57,255,20,0.8)] font-bold tracking-wide">
                <span className={cn(
                  phase === "desynced" 
                    ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    : "text-bio-green"
                )}>
                  {statusMessage}
                </span>
                <span className={cn(
                  phase === "desynced" 
                    ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    : "text-bio-green"
                )}> Click </span>
                <button
                  onClick={handleStart}
                  className={cn(
                    "inline-flex items-center font-bold transition-colors underline decoration-2 underline-offset-4",
                    phase === "desynced" 
                      ? "text-red-400 hover:text-red-200 decoration-red-500/50 hover:decoration-red-200" 
                      : "text-bio-cyan hover:text-white decoration-bio-cyan/50 hover:decoration-white"
                  )}
                >
                  RETRY
                </button>
                <span className={cn(
                  phase === "desynced" 
                    ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    : "text-bio-green"
                )}> for another round.</span>
              </div>
            ) : (
              <p className={cn(
                "max-w-md font-mono text-sm leading-loose drop-shadow-[0_0_10px_rgba(57,255,20,0.8)] font-bold tracking-wide text-bio-green"
              )}>
              {statusMessage}
            </p>
            )}
            
            {txHash && (
              <div className="mt-1">
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-bio-green drop-shadow-[0_0_5px_rgba(57,255,20,0.6)] font-bold transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-bio-green shadow-[0_0_5px_#39FF14] animate-pulse" />
                  TX: {truncateAddress(txHash, 8)}
                </a>
              </div>
            )}
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
            <CapsuleButton
              color="red"
              label="Red Pill"
              disabled={capsuleDisabled}
              active={playerChoice === "RED"}
              onClick={() => submitChoice("RED")}
            />
            <CapsuleButton
              color="blue"
              label="Blue Pill"
              disabled={capsuleDisabled}
              active={playerChoice === "BLUE"}
              onClick={() => submitChoice("BLUE")}
            />
          </div>

          {systemChoice ? (
            <div className="mt-2 animate-float z-20">
              <div className={cn(
                "flex items-center gap-4 border bg-black/90 px-8 py-4 backdrop-blur-md rounded-lg transition-colors duration-500",
                systemChoice === "RED" 
                  ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]" 
                  : "border-bio-cyan/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              )}>
                <span className="font-mono text-sm text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                  System Decrypted
                </span>
                <span className={cn(
                  "font-bold tracking-widest text-xl", 
                  systemChoice === "RED" 
                    ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]" 
                    : "text-bio-cyan drop-shadow-[0_0_15px_rgba(6,182,212,1)]"
                )}>
                  {systemChoice}
                </span>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={connectWallet}
      />
    </>
  );
}
