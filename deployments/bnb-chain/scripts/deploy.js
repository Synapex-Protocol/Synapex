const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy SYNXToken
  console.log("\n1. Deploying SYNXToken...");
  const SYNXToken = await hre.ethers.getContractFactory("SYNXToken");
  const synxToken = await SYNXToken.deploy();
  await synxToken.waitForDeployment();
  const synxAddress = await synxToken.getAddress();
  console.log("   SYNXToken deployed to:", synxAddress);

  // 2. Deploy FeeBurner (needs SYNXToken)
  console.log("\n2. Deploying FeeBurner...");
  const FeeBurner = await hre.ethers.getContractFactory("FeeBurner");
  const feeBurner = await FeeBurner.deploy(synxAddress);
  await feeBurner.waitForDeployment();
  const feeBurnerAddress = await feeBurner.getAddress();
  console.log("   FeeBurner deployed to:", feeBurnerAddress);

  // 3. Deploy GovernanceGuard (needs SYNXToken, owner)
  console.log("\n3. Deploying GovernanceGuard...");
  const GovernanceGuard = await hre.ethers.getContractFactory("GovernanceGuard");
  const governanceGuard = await GovernanceGuard.deploy(synxAddress, deployer.address);
  await governanceGuard.waitForDeployment();
  const governanceGuardAddress = await governanceGuard.getAddress();
  console.log("   GovernanceGuard deployed to:", governanceGuardAddress);

  // 4. Deploy example SYNXVesting (linear vesting: 10M over 6 months, no cliff)
  // Note: Use tgeBasisPoints=0 because constructor transfers TGE from contract balance;
  // tokens are transferred after deployment.
  console.log("\n4. Deploying example SYNXVesting...");
  const SYNXVesting = await hre.ethers.getContractFactory("SYNXVesting");
  const totalAllocation = hre.ethers.parseEther("10000000"); // 10M SYNX
  const tgeBasisPoints = 0; // No TGE at deploy; tokens transferred afterward
  const cliffMonths = 0;
  const vestingMonths = 6;
  const synxVesting = await SYNXVesting.deploy(
    synxAddress,
    deployer.address,
    totalAllocation,
    tgeBasisPoints,
    cliffMonths,
    vestingMonths
  );
  await synxVesting.waitForDeployment();
  const synxVestingAddress = await synxVesting.getAddress();
  console.log("   SYNXVesting deployed to:", synxVestingAddress);

  // Transfer tokens to vesting (deployer received full supply from SYNXToken)
  console.log("\n   Transferring 10M SYNX to vesting contract...");
  await synxToken.transfer(synxVestingAddress, totalAllocation);
  console.log("   Transfer complete.");

  console.log("\n--- Deployment Summary ---");
  console.log("SYNXToken:      ", synxAddress);
  console.log("FeeBurner:      ", feeBurnerAddress);
  console.log("GovernanceGuard:", governanceGuardAddress);
  console.log("SYNXVesting:    ", synxVestingAddress);
  console.log("-------------------------\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
