// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { ItemType, BuildingType, Recipe, TribeBonus, GameConfig } from "../codegen/index.sol";

contract GameInitSystem is System {

  // Initialize all game data (items, buildings, recipes, bonuses)
  function initializeGame() public {
    require(!GameConfig.getInitialized(), "Already initialized");
    
    initializeItems();
    initializeBuildings();
    initializeRecipes();
    initializeTribalBonuses();
    
    GameConfig.setInitialized(true);
  }

  // Helper to convert string literal to bytes32
  function toBytes32(string memory source) internal pure returns (bytes32 result) {
    bytes memory tempBytes = bytes(source);
    if (tempBytes.length == 0) {
      return 0x0;
    }
    assembly {
      result := mload(add(source, 32))
    }
  }

  // Initialize all item types - using bytes32 for gas efficiency
  function initializeItems() internal {
    // PRIMARY RESOURCES (Category 0)
    ItemType.set(1, 0, true, toBytes32("Wood"));
    ItemType.set(2, 0, true, toBytes32("Stone"));
    ItemType.set(3, 0, true, toBytes32("Iron Ore"));
    ItemType.set(4, 0, true, toBytes32("Food"));
    ItemType.set(5, 0, true, toBytes32("Water"));
    ItemType.set(6, 0, true, toBytes32("Magic Essence"));
    ItemType.set(7, 0, true, toBytes32("Leather"));
    ItemType.set(8, 0, true, toBytes32("Cloth"));
    ItemType.set(9, 0, true, toBytes32("Fish"));
    ItemType.set(10, 0, true, toBytes32("Herbs"));
    
    // CRAFTED ITEMS (Category 1)
    ItemType.set(101, 1, false, toBytes32("Iron Sword"));
    ItemType.set(102, 1, false, toBytes32("Bow"));
    ItemType.set(103, 1, false, toBytes32("Staff"));
    ItemType.set(104, 1, false, toBytes32("Iron Armor"));
    ItemType.set(105, 1, false, toBytes32("Leather Armor"));
    ItemType.set(106, 1, true, toBytes32("Health Potion"));
    ItemType.set(107, 1, true, toBytes32("Mana Potion"));
    ItemType.set(108, 1, false, toBytes32("Iron Axe"));
    ItemType.set(109, 1, false, toBytes32("Pickaxe"));
    ItemType.set(110, 1, false, toBytes32("Fishing Rod"));
    
    // SPECIAL ITEMS (Category 2)
    ItemType.set(201, 2, false, toBytes32("Enchanted Gem"));
    ItemType.set(202, 2, false, toBytes32("Ancient Relic"));
    ItemType.set(203, 2, false, toBytes32("Tribal Totem"));
  }

  // Initialize building types - using bytes32 for gas efficiency
  function initializeBuildings() internal {
    // EXTRACTORS (Category 0)
    // Lumber Mill - Outputs Wood (Amazonian bonus)
    BuildingType.set(1, 0, 4, 0, 0, 0, 0, 1, 10, 0, 0, toBytes32("Lumber Mill"));
    
    // Quarry - Outputs Stone (Himalayan bonus)
    BuildingType.set(2, 0, 2, 0, 0, 0, 0, 2, 10, 0, 0, toBytes32("Quarry"));
    
    // Iron Mine - Outputs Iron (Himalayan bonus)
    BuildingType.set(3, 0, 2, 0, 0, 0, 0, 3, 8, 0, 0, toBytes32("Iron Mine"));
    
    // Farm - Outputs Food (Tropical bonus)
    BuildingType.set(4, 0, 1, 0, 0, 0, 0, 4, 15, 0, 0, toBytes32("Farm"));
    
    // Fishing Dock - Outputs Fish (Poseidon bonus)
    BuildingType.set(5, 0, 3, 0, 0, 0, 0, 9, 12, 0, 0, toBytes32("Fishing Dock"));
    
    // Herbalist Hut - Outputs Herbs (Tropical bonus)
    BuildingType.set(6, 0, 1, 0, 0, 0, 0, 10, 8, 0, 0, toBytes32("Herbalist Hut"));
    
    // Mana Well - Outputs Magic Essence (Rae bonus)
    BuildingType.set(7, 0, 5, 0, 0, 0, 0, 6, 5, 0, 0, toBytes32("Mana Well"));
    
    // FACTORIES (Category 1)
    // Blacksmith - Crafts weapons and tools
    BuildingType.set(51, 1, 0, 3, 5, 1, 3, 0, 0, 0, 0, toBytes32("Blacksmith"));
    
    // Tailor - Crafts armor and cloth items
    BuildingType.set(52, 1, 0, 7, 4, 8, 4, 0, 0, 0, 0, toBytes32("Tailor"));
    
    // Alchemist Lab - Crafts potions
    BuildingType.set(53, 1, 0, 10, 3, 6, 2, 0, 0, 0, 0, toBytes32("Alchemist Lab"));
    
    // Enchanter - Crafts magical items
    BuildingType.set(54, 1, 0, 6, 5, 0, 0, 0, 0, 0, 0, toBytes32("Enchanter"));
    
    // DEFENSIVE BUILDINGS (Category 2)
    // Watchtower
    BuildingType.set(101, 2, 0, 1, 20, 2, 15, 0, 0, 0, 0, toBytes32("Watchtower"));
    
    // Fortress
    BuildingType.set(102, 2, 0, 2, 50, 3, 30, 0, 0, 0, 0, toBytes32("Fortress"));
    
    // SPECIAL BUILDINGS (Category 3)
    // Tribal Shrine
    BuildingType.set(151, 3, 0, 1, 10, 2, 10, 0, 0, 0, 0, toBytes32("Tribal Shrine"));
    
    // Market
    BuildingType.set(152, 3, 0, 1, 15, 8, 10, 0, 0, 0, 0, toBytes32("Market"));
  }

  // Initialize crafting recipes - using bytes32 for gas efficiency
  function initializeRecipes() internal {
    // WEAPONS
    // Iron Sword: 3 Iron + 2 Wood -> 1 Sword (at Blacksmith)
    Recipe.set(1, 3, 3, 1, 2, 0, 0, 101, 1, 51, toBytes32("Iron Sword"));
    
    // Bow: 4 Wood + 2 Leather -> 1 Bow (at any Factory)
    Recipe.set(2, 1, 4, 7, 2, 0, 0, 102, 1, 51, toBytes32("Bow"));
    
    // Staff: 3 Wood + 2 Magic Essence -> 1 Staff (at Enchanter)
    Recipe.set(3, 1, 3, 6, 2, 0, 0, 103, 1, 54, toBytes32("Staff"));
    
    // ARMOR
    // Iron Armor: 5 Iron + 3 Leather -> 1 Iron Armor (at Blacksmith)
    Recipe.set(4, 3, 5, 7, 3, 0, 0, 104, 1, 51, toBytes32("Iron Armor"));
    
    // Leather Armor: 6 Leather + 2 Cloth -> 1 Leather Armor (at Tailor)
    Recipe.set(5, 7, 6, 8, 2, 0, 0, 105, 1, 52, toBytes32("Leather Armor"));
    
    // POTIONS
    // Health Potion: 2 Herbs + 1 Food -> 3 Health Potions (at Alchemist)
    Recipe.set(6, 10, 2, 4, 1, 0, 0, 106, 3, 53, toBytes32("Health Potion"));
    
    // Mana Potion: 3 Magic Essence + 1 Herbs -> 2 Mana Potions (at Alchemist)
    Recipe.set(7, 6, 3, 10, 1, 0, 0, 107, 2, 53, toBytes32("Mana Potion"));
    
    // TOOLS
    // Iron Axe: 2 Iron + 2 Wood -> 1 Axe (at Blacksmith)
    Recipe.set(8, 3, 2, 1, 2, 0, 0, 108, 1, 51, toBytes32("Iron Axe"));
    
    // Pickaxe: 3 Iron + 1 Wood -> 1 Pickaxe (at Blacksmith)
    Recipe.set(9, 3, 3, 1, 1, 0, 0, 109, 1, 51, toBytes32("Pickaxe"));
    
    // Fishing Rod: 3 Wood + 1 Cloth -> 1 Fishing Rod (at any Factory)
    Recipe.set(10, 1, 3, 8, 1, 0, 0, 110, 1, 0, toBytes32("Fishing Rod"));
    
    // SPECIAL
    // Enchanted Gem: 5 Magic Essence + 2 Stone -> 1 Gem (at Enchanter)
    Recipe.set(11, 6, 5, 2, 2, 0, 0, 201, 1, 54, toBytes32("Enchanted Gem"));
  }

  // Initialize tribal bonuses
  function initializeTribalBonuses() internal {
    // Tribe IDs: 0=Amazonians, 1=Himalayans, 2=Poseidons, 3=Raes, 4=Tropicals
    
    // AMAZONIANS (Tribe 0) - Wood & Leather Masters
    TribeBonus.set(0, 1, 30);  // +30% Wood
    TribeBonus.set(0, 7, 30);  // +30% Leather
    TribeBonus.set(0, 102, 20); // +20% Bow crafting
    
    // HIMALAYANS (Tribe 1) - Stone & Iron Masters
    TribeBonus.set(1, 2, 30);  // +30% Stone
    TribeBonus.set(1, 3, 30);  // +30% Iron
    TribeBonus.set(1, 104, 20); // +20% Iron Armor crafting
    
    // POSEIDONS (Tribe 2) - Water & Trade Masters
    TribeBonus.set(2, 5, 30);  // +30% Water
    TribeBonus.set(2, 9, 30);  // +30% Fish
    TribeBonus.set(2, 8, 20);  // +20% Cloth
    
    // RAES (Tribe 3) - Magic & Energy Masters
    TribeBonus.set(3, 6, 30);  // +30% Magic Essence
    TribeBonus.set(3, 2, 20);  // +20% Stone
    TribeBonus.set(3, 103, 25); // +25% Staff crafting
    TribeBonus.set(3, 107, 25); // +25% Mana Potion crafting
    
    // TROPICALS (Tribe 4) - Food & Nature Masters
    TribeBonus.set(4, 4, 30);  // +30% Food
    TribeBonus.set(4, 10, 30); // +30% Herbs
    TribeBonus.set(4, 106, 25); // +25% Health Potion crafting
    TribeBonus.set(4, 1, 20);  // +20% Wood
  }
}
