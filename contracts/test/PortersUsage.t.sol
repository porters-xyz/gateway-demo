// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {PortersUsage} from "../src/PortersUsage.sol";
import {MockAggregator} from "./Utils.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";

contract PortersUsageTest is Test {
    PortersUsage public usage;

    using FixedPointMathLib for uint256;

    event Applied(bytes32 indexed _identifier, uint256 _amount);
    event PriceSet(uint256 _oldPrice, uint256 _newPrice);
    event DataFeedSet(address _oldDataFeed, address _newDataFeed);
    error EnforcedPause();
    error ExpectedPause();

    address public admin = makeAddr("admin");
    address public nonadmin = makeAddr("nonadmin");
    address public mockAddr;

    function setUp() public {
        vm.deal(nonadmin, 1 ether);
        vm.deal(admin, 1 ether);
        vm.startPrank(admin);
        usage = new PortersUsage();
        MockAggregator mockAgg = new MockAggregator();
        mockAddr = address(mockAgg);
        usage.setPriceAndFeed(mockAddr, 2 ether); // 2 USD
        vm.stopPrank();
    }

    function test_Mint() public {
        vm.prank(nonadmin);
        _mint(0.001 ether);
        uint256 bal = usage.balanceOf(nonadmin);
        assertEq(bal, 1_809_900_000_000_000_000); // ~2 tokens
    }

    function test_ApplyToAccount() public {
        vm.prank(nonadmin);
        _mint(0.01 ether);
        uint256 bal1 = usage.balanceOf(nonadmin);

        vm.prank(nonadmin);
        vm.expectEmit(true, true, false, false);
        emit Applied(bytes32("test"), 1 ether);
        usage.applyToAccount(bytes32("test"), 1 ether); // apply 1 token

        uint256 bal2 = usage.balanceOf(nonadmin);
        assertEq(bal2, bal1 - 1 ether, "should burn applied amount");
    }

    function test_Pause() public {
        vm.prank(admin);
        usage.pause();
        vm.prank(nonadmin);
        vm.expectRevert(EnforcedPause.selector); // paused
        _mint(0.01 ether);
        uint256 bal = usage.balanceOf(nonadmin);
        assertEq(0, bal, "should not mint");
    }

    function test_Unpause() public {
        vm.prank(admin);
        usage.pause();
        vm.prank(nonadmin);
        vm.expectRevert(EnforcedPause.selector); // paused
        _mint(0.01 ether);

        vm.prank(admin);
        usage.unpause();

        console.log("paused: %s", usage.paused());

        vm.prank(nonadmin);
        _mint(0.01 ether);
        uint256 bal = usage.balanceOf(nonadmin);
        assertGt(bal, 0, "should succeed in minting");
    }

    function test_AdminMint() public {
        vm.prank(admin);
        usage.adminMint(admin, 10 ether);
        uint256 bal = usage.balanceOf(admin);
        assertEq(10 ether, bal, "should have minted 10 tokens");
    }
    
    function test_AdminMintOnlyOwner() public {
        vm.prank(nonadmin);
        vm.expectRevert();
        usage.adminMint(nonadmin, 10 ether);
        uint256 bal = usage.balanceOf(nonadmin);
        assertEq(0, bal, "should not be able to adminMint");
    }

    function test_SetPrice() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit PriceSet(2 ether, 3 ether);
        usage.setPrice(3 ether);
    }
    
    function test_SetPriceAndFeed() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit PriceSet(2 ether, 3 ether);
        vm.expectEmit(false, false, false, false);
        emit DataFeedSet(address(0), address(0));
        usage.setPriceAndFeed(mockAddr, 3 ether);
    }

    function test_Sweep() public {
        vm.prank(nonadmin);
        _mint(0.1 ether);
        vm.prank(admin);
        usage.sweep(payable(admin));
        assertGt(admin.balance, 1.09 ether, "should have swept funds");
    }

    function test_SweepToken() public {
        vm.startPrank(nonadmin);
        _mint(0.1 ether);
        uint256 logbal = usage.balanceOf(nonadmin);
        console.log("balance from mint: %d", logbal);
        usage.transfer(address(usage), 1 ether);
        logbal = usage.balanceOf(address(usage));
        console.log("balance in contract: %d", logbal);
        vm.stopPrank();
        vm.prank(admin);
        usage.sweepToken(address(usage), admin);
        uint256 bal = usage.balanceOf(admin);
        console.log("balance after sweep: %d", bal);
        assertEq(bal, 1 ether, "should have swept minted tokens");
    }

    // FUZZ TESTS

    function testFuzz_Mint(uint256 x) public {
        uint256 deal = x < 1000000 ? 1000000 : x;
        vm.deal(nonadmin, deal);
        vm.prank(nonadmin);
        _mint(x);
        if (x > 0 && x < 1e50) {
            assertGt(usage.balanceOf(nonadmin), 0, "should be positive balance");
        } else {
            assertEq(0, usage.balanceOf(nonadmin), "should have zero balance");
        }
    }

    // SCRATCH TESTS

    function test_DecimalMathDiv() public {
        uint256 dec18 = 6_000_000_000_000_000_000; // 6
        uint256 dec8 = 300_000_000; // 3
        uint256 expect = 2_000_000_000_000_000_000; // 2
        uint256 got = dec18.mulDivUp(10 ** 8, dec8);
        assertEq(expect, got);
    }

    function test_DecimalMathMult() public {
        uint256 dec18 = 500_000_000_000_000_000; // .5 ETH
        uint256 dec8 = 300_000_000_000; // 3000 USD/ETH
        uint256 expect = 1_500_000_000_000_000_000_000; // 1500 USD
        uint256 got = dec18.mulDivUp(dec8, 10 ** 8);
        assertEq(expect, got);
    }

    // UTILITY

    function _mint(uint256 payableAmt) private {
        (bool success, bytes memory data) = address(usage).call{value: payableAmt}(
            abi.encodeWithSignature("mint()")
        );
        success;
        data;
    }
}
