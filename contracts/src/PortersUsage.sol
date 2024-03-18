// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "chainlink/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

using SafeERC20 for IERC20;

// TODO think about upgradability
contract PortersUsage is ERC20Pausable, Ownable {

    event Applied(bytes32 indexed _identifier, uint256 _amount);
    event PriceSet(uint256 _oldPrice, uint256 _newPrice);
    event DataFeedSet(address _oldDataFeed, address _newDataFeed);

    uint256 internal price = 0;
    AggregatorV3Interface internal dataFeed;

    constructor() ERC20("PORTERS Gateway", "PORTR") Ownable(_msgSender()) {
        this;
    }

    // TODO mint new tokens based on payable amount
    function mint() external payable {
        require(price > 0, "price not set");
        require(address(dataFeed) != address(0), "price feed not set");
        // TODO calculate amount
        uint256 _amount = 0;
        _mint(_msgSender(), _amount);
    }

    // TODO burn tokens and emit special event
    function applyToAccount(bytes32 _identifier, uint256 _amount) external {
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
        emit DataFeedSet(address(dataFeed), address(_feed));
        dataFeed = AggregatorV3Interface(_feed);
    }

    function sweep(address payable _to) onlyOwner external {
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
