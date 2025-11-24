# Neural Sync - PRD

## 1. Background & vision
- **Problem**: In on-chain multiplayer games based on guessing or random choices, the system’s choice or the players’ choices are often revealed too early, creating predictability and room for cheating.
- **Solution**: Use FHEVM so that both the system’s and the player’s choices remain fully encrypted on-chain. Only after the computation is finalized on-chain will the player decrypt the result locally, preserving fairness and mystery.
- **Narrative**: Neural Sync wraps this mechanic in a “neural synchronization” world: the player chooses between a red or blue capsule and tries to sync their neural state with the system.

## 2. Target users
1. Web3 players who are curious about encrypted privacy and FHE technology.  
2. Hackathon judges and potential partners who need a clear demo of FHEVM’s capabilities.

## 3. Key experience (core loop)
1. **Connect**: After connecting the wallet, the app automatically switches to Sepolia and checks FHEVM / Relayer / KMS health — the game only continues when everything is ready.  
2. **Start**: Once ready, enable the main stage animation (Neural Core).  
3. **Choose Pill**: The player chooses the red or blue capsule; the front‑end encrypts the choice with the FHE public key and submits it to the contract.  
4. **On‑chain FHE compute**: The contract generates the system’s encrypted choice and compares it with the player’s encrypted choice, outputting encrypted `matchResult` and `systemChoice`.  
5. **Decrypt & render**: The front‑end asks the wallet to decrypt the result and then plays success effects (green) or failure / glitch effects (red).

## 4. FHE / technical architecture
| Layer | Responsibility |
| --- | --- |
| Front‑end (Next.js + Wagmi + `fhevmjs`) | Connect wallet, fetch public key, encrypt the player’s choice, send transactions, decrypt encrypted outputs. |
| Contract (FHEVM Hardhat) | Generate the system’s random encrypted choice, compare it with the player’s encrypted choice, emit encrypted `matchResult` and `systemChoice` plus events. |
| Relayer / services | Perform the FHE computation and key validation as configured by Zama. |

## 5. Functional requirements
1. **Status bar** (top‑right):  
   - `FHEVM`: READY / ERROR  
   - `NETWORK`: fixed to SEPOLIA  
   - `WALLET`: shortened address (click to copy)  
   - `CONTRACT`: link to the deployed contract address (updated after deployment)  
   - `GITHUB`: button linking to the repository  
2. **Hero section**:  
   - Title: `Neural Sync`  
   - Subtitle: `Which capsule do you trust?`  
   - Buttons: `Connect`, `Start` (Start only enabled once Ready)  
3. **Game section**:  
   - Animated Neural Core (neutral by default; strong green glow for success, red / glitch for failure).  
   - Two capsule buttons (Red Pill / Blue Pill).  
   - Animated hints for encryption / decryption / result states.  
4. **Error handling**:  
   - If any critical service fails, disable `Start`.  
   - On decryption failure, show a toast and keep the UI consistent.

## 6. Non‑functional requirements
- UI: abstract, futuristic, neon‑dark sci‑fi aesthetic, inspired by `ai_studio_code (3).html`.  
- Responsive layout, desktop experience prioritized.  
- All user‑facing copy should be English.  
- Refreshing the page or disconnecting the wallet should always reset to the initial state.

## 7. Deliverables
1. Contracts: `NeuralSyncGame.sol` + deployment scripts + unit tests.  
2. Front‑end: full UI in `apps/web`, FHE flow, and custom animations.  
3. Documentation: README, deployment guide, testing / demo script.  
4. Deployment: Sepolia network with Etherscan verification completed.

