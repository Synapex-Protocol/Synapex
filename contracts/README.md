# SYNAPEX Protocol — Smart Contracts

Smart contracts for the $SYNX token, aligned with the [Whitepaper](whitepaper%202.html) and [Roadmap](synx.html).

## Overview

| Contract | Purpose |
|----------|---------|
| **SYNXToken** | ERC20 utility token, 1B fixed supply, burn-only deflationary |
| **SYNXVesting** | Linear vesting with cliff and TGE unlock |
| **FeeBurner** | Burns 5% of platform fees (immutable) |
| **GovernanceGuard** | Tracks >5% holders for disclosure |

## Token Specification

- **Name:** SYNAPEX Protocol
- **Symbol:** SYNX
- **Decimals:** 18
- **Total Supply:** 1,000,000,000 (fixed, no minting)
- **Network:** EVM Compatible

## Tokenomics (per Whitepaper)

| Allocation | % | Tokens | Vesting |
|------------|---|--------|---------|
| Public Sale / IDO | 20% | 200M | 30% TGE, 6mo linear |
| Ecosystem & Research | 20% | 200M | 3yr linear, monthly |
| Team & Founders | 15% | 150M | 1yr cliff, 3yr linear |
| Foundation Reserve | 13% | 130M | 2yr cliff, 3yr linear |
| Liquidity DEX Launch | 5% | 50M | Immediate, LP locked |
| Liquidity DEX Growth | 5% | 50M | Monthly over 12mo |
| Liquidity CEX Reserve | 5% | 50M | Until CEX listing |
| Strategic Partners | 10% | 100M | 6mo cliff, 18mo linear |
| Private Round | 7% | 70M | 6mo cliff, 18mo linear |
| Community Airdrop | 5% | 50M | TGE + 6mo linear |

## Burn Mechanism

**5% of all platform fees** (compute, model access, lab transactions) are **permanently burned** at the smart contract level. No governance can override.

Flow: Platform routes 5% of each fee to `FeeBurner`. Anyone may call `burnReceived()` to burn accumulated SYNX.

## Vesting Parameters

| Allocation | tgeBasisPoints | cliffMonths | vestingMonths |
|------------|----------------|-------------|---------------|
| IDO | 3000 (30%) | 0 | 6 |
| Ecosystem | 0 | 0 | 36 |
| Team | 0 | 12 | 36 |
| Foundation | 0 | 24 | 36 |
| Strategic/Private | 0 | 6 | 18 |
| Airdrop | 10000 (100%)* | 0 | 6 |

*Airdrop: 100% at TGE then linear unlock over 6mo for remainder; or use two vesting contracts.

## Governance Safeguards

- No single wallet >5% of circulating supply without enhanced disclosure
- Team/founder tokens excluded from governance during vesting
- 60% quorum, simple majority; treasury >100K requires 75% supermajority
- Timelock for contract changes

## Deployment (Foundry)

```bash
# Install Foundry: https://getfoundry.sh
forge install foundry-rs/forge-std --no-commit

# Build
forge build

# Test (add tests in test/)
forge test

# Deploy to testnet
export PRIVATE_KEY=0x...
export ECOSYSTEM_BENEFICIARY=0x...
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

## Roadmap Alignment

- **Phase 1 (Q2–Q3 2026):** Private Sale, Testnet deployment
- **Phase 2 (Q3–Q4 2026):** IDO, DEX listing, DAO live, Burn active
- **Phase 3+:** Full deployment with all vesting schedules

## Security

- Audit recommended (CertiK/Hacken per whitepaper)
- MiCA compliance to be addressed pre-public sale
