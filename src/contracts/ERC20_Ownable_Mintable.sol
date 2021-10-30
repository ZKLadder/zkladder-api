// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20_Ownable_Mintable is ERC20, Ownable {
    event calledTest (uint supply, uint decimalSupply);
    constructor(
      string memory name, 
      string memory symbol,
      address initialOwner,
      uint256 totalSupply) 
      ERC20(name, symbol) {
        _mint(initialOwner, totalSupply*(10**18));
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount*(10**18));
    }
}