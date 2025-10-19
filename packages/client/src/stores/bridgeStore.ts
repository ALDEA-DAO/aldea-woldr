import { create } from 'zustand';
import { CardanoWalletManager } from '../managers/CardanoWalletManager';

interface BridgeState {
  // Cardano wallet state
  cardanoAddress: string | null;
  isCardanoConnected: boolean;
  cardanoBalance: string;
  cardanoWalletManager: CardanoWalletManager;
  
  // Bridge state
  transferAmount: string;
  isOpen: boolean;
  
  // Actions
  connectCardano: () => Promise<void>;
  disconnectCardano: () => void;
  setTransferAmount: (amount: string) => void;
  bridgeToMetaMask: () => Promise<void>;
  openBridge: () => void;
  closeBridge: () => void;
}

const cardanoWalletManager = new CardanoWalletManager();

export const useBridgeStore = create<BridgeState>((set, get) => ({
  // Initial state
  cardanoAddress: null,
  isCardanoConnected: false,
  cardanoBalance: '0',
  cardanoWalletManager,
  transferAmount: '',
  isOpen: false,

  // Connect Cardano wallet
  connectCardano: async () => {
    try {
      // Try to connect with first available wallet
      const availableWallets = cardanoWalletManager.getAvailableWallets();
      
      if (availableWallets.length === 0) {
        throw new Error('No Cardano wallet found. Please install Nami, Eternl, or another supported wallet.');
      }
      
      const connected = await cardanoWalletManager.connectWallet(availableWallets[0]);
      
      if (connected) {
        const address = await cardanoWalletManager.getAddress();
        
        set({
          cardanoAddress: address,
          isCardanoConnected: true
        });
        
        // Fetch ADA balance
        const balance = await cardanoWalletManager.getAdaBalance();
        set({ cardanoBalance: balance.toString() });
      } else {
        throw new Error('Failed to connect Cardano wallet');
      }
    } catch (error) {
      console.error('Cardano connection error:', error);
      throw error;
    }
  },

  // Disconnect Cardano wallet
  disconnectCardano: () => {
    cardanoWalletManager.disconnect();
    set({
      cardanoAddress: null,
      isCardanoConnected: false,
      cardanoBalance: '0'
    });
  },

  // Set transfer amount
  setTransferAmount: (amount: string) => {
    set({ transferAmount: amount });
  },

  // Bridge tokens to MetaMask
  bridgeToMetaMask: async () => {
    const { transferAmount, isCardanoConnected, cardanoAddress } = get();
    
    if (!isCardanoConnected || !cardanoAddress) {
      throw new Error('Cardano wallet not connected');
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      throw new Error('Invalid amount');
    }

    try {
      // TODO: Implement actual bridge logic
      // This would interact with your bridge smart contracts
      console.log(`Bridging ${transferAmount} ALDEA from Cardano to MetaMask`);
      
      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Lock tokens on Cardano side
      // 2. Submit proof to Ethereum bridge contract
      // 3. Mint wrapped tokens on Ethereum
      
      return Promise.resolve();
    } catch (error) {
      console.error('Bridge error:', error);
      throw error;
    }
  },

  // Open bridge modal
  openBridge: () => set({ isOpen: true }),

  // Close bridge modal
  closeBridge: () => set({ isOpen: false })
}));
