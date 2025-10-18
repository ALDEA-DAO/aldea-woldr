# Aldea Game 🎮

A browser-based open-world RPG game built with Phaser 3, designed for future blockchain integration.

## Features

- **Open World Exploration**: Navigate through a Zelda-like world
- **Character Movement**: Smooth 8-directional movement with animations
- **Interactive Environment**: Collision detection, NPCs, and interactive objects
- **Scalable Architecture**: Designed for easy blockchain and API integration
- **Modern Tech Stack**: Built with TypeScript, Vite, and Phaser 3

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will open automatically at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Controls

- **Arrow Keys** or **WASD**: Move character
- **Space**: Interact with NPCs/objects
- **ESC**: Pause menu

## Project Structure

```
aldea-game/
├── src/
│   ├── main.ts              # Game initialization
│   ├── config/              # Game configuration
│   ├── scenes/              # Game scenes
│   │   ├── BootScene.ts     # Asset loading
│   │   ├── MenuScene.ts     # Main menu
│   │   └── GameScene.ts     # Main gameplay
│   ├── entities/            # Game entities (player, NPCs)
│   ├── managers/            # Game managers (state, inventory)
│   └── utils/               # Utility functions
├── public/
│   └── assets/              # Game assets (sprites, tiles, audio)
└── dist/                    # Production build
```

## Future Blockchain Integration

The architecture is designed with modularity in mind:
- State management system ready for blockchain transactions
- Event-driven architecture for easy API integration
- Inventory system prepared for NFT items
- Player data structure compatible with wallet integration

## Tech Stack

- **Phaser 3**: Game framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

## License

MIT
