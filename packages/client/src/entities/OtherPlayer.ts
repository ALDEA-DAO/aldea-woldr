import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Represents another player in the game world
 * Position is synced from blockchain
 */
export class OtherPlayer {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public characterId: number;
  public playerAddress: string;
  private nameText: Phaser.GameObjects.Text;
  private currentDirection: string = 'down';
  private targetX: number;
  private targetY: number;

  constructor(
    scene: Phaser.Scene,
    characterId: number,
    playerAddress: string,
    x: number,
    y: number
  ) {
    this.characterId = characterId;
    this.playerAddress = playerAddress;

    // Convert tile coordinates to pixel coordinates
    const pixelX = x * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
    const pixelY = y * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

    this.targetX = pixelX;
    this.targetY = pixelY;

    // Create sprite with a slightly different appearance (we can use the same for now)
    this.sprite = scene.physics.add.sprite(pixelX, pixelY, 'player-down');
    this.sprite.setDepth(10);
    this.sprite.setAlpha(0.8); // Slightly transparent to distinguish from local player

    // Set up physics
    this.sprite.body!.setSize(24, 24);
    this.sprite.body!.setOffset(4, 8);

    // Create name label (shortened address)
    const shortAddress = `${playerAddress.slice(0, 6)}...${playerAddress.slice(-4)}`;
    this.nameText = scene.add.text(pixelX, pixelY - 30, shortAddress, {
      fontSize: '12px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(11);
  }

  /**
   * Update position from blockchain (tile coordinates)
   */
  updatePosition(tileX: number, tileY: number) {
    // Convert tile coordinates to pixel coordinates
    this.targetX = tileX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
    this.targetY = tileY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
  }

  /**
   * Called every frame to smoothly interpolate to target position
   */
  update() {
    const currentX = this.sprite.x;
    const currentY = this.sprite.y;

    // Smoothly interpolate to target position
    const lerpFactor = 0.15; // Adjust for smoother/snappier movement
    const newX = currentX + (this.targetX - currentX) * lerpFactor;
    const newY = currentY + (this.targetY - currentY) * lerpFactor;

    // Update sprite position
    this.sprite.setPosition(newX, newY);

    // Update name label position
    this.nameText.setPosition(newX, newY - 30);

    // Update sprite direction based on movement
    const dx = this.targetX - currentX;
    const dy = this.targetY - currentY;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          this.setDirection('left');
        } else {
          this.setDirection('right');
        }
      } else {
        if (dy < 0) {
          this.setDirection('up');
        } else {
          this.setDirection('down');
        }
      }
    }
  }

  private setDirection(direction: string) {
    if (this.currentDirection !== direction) {
      this.currentDirection = direction;
      this.sprite.setTexture(`player-${direction}`);
    }
  }

  /**
   * Clean up when player disconnects
   */
  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
  }

  /**
   * Get current position in pixels
   */
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }
}
