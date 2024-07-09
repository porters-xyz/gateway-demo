// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import { PythAggregatorV3 } from "@pythnetwork/target_chains/ethereum/sdk/solidity/PythAggregatorV3.sol";

contract PythScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        address taiko_pyth = 0x2880aB155794e7179c9eE2e38200202908C17B43;
        bytes32 eth_feed = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

        PythAggregatorV3 eth_agg = new PythAggregatorV3(
            taiko_pyth,
            eth_feed
        );
        vm.stopBroadcast();
    }
}
