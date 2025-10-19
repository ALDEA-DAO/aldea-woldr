import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setupNetwork } from '../mud/setupNetwork';

export class MainMenuScene extends Phaser.Scene {
  private network: any;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize MUD network
    try {
      this.network = await setupNetwork();
    } catch (error) {
      console.error('Failed to setup network:', error);
    }

    // Title
    this.add.text(width / 2, 60, 'ALDEA WOLDR', {
      fontSize: '52px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 115, 'Choose Your Action', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Status text at bottom
    this.statusText = this.add.text(width / 2, height - 40, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Create menu options
    this.createMenuOptions(width, height);

    // Add decorative elements
    this.addBackgroundEffects();
  }

  private createMenuOptions(width: number, _height: number) {
    const startY = 180;
    const buttonHeight = 50;
    const spacing = 8;

    const menuOptions = [
      {
        label: 'NEW CHARACTER',
        description: 'Create a new character and start your adventure',
        color: 0x27ae60,
        icon: '⚔️',
        action: () => this.startCharacterCreation()
      },
      {
        label: 'LOAD CHARACTER',
        description: 'Load an existing character and continue playing',
        color: 0x2980b9,
        icon: '👤',
        action: () => this.loadCharacter()
      },
      {
        label: 'LEADERBOARD',
        description: 'View top players and their achievements',
        color: 0xf39c12,
        icon: '🏆',
        action: () => this.showLeaderboard()
      },
      {
        label: 'HARBOUR ⚓',
        description: 'Visit the harbour to bridge tokens and travel',
        color: 0x3498db,
        icon: '🚢',
        action: () => this.goToHarbour()
      },
      {
        label: 'THE WORLD',
        description: 'View world statistics and information',
        color: 0x16a085,
        icon: '📊',
        action: () => this.showWorldStats()
      },
      {
        label: 'SETTINGS',
        description: 'Configure game settings',
        color: 0x95a5a6,
        icon: '⚙️',
        action: () => this.showSettings()
      },
      {
        label: 'QUIT',
        description: 'Return to start screen',
        color: 0xc0392b,
        icon: '🚪',
        action: () => this.quitToStart()
      }
    ];

    menuOptions.forEach((option, index) => {
      const y = startY + index * (buttonHeight + spacing);
      this.createMenuButton(width / 2, y, option);
    });
  }

  private createMenuButton(
    x: number,
    y: number,
    option: {
      label: string;
      description: string;
      color: number;
      icon: string;
      action: () => void;
    }
  ) {
    const buttonWidth = 500;
    const buttonHeight = 50;

    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, option.color, 0.8);
    bg.setStrokeStyle(2, option.color);
    bg.setInteractive({ useHandCursor: true });

    // Icon
    const icon = this.add.text(-buttonWidth / 2 + 25, 0, option.icon, {
      fontSize: '24px'
    }).setOrigin(0.5);

    // Label
    const label = this.add.text(-buttonWidth / 2 + 60, 0, option.label, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    container.add([bg, icon, label]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setScale(1.05);
      bg.setFillStyle(option.color, 1);
      this.statusText.setText(option.description);
      this.statusText.setColor('#ffffff');
    });

    bg.on('pointerout', () => {
      bg.setScale(1);
      bg.setFillStyle(option.color, 0.8);
      this.statusText.setText('');
    });

    bg.on('pointerdown', () => {
      // Click animation
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          option.action();
        }
      });
    });
  }

  private addBackgroundEffects() {
    // Add some animated particles for visual appeal (if particle texture exists)
    try {
      this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: this.cameras.main.width },
        y: { min: 0, max: this.cameras.main.height },
        speed: { min: 10, max: 50 },
        scale: { start: 0.1, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 3000,
        frequency: 200,
        tint: [0x00ff00, 0x27ae60, 0x2ecc71]
      });
    } catch (error) {
      // Particle texture may not exist, continue without particles
    }
  }

  // Menu Actions

  private startCharacterCreation() {
    this.scene.start('CharacterSelectionScene');
  }

  private async loadCharacter() {
    this.statusText.setText('Loading your character...');
    this.statusText.setColor('#f39c12');

    try {
      if (!this.network) {
        throw new Error('Network not connected');
      }

      // TODO: Fetch player's character from smart contract
      // For now, just launch the game after a delay
      this.time.delayedCall(1000, () => {
        this.statusText.setText('✓ Character loaded! Entering world...');
        this.statusText.setColor('#27ae60');

        this.time.delayedCall(500, () => {
          this.scene.start(GameConfig.SCENES.GAME);
        });
      });

    } catch (error: any) {
      console.error('Failed to load character:', error);
      this.statusText.setText('❌ No character found. Please create one first.');
      this.statusText.setColor('#e74c3c');
    }
  }

  private showLeaderboard() {
    this.statusText.setText('Opening leaderboard...');
    this.statusText.setColor('#f39c12');

    // TODO: Implement leaderboard scene
    this.time.delayedCall(500, () => {
      this.statusText.setText('Leaderboard coming soon!');
      this.statusText.setColor('#95a5a6');
    });
  }

  private goToHarbour() {
    this.statusText.setText('⚓ Welcome to the Harbour!');
    this.statusText.setColor('#3498db');

    // Emit event to open React Bridge Modal
    window.dispatchEvent(new CustomEvent('openBridge'));
  }

  private showWorldStats() {
    this.statusText.setText('Opening world statistics...');
    this.statusText.setColor('#f39c12');

    // TODO: Implement world stats scene
    this.time.delayedCall(500, () => {
      this.statusText.setText('World statistics coming soon!');
      this.statusText.setColor('#95a5a6');
    });
  }

  private showSettings() {
    this.statusText.setText('Opening settings...');
    this.statusText.setColor('#f39c12');

    // TODO: Implement settings scene
    this.time.delayedCall(500, () => {
      this.statusText.setText('Settings menu coming soon!');
      this.statusText.setColor('#95a5a6');
    });
  }

  private quitToStart() {
    this.statusText.setText('Returning to start screen...');
    this.statusText.setColor('#f39c12');

    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
