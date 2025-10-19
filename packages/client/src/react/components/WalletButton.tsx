import React from 'react';
import { useWalletStore } from '../../stores/walletStore';

export const WalletButton: React.FC = () => {
  const { address, isConnected, aldeaBalance, isLoading, connectWallet, walletManager } = useWalletStore();

  const handleConnect = async () => {
    if (!walletManager.isMetaMaskInstalled()) {
      alert('Please install MetaMask to continue!');
      return;
    }
    await connectWallet();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(2);
  };

  if (isLoading) {
    return (
      <button className="wallet-button connecting">
        <span className="wallet-icon">🦊</span>
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="wallet-button connected">
        <div className="wallet-address">
          <span className="wallet-icon">🦊</span>
          <span>{formatAddress(address)}</span>
        </div>
        <div className="wallet-balance">
          <span className="balance-icon">💎</span>
          <span>{formatBalance(aldeaBalance)} $ALDEA</span>
        </div>
      </div>
    );
  }

  return (
    <button className="wallet-button" onClick={handleConnect}>
      <span className="wallet-icon">🦊</span>
      <span>Connect Wallet</span>
    </button>
  );
};
