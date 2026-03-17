// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GovernanceGuard
 * @author SYNAPEX Protocol
 * @notice Tracks wallets holding >5% of circulating supply for enhanced disclosure.
 *
 * Per whitepaper: "No single wallet may hold >5% of circulating supply without
 * enhanced disclosure. Founder/team tokens excluded from governance during vesting."
 *
 * This contract provides a view helper. Actual governance (e.g. Governor Bravo/OpenZeppelin)
 * would check balances against this or similar logic.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract GovernanceGuard {
    IERC20 public immutable synx;

    uint256 public constant DISCLOSURE_THRESHOLD_BP = 500; // 5% = 500 basis points

    address[] public exemptAddresses; // Vesting contracts, team locked tokens
    mapping(address => bool) public isExempt;

    event ExemptAdded(address indexed addr);
    event ExemptRemoved(address indexed addr);

    error ZeroAddress();
    error NotAuthorized();
    error AlreadyExempt();
    error NotExempt();

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    address public owner;

    constructor(address synx_, address owner_) {
        if (synx_ == address(0)) revert ZeroAddress();
        synx = IERC20(synx_);
        owner = owner_ != address(0) ? owner_ : msg.sender;
    }

    function addExempt(address addr) external onlyOwner {
        if (addr == address(0)) revert ZeroAddress();
        if (isExempt[addr]) revert AlreadyExempt();
        isExempt[addr] = true;
        exemptAddresses.push(addr);
        emit ExemptAdded(addr);
    }

    function removeExempt(address addr) external onlyOwner {
        if (!isExempt[addr]) revert NotExempt();
        isExempt[addr] = false;
        for (uint256 i = 0; i < exemptAddresses.length; i++) {
            if (exemptAddresses[i] == addr) {
                exemptAddresses[i] = exemptAddresses[exemptAddresses.length - 1];
                exemptAddresses.pop();
                break;
            }
        }
        emit ExemptRemoved(addr);
    }

    /**
     * @notice Circulating supply = total - burned. Exempt addresses (vesting)
     * hold tokens that are not yet circulating; optional to exclude from "voting" supply.
     */
    function circulatingSupply() public view returns (uint256) {
        (bool ok, bytes memory data) = address(synx).staticcall(
            abi.encodeWithSignature("circulatingSupply()")
        );
        if (ok && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return synx.totalSupply();
    }

    /**
     * @notice Check if account holds >5% of circulating supply (requires disclosure)
     */
    function exceedsThreshold(address account) external view returns (bool) {
        if (isExempt[account]) return false;
        uint256 circ = circulatingSupply();
        if (circ == 0) return false;
        uint256 balance = synx.balanceOf(account);
        return (balance * 10000) / circ > DISCLOSURE_THRESHOLD_BP;
    }

    /**
     * @notice Percentage of circulating supply held (basis points)
     */
    function holdingPercentBp(address account) external view returns (uint256) {
        uint256 circ = circulatingSupply();
        if (circ == 0) return 0;
        return (synx.balanceOf(account) * 10000) / circ;
    }
}
