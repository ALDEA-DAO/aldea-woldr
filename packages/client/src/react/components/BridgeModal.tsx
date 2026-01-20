import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useBridgeStore } from '../../stores/bridgeStore';
import { TransactionStatusModal, TransactionStage } from './TransactionStatusModal';
import type { SupportedWallet } from '../../config/CardanoConfig';

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
  const [isConnectingCardano, setIsConnectingCardano] = useState(false);
  const [cardanoConnectionError, setCardanoConnectionError] = useState('');
  const [availableWallets, setAvailableWallets] = useState<SupportedWallet[]>([]);
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet | null>(null);

  // Detect available wallets when modal opens
  useEffect(() => {
    if (isOpen && !isCardanoConnected) {
      const wallets = cardanoWalletManager.getAvailableWallets();
      setAvailableWallets(wallets);
    }
  }, [isOpen, isCardanoConnected, cardanoWalletManager]);

  // Clear error when modal is closed or wallet connects successfully
  useEffect(() => {
    if (!isOpen || isCardanoConnected) {
      setCardanoConnectionError('');
      setShowWalletSelection(false);
      setSelectedWallet(null);
    }
  }, [isOpen, isCardanoConnected]);

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

  const handleShowWalletSelection = () => {
    if (availableWallets.length === 0) {
      setCardanoConnectionError('❌ No Cardano wallet detected!\n\nPlease install a supported wallet:\n• Nami (https://namiwallet.io)\n• Eternl (https://eternl.io)\n• Flint, Lace, or other CIP-30 compatible wallets');
    } else {
      setShowWalletSelection(true);
      setCardanoConnectionError('');
    }
  };

  const handleConnectCardano = async (wallet: SupportedWallet) => {
    setSelectedWallet(wallet);
    setIsConnectingCardano(true);
    setCardanoConnectionError('');
    
    try {
      await connectCardano(wallet);
      setShowWalletSelection(false);
    } catch (error: any) {
      console.error('Failed to connect Cardano wallet:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Failed to connect wallet';
      
      if (errorMessage.includes('no account set')) {
        errorMessage = '❌ No wallet account found!\n\nPlease:\n1. Open your Cardano wallet extension\n2. Create or unlock your wallet account\n3. Try connecting again';
      } else if (errorMessage.includes('User declined')) {
        errorMessage = '❌ Connection rejected. Please approve the connection in your wallet.';
      } else if (errorMessage.includes('No Cardano wallet found')) {
        errorMessage = '❌ No Cardano wallet detected!\n\nPlease install a supported wallet:\n• Nami (https://namiwallet.io)\n• Eternl (https://eternl.io)\n• Other CIP-30 compatible wallets';
      }
      
      setCardanoConnectionError(errorMessage);
    } finally {
      setIsConnectingCardano(false);
      setSelectedWallet(null);
    }
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
              <>
                {!showWalletSelection ? (
                  <>
                    <button 
                      className="connect-wallet-btn cardano"
                      onClick={handleShowWalletSelection}
                      disabled={isConnectingCardano}
                    >
                      Connect Cardano Wallet
                    </button>
                    {cardanoConnectionError && (
                      <div className="error-message" style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        backgroundColor: '#fee', 
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        color: '#c33',
                        fontSize: '14px',
                        whiteSpace: 'pre-line',
                        textAlign: 'left'
                      }}>
                        {cardanoConnectionError}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="wallet-selection" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '10px'
                  }}>
                    <p style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                      Choose your wallet:
                    </p>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#e3f2fd', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      color: '#1976d2',
                      marginBottom: '6px',
                      lineHeight: '1.5'
                    }}>
                      <div style={{ marginBottom: '6px' }}>
                        💡 <strong>For Eternl multi-account users:</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#0d47a1' }}>
                        • First connection will use your current active Eternl account<br/>
                        • To switch accounts: Set your desired account in Eternl first<br/>
                        • Or in Eternl: Settings → dApp Connector → "Force dApp account"<br/>
                        • Then connect here - it will use that account
                      </div>
                    </div>
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet}
                        className="wallet-option-btn"
                        onClick={() => handleConnectCardano(wallet)}
                        disabled={isConnectingCardano}
                        style={{
                          padding: '12px 16px',
                          backgroundColor: selectedWallet === wallet ? '#e3f2fd' : '#fff',
                          border: '2px solid #2196f3',
                          borderRadius: '8px',
                          cursor: isConnectingCardano ? 'not-allowed' : 'pointer',
                          fontSize: '15px',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                          opacity: isConnectingCardano && selectedWallet !== wallet ? 0.5 : 1
                        }}
                      >
                        {isConnectingCardano && selectedWallet === wallet
                          ? `⏳ Connecting to ${wallet}...`
                          : `🔗 ${wallet}`}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowWalletSelection(false);
                        setCardanoConnectionError('');
                      }}
                      disabled={isConnectingCardano}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#666',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Cancel
                    </button>
                    {cardanoConnectionError && (
                      <div className="error-message" style={{ 
                        marginTop: '8px', 
                        padding: '12px', 
                        backgroundColor: '#fee', 
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        color: '#c33',
                        fontSize: '14px',
                        whiteSpace: 'pre-line',
                        textAlign: 'left'
                      }}>
                        {cardanoConnectionError}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="wallet-info">
                <div className="wallet-status connected">
                  ✓ Connected via <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{cardanoWalletManager.getConnectedWalletName()}</span>
                </div>
                <div style={{ 
                  marginTop: '12px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '4px', fontWeight: '500' }}>
                    CONNECTED ADDRESS:
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    color: '#212529',
                    backgroundColor: '#fff',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    {cardanoAddress}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '6px', fontStyle: 'italic' }}>
                    ℹ️ Check browser console for detailed account info
                  </div>
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
                <div style={{ fontSize: '11px', color: '#856404', marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeeba' }}>
                  ⚠️ <strong>Wrong account?</strong><br/>
                  <div style={{ marginTop: '4px', fontSize: '10px' }}>
                    1. Click Disconnect below<br/>
                    2. Open Eternl → Settings → dApp Connector<br/>
                    3. Either disable "Force dApp account" OR select the correct account<br/>
                    4. Reconnect to this dApp
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
