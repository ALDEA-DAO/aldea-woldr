# Aldea Game - MUD Integration Notes

## Migration Complete ✅

The Aldea Game has been successfully ported from the standalone `aldea-game` project to the `aldea-woldr/packages/client` package.

## What Was Changed

### Replaced Files
- ✅ **src/** - Complete game source code (scenes, entities, managers, utils)
- ✅ **index.html** - Game-specific HTML structure
- ✅ **vite.config.ts** - Updated for Phaser (removed React plugin)
- ✅ **tsconfig.json** - Updated TypeScript config for game
- ✅ **package.json** - Added Phaser, kept MUD dependencies for future integration

### Preserved
- ✅ **MUD Dependencies** - All LatticeMUD packages remain in package.json
- ✅ **Contracts workspace** - Link to smart contracts package maintained
- ✅ **Original client** - Backed up to `packages/client.backup`

## Current State

The game is now running as a **standalone Phaser 3 game** at the client package location, but it's architecturally ready for blockchain integration.

### What Works Now
- ✅ Full Zelda-like RPG gameplay
- ✅ Player movement and animations
- ✅ NPC interactions
- ✅ Procedurally generated world
- ✅ Game state management with local storage
- ✅ Pause menu system

## Next Steps: Blockchain Integration

The architecture is designed with MUD integration in mind. Here's the roadmap:

### Phase 1: Connect to MUD World (Upcoming)

1. **Set up MUD Network Connection**
   ```typescript
   // In src/managers/GameStateManager.ts
   import { useMUD } from './mud/MUDContext';
   
   // Connect to the MUD world
   const { network, systemCalls } = useMUD();
   ```

2. **Sync Player Position On-Chain**
   - Store player position in MUD tables
   - Read initial position from blockchain on game start
   - Update position periodically or on significant moves

3. **Create MUD Tables for Game State**
   ```solidity
   // In contracts package
   table Player {
     key bytes32 playerId;
     value uint32 x;
     value uint32 y;
     value uint32 health;
   }
   
   table Inventory {
     key bytes32 playerId;
     key bytes32 itemId;
     value uint32 quantity;
   }
   ```

### Phase 2: NFT Items

1. **Load NFT Inventory**
   - Query player's NFT holdings
   - Convert NFTs to in-game items
   - Display in inventory system

2. **Item Ownership Verification**
   - Check blockchain for item ownership
   - Prevent use of items player doesn't own
   - Enable trading through smart contracts

### Phase 3: On-Chain Game Logic

1. **Combat System**
   - Execute combat through MUD systems
   - Store combat results on-chain
   - Reward items as NFTs

2. **Marketplace**
   - In-game marketplace for trading items
   - Buy/sell using on-chain tokens
   - Peer-to-peer trading

## Development Commands

### Run the game (standalone)
```bash
pnpm --filter client dev
```

### Run with blockchain (when integrated)
```bash
# Terminal 1: Start local chain
pnpm dev:node

# Terminal 2: Deploy contracts
pnpm dev:deploy

# Terminal 3: Start client
pnpm --filter client dev:with-chain
```

### Build for production
```bash
pnpm --filter client build
```

## Key Integration Points

### GameStateManager (`src/managers/GameStateManager.ts`)
This is the **primary bridge** for blockchain features:
- Contains placeholder methods: `connectWallet()`, `syncWithBlockchain()`, `loadNFTItems()`
- State structure compatible with on-chain storage
- Ready to integrate with MUD's reactive store

### How to Add MUD Integration

1. Create `src/mud/` directory with MUD setup files
2. Import MUD context in `GameStateManager`
3. Replace placeholder methods with actual MUD system calls
4. Use MUD's reactive queries to update game state

Example:
```typescript
// src/managers/GameStateManager.ts
import { useMUD } from '../mud/MUDContext';

class GameStateManager {
  private mud: ReturnType<typeof useMUD>;
  
  async syncWithBlockchain() {
    const { systemCalls } = this.mud;
    await systemCalls.updatePlayerPosition(this.player.x, this.player.y);
  }
}
```

## Architecture Benefits

- **Modular Design**: Game logic separated from blockchain logic
- **Progressive Enhancement**: Works standalone, enhanced with blockchain
- **Type Safety**: TypeScript throughout for both game and blockchain code
- **Scalable**: Ready for features like multiplayer, quests, achievements

## Backup

Original MUD client backed up to: `packages/client.backup`

To restore original client if needed:
```bash
rm -rf packages/client
mv packages/client.backup packages/client
pnpm install
```

## Questions?

See:
- `README.md` - Game features and controls
- `ARCHITECTURE.md` - Detailed architecture documentation
- MUD docs: https://mud.dev
