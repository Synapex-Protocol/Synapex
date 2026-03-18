// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SYNXToken.sol";
import "../contracts/FeeBurner.sol";

contract SYNXTokenTest is Test {
    SYNXToken public token;
    FeeBurner public feeBurner;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant INITIAL = 1_000_000_000 * 10**18;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        token = new SYNXToken();
        feeBurner = new FeeBurner(address(token));
    }

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), INITIAL);
        assertEq(token.balanceOf(owner), INITIAL);
    }

    function test_Transfer() public {
        token.transfer(user1, 1000);
        assertEq(token.balanceOf(user1), 1000);
        assertEq(token.balanceOf(owner), INITIAL - 1000);
    }

    function test_Burn() public {
        uint256 burnAmt = 1e18;
        token.burn(burnAmt);
        assertEq(token.totalSupply(), INITIAL - burnAmt);
        assertEq(token.totalBurned(), burnAmt);
        assertEq(token.circulatingSupply(), INITIAL - burnAmt);
    }

    function test_BurnFrom() public {
        token.transfer(user1, 1000);
        vm.prank(user1);
        token.approve(owner, 500);
        token.burnFrom(user1, 500);
        assertEq(token.balanceOf(user1), 500);
        assertEq(token.totalSupply(), INITIAL - 500);
    }

    function test_Pause() public {
        token.pause();
        vm.expectRevert();
        token.transfer(user1, 100);
    }

    function test_Unpause() public {
        token.pause();
        token.unpause();
        token.transfer(user1, 100);
        assertEq(token.balanceOf(user1), 100);
    }

    function test_FeeBurner() public {
        token.transfer(address(feeBurner), 100);
        assertEq(feeBurner.pendingBurn(), 100);
        feeBurner.burnReceived();
        assertEq(feeBurner.pendingBurn(), 0);
        assertEq(token.totalSupply(), INITIAL - 100);
    }

    function test_OnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        token.pause();
    }
}
