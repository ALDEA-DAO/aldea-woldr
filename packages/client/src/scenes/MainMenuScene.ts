import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setupNetwork } from '../mud/setupNetwork';
import { EthereumWalletManager } from '../managers/EthereumWalletManager';

export class MainMenuScene extends Phaser.Scene {
  private network: any;
  private statusText!: Phaser.GameObjects.Text;
  private ethWalletManager!: EthereumWalletManager;
  private walletButton!: Phaser.GameObjects.Container;
  private walletBalanceText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize Ethereum wallet manager
    this.ethWalletManager = new EthereumWalletManager();

    // Initialize MUD network
    try {
      this.network = await setupNetwork();
    } catch (error) {
      console.error('Failed to setup network:', error);
    }

    // Title
    this.add.text(width / 2, 60, 'ALDEA WORLD', {
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

    // Create wallet connection button
    this.createWalletButton(width);
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

  private createWalletButton(width: number) {
    const buttonX = width - 150;
    const buttonY = 30;

    // Create container for wallet button
    this.walletButton = this.add.container(buttonX, buttonY);

    // Button background
    const buttonBg = this.add.rectangle(0, 0, 280, 50, 0x3498db, 0.9);
    buttonBg.setStrokeStyle(2, 0x2980b9);
    buttonBg.setInteractive({ useHandCursor: true });

    // Icon
    const icon = this.add.text(-120, 0, '🦊', {
      fontSize: '24px'
    }).setOrigin(0.5);

    // Button text
    const buttonText = this.add.text(-80, 0, 'Connect MetaMask', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Balance text (hidden initially)
    this.walletBalanceText = this.add.text(-80, 0, '', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    this.walletBalanceText.setVisible(false);

    this.walletButton.add([buttonBg, icon, buttonText, this.walletBalanceText]);
    this.walletButton.setDepth(200);

    // Hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x5dade2, 0.9);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x3498db, 0.9);
    });

    // Click handler
    buttonBg.on('pointerdown', async () => {
      await this.handleWalletConnection(buttonText);
    });

    // Check if already connected
    if (this.ethWalletManager.isConnected()) {
      this.updateWalletDisplay(buttonText);
    }
  }

  private async handleWalletConnection(buttonText: Phaser.GameObjects.Text) {
    if (this.ethWalletManager.isConnected()) {
      // Already connected, show info
      this.statusText.setText(`Connected: ${this.ethWalletManager.formatAddress(this.ethWalletManager.getConnectedAddress()!)}`);
      this.statusText.setColor('#27ae60');
      return;
    }

    // Show loading
    buttonText.setText('Connecting...');
    this.statusText.setText('Opening MetaMask...');
    this.statusText.setColor('#f39c12');

    // Connect wallet
    const result = await this.ethWalletManager.connectWallet();

    if (result.success && result.address) {
      this.statusText.setText(`✓ Connected: ${this.ethWalletManager.formatAddress(result.address)}`);
      this.statusText.setColor('#27ae60');
      
      // Update button display
      await this.updateWalletDisplay(buttonText);
    } else {
      this.statusText.setText(`❌ ${result.error || 'Failed to connect wallet'}`);
      this.statusText.setColor('#e74c3c');
      buttonText.setText('Connect MetaMask');
    }
  }

  private async updateWalletDisplay(buttonText: Phaser.GameObjects.Text) {
    const address = this.ethWalletManager.getConnectedAddress();
    if (!address) return;

    // Update button text to show address
    buttonText.setText(this.ethWalletManager.formatAddress(address));

    // Fetch and display balance
    const { balance, error } = await this.ethWalletManager.getAldeaBalance();
    
    if (!error) {
      // Show balance below address
      const formattedBalance = parseFloat(balance).toFixed(2);
      this.walletBalanceText.setText(`${formattedBalance} ALDEA`);
      this.walletBalanceText.setVisible(true);
      
      // Adjust text positions for two-line display
      buttonText.setY(-10);
      this.walletBalanceText.setY(8);
    } else {
      console.error('Failed to fetch balance:', error);
      this.walletBalanceText.setVisible(false);
    }
  }
}
