// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { ALDEA } from "../src/tokens/ALDEA.sol";

contract TokenDeploy is Script {
    function run() external {
      // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
      uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

      // Start broadcasting transactions from the deployer account
      vm.startBroadcast(deployerPrivateKey);

      new ALDEA(0xF90ad6FebE9A69A8FF6256cE1248cDC2feAB94DA);

      vm.stopBroadcast();
    }
}