# Neural Sync

An on-chain interactive experience powered by Fully Homomorphic Encryption (FHE).  
Players choose between a red and blue capsule while the system secretly generates its own encrypted choice—revealed only when the player decrypts it locally.

> **Why FHE?** The entire comparison runs on encrypted data on-chain. Neither the contract nor anyone else can see the player's choice or the system's decision until the player decrypts with their wallet.

## Features

- 🔐 **Client-side FHE encryption** – Choice encrypted in browser before submission
- ⛓️ **On-chain encrypted computation** – Contract compares encrypted values without revealing them
- 🔓 **Wallet-based decryption** – Only the player can reveal the result via EIP-712 signature
- 🎮 **Immersive sci-fi UI** – Matrix-style visuals with real-time status feedback

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15, React 19, Tailwind, Wagmi, Viem |
| FHE | @zama-fhe/relayer-sdk |
| Contracts | Hardhat, FHEVM Solidity, TypeChain |

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm dev:web          # Start frontend (localhost:3000)
pnpm test:contracts   # Run contract tests
```

### Environment Variables

Create `apps/web/.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GAME_ADDRESS` | Deployed NeuralSyncGame contract address |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | (Optional) Custom Sepolia RPC |
| `NEXT_PUBLIC_GITHUB_URL` | (Optional) GitHub link for UI |

## Deployment

**Network:** Sepolia  
**Contract:** [`0x9Cec98F62bF5956a522986C5E9ACB010C5A7AD47`](https://sepolia.etherscan.io/address/0x9Cec98F62bF5956a522986C5E9ACB010C5A7AD47#code)

## Tests

```bash
pnpm test:contracts
```

```
NeuralSyncGame
  ✔ stores encrypted round data and allows player decryption (49ms)

1 passing (57ms)
```

## Project Structure

```
├─ apps/web/            # Next.js frontend
├─ packages/contracts/  # FHEVM smart contracts
└─ docs/                # PRD, deployment & testing guides
```

## License

MIT
