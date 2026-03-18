// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SYNXVesting
 * @author SYNAPEX Protocol
 * @notice Linear vesting with optional cliff and TGE unlock. Audit-ready.
 *
 * Vesting: vested = tgeAmount + (total - tgeAmount) * min(elapsed, duration) / duration
 * after cliff has passed.
 *
 * Whitepaper schedules:
 * - IDO: 30% TGE, 70% over 6mo | Ecosystem: 3yr linear
 * - Team: 1yr cliff, 3yr linear | Foundation: 2yr cliff, 3yr linear
 * - Strategic/Private: 6mo cliff, 18mo linear | Airdrop: TGE + 6mo linear
 */
contract SYNXVesting is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 private immutable _token;
    address private immutable _beneficiary;
    uint256 private immutable _totalAllocation;
    uint256 private immutable _tgeAmount;
    uint256 private immutable _startTime;
    uint256 private immutable _cliffEnd;
    uint256 private immutable _vestingEnd;

    uint256 private _released;

    event TokensReleased(address indexed beneficiary, uint256 amount);

    error SYNXVestingZeroAddress();
    error SYNXVestingInvalidParams();
    error SYNXVestingNoTokensToRelease();

    /**
     * @param token_           SYNX token address
     * @param beneficiary_     Recipient of vested tokens
     * @param totalAllocation_ Total tokens for this allocation (18 decimals)
     * @param tgeBasisPoints_  TGE unlock in basis points (e.g. 3000 = 30%)
     * @param cliffMonths_     Cliff in months (0 = no cliff)
     * @param vestingMonths_   Linear vesting duration in months
     */
    constructor(
        address token_,
        address beneficiary_,
        uint256 totalAllocation_,
        uint256 tgeBasisPoints_,
        uint256 cliffMonths_,
        uint256 vestingMonths_
    ) {
        if (token_ == address(0) || beneficiary_ == address(0)) revert SYNXVestingZeroAddress();
        if (totalAllocation_ == 0 || vestingMonths_ == 0) revert SYNXVestingInvalidParams();
        if (tgeBasisPoints_ > 10000) revert SYNXVestingInvalidParams();

        _token = IERC20(token_);
        _beneficiary = beneficiary_;
        _totalAllocation = totalAllocation_;
        uint256 tgeAmt = (totalAllocation_ * tgeBasisPoints_) / 10000;
        _tgeAmount = tgeAmt;
        _startTime = block.timestamp;
        _cliffEnd = _startTime + (cliffMonths_ * 30 days);
        _vestingEnd = _cliffEnd + (vestingMonths_ * 30 days);

        if (tgeAmt > 0) {
            _released = tgeAmt;
            _token.safeTransfer(beneficiary_, tgeAmt);
            emit TokensReleased(beneficiary_, tgeAmt);
        }
    }

    function token() public view returns (IERC20) {
        return _token;
    }

    function beneficiary() public view returns (address) {
        return _beneficiary;
    }

    function totalAllocation() public view returns (uint256) {
        return _totalAllocation;
    }

    function released() public view returns (uint256) {
        return _released;
    }

    function vestedAmount() public view returns (uint256) {
        if (block.timestamp < _cliffEnd) return _released;

        uint256 linearTotal = _totalAllocation - _tgeAmount;
        if (linearTotal == 0) return _totalAllocation;

        if (block.timestamp >= _vestingEnd) return _totalAllocation;

        uint256 elapsed = block.timestamp - _cliffEnd;
        uint256 duration = _vestingEnd - _cliffEnd;
        uint256 linearVested = (linearTotal * elapsed) / duration;
        return _tgeAmount + linearVested;
    }

    /**
     * @notice Release vested tokens to beneficiary. Callable by anyone (assists UX).
     */
    function release() external nonReentrant {
        uint256 vested = vestedAmount();
        uint256 toRelease = vested - _released;
        if (toRelease == 0) revert SYNXVestingNoTokensToRelease();

        _released += toRelease;
        _token.safeTransfer(_beneficiary, toRelease);
        emit TokensReleased(_beneficiary, toRelease);
    }

    function releasable() external view returns (uint256) {
        return vestedAmount() - _released;
    }
}
