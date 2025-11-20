// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract peekaloToken is ERC20 {
    // Constructor: Runs once when you deploy
    constructor() ERC20("peekaloToken", "peUSDC") {
        // The Magic Line: Mint 1,000,000 tokens to YOUR wallet immediately
        // We use 18 decimals standard (so 1 token = 1 with 18 zeros)
        _mint(msg.sender, 1000000 * 10 ** 18); 
    }
}