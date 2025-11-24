# Neural Sync - Deployment & Integration Guide

## 1. Hardhat contract deployment

1. **Configure variables**
   ```bash
   cd packages/contracts
   npx hardhat vars set MNEMONIC
   npx hardhat vars set SEPOLIA_RPC_URL
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

   > The project root `Neural_note.md` contains the dedicated wallet, Sepolia RPC URL and Etherscan API key.  
   > Copy them into the variables above as needed and keep that file private and uncommitted.

2. **Local checks**
   ```bash
   pnpm --filter contracts test
   pnpm --filter contracts hardhat node   # run a local chain if needed
   ```

3. **Deploy to Sepolia**
   ```bash
   pnpm --filter contracts hardhat deploy --network sepolia
   pnpm --filter contracts hardhat verify --network sepolia <DEPLOYED_ADDRESS>
   ```

4. **Helper tasks**
   - `pnpm --filter contracts hardhat game:address`
   - `pnpm --filter contracts hardhat game:play --choice 1`
   - `pnpm --filter contracts hardhat game:last-round`

## 2. Front‑end environment variables

Configure in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=<RPC used by the contracts>
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_CHAIN_ID=10901
NEXT_PUBLIC_FHE_RELAYER_URL=https://relayer.testnet.zama.org
NEXT_PUBLIC_GAME_ADDRESS=<NeuralSyncGame deployed address>
NEXT_PUBLIC_GITHUB_URL=<repository URL>

# If you need to override the official addresses, you can set the following
# (they default to Zama’s Sepolia configuration):
# NEXT_PUBLIC_FHE_KMS_ADDRESS=0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
# NEXT_PUBLIC_FHE_ACL_ADDRESS=0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D
# NEXT_PUBLIC_FHE_INPUT_VERIFIER_ADDRESS=0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0
# NEXT_PUBLIC_FHE_DECRYPTION_CONTRACT=0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478
# NEXT_PUBLIC_FHE_INPUT_VERIFICATION_CONTRACT=0x483b9dE06E4E4C7D35CCf5837A1668487406D955
```

## 3. Running the front‑end

```bash
pnpm install             # Run once at the repo root
pnpm --filter web dev    # http://localhost:3000
```

Flow:
1. **Connect** – wallet connects and auto-switches to Sepolia.  
2. **Ready** – the system checks FHEVM & Relayer health.  
3. **Start** – scroll to the game area, choose a red/blue capsule, send the transaction, then decrypt and display the result via the wallet.

## 4. Self‑check list
- [ ] `pnpm --filter contracts test`
- [ ] `pnpm --filter web lint`
- [ ] Front‑end: Connect → Ready → Start → choose capsule → decrypted result
- [ ] After disconnect / refresh, state resets to initial
- [ ] Etherscan verification passes & status bar CONTRACT link points to the correct address

## 5. Latest deployment record (Sepolia)
- **Contract**: `0x786AE7f804e7CFD55e4Bab6f4a812980Bb8c705C`
- **Deploy tx**: `0x9cda2c88874a074cdaf0270db4f70807fe1c1bbee541c7bed72b349c19bab6c1`
- **Etherscan**: <https://sepolia.etherscan.io/address/0x786AE7f804e7CFD55e4Bab6f4a812980Bb8c705C#code>
- **Note**: Deployed and verified using the wallet private key + RPC recorded in `Neural_note.md`.



