import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import { BootScene } from '../../scenes/BootScene';
import { MainMenuScene } from '../../scenes/MainMenuScene';
import { CharacterSelectionScene } from '../../scenes/CharacterSelectionScene';
import { GameScene } from '../../scenes/GameScene';
import { MenuScene } from '../../scenes/MenuScene';

export const PhaserGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GameConfig.width,
      height: GameConfig.height,
      parent: containerRef.current,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [
        BootScene,
        MainMenuScene,
        CharacterSelectionScene,
        GameScene,
        MenuScene
      ],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="phaser-game-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};
