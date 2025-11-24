# Neural Sync · Contracts

Hardhat workspace containing the FHE-enabled `NeuralSyncGame` contract. The contract:

- Accepts an encrypted player pill choice (0 = Red, 1 = Blue).
- Generates an encrypted pseudo-random system choice on-chain.
- Compares both selections homomorphically and returns the encrypted outcome.
- Stores the last encrypted round per player so the UI can refetch even after a refresh.

## Requirements

- Node.js ≥ 20
- pnpm ≥ 10
- Access to a Sepolia RPC endpoint that supports the Zama coprocessor contracts (configured via `hardhat vars`).

## Setup

   ```bash
pnpm install
cd packages/contracts

# Configure sensitive values once
   npx hardhat vars set MNEMONIC
npx hardhat vars set SEPOLIA_RPC_URL
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

## Useful Scripts

| Command                           | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `pnpm --filter contracts compile` | Compile contracts + generate TypeChain types      |
| `pnpm --filter contracts test`    | Run unit tests against the FHEVM mock environment |
| `pnpm --filter contracts deploy`  | Custom deploy (see root scripts)                  |
| `pnpm --filter contracts lint`    | Solhint + ESLint                                  |

## Custom Hardhat Tasks

- `pnpm --filter contracts hardhat game:address`
- `pnpm --filter contracts hardhat game:play --choice 1`
- `pnpm --filter contracts hardhat game:last-round`

These utilities encrypt inputs, submit rounds, and decrypt results for quick smoke tests.

## File Map

```
contracts/
├── NeuralSyncGame.sol   # Core FHE gameplay logic
├── deploy/              # Hardhat-deploy script
├── tasks/               # Custom CLI helpers
└── test/                # Unit tests using fhevm mock
```

Refer to the root `README.md` and `docs/PRD.md` for end-to-end architecture context.
