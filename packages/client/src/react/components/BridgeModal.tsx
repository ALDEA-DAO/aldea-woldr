import React, { useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useBridgeStore } from '../../stores/bridgeStore';

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BridgeModal: React.FC<BridgeModalProps> = ({ isOpen, onClose }) => {
  const { isConnected: isMetaMaskConnected } = useWalletStore();
  const { 
    cardanoAddress, 
    isCardanoConnected, 
    connectCardano, 
    disconnectCardano,
    transferAmount,
    setTransferAmount,
    bridgeToMetaMask
  } = useBridgeStore();

  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState('');

  if (!isOpen) return null;

  const handleBridge = async () => {
    if (!isMetaMaskConnected) {
      setBridgeStatus('Please connect MetaMask first!');
      return;
    }

    if (!isCardanoConnected) {
      setBridgeStatus('Please connect Cardano wallet first!');
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setBridgeStatus('Please enter a valid amount!');
      return;
    }

    setIsBridging(true);
    setBridgeStatus('Initiating bridge transfer...');

    try {
      await bridgeToMetaMask();
      setBridgeStatus('✓ Bridge transfer successful!');
      setTimeout(() => {
        setBridgeStatus('');
        setTransferAmount('');
      }, 3000);
    } catch (error: any) {
      setBridgeStatus(`❌ ${error.message || 'Bridge transfer failed'}`);
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bridge-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>⚓ ALDEA Bridge</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="bridge-description">
            <p>Bridge your ALDEA tokens from Cardano to Ethereum seamlessly!</p>
          </div>

          {/* Cardano Wallet Section */}
          <div className="wallet-section">
            <h3>🔷 From: Cardano Network</h3>
            {!isCardanoConnected ? (
              <button 
                className="connect-wallet-btn cardano"
                onClick={connectCardano}
              >
                Connect Cardano Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-status connected">
                  ✓ Connected
                </div>
                <div className="wallet-address">
                  {cardanoAddress?.slice(0, 20)}...{cardanoAddress?.slice(-10)}
                </div>
                <button 
                  className="disconnect-btn"
                  onClick={disconnectCardano}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="bridge-arrow">
            ⬇️
          </div>

          {/* MetaMask Section */}
          <div className="wallet-section">
            <h3>🦊 To: Ethereum Network</h3>
            {!isMetaMaskConnected ? (
              <div className="wallet-info">
                <p className="warning">Please connect MetaMask in the top-right corner first!</p>
              </div>
            ) : (
              <div className="wallet-info">
                <div className="wallet-status connected">
                  ✓ MetaMask Connected
                </div>
              </div>
            )}
          </div>

          {/* Amount Input */}
          {isCardanoConnected && isMetaMaskConnected && (
            <div className="amount-section">
              <label>Amount to Bridge</label>
              <input
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="amount-input"
                min="0"
                step="0.01"
              />
              <div className="token-label">ALDEA</div>
            </div>
          )}

          {/* Bridge Button */}
          {isCardanoConnected && isMetaMaskConnected && (
            <button
              className={`bridge-btn ${isBridging ? 'bridging' : ''}`}
              onClick={handleBridge}
              disabled={isBridging}
            >
              {isBridging ? '⏳ Bridging...' : '🌉 Bridge Tokens'}
            </button>
          )}

          {/* Status Message */}
          {bridgeStatus && (
            <div className={`bridge-status ${bridgeStatus.includes('✓') ? 'success' : bridgeStatus.includes('❌') ? 'error' : 'info'}`}>
              {bridgeStatus}
            </div>
          )}

          {/* Info */}
          <div className="bridge-info">
            <p><strong>Note:</strong> Bridge transfers may take a few minutes to complete.</p>
            <p>A small fee will be deducted for network costs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
