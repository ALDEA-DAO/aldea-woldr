import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class WorldGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateWorld(
    groundLayer: Phaser.GameObjects.Group,
    obstaclesLayer: Phaser.GameObjects.Group,
    npcsGroup: Phaser.GameObjects.Group
  ) {
    const worldWidth = GameConfig.WORLD_WIDTH;
    const worldHeight = GameConfig.WORLD_HEIGHT;
    const tileSize = GameConfig.TILE_SIZE;

    // Generate ground tiles
    for (let y = 0; y < worldHeight; y++) {
      for (let x = 0; x < worldWidth; x++) {
        const worldX = x * tileSize;
        const worldY = y * tileSize;

        // Use noise-like pattern for varied terrain
        const noise = this.simpleNoise(x, y);
        let tileType = 'tile-grass';

        if (noise < 0.3) {
          tileType = 'tile-grass';
        } else if (noise < 0.4) {
          tileType = 'tile-stone';
        } else if (noise < 0.5) {
          tileType = 'tile-water';
        } else {
          tileType = 'tile-grass';
        }

        const tile = this.scene.add.image(worldX, worldY, tileType);
        tile.setOrigin(0, 0);
        groundLayer.add(tile);
      }
    }

    // Generate obstacles (trees, rocks)
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(2, worldWidth - 3) * tileSize;
      const y = Phaser.Math.Between(2, worldHeight - 3) * tileSize;

      // Don't place obstacles near spawn point
      if (Math.abs(x - 640) < 200 && Math.abs(y - 360) < 200) {
        continue;
      }

      const obstacleType = Math.random() > 0.5 ? 'tile-tree' : 'tile-rock';
      const obstacle = this.scene.physics.add.sprite(x, y, obstacleType);
      obstacle.setOrigin(0, 0);
      obstacle.setImmovable(true);
      obstacle.body!.setSize(tileSize, tileSize);
      obstaclesLayer.add(obstacle);
    }

    // Generate NPCs
    this.spawnNPC(npcsGroup, 400, 300, 'friendly');
    this.spawnNPC(npcsGroup, 800, 500, 'merchant');
    this.spawnNPC(npcsGroup, 1000, 300, 'friendly');
    this.spawnNPC(npcsGroup, 600, 700, 'merchant');
    this.spawnNPC(npcsGroup, 1200, 900, 'friendly');

    // Generate clusters of trees for forest areas
    this.generateForest(obstaclesLayer, 10, 10, 5, 5);
    this.generateForest(obstaclesLayer, 30, 35, 7, 7);
  }

  private spawnNPC(
    npcsGroup: Phaser.GameObjects.Group,
    x: number,
    y: number,
    type: string
  ) {
    const npc = this.scene.physics.add.sprite(x, y, `npc-${type}`);
    npc.setImmovable(true);
    npc.setData('npcType', type);
    npc.setDepth(9);
    npcsGroup.add(npc);

    // Add idle animation
    this.scene.tweens.add({
      targets: npc,
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private generateForest(
    obstaclesLayer: Phaser.GameObjects.Group,
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    const tileSize = GameConfig.TILE_SIZE;
    
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        if (Math.random() > 0.3) {
          const worldX = x * tileSize;
          const worldY = y * tileSize;
          const tree = this.scene.physics.add.sprite(worldX, worldY, 'tile-tree');
          tree.setOrigin(0, 0);
          tree.setImmovable(true);
          tree.body!.setSize(tileSize, tileSize);
          obstaclesLayer.add(tree);
        }
      }
    }
  }

  private simpleNoise(x: number, y: number): number {
    // Simple pseudo-random noise function
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
}
