import { ethers } from "hardhat";

async function main() {
  // 1. Deploy your Coin
  const token = await ethers.deployContract("peekaloToken");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`Money Printer Deployed! Address: ${tokenAddress}`);

  // 2. Deploy your Vault (AgentAllowance) AGAIN, but using YOUR Coin this time
  const agentAllowance = await ethers.deployContract("AgentAllowance", [tokenAddress]);
  await agentAllowance.waitForDeployment();
  console.log(`New Vault Deployed! Address: ${await agentAllowance.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});