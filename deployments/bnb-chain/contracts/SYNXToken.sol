// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title SYNXToken
 * @author SYNAPEX Protocol
 * @notice ERC20 utility token for SYNAPEX Protocol — compute access, governance, lab currency.
 * @dev Fixed supply 1B. Burn-only deflationary. No minting. Pausable for emergency.
 *
 * Token Utility (per whitepaper):
 * - GPU compute payment | Model access | DAO governance | Virtual Lab currency
 *
 * Burn: 5% of platform fees permanently burned via FeeBurner.
 * Audit-ready: OpenZeppelin, Pausable, Ownable2Step.
 */
contract SYNXToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable2Step {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1B fixed

    event TokensBurned(address indexed account, uint256 amount);

    constructor() ERC20("SYNAPEX Protocol", "SYNX") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @notice Total burned = initial supply - current total supply (OZ reduces on burn)
     */
    function totalBurned() external view returns (uint256) {
        return INITIAL_SUPPLY - totalSupply();
    }

    /**
     * @notice Circulating supply = current total supply (OZ burns reduce it)
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @notice Pause all transfers (emergency only). Owner only.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause transfers.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    function burn(uint256 value) public override {
        super.burn(value);
        emit TokensBurned(msg.sender, value);
    }

    function burnFrom(address account, uint256 value) public override {
        super.burnFrom(account, value);
        emit TokensBurned(account, value);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
