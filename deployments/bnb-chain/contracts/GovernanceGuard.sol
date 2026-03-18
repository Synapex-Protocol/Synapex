// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title GovernanceGuard
 * @author SYNAPEX Protocol
 * @notice Tracks wallets holding >5% of circulating supply for enhanced disclosure.
 *
 * Per whitepaper: "No single wallet may hold >5% without enhanced disclosure.
 * Founder/team tokens excluded from governance during vesting."
 */
interface IERC20View {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract GovernanceGuard is Ownable2Step {
    IERC20View public immutable synx;

    uint256 public constant DISCLOSURE_THRESHOLD_BP = 500; // 5%

    address[] private _exemptAddresses;
    mapping(address => bool) public isExempt;

    event ExemptAdded(address indexed addr);
    event ExemptRemoved(address indexed addr);

    error GovernanceGuardZeroAddress();
    error GovernanceGuardAlreadyExempt();
    error GovernanceGuardNotExempt();

    constructor(address synx_, address owner_) Ownable(owner_ != address(0) ? owner_ : msg.sender) {
        if (synx_ == address(0)) revert GovernanceGuardZeroAddress();
        synx = IERC20View(synx_);
    }

    function addExempt(address addr) external onlyOwner {
        if (addr == address(0)) revert GovernanceGuardZeroAddress();
        if (isExempt[addr]) revert GovernanceGuardAlreadyExempt();
        isExempt[addr] = true;
        _exemptAddresses.push(addr);
        emit ExemptAdded(addr);
    }

    function removeExempt(address addr) external onlyOwner {
        if (!isExempt[addr]) revert GovernanceGuardNotExempt();
        isExempt[addr] = false;
        uint256 len = _exemptAddresses.length;
        for (uint256 i = 0; i < len; i++) {
            if (_exemptAddresses[i] == addr) {
                _exemptAddresses[i] = _exemptAddresses[len - 1];
                _exemptAddresses.pop();
                break;
            }
        }
        emit ExemptRemoved(addr);
    }

    function exemptAddresses() external view returns (address[] memory) {
        return _exemptAddresses;
    }

    function circulatingSupply() public view returns (uint256) {
        (bool ok, bytes memory data) = address(synx).staticcall(
            abi.encodeWithSignature("circulatingSupply()")
        );
        if (ok && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return synx.totalSupply();
    }

    function exceedsThreshold(address account) external view returns (bool) {
        if (isExempt[account]) return false;
        uint256 circ = circulatingSupply();
        if (circ == 0) return false;
        return (synx.balanceOf(account) * 10000) / circ > DISCLOSURE_THRESHOLD_BP;
    }

    function holdingPercentBp(address account) external view returns (uint256) {
        uint256 circ = circulatingSupply();
        if (circ == 0) return 0;
        return (synx.balanceOf(account) * 10000) / circ;
    }
}
