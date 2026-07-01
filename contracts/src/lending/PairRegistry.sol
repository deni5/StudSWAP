// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract PairRegistry is AccessControl {

    bytes32 public constant RISK_ADMIN_ROLE = keccak256("RISK_ADMIN_ROLE");

    struct PairConfig {
        bool    allowed;
        uint16  aCdBps;
        uint16  phiCdBps;
        uint16  effectiveLtvBps;
        uint16  effectiveLiqThBps;
        uint32  guardThresholdBps;
        uint128 referenceRatioRay;
        uint64  updatedAt;
        uint64  epoch;
    }

    struct PairUpdate {
        address collateralAsset;
        address debtAsset;
        bool    allowed;
        uint16  aCdBps;
        uint16  phiCdBps;
        uint16  effectiveLtvBps;
        uint16  effectiveLiqThBps;
        uint32  guardThresholdBps;
        uint128 referenceRatioRay;
        uint64  updatedAt;
    }

    mapping(address => mapping(address => PairConfig)) private _pairs;
    uint64 public currentEpoch;

    event PairUpdated(
        address indexed collateral,
        address indexed debt,
        bool    allowed,
        uint16  effectiveLtvBps,
        uint16  effectiveLiqThBps,
        uint64  epoch
    );
    event EpochAdvanced(uint64 oldEpoch, uint64 newEpoch);

    constructor(address riskAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RISK_ADMIN_ROLE, riskAdmin);
    }

    function batchUpdatePairs(
        PairUpdate[] calldata updates,
        uint64 epoch
    ) external onlyRole(RISK_ADMIN_ROLE) {
        uint64 oldEpoch = currentEpoch;
        currentEpoch = epoch;

        for (uint i = 0; i < updates.length; i++) {
            PairUpdate calldata u = updates[i];
            _pairs[u.collateralAsset][u.debtAsset] = PairConfig({
                allowed:            u.allowed,
                aCdBps:             u.aCdBps,
                phiCdBps:           u.phiCdBps,
                effectiveLtvBps:    u.effectiveLtvBps,
                effectiveLiqThBps:  u.effectiveLiqThBps,
                guardThresholdBps:  u.guardThresholdBps,
                referenceRatioRay:  u.referenceRatioRay,
                updatedAt:          u.updatedAt,
                epoch:              epoch
            });
            emit PairUpdated(
                u.collateralAsset, u.debtAsset,
                u.allowed, u.effectiveLtvBps, u.effectiveLiqThBps, epoch
            );
        }
        emit EpochAdvanced(oldEpoch, epoch);
    }

    function getPairConfig(
        address collateralAsset,
        address debtAsset
    ) external view returns (PairConfig memory) {
        return _pairs[collateralAsset][debtAsset];
    }

    function isPairAllowed(
        address collateralAsset,
        address debtAsset
    ) external view returns (bool) {
        return _pairs[collateralAsset][debtAsset].allowed;
    }
}
