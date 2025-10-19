import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private currentDirection: string = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player-down');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    
    // Set up physics
    this.sprite.body!.setSize(24, 24);
    this.sprite.body!.setOffset(4, 8);
  }

  update(left: boolean, right: boolean, up: boolean, down: boolean) {
    const speed = GameConfig.PLAYER_SPEED;
    let velocityX = 0;
    let velocityY = 0;

    // Calculate velocity
    if (left) velocityX = -speed;
    else if (right) velocityX = speed;
    
    if (up) velocityY = -speed;
    else if (down) velocityY = speed;

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    // Apply velocity
    this.sprite.setVelocity(velocityX, velocityY);

    // Update sprite texture based on direction
    if (velocityX !== 0 || velocityY !== 0) {
      if (Math.abs(velocityX) > Math.abs(velocityY)) {
        if (velocityX < 0) {
          this.setDirection('left');
        } else {
          this.setDirection('right');
        }
      } else {
        if (velocityY < 0) {
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

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }
}
