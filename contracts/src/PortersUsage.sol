// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


// TODO think about upgradability
contract PortersUsage is ERC20Pausable, Ownable {

    event Apply(bytes32 indexed _identifier, uint256 amount);

    uint256 price = 0;
    address priceFeed = address(0);

    constructor() ERC20("PORTERS Gateway", "PORTR") Ownable(_msgSender()) {
        // TODO add anything needed on constructor
        this;
    }

    // TODO mint new tokens based on payable amount
    function mint() external payable {
        require(price > 0, "price not set");
        require(priceFeed != address(0), "price feed not set");
        // TODO calculate amount
        uint256 _amount = 0;
        _mint(_msgSender(), _amount);
    }

    // TODO burn tokens and emit special event
    function applyToAccount(bytes32 _identifier, uint256 _amount) external {
        _burn(_msgSender(), _amount);
        emit Apply(_identifier, _amount);
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
        price = _price;
    }

    function setPriceAndFeed(address _feed, uint256 _price) onlyOwner external {
        price = _price;
        priceFeed = _feed;
    }
}
