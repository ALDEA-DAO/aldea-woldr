# ALDEA-WOLDR

An on-chain Autonomous World by ALDEA, built using MUD and developed for EVM compatible blockchains.

## Overview

ALDEA-WOLDR is a tribal-focused autonomous world featuring:

- **5 Unique Tribes** - Amazonians, Himalayans, Poseidons, Raes, and Tropicals
- **11 Character Classes** - Archer, Alchemist, Artisan, Blacksmith, Chef, Magician, Merchant, Priest, Tailor, Rebel, Warrior
- **Resource Economy** - Extract, craft, and trade 10+ resource types
- **Building System** - Construct extractors, factories, defensive structures, and special buildings
- **Tribal Bonuses** - Each tribe excels at different resources and crafts
- **Balanced Interdependence** - Yin & Yang design encourages cooperation and trade

Inspired by [Downstream](https://github.com/playmint/ds), adapted for tribal specialization and economic balance.

## Quick Start

### Installation

```bash
pnpm install
```

### Build Contracts

```bash
cd packages/contracts
pnpm build
```

### Deploy Locally

```bash
cd packages/contracts
pnpm deploy:local
```

### Initialize Game Data

After deployment, initialize the game data (items, buildings, recipes, and tribal bonuses):

```bash
cd packages/contracts
pnpm init:local
```

This will call `GameInitSystem.initializeGame()` to set up all game configuration.

### Start Client

```bash
cd packages/client
pnpm dev
```

## Documentation

- **[Game Design](./GAME_DESIGN.md)** - Complete game mechanics and tribal system
- **[Systems Guide](./packages/contracts/SYSTEMS_GUIDE.md)** - How to use smart contracts
- **[Downstream Adaptation](./DOWNSTREAM_ADAPTATION.md)** - How Downstream mechanics were adapted
- **[🎮 Multiplayer System](./MULTIPLAYER.md)** - Decentralized multiplayer implementation (NEW!)
- **[⚡ Quick Start Multiplayer](./MULTIPLAYER_QUICKSTART.md)** - Test multiplayer in 5 minutes
- **[Blockchain Movement](./BLOCKCHAIN_MOVEMENT.md)** - On-chain position syncing

## Key Features

### ✨ Decentralized Multiplayer (NEW!)

**See other players on the map in real-time!** All positions stored on-chain with no central server:

- 👥 **Real-time player syncing** - See all players moving on the map
- ⛓️ **Fully on-chain** - Positions stored in blockchain smart contracts
- 🔄 **Auto-sync** - Updates via events and polling every 3 seconds
- 🎮 **Smooth gameplay** - Fire-and-forget transactions, no gameplay interruption
- 📊 **Player counter** - HUD shows online player count

👉 [**Quick Start Guide**](./MULTIPLAYER_QUICKSTART.md) - Test in 5 minutes!

### Tribal System

Each of the 5 tribes has unique bonuses:

- 🌿 **Amazonians** - Wood & Leather masters (+30% extraction)
- 🏔️ **Himalayans** - Stone & Iron masters (+30% extraction)
- 🌊 **Poseidons** - Water & Trade masters (+30% fish, +20% trade efficiency)
- ☀️ **Raes** - Magic & Energy masters (+30% magic essence)
- 🌴 **Tropicals** - Food & Nature masters (+30% food & herbs)

### Resource Types

**Primary Resources:** Wood, Stone, Iron Ore, Food, Water, Magic Essence, Leather, Cloth, Fish, Herbs

**Crafted Items:** Weapons, Armor, Potions, Tools, Enchanted Items

### Building Types

**Extractors:** Generate resources (Lumber Mill, Quarry, Farm, etc.)

**Factories:** Craft items (Blacksmith, Tailor, Alchemist Lab, Enchanter)

**Defensive:** Protect territory (Watchtower, Fortress)

**Special:** Unique functions (Tribal Shrine, Market)

### Game Systems

1. **Character System** - Create and manage characters
2. **Inventory System** - 20-slot inventory per character
3. **Building System** - Construct, upgrade, and destroy buildings
4. **Crafting System** - Craft items and extract resources
5. **Movement System** - Move characters across the world
6. **Custom Buildings** - Extend with BuildingKind interface

## Smart Contract Architecture

### MUD Tables

- `Player` - Player accounts
- `Character` - Character data (class, tribe, position)
- `World` - Global statistics
- `ItemType` - Item definitions
- `Inventory` - Character inventories  
- `BuildingType` - Building definitions
- `Building` - Placed building instances
- `TribeBonus` - Tribal bonus percentages
- `Recipe` - Crafting recipes

### Systems

- `CharacterSystem` - Character creation
- `InventorySystem` - Item management
- `BuildingSystem` - Building placement
- `CraftingSystem` - Crafting & extraction
- `MovementSystem` - Character movement
- `GameInitSystem` - Game initialization

### Custom Buildings

- `TribalShrine` - Daily tribal blessings
- `Market` - Player-to-player trading

## Example Usage

```solidity
// Create a character
uint32 characterId = CharacterSystem.createCharacter(4); // Blacksmith

// Build a lumber mill
uint32 lumberMill = BuildingSystem.constructBuilding(characterId, 1, 5, 5);

// Extract wood (with tribal bonus if Amazonian)
CraftingSystem.extract(characterId, lumberMill);

// Craft an iron sword at blacksmith
CraftingSystem.craft(characterId, blacksmithId, 1);
```

## Contributing

Contributions welcome! Please read the game design docs to understand the tribal balance philosophy.

## License

MIT
