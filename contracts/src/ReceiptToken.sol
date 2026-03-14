// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReceiptToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    event MinterUpdated(address indexed account, bool allowed);

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner
    ) ERC20(name_, symbol_) Ownable(initialOwner) {}

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized minter");
        _;
    }

    function setMinter(address account, bool allowed) external onlyOwner {
        require(account != address(0), "Invalid minter");
        minters[account] = allowed;
        emit MinterUpdated(account, allowed);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyMinter {
        require(from != address(0), "Invalid holder");
        require(amount > 0, "Amount must be > 0");
        _burn(from, amount);
    }
}
