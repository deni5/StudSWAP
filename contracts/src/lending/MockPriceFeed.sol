// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function latestRoundData() external view returns (
        uint80 roundId, int256 answer, uint256 startedAt,
        uint256 updatedAt, uint80 answeredInRound
    );
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId, int256 answer, uint256 startedAt,
        uint256 updatedAt, uint80 answeredInRound
    );
}

contract MockPriceFeed is AggregatorV3Interface, Ownable {
    int256  private _price;
    uint256 private _updatedAt;
    uint80  private _roundId;
    uint8   public override decimals = 8;
    string  public override description;
    uint256 public override version = 1;

    event PriceUpdated(int256 price, uint256 timestamp, uint80 roundId);

    constructor(string memory _description) Ownable(msg.sender) {
        description = _description;
    }

    function updatePrice(int256 price) external onlyOwner {
        _roundId++;
        _price     = price;
        _updatedAt = block.timestamp;
        emit PriceUpdated(price, block.timestamp, _roundId);
    }

    function latestRoundData() external view override returns (
        uint80, int256, uint256, uint256, uint80
    ) {
        return (_roundId, _price, _updatedAt, _updatedAt, _roundId);
    }

    function getRoundData(uint80) external view override returns (
        uint80, int256, uint256, uint256, uint80
    ) {
        return (_roundId, _price, _updatedAt, _updatedAt, _roundId);
    }
}
