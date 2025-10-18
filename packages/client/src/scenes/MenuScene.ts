import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: GameConfig.SCENES.MENU });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, height / 3, 'ALDEA GAME', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'Open World Adventure', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#2ecc71' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#27ae60' });
    });

    startButton.on('pointerdown', () => {
      this.scene.start(GameConfig.SCENES.GAME);
    });

    // Instructions
    this.add.text(width / 2, height - 100, 'Controls: Arrow Keys or WASD to move | Space to interact', {
      fontSize: '18px',
      color: '#95a5a6'
    }).setOrigin(0.5);

    // Animated title effect
    this.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
