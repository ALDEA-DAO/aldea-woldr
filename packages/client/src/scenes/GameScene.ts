import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { WorldGenerator } from '../utils/WorldGenerator';
import { GameStateManager } from '../managers/GameStateManager';
import { EthereumWalletManager } from '../managers/EthereumWalletManager';
import { WalletDisplay } from '../components/WalletDisplay';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private groundLayer!: Phaser.GameObjects.Group;
  private obstaclesLayer!: Phaser.GameObjects.Group;
  private npcs!: Phaser.GameObjects.Group;
  private gameStateManager!: GameStateManager;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private hudText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private pauseMenuElements: Phaser.GameObjects.GameObject[] = [];
  private ethWalletManager!: EthereumWalletManager;
  private walletDisplay!: WalletDisplay;

  constructor() {
    super({ key: GameConfig.SCENES.GAME });
  }

  create() {
    // Reset pause state and ensure physics is running
    this.isPaused = false;
    this.pauseMenuElements = [];
    this.physics.resume();

    // Initialize Ethereum wallet manager
    this.ethWalletManager = new EthereumWalletManager();

    // Initialize game state manager
    this.gameStateManager = new GameStateManager(this);

    // Create world
    this.createWorld();

    // Create player
    this.player = new Player(this, 640, 360);

    // Setup camera
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create HUD
    this.createHUD();

    // Setup collisions
    this.physics.add.collider(this.player.sprite, this.obstaclesLayer);

    // Setup interactions
    this.physics.add.overlap(
      this.player.sprite,
      this.npcs,
      this.handleNPCInteraction as any,
      undefined,
      this
    );

    // ESC key for menu
    this.input.keyboard!.on('keydown-ESC', () => {
      if (!this.isPaused) {
        this.pauseGame();
      }
    });
  }

  update() {
    // Don't update game logic if paused
    if (this.isPaused) {
      return;
    }

    // Update player
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    this.player.update(left, right, up, down);

    // Update HUD
    this.updateHUD();
  }

  private pauseGame() {
    this.isPaused = true;
    this.physics.pause();
    this.showPauseMenu();
  }

  private resumeGame() {
    this.isPaused = false;
    this.physics.resume();
    this.hidePauseMenu();
  }

  private createWorld() {
    const worldWidth = GameConfig.WORLD_WIDTH * GameConfig.TILE_SIZE;
    const worldHeight = GameConfig.WORLD_HEIGHT * GameConfig.TILE_SIZE;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Create layers
    this.groundLayer = this.add.group();
    this.obstaclesLayer = this.add.group();
    this.npcs = this.add.group();

    // Generate world
    const worldGen = new WorldGenerator(this);
    worldGen.generateWorld(this.groundLayer, this.obstaclesLayer, this.npcs);
  }

  private createHUD() {
    // Fixed camera HUD
    this.hudText = this.add.text(16, 16, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(100);

    // Wallet Display (top-right corner, fixed to camera)
    const width = this.cameras.main.width;
    this.walletDisplay = new WalletDisplay(this, this.ethWalletManager);
    const walletContainer = this.walletDisplay.create(width - 120, 50);
    walletContainer.setScrollFactor(0).setDepth(100);
  }

  private updateHUD() {
    const playerPos = this.player.getPosition();
    this.hudText.setText([
      `Position: (${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)})`,
      `Health: ${this.gameStateManager.getPlayerHealth()}`,
      `Coins: ${this.gameStateManager.getCoins()}`,
      'Press SPACE to interact | ESC to pause'
    ]);
  }

  private handleNPCInteraction(
    _playerSprite: Phaser.GameObjects.GameObject,
    npcSprite: Phaser.GameObjects.GameObject
  ) {
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const npc = npcSprite as Phaser.Physics.Arcade.Sprite;
      const npcType = npc.getData('npcType');

      this.showDialogue(npcType);
    }
  }

  private showDialogue(npcType: string) {
    const dialogues: { [key: string]: string[] } = {
      friendly: [
        'Hello, traveler!',
        'Welcome to Aldea!',
        'Explore the world and discover its secrets!'
      ],
      merchant: [
        'Welcome to my shop!',
        'I have rare items for sale.',
        'Come back when you have more coins!'
      ]
    };

    const messages = dialogues[npcType] || ['...'];
    const message = Phaser.Utils.Array.GetRandom(messages);

    const dialogueBox = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height - 100,
      message,
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 15 },
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5).setDepth(200);

    this.time.delayedCall(2500, () => {
      dialogueBox.destroy();
    });
  }

  private showPauseMenu() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const pauseOverlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    ).setScrollFactor(0).setDepth(300);

    const pauseText = this.add.text(
      width / 2,
      height / 2 - 50,
      'PAUSED',
      {
        fontSize: '48px',
        color: '#ffffff'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const resumeButton = this.add.text(
      width / 2,
      height / 2 + 20,
      'Resume',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive();

    const menuButton = this.add.text(
      width / 2,
      height / 2 + 70,
      'Main Menu',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#e74c3c',
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive();

    // Store references for cleanup
    this.pauseMenuElements = [pauseOverlay, pauseText, resumeButton, menuButton];

    // Add hover effects
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#2ecc71' });
    });

    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#27ae60' });
    });

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#c0392b' });
    });

    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#e74c3c' });
    });

    // Resume button handler
    resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });

    // Main menu button handler
    menuButton.on('pointerdown', () => {
      this.hidePauseMenu();
      this.isPaused = false;
      this.physics.resume();
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });
  }

  private hidePauseMenu() {
    this.pauseMenuElements.forEach(element => {
      element.destroy();
    });
    this.pauseMenuElements = [];
  }
}
