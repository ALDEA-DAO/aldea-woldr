import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { OtherPlayer } from '../entities/OtherPlayer';
import { WorldGenerator } from '../utils/WorldGenerator';
import { GameStateManager } from '../managers/GameStateManager';
import { NetworkConfig } from '../mud/setupNetwork';
import { setupCharacterPolling, watchCharacterUpdates, CharacterData } from '../mud/syncStore';

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
  
  // Blockchain integration
  private network?: NetworkConfig;
  private characterId?: number;
  private lastBlockchainPosition = { x: 0, y: 0 };
  private movementThrottleTime = 2000; // Send transaction every 2 seconds max
  private lastMovementTransaction = 0;
  private pendingMovementTransaction = false;
  
  // Multiplayer - other players
  private otherPlayers: Map<number, OtherPlayer> = new Map();
  private cleanupPolling?: () => void;
  private cleanupWatcher?: () => void;

  constructor() {
    super({ key: GameConfig.SCENES.GAME });
  }

  init(data: { network?: NetworkConfig; characterId?: number }) {
    // Receive data from previous scene
    this.network = data.network;
    this.characterId = data.characterId;
    console.log('GameScene initialized with characterId:', this.characterId);
  }

  create() {
    // Reset pause state and ensure physics is running
    this.isPaused = false;
    this.pauseMenuElements = [];
    this.physics.resume();

    // Initialize game state manager with network and characterId
    this.gameStateManager = new GameStateManager(this, this.network, this.characterId);

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

    // Setup multiplayer sync if connected to blockchain
    if (this.network) {
      this.setupMultiplayer();
    }

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

    // Check if player has moved significantly and send blockchain transaction
    this.checkAndSendMovementTransaction();

    // Update other players
    this.updateOtherPlayers();

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
  }

  private updateHUD() {
    const playerPos = this.player.getPosition();
    const tileX = Math.floor(playerPos.x / GameConfig.TILE_SIZE);
    const tileY = Math.floor(playerPos.y / GameConfig.TILE_SIZE);
    
    const hudLines = [
      `Position: (${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)}) | Tile: (${tileX}, ${tileY})`,
      `Health: ${this.gameStateManager.getPlayerHealth()}`,
      `Coins: ${this.gameStateManager.getCoins()}`,
    ];

    // Show blockchain status if connected
    if (this.network && this.characterId) {
      const bcPos = `Blockchain: (${this.lastBlockchainPosition.x}, ${this.lastBlockchainPosition.y})`;
      const txStatus = this.pendingMovementTransaction ? ' [TX Pending...]' : '';
      hudLines.push(bcPos + txStatus);
      
      // Show number of other players
      const playerCount = this.otherPlayers.size;
      hudLines.push(`Players Online: ${playerCount + 1} (You + ${playerCount} others)`);
    } else {
      hudLines.push('Blockchain: Not connected');
    }

    hudLines.push('Press SPACE to interact | ESC to pause');
    
    this.hudText.setText(hudLines);
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

  /**
   * Check if player has moved significantly and send blockchain transaction
   * This throttles movement updates to avoid spamming the blockchain
   */
  private checkAndSendMovementTransaction() {
    // Only send transactions if we have network and characterId
    if (!this.network || !this.characterId) {
      return;
    }

    // Don't send if a transaction is pending
    if (this.pendingMovementTransaction) {
      return;
    }

    const currentTime = Date.now();
    const playerPos = this.player.getPosition();
    
    // Convert pixel position to tile position (game coordinate system)
    const tileX = Math.floor(playerPos.x / GameConfig.TILE_SIZE);
    const tileY = Math.floor(playerPos.y / GameConfig.TILE_SIZE);

    // Calculate distance from last blockchain position
    const distanceX = Math.abs(tileX - this.lastBlockchainPosition.x);
    const distanceY = Math.abs(tileY - this.lastBlockchainPosition.y);

    // Check if enough time has passed AND player has moved at least 1 tile
    const timeElapsed = currentTime - this.lastMovementTransaction >= this.movementThrottleTime;
    const hasMoved = distanceX > 0 || distanceY > 0;

    if (timeElapsed && hasMoved) {
      this.sendMovementTransaction(tileX, tileY);
    }
  }

  /**
   * Send a movement transaction to the blockchain
   */
  private async sendMovementTransaction(tileX: number, tileY: number) {
    if (!this.network || !this.characterId) {
      return;
    }

    this.pendingMovementTransaction = true;

    try {
      console.log(`Sending movement transaction: Character ${this.characterId} moving to (${tileX}, ${tileY})`);
      
      // Call the moveCharacter function on the smart contract
      const tx = await this.network.worldContract.write.aldea__moveCharacter([
        this.characterId,
        tileX,
        tileY
      ]);

      console.log('Movement transaction sent:', tx);

      // Don't wait for confirmation - fire and forget for better UX
      // The transaction will be mined in the background
      this.network.publicClient.waitForTransactionReceipt({ hash: tx }).then(() => {
        console.log('Movement transaction confirmed');
      }).catch((error: any) => {
        console.error('Movement transaction failed:', error);
      });

      // Update tracking variables
      this.lastBlockchainPosition.x = tileX;
      this.lastBlockchainPosition.y = tileY;
      this.lastMovementTransaction = Date.now();

    } catch (error: any) {
      console.error('Failed to send movement transaction:', error);
      // Show error to user (optional)
      // this.showTemporaryMessage('Failed to sync position with blockchain');
    } finally {
      this.pendingMovementTransaction = false;
    }
  }

  /**
   * Setup multiplayer syncing from blockchain
   */
  private setupMultiplayer() {
    if (!this.network) return;

    console.log('Setting up multiplayer sync...');

    // Setup polling for all characters (every 3 seconds)
    this.cleanupPolling = setupCharacterPolling(
      this.network,
      (characters) => this.handleCharactersUpdate(characters),
      3000,
      100 // Max character ID to check
    );

    // Also watch for real-time updates via events
    this.cleanupWatcher = watchCharacterUpdates(
      this.network,
      (character) => this.handleCharacterUpdate(character)
    );
  }

  /**
   * Handle bulk character updates from polling
   */
  private handleCharactersUpdate(characters: CharacterData[]) {
    for (const character of characters) {
      this.handleCharacterUpdate(character);
    }
  }

  /**
   * Handle a single character update
   */
  private handleCharacterUpdate(character: CharacterData) {
    // Ignore our own character
    if (character.characterId === this.characterId) {
      return;
    }

    // Check if this player already exists
    const existingPlayer = this.otherPlayers.get(character.characterId);
    
    if (existingPlayer) {
      // Update position
      existingPlayer.updatePosition(character.x, character.y);
    } else {
      // Create new other player
      const otherPlayer = new OtherPlayer(
        this,
        character.characterId,
        character.player,
        character.x,
        character.y
      );
      this.otherPlayers.set(character.characterId, otherPlayer);
      console.log(`New player joined: Character #${character.characterId}`);
    }
  }

  /**
   * Update all other players (called every frame)
   */
  private updateOtherPlayers() {
    for (const otherPlayer of this.otherPlayers.values()) {
      otherPlayer.update();
    }
  }

  /**
   * Cleanup multiplayer resources
   */
  private cleanupMultiplayer() {
    // Stop polling and watching
    if (this.cleanupPolling) {
      this.cleanupPolling();
      this.cleanupPolling = undefined;
    }
    if (this.cleanupWatcher) {
      this.cleanupWatcher();
      this.cleanupWatcher = undefined;
    }

    // Remove all other players
    for (const otherPlayer of this.otherPlayers.values()) {
      otherPlayer.destroy();
    }
    this.otherPlayers.clear();
  }

  /**
   * Override shutdown to cleanup multiplayer
   */
  shutdown() {
    this.cleanupMultiplayer();
  }
}
