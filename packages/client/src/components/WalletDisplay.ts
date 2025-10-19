import Phaser from 'phaser';
import { EthereumWalletManager } from '../managers/EthereumWalletManager';

/**
 * Wallet Display Component
 * Shows wallet connection button with address and ALDEA token balance
 */
export class WalletDisplay {
  private scene: Phaser.Scene;
  private walletManager: EthereumWalletManager;
  private container!: Phaser.GameObjects.Container;
  private buttonBg!: Phaser.GameObjects.Rectangle;
  private buttonText!: Phaser.GameObjects.Text;
  private balanceText!: Phaser.GameObjects.Text;
  private aldeaBalanceText!: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene, walletManager: EthereumWalletManager) {
    this.scene = scene;
    this.walletManager = walletManager;
  }

  /**
   * Create the wallet display UI
   * @param x X position
   * @param y Y position
   * @returns The container with all wallet UI elements
   */
  create(x: number, y: number): Phaser.GameObjects.Container {
    this.container = this.scene.add.container(x, y);

    // Button background
    this.buttonBg = this.scene.add.rectangle(0, 0, 200, 60, 0x2c3e50, 0.9);
    this.buttonBg.setStrokeStyle(2, 0x00ff00);
    this.buttonBg.setInteractive({ useHandCursor: true });
    this.container.add(this.buttonBg);

    // Main button text (shows "Connect Wallet" or address)
    this.buttonText = this.scene.add.text(0, -15, '🦊 Connect Wallet', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(this.buttonText);

    // ETH Balance text (hidden by default)
    this.balanceText = this.scene.add.text(0, 5, '', {
      fontSize: '11px',
      color: '#95a5a6',
      align: 'center'
    }).setOrigin(0.5);
    this.balanceText.setVisible(false);
    this.container.add(this.balanceText);

    // ALDEA Token balance text (hidden by default)
    this.aldeaBalanceText = this.scene.add.text(0, 20, '', {
      fontSize: '12px',
      color: '#f1c40f',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.aldeaBalanceText.setVisible(false);
    this.container.add(this.aldeaBalanceText);

    // Button click handler
    this.buttonBg.on('pointerdown', async () => {
      await this.handleWalletClick();
    });

    // Hover effects
    this.buttonBg.on('pointerover', () => {
      this.buttonBg.setFillStyle(0x34495e, 0.9);
    });

    this.buttonBg.on('pointerout', () => {
      this.buttonBg.setFillStyle(0x2c3e50, 0.9);
    });

    // Check if already connected
    if (this.walletManager.isConnected()) {
      this.updateDisplay();
    }

    return this.container;
  }

  /**
   * Handle wallet button click
   */
  private async handleWalletClick(): Promise<void> {
    if (!this.walletManager.isMetaMaskInstalled()) {
      this.buttonText.setText('MetaMask Not Found');
      this.buttonText.setColor('#e74c3c');
      setTimeout(() => {
        this.buttonText.setText('🦊 Connect Wallet');
        this.buttonText.setColor('#ffffff');
      }, 2000);
      return;
    }

    if (this.walletManager.isConnected()) {
      // Already connected, show status
      return;
    }

    // Show connecting status
    this.buttonText.setText('Connecting...');

    // Connect wallet
    const result = await this.walletManager.connectWallet();

    if (result.success && result.address) {
      await this.updateDisplay();
    } else {
      this.buttonText.setText('Connection Failed');
      this.buttonText.setColor('#e74c3c');
      setTimeout(() => {
        this.buttonText.setText('🦊 Connect Wallet');
        this.buttonText.setColor('#ffffff');
      }, 2000);
    }
  }

  /**
   * Update the display with wallet info
   */
  private async updateDisplay(): Promise<void> {
    const address = this.walletManager.getConnectedAddress();
    if (!address) return;

    // Update button text with address
    this.buttonText.setText(`🦊 ${this.walletManager.formatAddress(address)}`);
    this.buttonText.setColor('#27ae60');
    this.buttonText.setY(-18);

    // Show balance text
    this.balanceText.setText('Loading balance...');
    this.balanceText.setVisible(true);
    this.balanceText.setY(0);

    // Fetch and display ALDEA token balance
    const { balance, error } = await this.walletManager.getAldeaBalance();

    if (!error) {
      const formattedBalance = parseFloat(balance).toFixed(2);
      this.aldeaBalanceText.setText(`💎 ${formattedBalance} $ALDEA`);
      this.aldeaBalanceText.setVisible(true);
      this.aldeaBalanceText.setY(15);
      
      this.balanceText.setText('Connected');
      this.balanceText.setColor('#95a5a6');
    } else {
      this.aldeaBalanceText.setText('💎 0.00 $ALDEA');
      this.aldeaBalanceText.setVisible(true);
      this.aldeaBalanceText.setY(15);
      
      this.balanceText.setText('Balance unavailable');
      this.balanceText.setColor('#e74c3c');
    }

    // Expand button height to fit all content
    this.buttonBg.setSize(200, 70);
  }

  /**
   * Destroy the wallet display
   */
  destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * Set visibility
   */
  setVisible(visible: boolean): void {
    if (this.container) {
      this.container.setVisible(visible);
    }
  }

  /**
   * Get the container
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
