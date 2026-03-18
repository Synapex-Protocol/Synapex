# SYNAPEX $SYNX — Deployment na BNB Chain

Kompletny zestaw do wdrożenia tokena SYNX na BNB Chain (BSC). Token staje się **BEP20** po deployu.

## Struktura

```
deployments/bnb-chain/
├── contracts/          # SYNXToken, FeeBurner, GovernanceGuard, SYNXVesting
├── scripts/
│   └── deploy.js       # Skrypt deployu
├── hardhat.config.js   # Konfiguracja BNB mainnet + testnet
├── package.json
├── DEPLOY_CHAINIDE.md   # Instrukcja ChainIDE krok po kroku
└── README.md
```

## Szybki start (lokalnie)

```bash
npm install
npx hardhat compile
export PRIVATE_KEY="0x..."
npx hardhat run scripts/deploy.js --network bnb-testnet
```

## ChainIDE

Szczegółowa instrukcja w **[DEPLOY_CHAINIDE.md](./DEPLOY_CHAINIDE.md)**:
- Metoda A: EVM Sandbox + Hardhat (zalecana)
- Metoda B: Prosty interfejs Compile + Deploy
- Konfiguracja MetaMask (BNB Testnet)
- Kolejność deployu kontraktów

## Sieci BNB Chain

| Sieć    | Chain ID | RPC |
|---------|----------|-----|
| Testnet | 97       | https://bsc-testnet.bnbchain.org |
| Mainnet | 56       | https://bsc-dataseed.bnbchain.org |
