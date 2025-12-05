// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title NeuralSyncGame
/// @notice Compares an encrypted player choice with an encrypted pseudo-random system choice
///         and returns encrypted outcomes so only the player can decrypt the round result.
contract NeuralSyncGame is ZamaEthereumConfig {
    struct CipherRound {
        euint32 systemChoice;
        euint32 isSyncedFlag;
        uint64 roundId;
    }

    uint64 private _roundCursor;
    mapping(address => CipherRound) private _lastRounds;

    event NeuralLink(address indexed player, uint64 indexed roundId, euint32 systemChoice, euint32 isSyncedFlag);

    /// @notice Plays a round by sending an encrypted pill choice (0 for red, 1 for blue).
    /// @param encryptedChoice encrypted player choice handle
    /// @param inputProof proof that accompanies the encrypted choice
    /// @return systemChoice encrypted system selection
    /// @return isSyncedFlag encrypted equality result between system and player choice
    function play(
        externalEuint32 encryptedChoice,
        bytes calldata inputProof
    ) external returns (euint32 systemChoice, euint32 isSyncedFlag) {
        euint32 playerChoice = FHE.fromExternal(encryptedChoice, inputProof);

        systemChoice = _randomSystemChoice();
        ebool isSynced = FHE.eq(playerChoice, systemChoice);
        isSyncedFlag = FHE.select(isSynced, FHE.asEuint32(1), FHE.asEuint32(0));

        _roundCursor += 1;
        _lastRounds[msg.sender] = CipherRound(systemChoice, isSyncedFlag, _roundCursor);

        FHE.allowThis(systemChoice);
        FHE.allowThis(isSyncedFlag);
        FHE.allow(systemChoice, msg.sender);
        FHE.allow(isSyncedFlag, msg.sender);

        emit NeuralLink(msg.sender, _roundCursor, systemChoice, isSyncedFlag);

        return (systemChoice, isSyncedFlag);
    }

    /// @notice Returns the last encrypted round result recorded for a player.
    function getLastRound(
        address player
    ) external view returns (euint32 systemChoice, euint32 isSyncedFlag, uint64 roundId) {
        CipherRound memory round = _lastRounds[player];
        return (round.systemChoice, round.isSyncedFlag, round.roundId);
    }

    function _randomSystemChoice() private returns (euint32) {
        euint32 random = FHE.randEuint32();
        return FHE.rem(random, 2);
    }
}

