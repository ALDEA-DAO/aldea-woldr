// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract InitializeGame is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    console.log("Initializing game data...");
    console.log("World address:", worldAddress);

    // Call initializeGame on the GameInitSystem
    IWorld(worldAddress).aldea__initializeGame();

    console.log("Game initialization complete!");
    console.log("- Item types registered");
    console.log("- Building types registered");
    console.log("- Recipes registered");
    console.log("- Tribal bonuses configured");

    vm.stopBroadcast();
  }
}
