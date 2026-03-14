// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IReceiptToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

interface IBonusReserveManager {
    function hasReserve(address token) external view returns (bool);
    function payBonus(address token, uint256 amount) external returns (uint256 paidAmount);
}

contract ReceiptVault is Ownable {
    uint256 public constant LOCK_PERIOD = 30 days;

    address public immutable receiptToken;
    address public immutable bonusReserveManager;

    struct VaultPosition {
        uint256 id;
        address owner;
        address lpToken;
        uint256 lpAmount;
        uint256 receiptAmount;
        uint256 lockedAt;
        uint256 unlockAt;
        bool redeemed;
        bool exists;
    }

    uint256 public nextPositionId = 1;

    mapping(uint256 => VaultPosition) private positions;
    mapping(address => uint256[]) private userPositions;

    event PositionCreated(
        uint256 indexed positionId,
        address indexed owner,
        address indexed lpToken,
        uint256 lpAmount,
        uint256 receiptAmount,
        uint256 unlockAt
    );

    event PositionRedeemed(
        uint256 indexed positionId,
        address indexed owner,
        address indexed lpToken,
        uint256 lpReturned,
        uint256 bonusPaid
    );

    constructor(
        address initialOwner,
        address receiptTokenAddress,
        address bonusReserveManagerAddress
    ) Ownable(initialOwner) {
        require(receiptTokenAddress != address(0), "Invalid receipt token");
        require(bonusReserveManagerAddress != address(0), "Invalid bonus reserve manager");

        receiptToken = receiptTokenAddress;
        bonusReserveManager = bonusReserveManagerAddress;
    }

    function depositLP(
        address lpToken,
        uint256 lpAmount,
        uint256 receiptAmount
    ) external returns (uint256 positionId) {
        require(lpToken != address(0), "Invalid LP token");
        require(lpAmount > 0, "LP amount must be > 0");
        require(receiptAmount > 0, "Receipt amount must be > 0");

        positionId = nextPositionId;
        nextPositionId++;

        positions[positionId] = VaultPosition({
            id: positionId,
            owner: msg.sender,
            lpToken: lpToken,
            lpAmount: lpAmount,
            receiptAmount: receiptAmount,
            lockedAt: block.timestamp,
            unlockAt: block.timestamp + LOCK_PERIOD,
            redeemed: false,
            exists: true
        });

        userPositions[msg.sender].push(positionId);

        IReceiptToken(receiptToken).mint(msg.sender, receiptAmount);

        emit PositionCreated(
            positionId,
            msg.sender,
            lpToken,
            lpAmount,
            receiptAmount,
            block.timestamp + LOCK_PERIOD
        );
    }

    function redeemPosition(uint256 positionId) external returns (uint256 bonusPaid) {
        VaultPosition storage position = positions[positionId];
        require(position.exists, "Position not found");
        require(position.owner == msg.sender, "Not position owner");
        require(!position.redeemed, "Already redeemed");
        require(block.timestamp >= position.unlockAt, "Position still locked");

        position.redeemed = true;

        IReceiptToken(receiptToken).burn(msg.sender, position.receiptAmount);

        if (IBonusReserveManager(bonusReserveManager).hasReserve(position.lpToken)) {
            bonusPaid = IBonusReserveManager(bonusReserveManager).payBonus(
                position.lpToken,
                position.lpAmount / 100
            );
        }

        emit PositionRedeemed(
            positionId,
            msg.sender,
            position.lpToken,
            position.lpAmount,
            bonusPaid
        );
    }

    function getPosition(uint256 positionId) external view returns (VaultPosition memory) {
        require(positions[positionId].exists, "Position not found");
        return positions[positionId];
    }

    function getUserPositionIds(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getUserPositions(address user) external view returns (VaultPosition[] memory) {
        uint256[] memory ids = userPositions[user];
        VaultPosition[] memory result = new VaultPosition[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = positions[ids[i]];
        }

        return result;
    }

    function isRedeemable(uint256 positionId) external view returns (bool) {
        VaultPosition memory position = positions[positionId];
        require(position.exists, "Position not found");
        return !position.redeemed && block.timestamp >= position.unlockAt;
    }
}
