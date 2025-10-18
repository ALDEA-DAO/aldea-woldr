# ALDEA-WOLDR Game Design Document

## Overview

ALDEA-WOLDR is an on-chain autonomous world that combines tribal civilization mechanics with resource management, crafting, and building systems inspired by Downstream. Built on MUD framework for EVM-compatible blockchains.

---

## Core Concepts

### **Tribes (Civilizations)**

The world has **5 distinct tribes**, each with unique bonuses and specializations:

#### 🌿 **Amazonians** - Forest Hunters
- **Philosophy**: Masters of the forest, expert archers and hunters
- **Resource Bonuses**: +30% Wood, +30% Leather
- **Crafting Bonuses**: +20% Bow production
- **Signature Buildings**: Lumber Mill, Hunter's Lodge, Archery Range
- **Best Classes**: Archer, Rebel, Artisan

#### 🏔️ **Himalayans** - Mountain Stronghold
- **Philosophy**: Stone and metal workers, defensive masters
- **Resource Bonuses**: +30% Stone, +30% Iron Ore
- **Crafting Bonuses**: +20% Iron Armor production
- **Signature Buildings**: Quarry, Iron Mine, Fortress
- **Best Classes**: Blacksmith, Warrior, Artisan

#### 🌊 **Poseidons** - Ocean Traders
- **Philosophy**: Maritime commerce and fishing experts
- **Resource Bonuses**: +30% Water, +30% Fish, +20% Cloth
- **Crafting Bonuses**: Trade efficiency
- **Signature Buildings**: Fishing Dock, Harbor, Market
- **Best Classes**: Merchant, Tailor, Magician

#### ☀️ **Raes** - Sun Mystics
- **Philosophy**: Magical energy and mystical crafting
- **Resource Bonuses**: +30% Magic Essence, +20% Stone
- **Crafting Bonuses**: +25% Staff production, +25% Mana Potions
- **Signature Buildings**: Mana Well, Solar Temple, Enchanter
- **Best Classes**: Magician, Alchemist, Priest

#### 🌴 **Tropicals** - Nature Healers
- **Philosophy**: Agricultural abundance and healing arts
- **Resource Bonuses**: +30% Food, +30% Herbs, +20% Wood
- **Crafting Bonuses**: +25% Health Potion production
- **Signature Buildings**: Farm, Herbalist Hut, Healing Spring
- **Best Classes**: Chef, Priest, Alchemist

---

## Character Classes

Each character belongs to one of **11 classes**:

1. **Archer** - Ranged combat specialist
2. **Alchemist** - Potion and transmutation master
3. **Artisan** - General crafting expert
4. **Blacksmith** - Weapons and armor smith
5. **Chef** - Food production specialist
6. **Magician** - Arcane magic user
7. **Merchant** - Trading and commerce
8. **Priest** - Healing and support
9. **Tailor** - Cloth and leather worker
10. **Rebel** - Guerrilla tactics specialist
11. **Warrior** - Melee combat master

---

## Resource System

### **Primary Resources (Tier 1)**

Resources are extracted from specialized buildings:

| Resource | Extractor Building | Primary Tribes | Uses |
|----------|-------------------|----------------|------|
| Wood | Lumber Mill | Amazonians, Tropicals | Construction, weapons, tools |
| Stone | Quarry | Himalayans, Raes | Construction, defense |
| Iron Ore | Iron Mine | Himalayans, Poseidons | Weapons, armor, tools |
| Food | Farm | Tropicals, Amazonians | Health, sustenance |
| Water | Well | Poseidons, Tropicals | Survival, potions |
| Magic Essence | Mana Well | Raes, Poseidons | Enchantments, spells |
| Leather | Hunter's Lodge | Amazonians, Raes | Armor, crafting |
| Cloth | Weaver | Poseidons, Tropicals | Armor, items |
| Fish | Fishing Dock | Poseidons | Food source |
| Herbs | Herbalist Hut | Tropicals | Potions, healing |

### **Crafted Items (Tier 2)**

Items created through crafting recipes:

**Weapons:**
- Iron Sword (3 Iron + 2 Wood)
- Bow (4 Wood + 2 Leather)
- Staff (3 Wood + 2 Magic Essence)

**Armor:**
- Iron Armor (5 Iron + 3 Leather)
- Leather Armor (6 Leather + 2 Cloth)

**Potions:**
- Health Potion (2 Herbs + 1 Food) - Restores health
- Mana Potion (3 Magic Essence + 1 Herbs) - Restores mana

**Tools:**
- Iron Axe (2 Iron + 2 Wood) - Faster wood gathering
- Pickaxe (3 Iron + 1 Wood) - Faster mining
- Fishing Rod (3 Wood + 1 Cloth) - Better fishing

**Special:**
- Enchanted Gem (5 Magic Essence + 2 Stone)

---

## Building System

### **Building Categories**

#### **Extractors (Category 0)**
- Extract raw resources from the environment
- Cooldown between extractions (100 blocks)
- Output affected by tribal bonuses
- Examples: Lumber Mill, Quarry, Farm, Fishing Dock

#### **Factories (Category 1)**
- Convert input materials into crafted items
- Require specific recipes
- Can be upgraded for efficiency
- Examples: Blacksmith, Tailor, Alchemist Lab, Enchanter

#### **Defensive (Category 2)**
- Protect territory
- Can be garrisoned
- Examples: Watchtower, Fortress

#### **Special (Category 3)**
- Unique functions
- Examples: Tribal Shrine, Market, Temple

### **Building Construction**

Requirements:
1. Character at valid location
2. Required materials in inventory
3. Location not occupied
4. Proper building type unlocked

---

## Game Systems

### **1. Inventory System**

- Each character has **20 inventory slots**
- Stackable items share slots
- Non-stackable items use individual slots
- Functions:
  - `addItem()` - Add items to inventory
  - `removeItem()` - Remove items from inventory
  - `transferItem()` - Transfer between characters

### **2. Crafting System**

- Craft items using recipes at appropriate buildings
- Consumes input materials from inventory
- Outputs crafted items with tribal bonuses applied
- Recipe requirements:
  - Specific building type (or any factory)
  - Required input items
  - Character must be at building location

### **3. Extraction System**

- Extract resources from extractor buildings
- Cooldown period between extractions
- Tribal bonuses multiply output
- Formula: `outputQty = baseQty + (baseQty * bonusPercentage / 100)`

### **4. Movement System**

- Characters can move across the world grid
- Manhattan distance calculation
- Maximum movement distance per action: 5 tiles
- Position stored as (x, y) coordinates

### **5. Building Management**

- Construct buildings at locations
- Upgrade buildings to increase efficiency
- Destroy buildings to reclaim space
- Each building tracks:
  - Owner
  - Type
  - Level
  - Last used block (for cooldowns)

---

## Tribal Balance (Yin & Yang Philosophy)

The game is designed with **complementary specializations**:

### Resource Interdependence

| Tribe | Produces Efficiently | Needs from Others |
|-------|---------------------|-------------------|
| Amazonians | Wood, Leather | Stone, Iron, Magic |
| Himalayans | Stone, Iron | Food, Cloth, Wood |
| Poseidons | Fish, Cloth, Water | Stone, Iron, Herbs |
| Raes | Magic Essence | Food, Leather, Fish |
| Tropicals | Food, Herbs | Iron, Stone, Magic |

### Crafting Synergies

- **Weapons** require cooperation between Amazonians (wood/leather) and Himalayans (iron)
- **Armor** needs Himalayans (iron), Amazonians (leather), and Poseidons (cloth)
- **Potions** need Tropicals (herbs/food) and Raes (magic essence)
- **Tools** require multiple tribe resources

This creates a **natural trading economy** where tribes must cooperate to access all game features.

---

## Smart Contract Architecture

### **MUD Tables**

1. **Player** - Player accounts and balances
2. **Character** - Character data (class, tribe, position)
3. **World** - Global statistics
4. **ItemType** - Item definitions
5. **Inventory** - Character inventories
6. **BuildingType** - Building definitions
7. **Building** - Placed building instances
8. **TribeBonus** - Tribal bonus percentages
9. **Recipe** - Crafting recipes

### **Systems (Contracts)**

1. **CharacterSystem** - Create and manage characters
2. **InventorySystem** - Manage item storage
3. **BuildingSystem** - Construct and manage buildings
4. **CraftingSystem** - Craft items and extract resources
5. **MovementSystem** - Move characters
6. **GameInitSystem** - Initialize game data

---

## Economy & Balance

### **Resource Scarcity**

- Base extraction rates balanced across tribes
- Cooldowns prevent resource flooding
- Tribal bonuses create specialization, not monopolies

### **Crafting Costs**

- Higher tier items require more resources
- Multiple input types encourage trading
- Tribal bonuses reduce costs for specialized items

### **Building Costs**

- Construction requires significant investment
- Upgrades provide incremental benefits
- Defensive structures most expensive

---

## Future Expansions

Potential additions to the game:

1. **Combat System** - PvP and PvE battles
2. **Quests** - Tribal missions and objectives
3. **Alliances** - Multi-tribe cooperation
4. **Land Ownership** - Territory control via NFTs
5. **Seasonal Events** - Time-based bonuses
6. **Advanced Crafting** - Tier 3 legendary items
7. **Character Progression** - XP and leveling
8. **Tribal Wars** - Large-scale conflicts

---

## Technical Notes

### **Gas Optimization**

- Use packed structs where possible
- Minimize storage writes
- Batch operations when feasible
- Use events for off-chain tracking

### **Upgradeability**

- MUD framework provides built-in upgradeability
- Tables can be extended
- Systems can be replaced
- World remains persistent

### **Security Considerations**

- Ownership verification on all actions
- Cooldown enforcement
- Inventory bounds checking
- Building placement validation

---

## Conclusion

ALDEA-WOLDR creates a **balanced, interconnected ecosystem** where five unique tribes each excel at different aspects of the game world. Drawing inspiration from Downstream's proven mechanics while adding unique tribal identity and specialization, the game encourages both competition and cooperation in a fully on-chain autonomous world.

The **Yin & Yang balance** ensures no single tribe can dominate all aspects, creating natural economic incentives for trade, diplomacy, and strategic tribal selection based on playstyle preferences.
