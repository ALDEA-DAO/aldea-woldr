import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { CardanoWalletManager } from '../managers/CardanoWalletManager';
import { CardanoConfig, SupportedWallet } from '../config/CardanoConfig';

export class MenuScene extends Phaser.Scene {
  private walletManager: CardanoWalletManager;
  private statusText!: Phaser.GameObjects.Text;
  private walletButtonsContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: GameConfig.SCENES.MENU });
    this.walletManager = new CardanoWalletManager();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, height / 4, 'ALDEA GAME', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 4 + 60, 'Open World Adventure', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Wallet requirement notice
    this.add.text(width / 2, height / 4 + 100, 'Requires $ALMA Token to Play', {
      fontSize: '18px',
      color: '#f39c12',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, height / 2 - 40, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
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
      this.handleStartGame();
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

  private async handleStartGame() {
    // Check if dev mode is enabled (skip wallet verification for local testing)
    const devMode = import.meta.env.VITE_DEV_MODE === 'true';
    
    if (devMode) {
      this.statusText.setText('🔧 Dev Mode: Skipping wallet verification...\nLoading game...');
      this.statusText.setColor('#f39c12');
      
      this.time.delayedCall(1000, () => {
        this.scene.start(GameConfig.SCENES.GAME);
      });
      return;
    }
    
    // Check if wallet is already connected
    if (!this.walletManager.isConnected()) {
      this.statusText.setText('Please connect your Cardano wallet first...');
      this.showWalletSelection();
      return;
    }

    // Verify asset ownership
    this.statusText.setText('Verifying $ALMA token ownership...');
    
    try {
      const verification = await this.walletManager.verifyAssetOwnership();
      
      if (verification.hasAccess) {
        this.statusText.setText('✓ Access granted! Loading game...');
        this.statusText.setColor('#27ae60');
        
        // Wait a moment then start game
        this.time.delayedCall(1000, () => {
          this.scene.start(GameConfig.SCENES.GAME);
        });
      } else {
        this.showAccessDenied(verification.missingAssets);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      this.statusText.setText('❌ Failed to verify wallet. Please try again.');
      this.statusText.setColor('#e74c3c');
    }
  }

  private showWalletSelection() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clear previous wallet buttons if any
    if (this.walletButtonsContainer) {
      this.walletButtonsContainer.destroy();
    }

    const availableWallets = this.walletManager.getAvailableWallets();

    if (availableWallets.length === 0) {
      this.statusText.setText(
        '❌ No Cardano wallets detected!\n\n' +
        'Please install a Cardano wallet like Nami, Eternl, or Lace.'
      );
      this.statusText.setColor('#e74c3c');
      return;
    }

    this.statusText.setText('Select your Cardano wallet:');
    this.statusText.setColor('#ffffff');

    // Create wallet buttons
    const buttons: Phaser.GameObjects.GameObject[] = [];
    const startY = height / 2 + 20;
    const spacing = 50;

    availableWallets.forEach((wallet, index) => {
      const button = this.add.text(
        width / 2,
        startY + (index * spacing),
        this.getWalletDisplayName(wallet),
        {
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: '#3498db',
          padding: { x: 20, y: 10 }
        }
      ).setOrigin(0.5).setInteractive();

      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: '#5dade2' });
      });

      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: '#3498db' });
      });

      button.on('pointerdown', () => {
        this.connectWallet(wallet);
      });

      buttons.push(button);
    });

    this.walletButtonsContainer = this.add.container(0, 0, buttons);
  }

  private async connectWallet(walletName: SupportedWallet) {
    this.statusText.setText(`Connecting to ${this.getWalletDisplayName(walletName)}...`);
    this.statusText.setColor('#f39c12');

    // Clear wallet buttons
    if (this.walletButtonsContainer) {
      this.walletButtonsContainer.destroy();
      this.walletButtonsContainer = null;
    }

    try {
      await this.walletManager.connectWallet(walletName);
      const address = await this.walletManager.getAddress();
      
      this.statusText.setText(
        `✓ Wallet connected!\n` +
        `Address: ${address?.substring(0, 20)}...${address?.substring(address.length - 10)}\n\n` +
        `Click START GAME to verify $ALMA ownership`
      );
      this.statusText.setColor('#27ae60');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      this.statusText.setText(
        `❌ Failed to connect wallet\n\n` +
        `${error.message || 'Please try again'}`
      );
      this.statusText.setColor('#e74c3c');
    }
  }

  private showAccessDenied(missingAssets: any[]) {
    const assetNames = missingAssets.map(a => a.displayName).join(', ');
    
    this.statusText.setText(
      `❌ ACCESS DENIED\n\n` +
      `You need ${assetNames} to play this game.\n\n` +
      `Visit alma.adasouls.io to mint your $ALMA token`
    );
    this.statusText.setColor('#e74c3c');

    // Add clickable link to mint page
    const mintButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 120,
      'Go to Mint Page →',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#9b59b6',
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5).setInteractive();

    mintButton.on('pointerover', () => {
      mintButton.setStyle({ backgroundColor: '#8e44ad' });
    });

    mintButton.on('pointerout', () => {
      mintButton.setStyle({ backgroundColor: '#9b59b6' });
    });

    mintButton.on('pointerdown', () => {
      window.open(CardanoConfig.MINT_URL, '_blank');
    });
  }

  private getWalletDisplayName(wallet: SupportedWallet): string {
    const names: Record<SupportedWallet, string> = {
      nami: 'Nami',
      eternl: 'Eternl',
      flint: 'Flint',
      gerowallet: 'GeroWallet',
      typhoncip30: 'Typhon',
      cardwallet: 'CardWallet',
      nufi: 'NuFi',
      lace: 'Lace'
    };
    return names[wallet] || wallet;
  }
}
