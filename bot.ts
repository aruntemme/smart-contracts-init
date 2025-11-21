import { createPublicClient, createWalletClient, http, parseAbi, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const VAULT_ADDRESS = "0x9800eA3Fe980766a1E5bf6241068715774776eE0"; // Your Day 2 Vault
const MY_PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

// 1. Define the Contract Interface (Human Readable ABI)
const abi = parseAbi([
  'function allowances(address agent) view returns (uint256)',
  'function claimUSDC(uint256 amount) external'
]);

async function main() {
  // 2. Setup Clients (The "Eyes" and "Hands" of the bot)
  const account = privateKeyToAccount(MY_PRIVATE_KEY);
  
  // Public Client: Reads data from blockchain (The Eyes)
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org") 
  });

  // Wallet Client: Signs transactions (The Hands)
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org")
  });

  console.log(`🤖 Bot initialized for agent: ${account.address}`);
  console.log(`🎯 Watching Vault: ${VAULT_ADDRESS}`);
  console.log("------------------------------------------------");

  // 3. The Infinite Loop
  while (true) {
    try {
      console.log(`Checking allowance...`);

      // STEP A: READ the allowance from the contract
      const allowance = await publicClient.readContract({
        address: VAULT_ADDRESS,
        abi: abi,
        functionName: 'allowances',
        args: [account.address] // Check allowance for "Me"
      });

      // Convert BigInt to readable string (assuming 18 decimals for peUSDC)
      const readableAllowance = formatUnits(allowance, 18);
      
      if (allowance > 0n) {
        console.log(`🚨 MONEY FOUND! Allowance: ${readableAllowance} peUSDC`);
        console.log(`🏃 Executing Claim Transaction...`);

        // STEP B: WRITE (Claim the funds)
        const hash = await walletClient.writeContract({
          address: VAULT_ADDRESS,
          abi: abi,
          functionName: 'claimUSDC',
          args: [allowance] // Claim everything
        });

        console.log(`✅ Transaction Sent! Hash: ${hash}`);
        console.log(`Waiting for confirmation...`);
        
        // Wait for the block to be mined
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`🎉 SUCCESS! Money Secured.`);
        
        // Exit after success (or remove this break to keep running)
        break; 

      } else {
        console.log(`💤 No allowance found. (Current: ${readableAllowance})`);
      }

    } catch (error) {
      console.error("Error in loop:", error);
    }

    // Sleep for 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main();