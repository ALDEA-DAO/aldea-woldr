import React, { useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useBridgeStore } from '../../stores/bridgeStore';
import { TransactionStatusModal, TransactionStage } from './TransactionStatusModal';

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BridgeModal: React.FC<BridgeModalProps> = ({ isOpen, onClose }) => {
  const { isConnected: isMetaMaskConnected, address: metaMaskAddress, aldeaBalance: pyropeBalance, walletManager, refreshBalance } = useWalletStore();
  const { 
    cardanoAddress, 
    isCardanoConnected,
    aldeaTokenBalance,
    adaBalance,
    connectCardano, 
    disconnectCardano,
    transferAmount,
    estimatedFee,
    setTransferAmount,
    setMaxAmount,
    bridgeToMetaMask,
    cardanoWalletManager
  } = useBridgeStore();

  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [showTxStatus, setShowTxStatus] = useState(false);
  const [txStage, setTxStage] = useState<TransactionStage>('cardano-confirming');
  const [txError, setTxError] = useState('');

  if (!isOpen) return null;

  const formatTokenBalance = (balance: string) => {
    // Convert from smallest unit (6 decimals) to display format
    const balanceNum = Number(balance) / 1_000_000;
    return balanceNum.toFixed(6);
  };

  const formatAdaBalance = (balance: string) => {
    // Convert from lovelace to ADA
    const balanceNum = Number(balance) / 1_000_000;
    return balanceNum.toFixed(2);
  };

  const formatFee = (fee: string) => {
    // Convert from lovelace to ADA
    const feeNum = Number(fee) / 1_000_000;
    return feeNum.toFixed(4);
  };

  const handleBridge = async () => {
    if (!isMetaMaskConnected || !metaMaskAddress) {
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
    setBridgeStatus('Building transaction...');
    setTxError('');

    try {
      // Get initial Pyrope balance
      const initialBalance = pyropeBalance;

      // Stage 1: Submit Cardano transaction
      setBridgeStatus('⏳ Please sign the transaction in your Cardano wallet...');
      const hash = await bridgeToMetaMask(metaMaskAddress);
      
      if (!hash) {
        throw new Error('Transaction failed to submit');
      }

      // Show transaction status modal
      setTxHash(hash);
      setTxStage('cardano-confirming');
      setShowTxStatus(true);
      setBridgeStatus('');

      // Stage 2: Wait for Cardano confirmation
      console.log('Waiting for Cardano confirmation...');
      const cardanoConfirmed = await cardanoWalletManager.waitForCardanoConfirmation(hash, 120000); // 2 min timeout

      if (!cardanoConfirmed) {
        throw new Error('Cardano transaction confirmation timeout');
      }

      // Stage 3: Bridge processing
      setTxStage('bridge-processing');
      console.log('Cardano confirmed, waiting for bridge...');
      
      // Wait a bit for bridge to process
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Stage 4: Wait for Pyrope minting (balance increase)
      setTxStage('pyrope-minting');
      console.log('Waiting for Pyrope minting...');
      const mintingDetected = await walletManager.waitForBalanceIncrease(initialBalance, 300000); // 5 min timeout

      if (!mintingDetected) {
        throw new Error('Pyrope minting timeout - please check your balance manually');
      }

      // Stage 5: Completed!
      setTxStage('completed');
      console.log('Bridge completed successfully!');

      // Refresh balances
      await refreshBalance();

      // Auto-close after 5 seconds
      setTimeout(() => {
        setShowTxStatus(false);
        setTransferAmount('');
        setTxHash('');
      }, 5000);

    } catch (error: any) {
      console.error('Bridge error:', error);
      setTxError(error.message || 'Bridge transfer failed');
      setTxStage('error');
      
      // Keep error visible for 10 seconds
      setTimeout(() => {
        setShowTxStatus(false);
        setTxError('');
      }, 10000);
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
                <div className="balance-display">
                  <div className="balance-row">
                    <span>💎 ALDEA Balance:</span>
                    <strong>{formatTokenBalance(aldeaTokenBalance)}</strong>
                  </div>
                  <div className="balance-row">
                    <span>₳ ADA Balance:</span>
                    <strong>{formatAdaBalance(adaBalance)}</strong>
                  </div>
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
              <div className="amount-header">
                <label>Amount to Bridge</label>
                <button 
                  className="max-button"
                  onClick={setMaxAmount}
                  type="button"
                >
                  MAX
                </button>
              </div>
              <div className="amount-input-container">
                <input
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="amount-input"
                  min="0"
                  step="0.000001"
                />
                <span className="token-label-inline">ALDEA</span>
              </div>
              {estimatedFee && transferAmount && parseFloat(transferAmount) > 0 && (
                <div className="fee-display">
                  <span>Estimated Fee:</span>
                  <strong>{formatFee(estimatedFee)} ADA</strong>
                </div>
              )}
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

      {/* Transaction Status Modal */}
      <TransactionStatusModal
        isOpen={showTxStatus}
        stage={txStage}
        cardanoTxHash={txHash}
        error={txError}
        onClose={() => {
          setShowTxStatus(false);
          setTxHash('');
          setTxError('');
        }}
      />
    </div>
  );
};
