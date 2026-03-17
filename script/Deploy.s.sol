// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts/SYNXToken.sol";
import "../contracts/SYNXVesting.sol";
import "../contracts/FeeBurner.sol";
import "../contracts/GovernanceGuard.sol";

/**
 * @title DeployScript
 * @notice Deployment for SYNAPEX Protocol. Use with Foundry:
 *   forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC --broadcast
 *
 * Allocations (1B total):
 *   IDO 20% | Ecosystem 20% | Team 15% | Foundation 13%
 *   Liquidity 15% | Strategic 10% | Private 7% | Airdrop 5%
 */
contract DeployScript {
    uint256 constant ONE = 10**18;

    function run() external returns (address synxAddr, address feeBurnerAddr, address guardAddr) {
        // 1. Token
        SYNXToken synx = new SYNXToken();
        synxAddr = address(synx);

        // 2. FeeBurner (5% platform fee burn)
        FeeBurner feeBurner = new FeeBurner(synxAddr);
        feeBurnerAddr = address(feeBurner);

        // 3. GovernanceGuard (>5% disclosure)
        GovernanceGuard guard = new GovernanceGuard(synxAddr, msg.sender);
        guardAddr = address(guard);

        // 4. Example vesting: Ecosystem (20%, 3yr linear)
        SYNXVesting vest = new SYNXVesting(
            synxAddr,
            msg.sender,          // beneficiary - set in production
            200_000_000 * ONE,   // 200M
            0, 0, 36             // no TGE, no cliff, 36mo vesting
        );
        synx.transfer(address(vest), 200_000_000 * ONE);
        guard.addExempt(address(vest));
    }
}
