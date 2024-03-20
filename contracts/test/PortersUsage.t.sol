// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {PortersUsage} from "../src/PortersUsage.sol";
import {MockAggregator} from "./Utils.sol";

contract PortersUsageTest is Test {
    PortersUsage public usage;

    address public admin = makeAddr("admin");
    address public nonadmin = makeAddr("nonadmin");

    function setUp() public {
        vm.startPrank(admin);
        usage = new PortersUsage();
        MockAggregator mockAgg = new MockAggregator();
        usage.setPriceAndFeed(address(mockAgg), 1 ether); // 1 USD
        vm.stopPrank();
    }

    function test_Mint() public {
        vm.deal(nonadmin, 1 ether);
        vm.prank(nonadmin);
        (bool success,) = address(usage).call{value: 0.1 ether}(
            abi.encodeWithSignature("mint()")
        );
        if (!success) {
            revert("mint failed");
        }
        uint256 bal = usage.balanceOf(nonadmin);
        console.log("minted bal %d", bal);
        assertEq(bal, 361980);
    }

    // Testing how the price math works
    function test_DecimalMath() public {
        uint256 dec18 = 6000000000000000000; // 6
        uint256 dec8 = 300000000; // 3
        uint256 expect = 2000000000000000000; // 2
        uint256 got = dec18 * 10 ** 8 / dec8;
        assertEq(expect, got);
    }

    function testFuzz_Mint(uint256 x) public {
        x; // set msg.amount to x
        usage.mint();
        //assertEq(usage.number(), x);
    }
}
