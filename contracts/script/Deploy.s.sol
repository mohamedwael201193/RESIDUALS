// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ResidualsVault} from "../src/ResidualsVault.sol";

contract Deploy is Script {
    address constant USDT0 = 0x779Ded0c9e1022225f8E0630b35a9b54bE713736;

    function run() external {
        uint256 pk = vm.envUint("OPERATOR_PRIVATE_KEY");
        address op = vm.addr(pk);
        vm.startBroadcast(pk);
        ResidualsVault vault = new ResidualsVault(USDT0, op);
        vm.stopBroadcast();
        console2.log("ResidualsVault", address(vault));
        console2.log("operator", op);
    }
}
