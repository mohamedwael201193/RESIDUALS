// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/// @title ResidualsVault
/// @notice Accrues contributor royalties in USD₮0. Contributors withdraw themselves.
/// @dev The operator can ONLY credit balances by pulling tokens it already holds.
///      There is NO operator path that can withdraw or seize contributor claimable balances.
contract ResidualsVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public operator;
    address public pendingOperator;

    mapping(address => uint256) public claimable;

    event Credited(address indexed contributor, uint256 amount);
    event Withdrawn(address indexed contributor, uint256 amount);
    event OperatorTransferStarted(address indexed pending);
    event OperatorTransferAccepted(address indexed operator);

    error OnlyOperator();
    error LengthMismatch();
    error ZeroAddress();
    error NothingToWithdraw();
    error NotPendingOperator();

    modifier onlyOperator() {
        if (msg.sender != operator) revert OnlyOperator();
        _;
    }

    constructor(address token_, address operator_) {
        if (token_ == address(0) || operator_ == address(0)) revert ZeroAddress();
        token = IERC20(token_);
        operator = operator_;
    }

    /// @notice Pull `sum(amounts)` from operator and increase per-address claimable.
    function credit(address[] calldata contributors, uint256[] calldata amounts)
        external
        onlyOperator
        nonReentrant
    {
        if (contributors.length != amounts.length) revert LengthMismatch();
        uint256 total;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        if (total == 0) return;
        token.safeTransferFrom(msg.sender, address(this), total);
        for (uint256 i = 0; i < contributors.length; i++) {
            address c = contributors[i];
            uint256 a = amounts[i];
            if (c == address(0) || a == 0) continue;
            claimable[c] += a;
            emit Credited(c, a);
        }
    }

    /// @notice Withdraw full claimable balance. Sets to zero before transfer.
    function withdraw() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        claimable[msg.sender] = 0;
        token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function beginOperatorTransfer(address next) external onlyOperator {
        if (next == address(0)) revert ZeroAddress();
        pendingOperator = next;
        emit OperatorTransferStarted(next);
    }

    function acceptOperatorTransfer() external {
        if (msg.sender != pendingOperator) revert NotPendingOperator();
        operator = pendingOperator;
        pendingOperator = address(0);
        emit OperatorTransferAccepted(operator);
    }
}
