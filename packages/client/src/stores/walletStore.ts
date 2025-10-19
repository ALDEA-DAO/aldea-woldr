import { create } from 'zustand';
import { EthereumWalletManager } from '../managers/EthereumWalletManager';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  aldeaBalance: string;
  isLoading: boolean;
  walletManager: EthereumWalletManager;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const walletManager = new EthereumWalletManager();

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  isConnected: false,
  aldeaBalance: '0',
  isLoading: false,
  walletManager,

  connectWallet: async () => {
    set({ isLoading: true });
    
    const result = await walletManager.connectWallet();
    
    if (result.success && result.address) {
      set({ 
        address: result.address,
        isConnected: true,
        isLoading: false
      });
      
      // Fetch balance after connecting
      await get().refreshBalance();
    } else {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    walletManager.disconnect();
    set({
      address: null,
      isConnected: false,
      aldeaBalance: '0'
    });
  },

  refreshBalance: async () => {
    if (!get().isConnected) return;
    
    const { balance } = await walletManager.getAldeaBalance();
    set({ aldeaBalance: balance });
  }
}));
