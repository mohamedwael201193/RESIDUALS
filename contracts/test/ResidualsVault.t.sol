// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ResidualsVault} from "../src/ResidualsVault.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT0", "USDT0") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amt) external { _mint(to, amt); }
}

contract ResidualsVaultTest is Test {
    MockUSDT token;
    ResidualsVault vault;
    address op = address(0xA11CE);
    address alice = address(0xB0B);
    address bob = address(0xB0B2);

    function setUp() public {
        token = new MockUSDT();
        vault = new ResidualsVault(address(token), op);
        token.mint(op, 1_000_000e6);
        vm.prank(op);
        token.approve(address(vault), type(uint256).max);
    }

    function test_creditAndWithdraw() public {
        address[] memory c = new address[](2);
        uint256[] memory a = new uint256[](2);
        c[0] = alice; a[0] = 10e6;
        c[1] = bob; a[1] = 5e6;
        vm.prank(op);
        vault.credit(c, a);
        assertEq(vault.claimable(alice), 10e6);
        assertEq(vault.claimable(bob), 5e6);

        vm.prank(alice);
        vault.withdraw();
        assertEq(vault.claimable(alice), 0);
        assertEq(token.balanceOf(alice), 10e6);

        vm.prank(alice);
        vm.expectRevert(ResidualsVault.NothingToWithdraw.selector);
        vault.withdraw();
    }

    function test_lengthMismatch() public {
        address[] memory c = new address[](1);
        uint256[] memory a = new uint256[](2);
        c[0] = alice; a[0] = 1; a[1] = 1;
        vm.prank(op);
        vm.expectRevert(ResidualsVault.LengthMismatch.selector);
        vault.credit(c, a);
    }

    function test_nonOperatorReverts() public {
        address[] memory c = new address[](1);
        uint256[] memory a = new uint256[](1);
        c[0] = alice; a[0] = 1;
        vm.expectRevert(ResidualsVault.OnlyOperator.selector);
        vault.credit(c, a);
    }

    function testFuzz_claimableNeverExceedsBalance(uint96 x, uint96 y) public {
        x = uint96(bound(x, 0, 100_000e6));
        y = uint96(bound(y, 0, 100_000e6));
        address[] memory c = new address[](2);
        uint256[] memory a = new uint256[](2);
        c[0] = alice; a[0] = x;
        c[1] = bob; a[1] = y;
        vm.prank(op);
        vault.credit(c, a);
        assertLe(vault.claimable(alice) + vault.claimable(bob), token.balanceOf(address(vault)));
    }
}
