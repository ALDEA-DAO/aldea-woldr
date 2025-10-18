# Smart Contract Documentation

This folder contains documentation specific to the ALDEA-WOLDR smart contracts.

## Documents

### 📘 [SYSTEMS_GUIDE.md](./SYSTEMS_GUIDE.md)
Guide to interacting with the smart contract systems:
- CharacterSystem - Character creation and management
- MovementSystem - Character movement
- BuildingSystem - Building creation and management
- InventorySystem - Item management
- CraftingSystem - Crafting recipes and production

## Related Documentation

### NFT Oracle System
For detailed documentation on the Cardano NFT verification system:
- [`../nft-oracle-docs/`](../nft-oracle-docs/) - Complete NFT oracle documentation
  - Setup guide
  - Security analysis
  - Technical implementation details

### Smart Contract Code
- [`../src/systems/`](../src/systems/) - System implementations
- [`../src/codegen/`](../src/codegen/) - MUD generated code
- [`../mud.config.ts`](../mud.config.ts) - MUD configuration

## Quick Reference

### Key Contracts
- **CharacterSystem** - Character creation (requires 50 ALDEA + Cardano NFT)
- **MovementSystem** - Move characters on the map
- **BuildingSystem** - Build and manage structures
- **InventorySystem** - Manage character inventory
- **CraftingSystem** - Craft items using recipes

### Token
- **ALDEA** ([`../src/tokens/ALDEA.sol`](../src/tokens/ALDEA.sol)) - Game's native ERC20 token

## Getting Started

1. Read [SYSTEMS_GUIDE.md](./SYSTEMS_GUIDE.md) for system interactions
2. Check [NFT Oracle Setup](../nft-oracle-docs/SETUP_GUIDE.md) for NFT verification
3. Review contract code in [`../src/systems/`](../src/systems/)
