// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SYNXVesting
 * @author SYNAPEX Protocol
 * @notice Linear vesting with optional cliff and TGE unlock.
 *
 * Vesting formula: vested = tgeAmount + (total - tgeAmount) * min(elapsed, duration) / duration
 * after cliff has passed.
 *
 * Whitepaper schedules:
 * - IDO:        30% TGE, 70% over 6mo
 * - Ecosystem:  3yr linear, monthly claims
 * - Team:       1yr cliff, 3yr linear
 * - Foundation: 2yr cliff, 3yr linear
 * - Strategic/Private: 6mo cliff, 18mo linear
 * - Airdrop:    TGE + 6mo linear
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract SYNXVesting {
    IERC20 public immutable token;
    address public immutable beneficiary;
    uint256 public immutable totalAllocation;
    uint256 public immutable tgeAmount;
    uint256 public immutable startTime;
    uint256 public immutable cliffEnd;
    uint256 public immutable vestingEnd;

    uint256 public released;

    event TokensReleased(address indexed beneficiary, uint256 amount);

    error ZeroAddress();
    error NoTokensToRelease();
    error InvalidParams();

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
        if (token_ == address(0) || beneficiary_ == address(0)) revert ZeroAddress();
        if (totalAllocation_ == 0 || vestingMonths_ == 0) revert InvalidParams();
        if (tgeBasisPoints_ > 10000) revert InvalidParams();

        token = IERC20(token_);
        beneficiary = beneficiary_;
        totalAllocation = totalAllocation_;
        tgeAmount = (totalAllocation_ * tgeBasisPoints_) / 10000;
        startTime = block.timestamp;
        cliffEnd = startTime + (cliffMonths_ * 30 days);
        vestingEnd = cliffEnd + (vestingMonths_ * 30 days);

        if (tgeAmount > 0) {
            released = tgeAmount;
            require(token.transfer(beneficiary_, tgeAmount), "TGE transfer failed");
            emit TokensReleased(beneficiary_, tgeAmount);
        }
    }

    function vestedAmount() public view returns (uint256) {
        if (block.timestamp < cliffEnd) return released;

        uint256 linearTotal = totalAllocation - tgeAmount;
        if (linearTotal == 0) return totalAllocation;

        if (block.timestamp >= vestingEnd) return totalAllocation;

        uint256 elapsed = block.timestamp - cliffEnd;
        uint256 duration = vestingEnd - cliffEnd;
        uint256 linearVested = (linearTotal * elapsed) / duration;
        return tgeAmount + linearVested;
    }

    function release() external {
        uint256 vested = vestedAmount();
        uint256 toRelease = vested - released;
        if (toRelease == 0) revert NoTokensToRelease();

        released += toRelease;
        require(token.transfer(beneficiary, toRelease), "Transfer failed");
        emit TokensReleased(beneficiary, toRelease);
    }

    function releasable() external view returns (uint256) {
        return vestedAmount() - released;
    }
}
