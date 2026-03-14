// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice Allowed base tokens list (WETH + registered student tokens).
contract AllowedBaseTokens {
    address public owner;
    mapping(address => bool) public allowed;

    event BaseTokenUpdated(address indexed token, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address weth) {
        owner = msg.sender;
        allowed[weth] = true;
        emit BaseTokenUpdated(weth, true);
    }

    function setAllowed(address token, bool status) external onlyOwner {
        allowed[token] = status;
        emit BaseTokenUpdated(token, status);
    }

    function isAllowed(address token) external view returns (bool) {
        return allowed[token];
    }
}
