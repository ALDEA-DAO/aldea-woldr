// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Character, Inventory, ItemType, ItemBalance } from "../codegen/index.sol";

contract InventorySystem is System {

  // Add item to character inventory with O(1) balance tracking
  function addItem(uint32 characterId, uint32 itemId, uint64 quantity) public {
    // Verify character exists and caller owns it
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    // Update ItemBalance first (O(1) operation)
    uint64 currentBalance = ItemBalance.getTotalQuantity(characterId, itemId);
    ItemBalance.setTotalQuantity(characterId, itemId, currentBalance + quantity);
    
    // Find first empty slot or existing stack
    for (uint32 slot = 0; slot < 20; slot++) {
      uint32 existingItemId = Inventory.getItemId(characterId, slot);
      uint64 existingQty = Inventory.getQuantity(characterId, slot);
      
      // If slot is empty
      if (existingItemId == 0 || existingQty == 0) {
        Inventory.set(characterId, slot, itemId, quantity);
        return;
      }
      
      // If same item and stackable, add to existing stack
      if (existingItemId == itemId && ItemType.getStackable(itemId)) {
        Inventory.setQuantity(characterId, slot, existingQty + quantity);
        return;
      }
    }
    
    revert("Inventory full");
  }

  // Remove item from character inventory with O(1) balance tracking
  function removeItem(uint32 characterId, uint32 slotIndex, uint64 quantity) public {
    // Verify character exists and caller owns it
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    uint32 itemId = Inventory.getItemId(characterId, slotIndex);
    uint64 currentQty = Inventory.getQuantity(characterId, slotIndex);
    require(currentQty >= quantity, "Insufficient quantity");
    
    // Update ItemBalance (O(1) operation)
    uint64 currentBalance = ItemBalance.getTotalQuantity(characterId, itemId);
    ItemBalance.setTotalQuantity(characterId, itemId, currentBalance - quantity);
    
    if (currentQty == quantity) {
      // Remove entire stack
      Inventory.set(characterId, slotIndex, 0, 0);
    } else {
      // Reduce quantity
      Inventory.setQuantity(characterId, slotIndex, currentQty - quantity);
    }
  }

  // Transfer item between characters with O(1) balance tracking
  function transferItem(
    uint32 fromCharacterId, 
    uint32 fromSlot,
    uint32 toCharacterId, 
    uint64 quantity
  ) public {
    // Verify sender owns the from character
    require(Character.getPlayer(fromCharacterId) == _msgSender(), "Not character owner");
    
    uint32 itemId = Inventory.getItemId(fromCharacterId, fromSlot);
    require(itemId != 0, "Empty slot");
    
    // Remove from source (updates ItemBalance internally)
    removeItem(fromCharacterId, fromSlot, quantity);
    
    // Add to destination (updates ItemBalance internally)
    addItemInternal(toCharacterId, itemId, quantity);
  }

  // Internal function to add items (no ownership check) with O(1) balance tracking
  function addItemInternal(uint32 characterId, uint32 itemId, uint64 quantity) internal {
    // Update ItemBalance first (O(1) operation)
    uint64 currentBalance = ItemBalance.getTotalQuantity(characterId, itemId);
    ItemBalance.setTotalQuantity(characterId, itemId, currentBalance + quantity);
    
    for (uint32 slot = 0; slot < 20; slot++) {
      uint32 existingItemId = Inventory.getItemId(characterId, slot);
      uint64 existingQty = Inventory.getQuantity(characterId, slot);
      
      if (existingItemId == 0 || existingQty == 0) {
        Inventory.set(characterId, slot, itemId, quantity);
        return;
      }
      
      if (existingItemId == itemId && ItemType.getStackable(itemId)) {
        Inventory.setQuantity(characterId, slot, existingQty + quantity);
        return;
      }
    }
    
    revert("Inventory full");
  }

  // Get item count for a character - O(1) lookup using ItemBalance table
  function getItemCount(uint32 characterId, uint32 itemId) public view returns (uint64) {
    return ItemBalance.getTotalQuantity(characterId, itemId);
  }
}
