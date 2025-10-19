import React, { useEffect, useState } from 'react';
import { GameBoyFrame } from './components/GameBoyFrame';
import { PhaserGame } from './components/PhaserGame';
import { BridgeModal } from './components/BridgeModal';
import './styles/gameboy.css';
import './styles/wallet.css';
import './styles/bridge.css';

export const App: React.FC = () => {
  const [isBridgeOpen, setIsBridgeOpen] = useState(false);

  useEffect(() => {
    // Listen for bridge open event from Phaser
    const handleOpenBridge = () => {
      setIsBridgeOpen(true);
    };

    window.addEventListener('openBridge', handleOpenBridge);

    return () => {
      window.removeEventListener('openBridge', handleOpenBridge);
    };
  }, []);

  return (
    <>
      <GameBoyFrame>
        <PhaserGame />
      </GameBoyFrame>
      
      <BridgeModal 
        isOpen={isBridgeOpen}
        onClose={() => setIsBridgeOpen(false)}
      />
    </>
  );
};
