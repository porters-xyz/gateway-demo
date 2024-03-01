// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


// TODO think about upgradability
contract PortersUsage is ERC20Pausable, Ownable {

    uint256 price;

    constructor() ERC20("PORTERS Gateway", "GATE") Ownable(_msgSender()) {
        // TODO add anything needed on constructor
        this;
    }

    // TODO admin can mint without payment (used for liquidity provision/OTC)
    function adminMint(address _to, uint256 _amount) onlyOwner external {

        _mint(_to, _amount);
    }

    // TODO mint new tokens based on payable amount
    function mint() external payable {

    }

    // don't bother minting and burning, just apply
    function mintAndApply(string calldata _identifier) external payable {
        _identifier; // emit this
    }

    // TODO burn tokens and emit special event
    function applyToTenant(address _account, uint256 _amount, string calldata _identifier) external {
        _identifier; // emit this
        _burn(_account, _amount);
    }

    function pause() onlyOwner external {
        _pause();
    }

    function unpause() onlyOwner external {
        _unpause();
    }
}
