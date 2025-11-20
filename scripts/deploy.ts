import{ ethers } from "hardhat";

async function main() {
  // 1. Setup addresses
  // On Base Sepolia, this is a Mock USDC address (or you can deploy your own dummy token)
  // For this example, let's assume you have a MockToken address.
  // If you don't, deploy a simple ERC20 first.
  const USDC_ADDRESS = "0x59866D6285BB0A22275016cbAA7199780D273D93"; // Example Base Sepolia USDC

  console.log("Deploying AgentAllowance...");

  // 2. Get the factory
  const AgentAllowance = await ethers.getContractFactory("AgentAllowance");

  // 3. Deploy (Passing the USDC address to the constructor)
  const contract = await AgentAllowance.deploy(USDC_ADDRESS);

  // 4. Wait for confirmation
  await contract.waitForDeployment();

  console.log(`Contract deployed to: ${await contract.getAddress()}`);
  console.log(`Master set to: ${await (await ethers.getSigners())[0].address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});