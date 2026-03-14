// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StudentTokenRegistry is Ownable {
    enum TokenStatus {
        Draft,
        Registered,
        PoolCreated,
        Tradable,
        Hidden,
        Blocked
    }

    struct TokenRecord {
        address token;
        address creator;
        string title;
        string symbol;
        string description;
        string category;
        string logoUrl;
        address baseToken;
        bool bonusEnabled;
        address rewardAsset;
        uint256 bonusReserve;
        uint256 createdAt;
        TokenStatus status;
        bool exists;
    }

    mapping(address => TokenRecord) private records;
    address[] private tokenList;

    event TokenRegistered(
        address indexed token,
        address indexed creator,
        string title,
        string symbol,
        address indexed baseToken,
        bool bonusEnabled,
        address rewardAsset,
        uint256 bonusReserve
    );

    event TokenStatusUpdated(address indexed token, TokenStatus newStatus);
    event BonusReserveUpdated(address indexed token, uint256 newBonusReserve);
    event LogoUpdated(address indexed token, string newLogoUrl);
    event DescriptionUpdated(address indexed token, string newDescription);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerToken(
        address token,
        string calldata title,
        string calldata symbol,
        string calldata description,
        string calldata category,
        string calldata logoUrl,
        address baseToken,
        bool bonusEnabled,
        address rewardAsset,
        uint256 bonusReserve
    ) external {
        require(token != address(0), "Invalid token address");
        require(baseToken != address(0), "Invalid base token");
        require(bytes(title).length > 0, "Title required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(!records[token].exists, "Token already registered");

        if (bonusEnabled) {
            require(rewardAsset != address(0), "Reward asset required");
        }

        records[token] = TokenRecord({
            token: token,
            creator: msg.sender,
            title: title,
            symbol: symbol,
            description: description,
            category: category,
            logoUrl: logoUrl,
            baseToken: baseToken,
            bonusEnabled: bonusEnabled,
            rewardAsset: rewardAsset,
            bonusReserve: bonusReserve,
            createdAt: block.timestamp,
            status: TokenStatus.Registered,
            exists: true
        });

        tokenList.push(token);

        emit TokenRegistered(
            token,
            msg.sender,
            title,
            symbol,
            baseToken,
            bonusEnabled,
            rewardAsset,
            bonusReserve
        );
    }

    function updateStatus(address token, TokenStatus newStatus) external {
        TokenRecord storage record = records[token];
        require(record.exists, "Token not found");
        require(
            msg.sender == record.creator || msg.sender == owner(),
            "Not authorized"
        );

        record.status = newStatus;
        emit TokenStatusUpdated(token, newStatus);
    }

    function updateBonusReserve(address token, uint256 newBonusReserve) external {
        TokenRecord storage record = records[token];
        require(record.exists, "Token not found");
        require(
            msg.sender == record.creator || msg.sender == owner(),
            "Not authorized"
        );
        require(record.bonusEnabled, "Bonus not enabled");

        record.bonusReserve = newBonusReserve;
        emit BonusReserveUpdated(token, newBonusReserve);
    }

    function updateLogo(address token, string calldata newLogoUrl) external {
        TokenRecord storage record = records[token];
        require(record.exists, "Token not found");
        require(
            msg.sender == record.creator || msg.sender == owner(),
            "Not authorized"
        );

        record.logoUrl = newLogoUrl;
        emit LogoUpdated(token, newLogoUrl);
    }

    function updateDescription(address token, string calldata newDescription) external {
        TokenRecord storage record = records[token];
        require(record.exists, "Token not found");
        require(
            msg.sender == record.creator || msg.sender == owner(),
            "Not authorized"
        );

        record.description = newDescription;
        emit DescriptionUpdated(token, newDescription);
    }

    function getToken(address token) external view returns (TokenRecord memory) {
        require(records[token].exists, "Token not found");
        return records[token];
    }

    function isRegistered(address token) external view returns (bool) {
        return records[token].exists;
    }

    function getAllTokens() external view returns (TokenRecord[] memory) {
        uint256 length = tokenList.length;
        TokenRecord[] memory result = new TokenRecord[](length);

        for (uint256 i = 0; i < length; i++) {
            result[i] = records[tokenList[i]];
        }

        return result;
    }

    function getTokenAddresses() external view returns (address[] memory) {
        return tokenList;
    }

    function totalTokens() external view returns (uint256) {
        return tokenList.length;
    }
}
