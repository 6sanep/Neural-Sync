export const neuralSyncGameAbi = [
  {
    inputs: [],
    name: "ZamaProtocolUnsupported",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: true, internalType: "uint64", name: "roundId", type: "uint64" },
      { indexed: false, internalType: "euint32", name: "systemChoice", type: "bytes32" },
      { indexed: false, internalType: "euint32", name: "isSyncedFlag", type: "bytes32" },
    ],
    name: "NeuralLink",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getLastRound",
    outputs: [
      { internalType: "euint32", name: "systemChoice", type: "bytes32" },
      { internalType: "euint32", name: "isSyncedFlag", type: "bytes32" },
      { internalType: "uint64", name: "roundId", type: "uint64" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "encryptedChoice", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "play",
    outputs: [
      { internalType: "euint32", name: "systemChoice", type: "bytes32" },
      { internalType: "euint32", name: "isSyncedFlag", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

