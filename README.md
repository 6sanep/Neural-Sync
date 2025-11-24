# Neural Sync

Neural Sync is an on-chain interactive experience built on top of FHEVM.  
Players choose between a red and a blue capsule while the system secretly generates its own encrypted choice on-chain.  
The final result is only revealed when the player decrypts it locally with their wallet.

> Core goal: showcase the full loop of **client-side encryption ➜ on-chain FHE computation ➜ client-side decryption**, wrapped in an immersive sci‑fi UI.

## Gameplay flow

- **Connect wallet** – Player opens the custom modal, chooses MetaMask / OKX Wallet / Coinbase Wallet, and the app auto‑switches to Sepolia with a live status bar.  
- **Engage & choose** – After FHEVM checks pass, the player hits **ENGAGE NEURAL CORE**, scrolls into the game frame, and picks the **RED** or **BLUE** capsule.  
- **On‑chain FHE round** – The front‑end encrypts the choice with the FHE public key, the contract runs the comparison fully on‑chain, and returns encrypted `systemChoice` and `matchResult`.  
- **Decrypt & react** – The front‑end performs a single `userDecrypt` via the wallet, reveals **System Decrypted RED/BLUE**, plays rich success / failure VFX around the Neural Core, and offers a **RETRY** action to start the next round.

## Monorepo structure
```
.
├─ apps/web           # Next.js 16 + Tailwind + Wagmi front‑end
├─ packages/contracts # Hardhat + FHEVM smart contracts
├─ docs/PRD.md        # Product requirements document
└─ Neural_note.md     # Sensitive config (ignored by .gitignore)
```

## Quick start
```bash
pnpm install                     # Install all workspace dependencies
pnpm dev:web                     # Start the front‑end
pnpm dev:contracts               # Start local blockchain (Hardhat node)
pnpm test:contracts              # Run contract tests
```

### Key environment variables
Configure the following values in `apps/web/.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Sepolia RPC shared with the contracts |
| `NEXT_PUBLIC_CHAIN_ID` | Main chain id (default 11155111) |
| `NEXT_PUBLIC_GATEWAY_CHAIN_ID` | Gateway chain id (default 10901) |
| `NEXT_PUBLIC_FHE_RELAYER_URL` | Relayer URL (default https://relayer.testnet.zama.org) |
| `NEXT_PUBLIC_GAME_ADDRESS` | Deployed `NeuralSyncGame` address |
| `NEXT_PUBLIC_GITHUB_URL` | (Optional) GitHub repo link used in the UI status bar |

> Note: Zama already ships the official Sepolia addresses inside `@zama-fhe/relayer-sdk`.  
> If you need to override them manually, you can set  
> `NEXT_PUBLIC_FHE_KMS_ADDRESS`, `NEXT_PUBLIC_FHE_ACL_ADDRESS`,  
> `NEXT_PUBLIC_FHE_INPUT_VERIFIER_ADDRESS`, `NEXT_PUBLIC_FHE_DECRYPTION_CONTRACT` and  
> `NEXT_PUBLIC_FHE_INPUT_VERIFICATION_CONTRACT` in `.env.local`.

## Tech stack
- **Front‑end**: Next.js 16, React 19, Tailwind, Shadcn UI (planned), wagmi, viem, @zama-fhe/relayer-sdk  
- **Contracts**: Hardhat, FHEVM Solidity libs, TypeChain, Hardhat Deploy

## Current deployment
- **Network**: Sepolia  
- **NeuralSyncGame**: `0x786AE7f804e7CFD55e4Bab6f4a812980Bb8c705C`  
  ↳ [Etherscan contract page](https://sepolia.etherscan.io/address/0x786AE7f804e7CFD55e4Bab6f4a812980Bb8c705C#code) · Deploy tx `0x9cda2c88874a074cdaf0270db4f70807fe1c1bbee541c7bed72b349c19bab6c1`

## Next steps
1. Iterate on the `NeuralSyncGame` contract and events as the game evolves.  
2. Polish the front‑end UI (status bar, Neural Core animation, red/blue capsule interactions).  
3. Keep the FHEVM integration aligned with the latest SDK best practices.  
4. Maintain Sepolia deployment & Etherscan verification as part of the release flow.

For more background and operational details, see:
- `docs/PRD.md`
- `docs/DEPLOY.md`
- `docs/TESTING.md`
