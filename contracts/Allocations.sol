// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Allocations
 * @author SYNAPEX Protocol
 * @notice Constants for SYNX token allocation per whitepaper.
 * @dev All values in 18 decimals. Total = 1,000,000,000 * 10**18
 */
library Allocations {
    uint256 constant DECIMALS = 18;
    uint256 constant ONE_TOKEN = 10**DECIMALS;

    // Allocation amounts (tokens * 10^18)
    uint256 internal constant PUBLIC_IDO       = 200_000_000 * ONE_TOKEN;   // 20%
    uint256 internal constant ECOSYSTEM        = 200_000_000 * ONE_TOKEN;   // 20%
    uint256 internal constant TEAM            = 150_000_000 * ONE_TOKEN;   // 15%
    uint256 internal constant FOUNDATION      = 130_000_000 * ONE_TOKEN;   // 13%
    uint256 internal constant LIQ_DEX_LAUNCH  =  50_000_000 * ONE_TOKEN;   //  5%
    uint256 internal constant LIQ_DEX_GROWTH =  50_000_000 * ONE_TOKEN;   //  5%
    uint256 internal constant LIQ_CEX        =  50_000_000 * ONE_TOKEN;   //  5%
    uint256 internal constant STRATEGIC      = 100_000_000 * ONE_TOKEN;   // 10%
    uint256 internal constant PRIVATE        =  70_000_000 * ONE_TOKEN;   //  7%
    uint256 internal constant AIRDROP        =  50_000_000 * ONE_TOKEN;   //  5%
}
