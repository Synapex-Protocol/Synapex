# CertiK Audit Checklist — SYNAPEX $SYNX

## Pre-Audit Readiness

### ✅ OpenZeppelin
- [x] SYNXToken: ERC20, ERC20Burnable, ERC20Pausable, Ownable2Step
- [x] SYNXVesting: SafeERC20, ReentrancyGuard
- [x] FeeBurner: ReentrancyGuard
- [x] GovernanceGuard: Ownable2Step

### ✅ Access Control
- [x] Token: onlyOwner for pause/unpause
- [x] GovernanceGuard: onlyOwner for addExempt/removeExempt
- [x] Ownable2Step: 2-step ownership transfer (prevents accidental loss)

### ✅ Reentrancy
- [x] FeeBurner.burnReceived: nonReentrant
- [x] SYNXVesting.release: nonReentrant

### ✅ Safe Transfers
- [x] SYNXVesting: SafeERC20 for all token transfers

### ✅ Custom Errors
- [x] All contracts use custom errors (gas-efficient, no string decoding)

### ✅ Events
- [x] Token: Transfer, Approval, TokensBurned
- [x] Vesting: TokensReleased
- [x] FeeBurner: Burned
- [x] GovernanceGuard: ExemptAdded, ExemptRemoved

### ✅ Pausability
- [x] Token can be paused by owner (emergency freeze)

### ✅ Fixed Supply
- [x] No mint function, burn-only deflationary

## Pre-Submission

1. **Run tests**: `forge test`
2. **Run Slither**: `slither . --json slither-report.json`
3. **Review** Slither findings, fix or document
4. **Document** deployment order and initial parameters
5. **Prepare** scope document for CertiK (contract addresses, functions in scope)

## Known Design Decisions

| Decision | Rationale |
|----------|-----------|
| Vesting math custom (not OZ VestingWallet) | TGE + cliff + custom durations per whitepaper |
| FeeBurner receives tokens, anyone triggers burn | Gas-efficient; platform sends 5%, anyone calls burn |
| GovernanceGuard exempt list | Vesting contracts hold non-circulating tokens |
| 30 days = 1 month | Approximate; consider exact for production |

## Recommended Additions

- [ ] NatSpec on all public/external functions
- [ ] Fuzz tests for vesting math
- [ ] Invariant tests
- [ ] Formal verification (optional)
