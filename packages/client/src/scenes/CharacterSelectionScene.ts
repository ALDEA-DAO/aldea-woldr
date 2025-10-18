import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setupNetwork } from '../mud/setupNetwork';

export class CharacterSelectionScene extends Phaser.Scene {
  private network: any;
  private selectedClass: number = 0;
  private selectedTribe: number = 0;
  private classCards: Phaser.GameObjects.Container[] = [];
  private tribeCards: Phaser.GameObjects.Container[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private characterPreview!: Phaser.GameObjects.Graphics;

  // Character classes (matching smart contract enum)
  private readonly classes = [
    { id: 0, name: 'Archer', description: 'Master of ranged combat', color: 0x2ecc71 },
    { id: 1, name: 'Alchemist', description: 'Potion master', color: 0x9b59b6 },
    { id: 2, name: 'Artisan', description: 'Skilled craftsperson', color: 0xf39c12 },
    { id: 3, name: 'Blacksmith', description: 'Weapon and armor forger', color: 0x95a5a6 },
    { id: 4, name: 'Chef', description: 'Master of cuisine', color: 0xe74c3c },
    { id: 5, name: 'Magician', description: 'Wielder of magic', color: 0x3498db },
    { id: 6, name: 'Merchant', description: 'Trading expert', color: 0xf1c40f },
    { id: 7, name: 'Priest', description: 'Divine healer', color: 0xecf0f1 },
    { id: 8, name: 'Tailor', description: 'Cloth and armor crafter', color: 0x1abc9c },
    { id: 9, name: 'Rebel', description: 'Unconventional fighter', color: 0xc0392b },
    { id: 10, name: 'Warrior', description: 'Melee combat specialist', color: 0x34495e }
  ];

  // Tribes (matching smart contract enum - 0 = random)
  private readonly tribes = [
    { id: 0, name: 'Random', description: 'Let fate decide your tribe!', color: 0xe74c3c, bonus: 'Surprise' },
    { id: 1, name: 'Amazonians', description: 'Forest dwellers, +30% Wood production', color: 0x27ae60, bonus: 'Wood' },
    { id: 2, name: 'Himalayans', description: 'Mountain people, +30% Stone/Iron', color: 0x95a5a6, bonus: 'Stone/Iron' },
    { id: 3, name: 'Poseidons', description: 'Sea masters, +30% Fish production', color: 0x3498db, bonus: 'Fish' },
    { id: 4, name: 'Raes', description: 'Magic affinity, +30% Mana production', color: 0x9b59b6, bonus: 'Mana' },
    { id: 5, name: 'Tropicals', description: 'Jungle tribe, +30% Food/Herbs', color: 0xf39c12, bonus: 'Food/Herbs' }
  ];

  constructor() {
    super({ key: 'CharacterSelectionScene' });
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize MUD network connection
    try {
      this.network = await setupNetwork();
    } catch (error) {
      console.error('Failed to setup network:', error);
    }

    // Background gradient effect
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1, 1, 1, 1);
    gradient.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 35, 'CREATE YOUR CHARACTER', {
      fontSize: '42px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, 80, 'Choose your class and tribe to begin your journey', {
      fontSize: '16px',
      color: '#ecf0f1',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, height - 100, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Create class selection section
    this.createClassSelection(width, height);

    // Create tribe selection section
    this.createTribeSelection(width, height);

    // Create character preview
    this.createCharacterPreview(width, height);

    // Create character button
    this.createConfirmButton(width, height);

    // Back button
    this.createBackButton();
  }

  private createClassSelection(width: number, _height: number) {
    const headerY = 115;
    const startY = 155;
    const cardWidth = 95;
    const cardHeight = 110;
    const padding = 8;
    const cols = 6;

    // Section header with background (rendered FIRST with high depth)
    const headerBg = this.add.rectangle(width / 2, headerY, 450, 45, 0x2c3e50, 0.95);
    headerBg.setStrokeStyle(2, 0x00ff00);
    headerBg.setDepth(100);
    
    const headerText = this.add.text(width / 2, headerY, '⚔️ SELECT YOUR CLASS ⚔️', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    headerText.setDepth(101);

    // Create cards below header
    this.classes.forEach((classInfo, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 60 + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);

      const card = this.createClassCard(x, y, cardWidth, cardHeight, classInfo, index);
      this.classCards.push(card);
    });
  }

  private createClassCard(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    classInfo: any, 
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background with rounded effect (using multiple rectangles for simulation)
    const bg = this.add.rectangle(0, 0, width, height, classInfo.color, 0.2);
    bg.setStrokeStyle(2, classInfo.color, 0.8);
    bg.setInteractive({ useHandCursor: true });

    // Inner glow effect
    const innerGlow = this.add.rectangle(0, 0, width - 6, height - 6, classInfo.color, 0.1);
    
    // Character icon (simple representation)
    const icon = this.add.text(0, -18, this.getClassIcon(classInfo.name), {
      fontSize: '36px'
    }).setOrigin(0.5);

    // Class name
    const name = this.add.text(0, 28, classInfo.name, {
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      wordWrap: { width: width - 10 }
    }).setOrigin(0.5);

    container.add([bg, innerGlow, icon, name]);

    // Interaction
    bg.on('pointerover', () => {
      bg.setFillStyle(classInfo.color, 0.5);
      this.statusText.setText(classInfo.description);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(classInfo.color, index === this.selectedClass ? 0.6 : 0.2);
      this.statusText.setText('');
    });

    bg.on('pointerdown', () => {
      this.selectClass(index);
    });

    return container;
  }

  private createTribeSelection(width: number, _height: number) {
    const headerY = 360;
    const startY = 400;
    const cardWidth = 165;
    const cardHeight = 90;
    const padding = 10;

    // Section header with background (rendered FIRST with high depth)
    const headerBg = this.add.rectangle(width / 2, headerY, 450, 45, 0x2c3e50, 0.95);
    headerBg.setStrokeStyle(2, 0x00ff00);
    headerBg.setDepth(100);
    
    const headerText = this.add.text(width / 2, headerY, '🏘️ SELECT YOUR TRIBE 🏘️', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    headerText.setDepth(101);

    // Create cards below header
    this.tribes.forEach((tribeInfo, index) => {
      const x = 60 + index * (cardWidth + padding);
      const y = startY;

      const card = this.createTribeCard(x, y, cardWidth, cardHeight, tribeInfo, index);
      this.tribeCards.push(card);
    });
  }

  private createTribeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    tribeInfo: any,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, width, height, tribeInfo.color, 0.2);
    bg.setStrokeStyle(2, tribeInfo.color, 0.8);
    bg.setInteractive({ useHandCursor: true });

    // Inner glow effect
    const innerGlow = this.add.rectangle(0, 0, width - 6, height - 6, tribeInfo.color, 0.1);

    // Tribe name
    const name = this.add.text(0, -22, tribeInfo.name, {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Bonus info - special handling for Random tribe
    let bonus;
    if (tribeInfo.id === 0) {
      bonus = this.add.text(0, 5, `🎲 ${tribeInfo.bonus} 🎲\nRandom tribe assigned`, {
        fontSize: '11px',
        color: '#ecf0f1',
        align: 'center'
      }).setOrigin(0.5);
    } else {
      bonus = this.add.text(0, 5, `⭐ Bonus ⭐\n+30% ${tribeInfo.bonus}`, {
        fontSize: '11px',
        color: '#ecf0f1',
        align: 'center'
      }).setOrigin(0.5);
    }

    container.add([bg, innerGlow, name, bonus]);

    // Interaction
    bg.on('pointerover', () => {
      bg.setFillStyle(tribeInfo.color, 0.5);
      this.statusText.setText(tribeInfo.description);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(tribeInfo.color, index === this.selectedTribe ? 0.6 : 0.2);
      this.statusText.setText('');
    });

    bg.on('pointerdown', () => {
      this.selectTribe(index);
    });

    return container;
  }

  private createCharacterPreview(width: number, height: number) {
    const previewX = width - 200;
    const previewY = 290;

    // Preview header with background
    const headerBg = this.add.rectangle(previewX, 155, 280, 45, 0x2c3e50, 0.95);
    headerBg.setStrokeStyle(2, 0x00ff00);
    headerBg.setDepth(100);
    
    const headerText = this.add.text(previewX, 155, '👤 PREVIEW 👤', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    headerText.setDepth(101);

    // Preview box with enhanced styling
    const previewBg = this.add.rectangle(previewX, previewY, 280, 300, 0x1a1a2e, 0.9);
    previewBg.setStrokeStyle(3, 0x00ff00);
    
    // Inner shadow effect
    this.add.rectangle(previewX, previewY, 270, 290, 0x000000, 0.3);

    // Character preview (will be updated based on selection)
    this.characterPreview = this.add.graphics();
    this.updateCharacterPreview(previewX, previewY);
  }

  private updateCharacterPreview(x: number, y: number) {
    this.characterPreview.clear();

    const classInfo = this.classes[this.selectedClass];
    const tribeInfo = this.tribes[this.selectedTribe];

    // Draw a simple character representation
    // Body (tribe color)
    this.characterPreview.fillStyle(tribeInfo.color, 1);
    this.characterPreview.fillCircle(x, y - 20, 30); // Head
    this.characterPreview.fillRect(x - 20, y + 10, 40, 60); // Body

    // Class symbol
    this.characterPreview.fillStyle(classInfo.color, 1);
    this.characterPreview.fillCircle(x, y + 20, 15);

    // Add class and tribe labels
    this.add.text(x, y + 100, classInfo.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(x, y + 125, tribeInfo.name, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  private createConfirmButton(width: number, height: number) {
    // Button background for depth
    const buttonShadow = this.add.rectangle(width / 2, height - 58, 350, 60, 0x000000, 0.5);
    
    const button = this.add.text(width / 2, height - 60, '⚔️ CREATE CHARACTER ⚔️', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 35, y: 15 },
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#2ecc71', fontSize: '26px' });
      buttonShadow.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#27ae60', fontSize: '24px' });
      buttonShadow.setScale(1);
    });

    button.on('pointerdown', () => {
      this.createCharacter();
    });
  }

  private createBackButton() {
    const button = this.add.text(25, 25, '⬅ Back', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#34495e',
      padding: { x: 20, y: 10 },
      fontStyle: 'bold'
    }).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#4a5f7f', fontSize: '19px' });
    });

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#34495e', fontSize: '18px' });
    });

    button.on('pointerdown', () => {
      // Fade out effect
      this.tweens.add({
        targets: button,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.scene.start('MainMenuScene');
        }
      });
    });
  }

  private selectClass(index: number) {
    // Update previous selection
    const prevCard = this.classCards[this.selectedClass];
    const prevBg = prevCard.list[0] as Phaser.GameObjects.Rectangle;
    prevBg.setFillStyle(this.classes[this.selectedClass].color, 0.2);

    // Update new selection
    this.selectedClass = index;
    const newCard = this.classCards[index];
    const newBg = newCard.list[0] as Phaser.GameObjects.Rectangle;
    newBg.setFillStyle(this.classes[index].color, 0.6);

    this.updateCharacterPreview(this.cameras.main.width - 200, 290);
  }

  private selectTribe(index: number) {
    // Update previous selection
    const prevCard = this.tribeCards[this.selectedTribe];
    const prevBg = prevCard.list[0] as Phaser.GameObjects.Rectangle;
    prevBg.setFillStyle(this.tribes[this.selectedTribe].color, 0.2);

    // Update new selection
    this.selectedTribe = index;
    const newCard = this.tribeCards[index];
    const newBg = newCard.list[0] as Phaser.GameObjects.Rectangle;
    newBg.setFillStyle(this.tribes[index].color, 0.6);

    this.updateCharacterPreview(this.cameras.main.width - 200, 290);
  }

  private async createCharacter() {
    if (!this.network) {
      this.statusText.setText('❌ Network not connected. Please refresh.');
      this.statusText.setColor('#e74c3c');
      return;
    }

    this.statusText.setText('Creating character...');
    this.statusText.setColor('#f39c12');

    try {
      // For now, we'll skip the NFT verification in dev mode
      // TODO: Implement proper NFT verification when ready
      const dummyNftId = '0x' + '0'.repeat(64);
      const nonce = 0;
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const dummySignature = '0x' + '0'.repeat(130);

      // Get the tribe ID to send to smart contract
      // tribes array has Random as id 0, but other tribes need their ID adjusted
      const tribeId = this.tribes[this.selectedTribe].id;
      
      // Call smart contract
      const tx = await this.network.worldContract.write.aldea__createCharacter([
        this.selectedClass,
        dummyNftId,
        nonce,
        deadline,
        dummySignature
      ]);

      this.statusText.setText('Character creation in progress...');
      
      // Wait for transaction
      await this.network.publicClient.waitForTransactionReceipt({ hash: tx });

      this.statusText.setText('✓ Character created successfully! Entering world...');
      this.statusText.setColor('#27ae60');

      // Launch game directly after character creation
      this.time.delayedCall(2000, () => {
        this.scene.start(GameConfig.SCENES.GAME);
      });

    } catch (error: any) {
      console.error('Failed to create character:', error);
      this.statusText.setText(`❌ Failed: ${error.message || 'Unknown error'}`);
      this.statusText.setColor('#e74c3c');
    }
  }

  private getClassIcon(className: string): string {
    const icons: Record<string, string> = {
      'Archer': '🏹',
      'Alchemist': '⚗️',
      'Artisan': '🔨',
      'Blacksmith': '⚒️',
      'Chef': '👨‍🍳',
      'Magician': '🔮',
      'Merchant': '💰',
      'Priest': '✨',
      'Tailor': '🧵',
      'Rebel': '⚔️',
      'Warrior': '🛡️'
    };
    return icons[className] || '👤';
  }
}
