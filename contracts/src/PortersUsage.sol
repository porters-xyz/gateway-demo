// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "chainlink/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";

// TODO think about upgradability
contract PortersUsage is ERC20Pausable, Ownable {

    using SafeERC20 for IERC20;
    using FixedPointMathLib for uint256;

    event Applied(bytes32 indexed _identifier, uint256 _amount);
    event PriceSet(uint256 _oldPrice, uint256 _newPrice);
    event DataFeedSet(address _oldDataFeed, address _newDataFeed);

    uint256 public price = 0;
    address public dataFeed;
    uint256 internal MINT_LIMIT = 1e50; // larger numbers make calcs weird 

    constructor() ERC20("PORTERS Gateway", "PORTR") Ownable(_msgSender()) {
    }

    // TODO mint new tokens based on payable amount
    function mint() whenNotPaused external payable {
        require(msg.value > 0, "no payment");
        require(msg.value < MINT_LIMIT, "mint too high");
        require(price > 0, "price not set");
        require(dataFeed != address(0), "price feed not set");

        AggregatorV3Interface aggregator = AggregatorV3Interface(dataFeed);
        (,int256 _answer,,,) = aggregator.latestRoundData();
        require(_answer > 0, "invalid price");
        
        uint256 _amount = msg.value.mulDivUp(uint256(_answer), 10 ** aggregator.decimals()).divWadUp(price);
        _mint(_msgSender(), _amount);
    }

    // TODO burn tokens and emit special event
    function applyToAccount(bytes32 _identifier, uint256 _amount) whenNotPaused external {
        _burn(_msgSender(), _amount);
        emit Applied(_identifier, _amount);
    }

    function pause() onlyOwner external {
        _pause();
    }

    function unpause() onlyOwner external {
        _unpause();
    }

    // ADMIN AREA //

    function adminMint(address _to, uint256 _amount) onlyOwner external {
        _mint(_to, _amount);
    }

    function setPrice(uint256 _price) onlyOwner external {
        emit PriceSet(price, _price);
        price = _price;
    }

    // This must be called before contract can be used
    function setPriceAndFeed(address _feed, uint256 _price) onlyOwner external {
        emit PriceSet(price, _price);
        price = _price;
        emit DataFeedSet(dataFeed, _feed);
        dataFeed = _feed;
    }

    function sweep(address payable _to) onlyOwner external {
        require(_to != address(0), "cannot use zero address");
        (bool sent,) = _to.call{value: address(this).balance}("");
        require(sent, "sweep failed");
    }

    // If anyone accidentally sends ERC20 to this address
    // (or eventually if we support minting from ERC20
    function sweepToken(address _erc20, address _to) onlyOwner external {
        IERC20 token = IERC20(_erc20);
        uint256 _amount = token.balanceOf(address(this));
        token.safeTransfer(_to, _amount);
    }
}
