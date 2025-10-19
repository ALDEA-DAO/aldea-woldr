import React, { useEffect, useState } from 'react';
import { WalletButton } from './WalletButton';
import { useWalletStore } from '../../stores/walletStore';

interface GameBoyFrameProps {
  children: React.ReactNode;
}

export const GameBoyFrame: React.FC<GameBoyFrameProps> = ({ children }) => {
  const { aldeaBalance, isConnected } = useWalletStore();
  const [isAlmaActivated, setIsAlmaActivated] = useState(false);

  useEffect(() => {
    // Check if user has ALMA tokens
    // If not connected, we haven't checked yet, so show NOT activated
    if (!isConnected) {
      setIsAlmaActivated(false); // Show NOT activated when wallet not connected
    } else {
      const balance = parseFloat(aldeaBalance);
      setIsAlmaActivated(balance > 0);
    }
  }, [aldeaBalance, isConnected]);

  return (
    <div className="gameboy-container">
      <div className="gameboy-frame">
        {/* Top Section - Brand and Wallet */}
        <div className="gameboy-header">
          <div className="gameboy-brand">
            <div className="brand-text">ALDEA</div>
            <div className="brand-subtext">WOLDR™</div>
          </div>
          <div className="gameboy-wallet">
            <WalletButton />
          </div>
        </div>

        {/* Screen Bezel */}
        <div className="screen-bezel">
          <div className={`screen-label ${isAlmaActivated ? 'activated' : 'not-activated'}`}>
            <span className={`status-dot ${isAlmaActivated ? 'active' : 'inactive'}`}></span>
            {isAlmaActivated ? 'ALMA ACTIVATED' : 'ALMA NOT ACTIVATED'}
          </div>
          
          {/* Game Screen */}
          <div className="game-screen">
            {children}
          </div>

          {/* Screen Info */}
          <div className="screen-info">
            <div className="battery-indicator">
              <span className="battery-icon">🔋</span>
              <span>ONLINE</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="gameboy-controls">
          <div className="dpad-section">
            <div className="dpad">
              <div className="dpad-center"></div>
              <div className="dpad-up">▲</div>
              <div className="dpad-down">▼</div>
              <div className="dpad-left">◀</div>
              <div className="dpad-right">▶</div>
            </div>
            <div className="control-label">MOVE</div>
          </div>

          <div className="buttons-section">
            <div className="action-buttons">
              <button className="btn-a">A</button>
              <button className="btn-b">B</button>
            </div>
            <div className="control-labels">
              <span>SPACE</span>
              <span>ESC</span>
            </div>
          </div>
        </div>

        {/* Bottom Labels */}
        <div className="gameboy-footer">
          <div className="speaker-grille">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="speaker-dot"></div>
            ))}
          </div>
          <div className="model-label">Aldea Woldr™ • Blockchain Edition</div>
        </div>
      </div>
    </div>
  );
};
