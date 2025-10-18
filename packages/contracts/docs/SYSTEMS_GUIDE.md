# ALDEA-WOLDR Systems Guide

## Overview

This guide explains how to interact with the ALDEA-WOLDR smart contract systems.

---

## System Contracts

### 1. CharacterSystem

**Create a new character:**

```solidity
function createCharacter(uint32 class) public returns (uint32 characterId)
```

- `class`: Character class (0 for random, 1-11 for specific class)
- Returns the new character ID
- Automatically assigns a random tribe
- Sets starting position to (0, 0)

**Classes:**
- 0: Random
- 1: Archer
- 2: Alchemist
- 3: Artisan
- 4: Blacksmith
- 5: Chef
- 6: Magician
- 7: Merchant
- 8: Priest
- 9: Tailor
- 10: Rebel
- 11: Warrior

---

### 2. InventorySystem

**Add items to inventory:**

```solidity
function addItem(uint32 characterId, uint32 itemId, uint64 quantity) public
```

**Remove items from inventory:**

```solidity
function removeItem(uint32 characterId, uint32 slotIndex, uint64 quantity) public
```

**Transfer items between characters:**

```solidity
function transferItem(
  uint32 fromCharacterId,
  uint32 fromSlot,
  uint32 toCharacterId,
  uint64 quantity
) public
```

**Check item count:**

```solidity
function getItemCount(uint32 characterId, uint32 itemId) public view returns (uint64)
```

---

### 3. BuildingSystem

**Construct a building:**

```solidity
function constructBuilding(
  uint32 characterId,
  uint32 buildingTypeId,
  int32 x,
  int32 y
) public returns (uint32 buildingInstanceId)
```

**Upgrade a building:**

```solidity
function upgradeBuilding(uint32 buildingInstanceId) public
```

**Destroy a building:**

```solidity
function destroyBuilding(uint32 buildingInstanceId) public
```

---

### 4. CraftingSystem

**Craft items using a recipe:**

```solidity
function craft(
  uint32 characterId,
  uint32 buildingInstanceId,
  uint32 recipeId
) public
```

Process:
1. Verifies character owns the action
2. Checks recipe requirements
3. Validates building type matches recipe
4. Removes input items from inventory
5. Applies tribal bonuses to output
6. Adds crafted items to inventory
7. Updates building cooldown

**Extract resources from a building:**

```solidity
function extract(uint32 characterId, uint32 buildingInstanceId) public
```

Process:
1. Verifies building is an extractor
2. Checks cooldown (100 blocks)
3. Applies tribal bonuses to output
4. Adds resources to inventory
5. Updates last used block

---

### 5. MovementSystem

**Move character:**

```solidity
function moveCharacter(uint32 characterId, int32 newX, int32 newY) public
```

- Maximum movement: 5 tiles per action (Manhattan distance)

**Teleport character:**

```solidity
function teleportCharacter(uint32 characterId, int32 newX, int32 newY) public
```

- Unrestricted movement (use for admin or special abilities)

**Get position:**

```solidity
function getPosition(uint32 characterId) public view returns (int32 x, int32 y)
```

---

### 6. GameInitSystem

**Initialize the game (one-time setup):**

```solidity
function initializeGame() public
```

This sets up:
- All item types (resources, crafted items, special items)
- All building types (extractors, factories, defensive, special)
- All crafting recipes
- All tribal bonuses

**⚠️ Must be called once after deployment before game can start!**

---

## Item IDs Reference

### Primary Resources (1-10)
- 1: Wood
- 2: Stone
- 3: Iron Ore
- 4: Food
- 5: Water
- 6: Magic Essence
- 7: Leather
- 8: Cloth
- 9: Fish
- 10: Herbs

### Crafted Items (101-110)
- 101: Iron Sword
- 102: Bow
- 103: Staff
- 104: Iron Armor
- 105: Leather Armor
- 106: Health Potion
- 107: Mana Potion
- 108: Iron Axe
- 109: Pickaxe
- 110: Fishing Rod

### Special Items (201-203)
- 201: Enchanted Gem
- 202: Ancient Relic
- 203: Tribal Totem

---

## Building Type IDs Reference

### Extractors (1-7)
- 1: Lumber Mill → Wood
- 2: Quarry → Stone
- 3: Iron Mine → Iron Ore
- 4: Farm → Food
- 5: Fishing Dock → Fish
- 6: Herbalist Hut → Herbs
- 7: Mana Well → Magic Essence

### Factories (51-54)
- 51: Blacksmith
- 52: Tailor
- 53: Alchemist Lab
- 54: Enchanter

### Defensive (101-102)
- 101: Watchtower
- 102: Fortress

### Special (151-152)
- 151: Tribal Shrine
- 152: Market

---

## Recipe IDs Reference

1. Iron Sword (3 Iron + 2 Wood → 1 Sword)
2. Bow (4 Wood + 2 Leather → 1 Bow)
3. Staff (3 Wood + 2 Magic Essence → 1 Staff)
4. Iron Armor (5 Iron + 3 Leather → 1 Armor)
5. Leather Armor (6 Leather + 2 Cloth → 1 Armor)
6. Health Potion (2 Herbs + 1 Food → 3 Potions)
7. Mana Potion (3 Magic Essence + 1 Herbs → 2 Potions)
8. Iron Axe (2 Iron + 2 Wood → 1 Axe)
9. Pickaxe (3 Iron + 1 Wood → 1 Pickaxe)
10. Fishing Rod (3 Wood + 1 Cloth → 1 Rod)
11. Enchanted Gem (5 Magic Essence + 2 Stone → 1 Gem)

---

## Tribe IDs & Bonuses

### 0: Amazonians
- +30% Wood (Item 1)
- +30% Leather (Item 7)
- +20% Bow crafting (Item 102)

### 1: Himalayans
- +30% Stone (Item 2)
- +30% Iron (Item 3)
- +20% Iron Armor (Item 104)

### 2: Poseidons
- +30% Water (Item 5)
- +30% Fish (Item 9)
- +20% Cloth (Item 8)

### 3: Raes
- +30% Magic Essence (Item 6)
- +20% Stone (Item 2)
- +25% Staff (Item 103)
- +25% Mana Potion (Item 107)

### 4: Tropicals
- +30% Food (Item 4)
- +30% Herbs (Item 10)
- +25% Health Potion (Item 106)
- +20% Wood (Item 1)

---

## Usage Examples

### Example 1: Create Character & Start Gathering

```solidity
// 1. Create a character (Blacksmith class, randomly assigned tribe)
uint32 myCharacter = CharacterSystem.createCharacter(4);

// 2. Initialize game data (admin, one-time)
GameInitSystem.initializeGame();

// 3. Build a lumber mill at position (5, 5)
uint32 lumberMill = BuildingSystem.constructBuilding(myCharacter, 1, 5, 5);

// 4. Move character to the lumber mill
MovementSystem.moveCharacter(myCharacter, 5, 5);

// 5. Extract wood (with tribal bonus if Amazonian/Tropical)
CraftingSystem.extract(myCharacter, lumberMill);

// 6. Check wood count
uint64 woodCount = InventorySystem.getItemCount(myCharacter, 1);
```

### Example 2: Craft a Weapon

```solidity
// Assuming character has materials in inventory

// 1. Build a blacksmith at position (10, 10)
uint32 blacksmith = BuildingSystem.constructBuilding(myCharacter, 51, 10, 10);

// 2. Move to blacksmith
MovementSystem.moveCharacter(myCharacter, 10, 10);

// 3. Craft an iron sword (Recipe 1: 3 Iron + 2 Wood)
CraftingSystem.craft(myCharacter, blacksmith, 1);

// 4. Check inventory for sword
uint64 swordCount = InventorySystem.getItemCount(myCharacter, 101);
```

### Example 3: Trade Resources

```solidity
// Transfer 10 wood from character 1 to character 2

// 1. Find slot with wood in character 1's inventory
// (Assume wood is in slot 0)

// 2. Transfer
InventorySystem.transferItem(
  1,  // fromCharacterId
  0,  // fromSlot
  2,  // toCharacterId
  10  // quantity
);
```

---

## Integration with MUD Client

### Reading Data

```typescript
import { useMUD } from "./MUDContext";
import { useComponentValue } from "@latticexyz/react";

const {
  components: { Character, Inventory, Building },
  systemCalls: { createCharacter, extract, craft }
} = useMUD();

// Get character data
const character = useComponentValue(Character, characterId);
console.log(`Tribe: ${character.tribe}, Class: ${character.class}`);

// Get inventory slot
const inventorySlot = useComponentValue(Inventory, { 
  characterId: 1, 
  slotIndex: 0 
});
console.log(`Item: ${inventorySlot.itemId}, Qty: ${inventorySlot.quantity}`);
```

### Calling Systems

```typescript
// Create character
await systemCalls.createCharacter(4); // Blacksmith class

// Extract resources
await systemCalls.extract(characterId, buildingId);

// Craft item
await systemCalls.craft(characterId, buildingId, recipeId);
```

---

## Gas Optimization Tips

1. **Batch operations** when possible
2. **Use view functions** for reads (no gas)
3. **Minimize storage writes** - update multiple fields in one transaction
4. **Stack items** in inventory to save slots
5. **Plan building placement** to minimize movement

---

## Security Best Practices

1. Always verify ownership before actions
2. Check cooldowns on extractors
3. Validate inventory has space before adding items
4. Ensure building requirements are met
5. Handle edge cases (empty slots, max values)

---

## Troubleshooting

**"Not character owner"**
- Ensure you're calling from the correct account
- Verify the character ID is correct

**"Inventory full"**
- Clear space by crafting or transferring items
- Each character has 20 slots maximum

**"Extraction on cooldown"**
- Wait 100 blocks between extractions
- Check `Building.lastUsedBlock`

**"Insufficient [item]"**
- Verify you have required materials
- Check with `getItemCount()`

**"Wrong building type"**
- Ensure you're at the correct building for the recipe
- Some recipes require specific buildings

---

## Next Steps

1. Deploy contracts to your network
2. Call `GameInitSystem.initializeGame()`
3. Create characters for players
4. Build extractors to start economy
5. Set up crafting buildings
6. Enable player trading
7. Monitor tribal balance

For more information, see [GAME_DESIGN.md](../../GAME_DESIGN.md)
