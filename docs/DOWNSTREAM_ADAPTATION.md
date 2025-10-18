# Downstream to ALDEA-WOLDR Adaptation

## Overview

This document explains how Downstream's game mechanics were adapted for ALDEA-WOLDR, creating a tribal-focused autonomous world with balanced specializations.

---

## Core Adaptations

### **1. From Zones to Tribes**

**Downstream:**
- World divided into Zones (owned via NFT)
- Zones are territorial areas

**ALDEA-WOLDR:**
- World organized by 5 Tribes (civilizations)
- Tribes provide cultural identity and bonuses
- Each character belongs to one tribe permanently
- Tribes create natural economic niches

---

### **2. From Items1155 to ItemType System**

**Downstream:**
- Items use ERC-1155 standard
- Items can be crafted, extracted, spawned
- Stored in "Bags" with 4 slots

**ALDEA-WOLDR:**
- Items defined in ItemType table (MUD)
- Categories: Resources, Crafted, Special
- 20-slot inventory per character
- Stackable vs non-stackable items
- Same crafting/extraction mechanics

**Similarity:** Both systems use item IDs and quantity-based inventory

---

### **3. From BuildingKind to Building System**

**Downstream:**
- Buildings registered via `REGISTER_BUILDING_KIND`
- Building contracts extend `BuildingKind`
- Hooks: `use()`, `construct()`, `onUnitArrive()`, `onUnitLeave()`
- Input/output items defined per building

**ALDEA-WOLDR:**
- Buildings defined in BuildingType table
- Building instances tracked in Building table
- Custom buildings extend `BuildingKind` interface
- Same hook pattern: `use()`, `onConstruct()`, `onCharacterArrive()`, etc.
- Input/output system preserved

**Key Addition:** Tribal bonuses on building outputs

---

### **4. From MobileUnit to Character**

**Downstream:**
- Players control MobileUnits
- Units move on tile grid (z, q, r, s coordinates)
- Units own/equip bags

**ALDEA-WOLDR:**
- Players control Characters
- Characters have (x, y) positions
- Characters have built-in 20-slot inventory
- Characters have class + tribe identity

**Difference:** Simplified from hexagonal to cartesian coordinates

---

### **5. Actions Mapping**

| Downstream Action | ALDEA-WOLDR Equivalent | Notes |
|-------------------|------------------------|-------|
| `MOVE_MOBILE_UNIT` | `moveCharacter()` | Position-based movement |
| `CRAFT` | `craft()` | Uses recipes + building types |
| `EXTRACT` | `extract()` | Resource generation with cooldowns |
| `TRANSFER_ITEM_MOBILE_UNIT` | `transferItem()` | Between characters |
| `CONSTRUCT_BUILDING_MOBILE_UNIT` | `constructBuilding()` | Placement system |
| `BUILDING_USE` | `use()` on BuildingKind | Custom building behavior |
| `REGISTER_BUILDING_KIND` | `BuildingType` table | Defined in initialization |
| `REGISTER_ITEM_KIND` | `ItemType` table | Defined in initialization |

---

## New Mechanics (Not in Downstream)

### **1. Tribal Bonus System**

- Each tribe gets specific resource/crafting bonuses
- Stored in `TribeBonus` table
- Applied automatically during extraction/crafting
- Creates economic specialization

**Example:**
```solidity
// Amazonians extract wood with 30% bonus
uint64 bonusQty = baseQty + (baseQty * 30 / 100);
```

### **2. Class System**

- 11 character classes (Archer, Blacksmith, etc.)
- Classes are cosmetic/lore for now
- Could be extended with class-specific bonuses

### **3. Recipe System**

- Explicit crafting recipes with 1-3 inputs
- Recipes specify required building type
- Output quantities affected by tribal bonuses

### **4. Simplified Coordinate System**

- 2D cartesian grid vs Downstream's hexagonal
- Manhattan distance for movement
- Easier to reason about for players

---

## Preserved Downstream Patterns

### **✓ Building Extensibility**

Both systems allow custom building implementations:

**Downstream:**
```solidity
contract MyBuilding is BuildingKind {
    function use(Game ds, bytes24 building, bytes24 unit, bytes memory data) 
        external override 
    {
        // Custom logic
    }
}
```

**ALDEA-WOLDR:**
```solidity
contract MyBuilding is BuildingKind {
    function use(uint32 characterId, uint32 buildingId, bytes calldata data) 
        external override 
    {
        // Custom logic
    }
}
```

### **✓ Item Lifecycle Hooks**

**Downstream:**
- `onCraft()` - When item is crafted
- `onExtract()` - When item is extracted
- `onSpawn()` - When item is spawned
- `onReward()` - When item is rewarded

**ALDEA-WOLDR:**
- Currently implemented at system level
- Could be extended to per-item hooks if needed

### **✓ State-Based Architecture**

Both use composable state systems:
- **Downstream:** COG framework with State, Dispatcher, Router
- **ALDEA-WOLDR:** MUD framework with Tables, Systems, World

---

## Architectural Comparisons

### **Downstream Architecture**

```
DownstreamGame (BaseGame)
├── State (BaseState)
│   ├── Nodes (Players, Units, Items, Buildings)
│   └── Edges (Relationships)
├── Dispatcher (BaseDispatcher)
│   └── Rules/Actions
└── Router (BaseRouter)
    └── Session Management
```

### **ALDEA-WOLDR Architecture**

```
MUD World
├── Tables (State)
│   ├── Player, Character, World
│   ├── ItemType, Inventory
│   ├── BuildingType, Building
│   ├── Recipe, TribeBonus
├── Systems (Logic)
│   ├── CharacterSystem
│   ├── InventorySystem
│   ├── BuildingSystem
│   ├── CraftingSystem
│   ├── MovementSystem
│   └── GameInitSystem
└── Custom Buildings
    ├── TribalShrine
    └── Market
```

---

## Data Model Comparison

### **Downstream: Graph-Based (Nodes + Edges)**

```
Player -[Owner]-> MobileUnit -[Location]-> Tile
       -[Owner]-> Bag -[Balance]-> Item
                     
Building -[Location]-> Tile
         -[Input]-> Item
         -[Output]-> Item
```

### **ALDEA-WOLDR: Table-Based (Relational)**

```
Character {
    player: address
    tribe: uint32
    class: uint32
    position: (x, y)
}

Inventory {
    characterId: uint32
    slotIndex: uint32
    itemId: uint32
    quantity: uint64
}

Building {
    typeId: uint32
    ownerId: uint32
    position: (x, y)
}
```

**Key Difference:** Graph vs Relational, but both achieve composability

---

## Tribal Economy Design (Yin & Yang)

The tribal system creates natural interdependence:

### **Resource Flow Example**

```
Amazonian Character:
1. Extracts Wood (30% bonus) → 13 wood instead of 10
2. Needs Iron for weapons
3. Trades wood to Himalayan

Himalayan Character:
1. Extracts Iron (30% bonus) → 13 iron instead of 10
2. Needs Wood for handles
3. Trades iron to Amazonian

Both Craft:
- Amazonian: Bow (4 wood + 2 leather)
- Himalayan: Sword (3 iron + 2 wood)
```

This creates:
- **Specialization** - Each tribe produces efficiently
- **Trade** - Tribes need each other's resources
- **Balance** - No single tribe is self-sufficient
- **Cooperation** - Inter-tribal economies emerge

---

## Example Buildings

### **1. TribalShrine (Custom Building)**

**Features:**
- Grants daily resource blessing
- Blessing type based on character's tribe
- Cooldown system (7200 blocks)
- Demonstrates `onConstruct()` hook

**Downstream Equivalent:** Similar to reward/harvest buildings

### **2. Market (Custom Building)**

**Features:**
- Create trade offers (escrow system)
- Accept trades
- Poseidon trading bonus (10% discount)
- Demonstrates complex state management

**Downstream Equivalent:** Could be implemented as AMM pool building

---

## Gas Optimization Strategies

Both systems share similar optimization needs:

1. **Batch Operations**
   - Downstream: Multiple actions in one dispatch
   - ALDEA: Multiple transfers/crafts in one tx

2. **Efficient Storage**
   - Downstream: Packed bytes24 IDs
   - ALDEA: Packed structs, uint32 IDs

3. **Minimize Writes**
   - Both: Read from view functions, write only when necessary

4. **Event Emission**
   - Both: Use events for off-chain indexing

---

## Migration Path from Downstream

If you're familiar with Downstream, here's how to think about ALDEA:

| Downstream Concept | Think of it as... |
|-------------------|-------------------|
| Zone | Tribe territory (conceptual, not spatial) |
| MobileUnit | Character |
| Bag | Character inventory |
| Building at Tile | Building at (x,y) |
| Item in Bag Slot | Item in Inventory Slot |
| CRAFT action | craft() function |
| EXTRACT action | extract() function |
| BuildingKind contract | BuildingKind contract (same!) |

---

## Future Expansion Ideas

### **From Downstream:**
- Combat system (START_COMBAT, FINALISE_COMBAT)
- Quest system (REGISTER_QUEST, ACCEPT_QUEST)
- Advanced item kinds with custom behavior
- Zone ownership (could map to tribal territories)

### **Tribal-Specific:**
- Tribal warfare mechanics
- Tribal alliances/treaties
- Tribal unique buildings
- Seasonal tribal events
- Tribal leader elections

---

## Conclusion

ALDEA-WOLDR successfully adapts Downstream's proven mechanics while adding:

✅ **Tribal Identity** - 5 distinct civilizations with bonuses  
✅ **Economic Balance** - Yin & Yang resource interdependence  
✅ **Simplified Coordinates** - Easier 2D grid  
✅ **MUD Framework** - Modern on-chain state management  
✅ **Class System** - 11 character archetypes  

While preserving:

✅ **Extensible Buildings** - BuildingKind pattern  
✅ **Crafting/Extraction** - Resource economy  
✅ **Item System** - IDs, quantities, categories  
✅ **Composable State** - Modular architecture  

The result is a **balanced, tribal-focused autonomous world** with strong on-chain economics and emergent gameplay.
