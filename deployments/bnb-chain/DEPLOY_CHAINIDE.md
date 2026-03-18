# BNB Chain Deployment via ChainIDE

> **Important: BNB Chain uses BEP20, not BRC20.**
> - **BEP20** = BNB Chain (BSC) token standard; fully **ERC20 compatible**. Our contracts work as BEP20 when deployed on BNB Chain.
> - **BRC20** = Bitcoin token standard; a different protocol. We do not use BRC20.

---

## Step-by-Step Instructions

### 1. Create Project in ChainIDE

1. Log in to [ChainIDE](https://chainide.com)
2. Create a new project (Solidity / Hardhat)
3. Or choose "Import from Git" if the repo is available

### 2. Add Project Files

The deployment package is self-contained. Copy the entire `deployments/bnb-chain/` folder into ChainIDE. Structure:

```
deployments/bnb-chain/
├── contracts/           <- SYNXToken, FeeBurner, GovernanceGuard, SYNXVesting
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
└── DEPLOY_CHAINIDE.md
```

Or clone/import the full repo and run all commands from `deployments/bnb-chain/`.

### 3. Install Dependencies

In the ChainIDE terminal, run:

```bash
npm install
```

This installs Hardhat and OpenZeppelin contracts per `package.json`.

### 4. Compile Contracts

```bash
npx hardhat compile
```

Confirm there are no compilation errors. Output will show compiled artifacts.

### 5. Connect MetaMask to BNB Testnet

1. Open MetaMask
2. Click the network dropdown → "Add network" / "Add a network manually"
3. Add BNB Smart Chain Testnet:
   - **Network name:** BNB Smart Chain Testnet
   - **RPC URL:** `https://bsc-testnet.bnbchain.org`
   - **Chain ID:** 97
   - **Currency symbol:** tBNB
   - **Block explorer:** `https://testnet.bscscan.com`
4. Get testnet BNB (tBNB) from a [faucet](https://www.bnbchain.org/en/testnet-faucet)
5. In ChainIDE, connect your wallet and ensure MetaMask is on BNB Testnet

### 6. Set Private Key for Deployment

Export your deployer private key to an environment variable (use a **testnet-only** wallet):

```bash
export PRIVATE_KEY="your_metamask_private_key_here"
```

Or create a `.env` file (if ChainIDE supports it) and ensure `hardhat.config.js` reads `process.env.PRIVATE_KEY`.

### 7. Deploy Contracts in Order

Deploy to BNB Testnet:

```bash
npx hardhat run scripts/deploy.js --network bnb-testnet
```

The script deploys in this order:

1. **SYNXToken** → copy the deployed address
2. **FeeBurner** (uses SYNXToken address)
3. **GovernanceGuard** (uses SYNXToken address, owner = deployer)
4. **SYNXVesting** (example: 10M tokens, 6-month linear vesting)

### 8. Paste Deployed Addresses for Next Steps

After deployment, the script prints a summary. Save these addresses for later use:

| Contract        | Address (example)      | Use in next step |
|-----------------|------------------------|------------------|
| SYNXToken       | `0x...`                | FeeBurner, GovernanceGuard, SYNXVesting |
| FeeBurner       | `0x...`                | Platform fee routing |
| GovernanceGuard | `0x...`                | Wallet monitoring |
| SYNXVesting     | `0x...`                | Vesting management |

Example output:

```
--- Deployment Summary ---
SYNXToken:       0x1234...
FeeBurner:       0x5678...
GovernanceGuard: 0x9abc...
SYNXVesting:     0xdef0...
-------------------------
```

Use these addresses when configuring the platform (e.g. fee burner address, governance guard, vesting contracts).

### 9. Verify on BSCScan (Optional)

1. Go to [BSCScan Testnet](https://testnet.bscscan.com)
2. Verify each contract: Contract → Verify & Publish
3. Use "Solidity (Single file)" or "Standard JSON" and paste source + compiler settings

### 10. Mainnet Deployment

For mainnet (Chain ID 56), ensure you have real BNB for gas. Run:

```bash
npx hardhat run scripts/deploy.js --network bnb-mainnet
```

Use a secure, dedicated deployer wallet and never share the private key.

---

## Troubleshooting

- **Insufficient funds:** Get tBNB from the testnet faucet.
- **Compilation fails:** Ensure OpenZeppelin is installed (`npm install`) and Solidity 0.8.20 is used.
- **"Nonce too high":** Reset the account in MetaMask or wait for pending transactions.
