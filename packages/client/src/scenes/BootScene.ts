import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: GameConfig.SCENES.BOOT });
  }

  preload() {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Create placeholder graphics for now (we'll generate them procedurally)
    this.createPlayerSprites();
    this.createTilesets();
    this.createNPCSprites();
  }

  create() {
    this.scene.start(GameConfig.SCENES.MENU);
  }

  private createPlayerSprites() {
    // Create player sprite with different directions
    const graphics = this.add.graphics();
    
    // Down
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xf39c12, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillStyle(0x2980b9, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.generateTexture('player-down', 32, 32);
    
    graphics.clear();
    
    // Up
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xf39c12, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillStyle(0x2980b9, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.generateTexture('player-up', 32, 32);
    
    graphics.clear();
    
    // Left
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xf39c12, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillStyle(0x2980b9, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(12, 12, 3);
    graphics.generateTexture('player-left', 32, 32);
    
    graphics.clear();
    
    // Right
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xf39c12, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillStyle(0x2980b9, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(20, 12, 3);
    graphics.generateTexture('player-right', 32, 32);
    
    graphics.destroy();
  }

  private createTilesets() {
    const graphics = this.add.graphics();
    
    // Grass tile
    graphics.fillStyle(0x27ae60, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x229954, 0.3);
    graphics.fillRect(4, 4, 8, 8);
    graphics.fillRect(20, 12, 6, 6);
    graphics.fillRect(10, 22, 10, 8);
    graphics.generateTexture('tile-grass', 32, 32);
    
    graphics.clear();
    
    // Water tile
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x5dade2, 0.5);
    graphics.fillCircle(10, 10, 4);
    graphics.fillCircle(24, 20, 5);
    graphics.generateTexture('tile-water', 32, 32);
    
    graphics.clear();
    
    // Stone tile
    graphics.fillStyle(0x7f8c8d, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x95a5a6, 1);
    graphics.fillRect(2, 2, 28, 28);
    graphics.fillStyle(0x5d6d6e, 1);
    graphics.fillRect(4, 4, 4, 4);
    graphics.fillRect(20, 8, 6, 6);
    graphics.generateTexture('tile-stone', 32, 32);
    
    graphics.clear();
    
    // Tree
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(12, 16, 8, 16);
    graphics.fillStyle(0x27ae60, 1);
    graphics.fillCircle(16, 12, 12);
    graphics.fillStyle(0x229954, 1);
    graphics.fillCircle(16, 12, 8);
    graphics.generateTexture('tile-tree', 32, 32);
    
    graphics.clear();
    
    // Rock
    graphics.fillStyle(0x5d6d6e, 1);
    graphics.fillCircle(16, 18, 14);
    graphics.fillStyle(0x7f8c8d, 1);
    graphics.fillCircle(16, 18, 10);
    graphics.generateTexture('tile-rock', 32, 32);
    
    graphics.destroy();
  }

  private createNPCSprites() {
    const graphics = this.add.graphics();
    
    // Friendly NPC
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xfad7a0, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillStyle(0xc0392b, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.generateTexture('npc-friendly', 32, 32);
    
    graphics.clear();
    
    // Merchant NPC
    graphics.fillStyle(0x9b59b6, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xfad7a0, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillStyle(0x8e44ad, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.fillStyle(0xf39c12, 1);
    graphics.fillCircle(8, 28, 3);
    graphics.generateTexture('npc-merchant', 32, 32);
    
    graphics.destroy();
  }
}
