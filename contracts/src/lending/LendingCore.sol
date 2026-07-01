// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (
        uint80, int256, uint256, uint256, uint80
    );
}

interface IPairRegistry {
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
    function getPairConfig(address, address) external view returns (PairConfig memory);
    function isPairAllowed(address, address) external view returns (bool);
}

contract LendingCore is AccessControl, ReentrancyGuard, Pausable {

    bytes32 public constant PARAM_ADMIN_ROLE = keccak256("PARAM_ADMIN_ROLE");
    bytes32 public constant RISK_ADMIN_ROLE  = keccak256("RISK_ADMIN_ROLE");

    uint256 public constant RAY  = 1e27;
    uint256 public constant YEAR = 365 days;

    struct AssetConfig {
        address priceFeed;
        uint32  staleAfter;
        uint16  ltvBaseBps;
        uint16  liqThresholdBaseBps;
        bool    enabled;
        bool    isStableDebt;
    }

    struct MarketState {
        uint128 totalLiquidityShares;
        uint128 totalScaledDebt;
        uint128 borrowIndexRay;
        uint128 reserveBalance;
        uint64  lastAccrualTimestamp;
        uint16  lastUtilizationBps;
        uint16  optimalUtilizationBps;
        uint16  slope1Bps;
        uint16  slope2Bps;
        uint16  baseRateBps;
        bool    borrowPaused;
        bool    withdrawPaused;
    }

    struct Position {
        uint128 collateralAmount;
        uint128 scaledDebt;
        address collateralAsset;
        address debtAsset;
        uint64  openedAt;
        uint64  updatedAt;
    }

    struct RiskParams {
        uint16  reserveFactorBps;
        uint16  closingFactorBps;
        uint16  liquidationBonusBps;
    }

    mapping(address => AssetConfig)  public assetConfigs;
    mapping(address => MarketState)  public marketStates;
    mapping(address => mapping(address => mapping(address => Position))) public positions;

    RiskParams     public riskParams;
    IPairRegistry  public pairRegistry;

    event LiquiditySupplied(address indexed user, address indexed asset, uint256 amount);
    event LiquidityWithdrawn(address indexed user, address indexed asset, uint256 amount);
    event CollateralDeposited(address indexed user, address indexed collateral, address indexed debt, uint256 amount);
    event Borrowed(address indexed user, address indexed collateral, address indexed debt, uint256 amount, uint256 hfAfter);
    event Repaid(address indexed user, address indexed collateral, address indexed debt, uint256 amount);
    event CollateralWithdrawn(address indexed user, address indexed collateral, address indexed debt, uint256 amount, uint256 hfAfter);
    event Liquidated(address indexed liquidator, address indexed borrower, address indexed collateral, address debt, uint256 repaid, uint256 seized);
    event GuardTriggered(address indexed collateral, address indexed debt, uint256 currentRatio, uint256 refRatio);
    event AssetConfigured(address indexed asset, address priceFeed, uint16 ltvBps);
    event InterestAccrued(address indexed asset, uint128 newIndex);

    constructor(address paramAdmin, address riskAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PARAM_ADMIN_ROLE, paramAdmin);
        _grantRole(RISK_ADMIN_ROLE, riskAdmin);
    }

    // ── Admin ────────────────────────────────────────────────────────

    function setPairRegistry(address registry) external onlyRole(PARAM_ADMIN_ROLE) {
        pairRegistry = IPairRegistry(registry);
    }

    function configureAsset(
        address asset,
        address priceFeed,
        uint32  staleAfter,
        uint16  ltvBaseBps,
        uint16  liqThresholdBaseBps,
        bool    enabled,
        bool    isStableDebt
    ) external onlyRole(PARAM_ADMIN_ROLE) {
        assetConfigs[asset] = AssetConfig(priceFeed, staleAfter, ltvBaseBps, liqThresholdBaseBps, enabled, isStableDebt);
        // Ініціалізація ринку
        if (marketStates[asset].borrowIndexRay == 0) {
            marketStates[asset].borrowIndexRay       = uint128(RAY);
            marketStates[asset].lastAccrualTimestamp = uint64(block.timestamp);
            marketStates[asset].optimalUtilizationBps = 8000;
            marketStates[asset].slope1Bps             = 800;
            marketStates[asset].slope2Bps             = 3000;
            marketStates[asset].baseRateBps            = 200;
        }
        emit AssetConfigured(asset, priceFeed, ltvBaseBps);
    }

    function setRiskParams(
        uint16 reserveFactorBps,
        uint16 closingFactorBps,
        uint16 liquidationBonusBps
    ) external onlyRole(PARAM_ADMIN_ROLE) {
        riskParams = RiskParams(reserveFactorBps, closingFactorBps, liquidationBonusBps);
    }

    function pauseAll()   external onlyRole(PARAM_ADMIN_ROLE) { _pause(); }
    function unpauseAll() external onlyRole(PARAM_ADMIN_ROLE) { _unpause(); }

    // ── Supply Liquidity ────────────────────────────────────────────

    function supplyLiquidity(address debtAsset, uint256 amount)
        external nonReentrant whenNotPaused
    {
        require(assetConfigs[debtAsset].enabled, "Asset not enabled");
        _accrueInterest(debtAsset);
        IERC20(debtAsset).transferFrom(msg.sender, address(this), amount);
        marketStates[debtAsset].totalLiquidityShares += uint128(amount);
        emit LiquiditySupplied(msg.sender, debtAsset, amount);
    }

    function withdrawLiquidity(address debtAsset, uint256 amount)
        external nonReentrant whenNotPaused
    {
        _accrueInterest(debtAsset);
        require(marketStates[debtAsset].totalLiquidityShares >= uint128(amount), "Insufficient liquidity");
        marketStates[debtAsset].totalLiquidityShares -= uint128(amount);
        IERC20(debtAsset).transfer(msg.sender, amount);
        emit LiquidityWithdrawn(msg.sender, debtAsset, amount);
    }

    // ── Deposit Collateral ──────────────────────────────────────────

    function depositCollateral(address collateralAsset, address debtAsset, uint256 amount)
        external nonReentrant whenNotPaused
    {
        require(assetConfigs[collateralAsset].enabled, "Collateral not enabled");
        require(pairRegistry.isPairAllowed(collateralAsset, debtAsset), "Pair not allowed");
        IERC20(collateralAsset).transferFrom(msg.sender, address(this), amount);
        Position storage pos = positions[msg.sender][collateralAsset][debtAsset];
        pos.collateralAmount += uint128(amount);
        pos.collateralAsset   = collateralAsset;
        pos.debtAsset         = debtAsset;
        if (pos.openedAt == 0) pos.openedAt = uint64(block.timestamp);
        pos.updatedAt = uint64(block.timestamp);
        emit CollateralDeposited(msg.sender, collateralAsset, debtAsset, amount);
    }

    // ── Borrow ──────────────────────────────────────────────────────

    function borrow(address collateralAsset, address debtAsset, uint256 amount)
        external nonReentrant whenNotPaused
    {
        require(!marketStates[debtAsset].borrowPaused, "Borrow paused");
        require(pairRegistry.isPairAllowed(collateralAsset, debtAsset), "Pair not allowed");
        _accrueInterest(debtAsset);

        // Guard перевірка
        _checkGuard(collateralAsset, debtAsset);

        MarketState storage m = marketStates[debtAsset];
        require(m.totalLiquidityShares >= uint128(amount), "Insufficient liquidity");

        uint128 scaledDebt = uint128(amount * RAY / m.borrowIndexRay);
        Position storage pos = positions[msg.sender][collateralAsset][debtAsset];
        pos.scaledDebt += scaledDebt;
        pos.updatedAt   = uint64(block.timestamp);

        m.totalScaledDebt      += scaledDebt;
        m.totalLiquidityShares -= uint128(amount);

        // HF перевірка
        uint256 hf = _getHF(msg.sender, collateralAsset, debtAsset);
        require(hf >= RAY, "HF below 1 after borrow");

        IERC20(debtAsset).transfer(msg.sender, amount);
        emit Borrowed(msg.sender, collateralAsset, debtAsset, amount, hf);
    }

    // ── Repay ───────────────────────────────────────────────────────

    function repay(address collateralAsset, address debtAsset, uint256 amount)
        external nonReentrant
    {
        _accrueInterest(debtAsset);
        MarketState storage m = marketStates[debtAsset];
        Position storage pos = positions[msg.sender][collateralAsset][debtAsset];

        uint256 currentDebt = uint256(pos.scaledDebt) * m.borrowIndexRay / RAY;
        uint256 repayAmount = amount > currentDebt ? currentDebt : amount;

        uint128 scaledRepay   = uint128(repayAmount * RAY / m.borrowIndexRay);
        pos.scaledDebt        -= scaledRepay;
        m.totalScaledDebt     -= scaledRepay;
        m.totalLiquidityShares += uint128(repayAmount);
        pos.updatedAt = uint64(block.timestamp);

        IERC20(debtAsset).transferFrom(msg.sender, address(this), repayAmount);
        emit Repaid(msg.sender, collateralAsset, debtAsset, repayAmount);
    }

    // ── Withdraw Collateral ─────────────────────────────────────────

    function withdrawCollateral(address collateralAsset, address debtAsset, uint256 amount)
        external nonReentrant whenNotPaused
    {
        Position storage pos = positions[msg.sender][collateralAsset][debtAsset];
        require(pos.collateralAmount >= uint128(amount), "Insufficient collateral");
        pos.collateralAmount -= uint128(amount);

        uint256 hf = _getHF(msg.sender, collateralAsset, debtAsset);
        require(hf >= RAY || pos.scaledDebt == 0, "HF below 1");

        IERC20(collateralAsset).transfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, collateralAsset, debtAsset, amount, hf);
    }

    // ── Liquidate ───────────────────────────────────────────────────

    function liquidate(
        address borrower,
        address collateralAsset,
        address debtAsset,
        uint256 repayAmount
    ) external nonReentrant {
        _accrueInterest(debtAsset);

        uint256 hf = _getHF(borrower, collateralAsset, debtAsset);
        require(hf < RAY, "Position healthy");

        MarketState storage m   = marketStates[debtAsset];
        Position storage pos    = positions[borrower][collateralAsset][debtAsset];
        uint256 currentDebt     = uint256(pos.scaledDebt) * m.borrowIndexRay / RAY;
        uint256 maxRepay        = currentDebt * riskParams.closingFactorBps / 10000;
        require(repayAmount <= maxRepay, "Exceeds close factor");

        (uint256 collPrice,) = _getPrice(collateralAsset);
        (uint256 debtPrice,) = _getPrice(debtAsset);

        uint256 seized = repayAmount * debtPrice / collPrice
            * (10000 + riskParams.liquidationBonusBps) / 10000;
        require(seized <= pos.collateralAmount, "Insufficient collateral");

        uint128 scaledRepay     = uint128(repayAmount * RAY / m.borrowIndexRay);
        pos.scaledDebt         -= scaledRepay;
        pos.collateralAmount   -= uint128(seized);
        m.totalScaledDebt      -= scaledRepay;
        m.totalLiquidityShares += uint128(repayAmount);

        IERC20(debtAsset).transferFrom(msg.sender, address(this), repayAmount);
        IERC20(collateralAsset).transfer(msg.sender, seized);
        emit Liquidated(msg.sender, borrower, collateralAsset, debtAsset, repayAmount, seized);
    }

    // ── View ─────────────────────────────────────────────────────────

    function getHealthFactor(address user, address collateralAsset, address debtAsset)
        external view returns (uint256)
    {
        return _getHF(user, collateralAsset, debtAsset);
    }

    function getLiquidationPrice(address user, address collateralAsset, address debtAsset)
        external view returns (uint256)
    {
        Position storage pos = positions[user][collateralAsset][debtAsset];
        MarketState storage m = marketStates[debtAsset];
        IPairRegistry.PairConfig memory cfg = pairRegistry.getPairConfig(collateralAsset, debtAsset);
        if (pos.collateralAmount == 0 || cfg.effectiveLiqThBps == 0) return 0;
        uint256 currentDebt = uint256(pos.scaledDebt) * m.borrowIndexRay / RAY;
        (uint256 debtPrice,) = _getPrice(debtAsset);
        return currentDebt * debtPrice * 10000
            / (uint256(pos.collateralAmount) * cfg.effectiveLiqThBps);
    }

    function getBorrowRate(address debtAsset) external view returns (uint256) {
        return _calcBorrowRate(debtAsset);
    }

    function isGuardActive(address collateralAsset, address debtAsset)
        external view returns (bool)
    {
        IPairRegistry.PairConfig memory cfg = pairRegistry.getPairConfig(collateralAsset, debtAsset);
        if (cfg.referenceRatioRay == 0 || cfg.guardThresholdBps == 0) return false;
        (uint256 collPrice,) = _getPrice(collateralAsset);
        (uint256 debtPrice,) = _getPrice(debtAsset);
        uint256 currentRatio = collPrice * RAY / debtPrice;
        uint256 threshold    = uint256(cfg.referenceRatioRay)
            * (10000 - cfg.guardThresholdBps) / 10000;
        return currentRatio <= threshold;
    }

    // ── Internal ─────────────────────────────────────────────────────

    function _getHF(address user, address collateralAsset, address debtAsset)
        internal view returns (uint256)
    {
        Position storage pos  = positions[user][collateralAsset][debtAsset];
        MarketState storage m = marketStates[debtAsset];
        IPairRegistry.PairConfig memory cfg = pairRegistry.getPairConfig(collateralAsset, debtAsset);
        uint256 currentDebt = uint256(pos.scaledDebt) * m.borrowIndexRay / RAY;
        if (currentDebt == 0) return type(uint256).max;
        (uint256 collPrice,) = _getPrice(collateralAsset);
        (uint256 debtPrice,) = _getPrice(debtAsset);
        uint256 collValue = uint256(pos.collateralAmount) * collPrice / 1e18
            * cfg.effectiveLiqThBps / 10000;
        uint256 debtValue = currentDebt * debtPrice / 1e18;
        return collValue * RAY / debtValue;
    }

    function _getPrice(address asset) internal view returns (uint256 price, uint256 updatedAt) {
        AssetConfig storage cfg = assetConfigs[asset];
        require(cfg.priceFeed != address(0), "No price feed");
        AggregatorV3Interface feed = AggregatorV3Interface(cfg.priceFeed);
        (, int256 answer,, uint256 ts,) = feed.latestRoundData();
        require(answer > 0, "Invalid price");
        require(block.timestamp - ts <= cfg.staleAfter, "Stale price");
        uint8 dec = feed.decimals();
        price = uint256(answer) * 1e18 / (10 ** uint256(dec));
        updatedAt = ts;
    }

    function _checkGuard(address collateralAsset, address debtAsset) internal {
        IPairRegistry.PairConfig memory cfg = pairRegistry.getPairConfig(collateralAsset, debtAsset);
        if (cfg.referenceRatioRay == 0 || cfg.guardThresholdBps == 0) return;
        (uint256 collPrice,) = _getPrice(collateralAsset);
        (uint256 debtPrice,) = _getPrice(debtAsset);
        uint256 currentRatio = collPrice * RAY / debtPrice;
        uint256 threshold    = uint256(cfg.referenceRatioRay)
            * (10000 - cfg.guardThresholdBps) / 10000;
        if (currentRatio <= threshold) {
            emit GuardTriggered(collateralAsset, debtAsset, currentRatio, uint256(cfg.referenceRatioRay));
            revert("Guard threshold triggered");
        }
    }

    function _calcBorrowRate(address debtAsset) internal view returns (uint256) {
        MarketState storage m = marketStates[debtAsset];
        uint256 totalDebt  = uint256(m.totalScaledDebt) * m.borrowIndexRay / RAY;
        uint256 totalFunds = totalDebt + m.totalLiquidityShares;
        if (totalFunds == 0) return uint256(m.baseRateBps) * RAY / 10000;
        uint256 utilBps = totalDebt * 10000 / totalFunds;
        uint256 rateBps;
        if (utilBps <= m.optimalUtilizationBps) {
            rateBps = m.baseRateBps + m.slope1Bps * utilBps / m.optimalUtilizationBps;
        } else {
            rateBps = m.baseRateBps + m.slope1Bps
                + m.slope2Bps * (utilBps - m.optimalUtilizationBps)
                / (10000 - m.optimalUtilizationBps);
        }
        return rateBps * RAY / 10000;
    }

    function _accrueInterest(address debtAsset) internal {
        MarketState storage m = marketStates[debtAsset];
        if (m.borrowIndexRay == 0) {
            m.borrowIndexRay       = uint128(RAY);
            m.lastAccrualTimestamp = uint64(block.timestamp);
            return;
        }
        uint256 elapsed = block.timestamp - m.lastAccrualTimestamp;
        if (elapsed == 0) return;
        uint256 rate    = _calcBorrowRate(debtAsset);
        uint256 factor  = RAY + rate * elapsed / YEAR;
        m.borrowIndexRay       = uint128(uint256(m.borrowIndexRay) * factor / RAY);
        m.lastAccrualTimestamp = uint64(block.timestamp);
        emit InterestAccrued(debtAsset, m.borrowIndexRay);
    }
}
