// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2FactoryLike {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IAllowedBaseTokensLike {
    function isAllowed(address token) external view returns (bool);
}

interface IStudentTokenRegistryLike {
    function isRegistered(address token) external view returns (bool);
}

contract PairLauncher is Ownable {
    address public immutable factory;
    address public immutable registry;
    address public immutable allowedBaseTokens;

    struct PairRecord {
        address token;
        address baseToken;
        address pair;
        address creator;
        uint256 createdAt;
        bool exists;
    }

    mapping(bytes32 => PairRecord) private pairRecords;
    bytes32[] private pairKeys;

    event PairCreated(
        address indexed token,
        address indexed baseToken,
        address indexed pair,
        address creator
    );

    constructor(
        address initialOwner,
        address factoryAddress,
        address registryAddress,
        address allowedBaseTokensAddress
    ) Ownable(initialOwner) {
        require(factoryAddress != address(0), "Invalid factory");
        require(registryAddress != address(0), "Invalid registry");
        require(allowedBaseTokensAddress != address(0), "Invalid allowed base tokens");

        factory = factoryAddress;
        registry = registryAddress;
        allowedBaseTokens = allowedBaseTokensAddress;
    }

    function launchPair(address token, address baseToken) external returns (address pair) {
        require(token != address(0), "Invalid token");
        require(baseToken != address(0), "Invalid base token");
        require(token != baseToken, "Identical addresses");

        require(
            IStudentTokenRegistryLike(registry).isRegistered(token),
            "Token not registered"
        );

        bool baseAllowed =
            IAllowedBaseTokensLike(allowedBaseTokens).isAllowed(baseToken) ||
            IStudentTokenRegistryLike(registry).isRegistered(baseToken);

        require(baseAllowed, "Base token not allowed");

        IUniswapV2FactoryLike uniFactory = IUniswapV2FactoryLike(factory);

        pair = uniFactory.getPair(token, baseToken);
        require(pair == address(0), "Pair already exists");

        pair = uniFactory.createPair(token, baseToken);
        require(pair != address(0), "Pair creation failed");

        bytes32 key = getPairKey(token, baseToken);
        pairRecords[key] = PairRecord({
            token: token,
            baseToken: baseToken,
            pair: pair,
            creator: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        pairKeys.push(key);

        emit PairCreated(token, baseToken, pair, msg.sender);
    }

    function pairExists(address token, address baseToken) external view returns (bool) {
        address pair = IUniswapV2FactoryLike(factory).getPair(token, baseToken);
        return pair != address(0);
    }

    function getExistingPair(address token, address baseToken) external view returns (address) {
        return IUniswapV2FactoryLike(factory).getPair(token, baseToken);
    }

    function getPairRecord(address token, address baseToken) external view returns (PairRecord memory) {
        bytes32 key = getPairKey(token, baseToken);
        require(pairRecords[key].exists, "Pair record not found");
        return pairRecords[key];
    }

    function getAllPairRecords() external view returns (PairRecord[] memory) {
        PairRecord[] memory result = new PairRecord[](pairKeys.length);

        for (uint256 i = 0; i < pairKeys.length; i++) {
            result[i] = pairRecords[pairKeys[i]];
        }

        return result;
    }

    function totalPairs() external view returns (uint256) {
        return pairKeys.length;
    }

    function getPairKey(address token, address baseToken) public pure returns (bytes32) {
        return token < baseToken
            ? keccak256(abi.encodePacked(token, baseToken))
            : keccak256(abi.encodePacked(baseToken, token));
    }
}
