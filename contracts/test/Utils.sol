// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {AggregatorV3Interface} from "chainlink/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockAggregator is AggregatorV3Interface {
    struct RoundData {
        uint80 roundId;
        int256 answer;
        uint256 startedAt;
        uint256 timeStamp;
        uint80 answeredInRound;
    }

    RoundData public roundData;
    uint8 public decimals = 8;
    string public description = "mock";
    uint256 public version = 1;

    function latestRoundData() public view returns (uint80, int256, uint256, uint256, uint80) {
        decimals;        
        return (
            42,
            361980000000,
            1710737003,
            1710737003,
            42
        );
    }

    function getRoundData(uint80) external view returns (uint80, int256, uint256, uint256, uint80) {
        return latestRoundData();
    }
}

