# Aldea Game - Architecture Document

## Overview

Aldea Game is built with a modular architecture designed for scalability and future blockchain integration. The game uses Phaser 3 for the core game engine with TypeScript for type safety and maintainability.

## Project Structure

```
aldea-game/
├── src/
│   ├── main.ts                    # Entry point, game initialization
│   ├── config/
│   │   └── GameConfig.ts          # Centralized game configuration
│   ├── scenes/
│   │   ├── BootScene.ts           # Asset loading and initialization
│   │   ├── MenuScene.ts           # Main menu
│   │   └── GameScene.ts           # Main gameplay scene
│   ├── entities/
│   │   ├── Player.ts              # Player character logic
│   │   └── NPC.ts                 # (Future) NPC behavior
│   ├── managers/
│   │   ├── GameStateManager.ts    # Game state and persistence
│   │   └── BlockchainManager.ts   # (Future) Blockchain integration
│   └── utils/
│       └── WorldGenerator.ts      # Procedural world generation
├── public/
│   └── assets/                    # Game assets (sprites, sounds)
└── dist/                          # Production build
```

## Core Systems

### 1. Scene Management

The game uses Phaser's scene system for different game states:

- **BootScene**: Handles initial asset loading and procedural sprite generation
- **MenuScene**: Main menu with start game functionality
- **GameScene**: Main gameplay with player movement, NPCs, and interactions

### 2. Player System

The `Player` class manages:
- Character movement (8-directional with normalization)
- Animation state based on movement direction
- Physics body and collisions
- Position tracking

### 3. World Generation

The `WorldGenerator` utility creates:
- Procedurally generated terrain using noise functions
- Strategic obstacle placement (trees, rocks)
- NPC spawning in the game world
- Forest clusters and biome-like areas

### 4. Game State Management

The `GameStateManager` handles:
- Player stats (health, coins)
- Inventory system
- Quest progress tracking
- Local storage persistence
- **Blockchain integration points** (placeholders for future implementation)

## Blockchain Integration Strategy

The architecture is designed with blockchain integration in mind:

### Phase 1: Current (Game Only) ✅
- Fully functional browser-based RPG
- Local state management
- Inventory and currency systems

### Phase 2: Wallet Connection (Future)
```typescript
// Example implementation points in GameStateManager
async connectWallet(): Promise<boolean> {
  // Connect to MetaMask or other Web3 wallets
  // Store wallet address
  // Verify ownership
}
```

### Phase 3: NFT Integration (Future)
```typescript
async loadNFTItems(): Promise<void> {
  // Query blockchain for owned NFTs
  // Convert NFTs to in-game items
  // Display in inventory
}
```

### Phase 4: On-Chain Transactions (Future)
```typescript
async syncWithBlockchain(): Promise<void> {
  // Save critical game state to blockchain
  // Execute smart contract transactions
  // Verify transaction completion
}
```

## Key Integration Points

### 1. GameStateManager
This is the primary interface for blockchain features:
- Already includes placeholder methods
- State structure compatible with on-chain storage
- Inventory system ready for NFT items

### 2. Item System
Future items can be linked to NFTs:
```typescript
interface GameItem {
  id: string;
  name: string;
  type: string;
  nftContract?: string;  // Future: NFT contract address
  tokenId?: number;      // Future: NFT token ID
}
```

### 3. Currency System
The coin system can be extended to support:
- On-chain token transfers
- In-game marketplace transactions
- Staking mechanisms

## Technology Stack

- **Frontend**: TypeScript + Phaser 3
- **Build Tool**: Vite
- **Future Blockchain**: Web3.js / Ethers.js
- **Future Backend**: Node.js + Express (for API endpoints)
- **Future Smart Contracts**: Solidity (for on-chain logic)

## Scalability Considerations

### Performance
- Efficient sprite rendering
- Object pooling for reusable game objects
- Optimized collision detection
- Lazy loading of game assets

### Code Organization
- Modular scene-based architecture
- Separation of concerns (entities, managers, utilities)
- Type-safe development with TypeScript
- Centralized configuration

### Future Extensions
- Plugin system for additional features
- Event-driven architecture for blockchain events
- Microservices for backend API
- Database for off-chain state persistence

## Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm run dev
   ```

2. **Building for Production**
   ```bash
   npm run build
   ```

3. **Testing**
   - Manual testing in development mode
   - Future: Unit tests for game logic
   - Future: Integration tests for blockchain features

## Best Practices

1. **Game Logic**
   - Keep scene code focused on visual and interaction logic
   - Move complex logic to managers and utilities
   - Use events for cross-system communication

2. **State Management**
   - All persistent state goes through GameStateManager
   - Use local storage for offline persistence
   - Prepare state structure for blockchain sync

3. **Asset Management**
   - Procedurally generate simple assets
   - Optimize sprite sizes
   - Use sprite sheets for animations

4. **Code Quality**
   - Follow TypeScript strict mode
   - Document complex logic
   - Keep functions small and focused

## Next Steps for Blockchain Integration

1. **Set up Web3 infrastructure**
   - Install Web3.js or Ethers.js
   - Create BlockchainManager
   - Implement wallet connection

2. **Design smart contracts**
   - Item ownership contracts (NFTs)
   - In-game currency token
   - Marketplace contract

3. **Backend API**
   - Off-chain state synchronization
   - Transaction monitoring
   - Player authentication

4. **Security**
   - Secure wallet interactions
   - Transaction validation
   - Anti-cheat mechanisms

## Conclusion

The current architecture provides a solid foundation for a browser-based RPG game while maintaining flexibility for future blockchain integration. The modular design ensures that blockchain features can be added incrementally without major refactoring.
