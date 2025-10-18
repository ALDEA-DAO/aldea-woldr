// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Character, Building, BuildingType, Recipe, Inventory, TribeBonus } from "../codegen/index.sol";

contract CraftingSystem is System {

  // Craft items at a building using a recipe
  function craft(
    uint32 characterId,
    uint32 buildingInstanceId,
    uint32 recipeId
  ) public {
    // Verify character exists and caller owns it
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    // Verify recipe exists
    require(bytes(Recipe.getName(recipeId)).length > 0, "Invalid recipe");
    
    // Get building info
    uint32 buildingTypeId = Building.getBuildingTypeId(buildingInstanceId);
    uint32 requiredBuildingType = Recipe.getRequiredBuildingType(recipeId);
    
    // Check if building type matches recipe requirements (0 = any building)
    if (requiredBuildingType != 0) {
      require(buildingTypeId == requiredBuildingType, "Wrong building type");
    }
    
    // Get recipe inputs
    uint32 input1 = Recipe.getInput1(recipeId);
    uint64 inputQty1 = Recipe.getInputQty1(recipeId);
    uint32 input2 = Recipe.getInput2(recipeId);
    uint64 inputQty2 = Recipe.getInputQty2(recipeId);
    uint32 input3 = Recipe.getInput3(recipeId);
    uint64 inputQty3 = Recipe.getInputQty3(recipeId);
    
    // Check character has required items
    if (input1 != 0) {
      require(getItemCount(characterId, input1) >= inputQty1, "Insufficient input1");
    }
    if (input2 != 0) {
      require(getItemCount(characterId, input2) >= inputQty2, "Insufficient input2");
    }
    if (input3 != 0) {
      require(getItemCount(characterId, input3) >= inputQty3, "Insufficient input3");
    }
    
    // Remove input items
    if (input1 != 0) removeItems(characterId, input1, inputQty1);
    if (input2 != 0) removeItems(characterId, input2, inputQty2);
    if (input3 != 0) removeItems(characterId, input3, inputQty3);
    
    // Calculate output with tribal bonuses
    uint32 outputItem = Recipe.getOutput(recipeId);
    uint64 baseOutputQty = Recipe.getOutputQty(recipeId);
    uint64 finalOutputQty = applyTribalBonus(characterId, outputItem, baseOutputQty);
    
    // Add output items
    addItems(characterId, outputItem, finalOutputQty);
    
    // Update building last used block
    Building.setLastUsedBlock(buildingInstanceId, block.number);
  }

  // Extract resources from an extractor building
  function extract(uint32 characterId, uint32 buildingInstanceId) public {
    // Verify character exists and caller owns it
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    // Get building type
    uint32 buildingTypeId = Building.getBuildingTypeId(buildingInstanceId);
    
    // Check building is an extractor (category 0)
    require(BuildingType.getCategory(buildingTypeId) == 0, "Not an extractor");
    
    // Check cooldown (example: 100 blocks between extractions)
    uint256 lastUsed = Building.getLastUsedBlock(buildingInstanceId);
    require(block.number >= lastUsed + 100, "Extraction on cooldown");
    
    // Get output items
    uint32 output1 = BuildingType.getOutputItem1(buildingTypeId);
    uint64 outputQty1 = BuildingType.getOutputQty1(buildingTypeId);
    uint32 output2 = BuildingType.getOutputItem2(buildingTypeId);
    uint64 outputQty2 = BuildingType.getOutputQty2(buildingTypeId);
    
    // Apply tribal bonuses
    if (output1 != 0) {
      uint64 bonusQty1 = applyTribalBonus(characterId, output1, outputQty1);
      addItems(characterId, output1, bonusQty1);
    }
    if (output2 != 0) {
      uint64 bonusQty2 = applyTribalBonus(characterId, output2, outputQty2);
      addItems(characterId, output2, bonusQty2);
    }
    
    // Update building last used block
    Building.setLastUsedBlock(buildingInstanceId, block.number);
  }

  // Apply tribal bonus to output quantity
  function applyTribalBonus(
    uint32 characterId,
    uint32 itemId,
    uint64 baseQuantity
  ) internal view returns (uint64) {
    uint32 tribe = Character.getTribe(characterId);
    uint32 bonusPercentage = TribeBonus.getBonusPercentage(tribe, itemId);
    
    if (bonusPercentage == 0) {
      return baseQuantity;
    }
    
    // Calculate bonus: baseQuantity * (100 + bonusPercentage) / 100
    uint64 bonusAmount = (baseQuantity * bonusPercentage) / 100;
    return baseQuantity + bonusAmount;
  }

  // Helper: Get total count of an item in character inventory
  function getItemCount(uint32 characterId, uint32 itemId) internal view returns (uint64) {
    uint64 total = 0;
    for (uint32 slot = 0; slot < 20; slot++) {
      if (Inventory.getItemId(characterId, slot) == itemId) {
        total += Inventory.getQuantity(characterId, slot);
      }
    }
    return total;
  }

  // Helper: Remove items from inventory
  function removeItems(uint32 characterId, uint32 itemId, uint64 quantity) internal {
    uint64 remaining = quantity;
    for (uint32 slot = 0; slot < 20 && remaining > 0; slot++) {
      if (Inventory.getItemId(characterId, slot) == itemId) {
        uint64 slotQty = Inventory.getQuantity(characterId, slot);
        if (slotQty <= remaining) {
          Inventory.set(characterId, slot, 0, 0);
          remaining -= slotQty;
        } else {
          Inventory.setQuantity(characterId, slot, slotQty - remaining);
          remaining = 0;
        }
      }
    }
  }

  // Helper: Add items to inventory
  function addItems(uint32 characterId, uint32 itemId, uint64 quantity) internal {
    // Try to stack with existing items first
    for (uint32 slot = 0; slot < 20; slot++) {
      if (Inventory.getItemId(characterId, slot) == itemId) {
        uint64 currentQty = Inventory.getQuantity(characterId, slot);
        Inventory.setQuantity(characterId, slot, currentQty + quantity);
        return;
      }
    }
    
    // Find empty slot
    for (uint32 slot = 0; slot < 20; slot++) {
      if (Inventory.getItemId(characterId, slot) == 0) {
        Inventory.set(characterId, slot, itemId, quantity);
        return;
      }
    }
    
    revert("Inventory full");
  }
}
