// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SYNXToken
 * @author SYNAPEX Protocol
 * @notice ERC20 utility token for SYNAPEX Protocol — compute access, governance, lab currency.
 * @dev Fixed supply 1B. Burn-only deflationary. No minting after deployment.
 *
 * Token Utility (per whitepaper):
 * - GPU compute payment
 * - Model access (stake/spend)
 * - DAO governance voting
 * - Virtual Lab transactions (datasets, IP, collaboration)
 *
 * Burn: 5% of platform fees permanently burned via FeeBurner.
 */
contract SYNXToken {
    string public constant name = "SYNAPEX Protocol";
    string public constant symbol = "SYNX";
    uint8 public constant decimals = 18;

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B fixed

    uint256 private _burned; // Tracks permanently burned tokens

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed burner, uint256 value);

    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAddress();
    error ExceedsSupply();

    constructor() {
        _balances[msg.sender] = TOTAL_SUPPLY;
        emit Transfer(address(0), msg.sender, TOTAL_SUPPLY);
    }

    function totalSupply() external pure returns (uint256) {
        return TOTAL_SUPPLY;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert ZeroAddress();
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) revert InsufficientAllowance();
            unchecked {
                _allowances[from][msg.sender] = currentAllowance - amount;
            }
        }
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Burn tokens from caller. Used by FeeBurner for 5% platform fee burn.
     */
    function burn(uint256 amount) external {
        if (_balances[msg.sender] < amount) revert InsufficientBalance();
        unchecked {
            _balances[msg.sender] -= amount;
            _burned += amount;
        }
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @notice Burn tokens from account (requires allowance). FeeBurner uses this.
     */
    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = _allowances[account][msg.sender];
        if (currentAllowance < amount) revert InsufficientAllowance();
        unchecked {
            _allowances[account][msg.sender] = currentAllowance - amount;
        }
        if (_balances[account] < amount) revert InsufficientBalance();
        unchecked {
            _balances[account] -= amount;
            _burned += amount;
        }
        emit Burn(account, amount);
        emit Transfer(account, address(0), amount);
    }

    /// @notice Total tokens permanently burned (reduces effective supply)
    function totalBurned() external view returns (uint256) {
        return _burned;
    }

    /// @notice Circulating supply = total - burned
    function circulatingSupply() external view returns (uint256) {
        return TOTAL_SUPPLY - _burned;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (_balances[from] < amount) revert InsufficientBalance();

        unchecked {
            _balances[from] -= amount;
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);
    }
}
