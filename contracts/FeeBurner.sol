// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FeeBurner
 * @author SYNAPEX Protocol
 * @notice Permanently burns 5% of platform fees. Immutable — no governance override.
 *
 * Per whitepaper: "5% of all platform fees — compute purchases, model access,
 * laboratory transactions — are permanently and irrevocably burned at the smart
 * contract level. No governance vote can override this."
 *
 * Flow: Platform routes 5% of each fee to this contract. Anyone may call
 * burnReceived() to burn the accumulated SYNX, removing it from supply forever.
 */
interface ISYNX {
    function burn(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

contract FeeBurner {
    ISYNX public immutable synx;

    event Burned(uint256 amount);

    error ZeroAddress();
    error NothingToBurn();

    constructor(address synx_) {
        if (synx_ == address(0)) revert ZeroAddress();
        synx = ISYNX(synx_);
    }

    /**
     * @notice Burn all SYNX held by this contract (5% of fees routed here by platform)
     */
    function burnReceived() external {
        uint256 amount = synx.balanceOf(address(this));
        if (amount == 0) revert NothingToBurn();
        synx.burn(amount);
        emit Burned(amount);
    }

    /**
     * @notice View balance awaiting burn
     */
    function pendingBurn() external view returns (uint256) {
        return synx.balanceOf(address(this));
    }
}
