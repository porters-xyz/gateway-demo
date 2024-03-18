// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {PortersUsage} from "../src/PortersUsage.sol";
import {MockAggregator} from "./Utils.sol";

contract PortersUsageTest is Test {
    PortersUsage public usage;

    function setUp() public {
        usage = new PortersUsage();
        MockAggregator mockAgg = new MockAggregator();
        usage.setPriceAndFeed(address(mockAgg), 1 ether); // 1 USD
    }

    function test_Mint() public {
        usage.mint();
        //assertEq(usage.number(), 1);
    }

    function testFuzz_Mint(uint256 x) public {
        x; // set msg.amount to x
        usage.mint();
        //assertEq(usage.number(), x);
    }
}
