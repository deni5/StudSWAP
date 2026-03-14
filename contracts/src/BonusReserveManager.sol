// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BonusReserveManager is Ownable {
    struct BonusReserve {
        address token;
        uint256 totalReserved;
        uint256 totalPaid;
        bool exists;
    }

    mapping(address => BonusReserve) private reserves;
    address[] private reserveTokens;

    event BonusReserveSet(address indexed token, uint256 totalReserved);
    event BonusReserveIncreased(address indexed token, uint256 amountAdded, uint256 newTotalReserved);
    event BonusPaid(address indexed token, uint256 amountPaid, uint256 newTotalPaid);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setReserve(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token");

        if (!reserves[token].exists) {
            reserves[token] = BonusReserve({
                token: token,
                totalReserved: amount,
                totalPaid: 0,
                exists: true
            });
            reserveTokens.push(token);
        } else {
            reserves[token].totalReserved = amount;
        }

        emit BonusReserveSet(token, amount);
    }

    function increaseReserve(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(reserves[token].exists, "Reserve not found");

        reserves[token].totalReserved += amount;

        emit BonusReserveIncreased(token, amount, reserves[token].totalReserved);
    }

    function payBonus(address token, uint256 amount) external onlyOwner returns (uint256 paidAmount) {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(reserves[token].exists, "Reserve not found");

        uint256 remaining = getRemainingReserve(token);
        paidAmount = amount > remaining ? remaining : amount;

        reserves[token].totalPaid += paidAmount;

        emit BonusPaid(token, paidAmount, reserves[token].totalPaid);
    }

    function getReserve(address token) external view returns (BonusReserve memory) {
        require(reserves[token].exists, "Reserve not found");
        return reserves[token];
    }

    function getRemainingReserve(address token) public view returns (uint256) {
        require(reserves[token].exists, "Reserve not found");
        return reserves[token].totalReserved - reserves[token].totalPaid;
    }

    function hasReserve(address token) external view returns (bool) {
        return reserves[token].exists;
    }

    function getAllReserves() external view returns (BonusReserve[] memory) {
        BonusReserve[] memory result = new BonusReserve[](reserveTokens.length);

        for (uint256 i = 0; i < reserveTokens.length; i++) {
            result[i] = reserves[reserveTokens[i]];
        }

        return result;
    }

    function totalReserveTokens() external view returns (uint256) {
        return reserveTokens.length;
    }
}
