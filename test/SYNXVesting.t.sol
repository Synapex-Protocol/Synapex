// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SYNXToken.sol";
import "../contracts/SYNXVesting.sol";

contract SYNXVestingTest is Test {
    SYNXToken public token;
    SYNXVesting public vest;

    address public beneficiary;
    uint256 constant ALLOC = 100_000 * 10**18;
    uint256 constant ONE_MONTH = 30 days;

    function setUp() public {
        token = new SYNXToken();
        beneficiary = makeAddr("beneficiary");
        vest = new SYNXVesting(
            address(token),
            beneficiary,
            ALLOC,
            3000,  // 30% TGE
            0,     // no cliff
            6      // 6mo vesting
        );
        token.transfer(address(vest), ALLOC);
    }

    function test_TGERelease() public view {
        uint256 expectedTGE = (ALLOC * 3000) / 10000;
        assertEq(token.balanceOf(beneficiary), expectedTGE);
        assertEq(vest.released(), expectedTGE);
    }

    function test_ReleasableAfterCliff() public {
        uint256 tge = (ALLOC * 3000) / 10000;
        vm.warp(block.timestamp + ONE_MONTH);
        uint256 releasable = vest.releasable();
        assertGt(releasable, 0);
        vest.release();
        assertGt(token.balanceOf(beneficiary), tge);
    }

    function test_FullVestingAtEnd() public {
        vm.warp(block.timestamp + 6 * ONE_MONTH + 1);
        vest.release();
        assertEq(token.balanceOf(beneficiary), ALLOC);
        assertEq(vest.released(), ALLOC);
    }

    function test_NoReleaseBeforeVest() public {
        vm.warp(block.timestamp + 1 days);
        uint256 releasable = vest.releasable();
        assertEq(releasable, 0);
    }

    function test_CliffVesting() public {
        SYNXVesting vestCliff = new SYNXVesting(
            address(token),
            beneficiary,
            ALLOC,
            0,    // no TGE
            6,    // 6mo cliff
            18    // 18mo vesting
        );
        token.transfer(address(vestCliff), ALLOC);

        vm.warp(block.timestamp + 5 * ONE_MONTH);
        assertEq(vestCliff.releasable(), 0);

        vm.warp(block.timestamp + 6 * ONE_MONTH + 1);
        assertGt(vestCliff.releasable(), 0);
    }
}
