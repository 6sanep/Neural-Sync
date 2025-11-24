# Neural Sync - Testing Log

| # | Type | Command / Action | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Contract unit tests | `pnpm --filter contracts test` | ✅ Passed | FHE mock environment covering the `NeuralSyncGame` encrypt/decrypt flow. |
| 2 | Front‑end lint | `pnpm --filter web lint` | ✅ Passed | Ensures the latest UI / hooks pass ESLint. |
| 3 | Contract deploy & verify | `npx hardhat deploy --network sepolia` + `npx hardhat verify ...` | ✅ Done | Sepolia address `0x786AE7f804e7CFD55e4Bab6f4a812980Bb8c705C`, verified on Etherscan. |
| 4 | Manual UX run | Connect → Ready → Start → choose capsule → decrypted result | 🚫 Pending | Record a full run after updating `NEXT_PUBLIC_GAME_ADDRESS` in `.env.local`. |

> Note: Depending on the contest requirements, you may want to re-run deployment and verification on Sepolia, then repeat step 3 and capture a screen recording as part of the submission material.

