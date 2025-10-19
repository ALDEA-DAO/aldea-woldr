import React from 'react';
import { GameBoyFrame } from './components/GameBoyFrame';
import { PhaserGame } from './components/PhaserGame';
import './styles/gameboy.css';
import './styles/wallet.css';

export const App: React.FC = () => {
  return (
    <GameBoyFrame>
      <PhaserGame />
    </GameBoyFrame>
  );
};
