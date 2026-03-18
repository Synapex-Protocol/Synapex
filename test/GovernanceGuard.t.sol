// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SYNXToken.sol";
import "../contracts/GovernanceGuard.sol";

contract GovernanceGuardTest is Test {
    SYNXToken public token;
    GovernanceGuard public guard;

    address public owner;
    address public whale;

    function setUp() public {
        owner = address(this);
        whale = makeAddr("whale");
        token = new SYNXToken();
        guard = new GovernanceGuard(address(token), owner);

        token.transfer(whale, 60_000_000 * 10**18); // 6%
    }

    function test_ExceedsThreshold() public view {
        assertTrue(guard.exceedsThreshold(whale));
    }

    function test_AddExempt() public {
        guard.addExempt(whale);
        assertFalse(guard.exceedsThreshold(whale));
    }

    function test_OnlyOwnerAddExempt() public {
        vm.prank(whale);
        vm.expectRevert();
        guard.addExempt(whale);
    }
}
