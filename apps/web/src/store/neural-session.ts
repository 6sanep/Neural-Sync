import { create } from "zustand";

export type Pill = "RED" | "BLUE";
export type Phase = "idle" | "ready" | "encrypting" | "waiting" | "decrypting" | "synced" | "desynced" | "error";

type NeuralSessionState = {
  phase: Phase;
  hasStarted: boolean;
  playerChoice: Pill | null;
  systemChoice: Pill | null;
  txHash: `0x${string}` | null;
  setPhase: (phase: Phase) => void;
  setHasStarted: (flag: boolean) => void;
  setPlayerChoice: (pill: Pill | null) => void;
  setSystemChoice: (pill: Pill | null) => void;
  setTxHash: (hash: `0x${string}` | null) => void;
  reset: () => void;
};

const initialState = {
  phase: "idle" as Phase,
  hasStarted: false,
  playerChoice: null,
  systemChoice: null,
  txHash: null,
};

export const useNeuralSession = create<NeuralSessionState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setHasStarted: (flag) => set({ hasStarted: flag }),
  setPlayerChoice: (pill) => set({ playerChoice: pill }),
  setSystemChoice: (pill) => set({ systemChoice: pill }),
  setTxHash: (hash) => set({ txHash: hash }),
  reset: () => set(initialState),
}));


