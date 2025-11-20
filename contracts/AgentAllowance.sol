// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 1. Import the Interface for ERC20 (Standard for tokens like USDC)
// Think of this like importing a Type definition file (.d.ts)
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AgentAllowance {
    
    // --- STATE VARIABLES (The Database) ---
    // These are stored permanently on the blockchain.
    address public master; 
    IERC20 public usdcToken; // The contract address of the USDC token
    
    // Mapping: Think of this as `Map<string, number>` or a JSON object
    // mapping(AgentAddress => AmountAllowed)
    mapping(address => uint256) public allowances;

    // --- EVENTS (The Logs) ---
    // This is how your frontend knows something happened
    event AllowanceChanged(address indexed agent, uint256 newAmount);
    event FundsClaimed(address indexed agent, uint256 amount);

    // --- CONSTRUCTOR (Runs once on deployment) ---
    constructor(address _usdcTokenAddress) {
        master = msg.sender; // 'msg.sender' is the person calling the function
        usdcToken = IERC20(_usdcTokenAddress);
    }

    // --- MODIFIERS (Middleware) ---
    // Reusable code to check permissions before a function runs
    modifier onlyMaster() {
        require(msg.sender == master, "You are not the Master");
        _; // This underscore represents where the actual function code runs
    }

    // --- LOGIC ---

    /**
     * @notice Master sets how much an agent can spend.
     * @param _agent The wallet address of the agent
     * @param _amount The amount (in raw units, e.g., 1000000 for 1 USDC)
     */
    function setAllowance(address _agent, uint256 _amount) external onlyMaster {
        allowances[_agent] = _amount;
        emit AllowanceChanged(_agent, _amount);
    }

    /**
     * @notice Agent calls this to withdraw their funds.
     * @param _amount The amount to withdraw
     */
    function claimUSDC(uint256 _amount) external {
        // 1. Check: Does the caller have enough allowance?
        require(allowances[msg.sender] >= _amount, "Allowance exceeded");

        // 2. Effect: Update the state (subtract allowance)
        // CRITICAL: Always update state BEFORE transferring money to prevent Reentrancy attacks
        allowances[msg.sender] -= _amount;

        // 3. Interaction: Send the tokens
        // We call the transfer function on the USDC contract
        bool success = usdcToken.transfer(msg.sender, _amount);
        require(success, "USDC Transfer failed");

        emit FundsClaimed(msg.sender, _amount);
    }
}