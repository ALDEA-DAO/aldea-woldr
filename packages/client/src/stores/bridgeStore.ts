import { create } from 'zustand';
import { CardanoWalletManager } from '../managers/CardanoWalletManager';
import type { SupportedWallet } from '../config/CardanoConfig';

// Bridge configuration
const BRIDGE_CONFIG = {
  bridgeAddress: 'addr_test1qqmceh6c3z9eeq55wz50c5szw59dtyjctyyev8l2xxgwrs8g5a36wxc9qt0ae44gxk9nsxd65dwdu7gr0fal8q0dvxzqzsz4jr',
  aldeaPolicyId: '99ad492da6e8a7afeccb91ac7492324686a69a701aa998be519db438',
  tokenNameHex: '414c444541',
  networkName: 'pyrope'
};

interface BridgeState {
  // Cardano wallet state
  cardanoAddress: string | null;
  isCardanoConnected: boolean;
  aldeaTokenBalance: string;
  adaBalance: string;
  cardanoWalletManager: CardanoWalletManager;

  // Bridge state
  transferAmount: string;
  estimatedFee: string;
  isOpen: boolean;

  // Actions
  connectCardano: (walletName?: SupportedWallet) => Promise<void>;
  disconnectCardano: () => Promise<void>;
  setTransferAmount: (amount: string) => void;
  setMaxAmount: () => void;
  refreshBalances: () => Promise<void>;
  estimateFee: () => Promise<void>;
  bridgeToMetaMask: (destinationAddress: string) => Promise<string | undefined>;
  openBridge: () => void;
  closeBridge: () => void;
}

const cardanoWalletManager = new CardanoWalletManager();

export const useBridgeStore = create<BridgeState>((set, get) => ({
  // Initial state
  cardanoAddress: null,
  isCardanoConnected: false,
  aldeaTokenBalance: '0',
  adaBalance: '0',
  cardanoWalletManager,
  transferAmount: '',
  estimatedFee: '0',
  isOpen: false,

  // Connect Cardano wallet
  connectCardano: async (walletName?: SupportedWallet) => {
    try {
      // Get available wallets
      const availableWallets = cardanoWalletManager.getAvailableWallets();

      console.log('Available wallets:', availableWallets);
      if (availableWallets.length === 0) {
        throw new Error('No Cardano wallet found. Please install Nami, Eternl, or another supported wallet.');
      }

      // Use specified wallet or throw error asking user to choose
      if (!walletName) {
        throw new Error('Please select a wallet to connect');
      }

      // Verify the selected wallet is available
      if (!availableWallets.includes(walletName)) {
        throw new Error(`${walletName} wallet is not installed or not available`);
      }

      console.log(`Connecting to ${walletName}...`);
      // Connect to wallet (forceReconnect=false to avoid signing issues)
      // If you need to switch Eternl accounts, disconnect first then reconnect
      const connected = await cardanoWalletManager.connectWallet(walletName, false);

      if (connected) {
        const address = await cardanoWalletManager.getAddress();

        // Log the connected address for verification
        console.log('✓ Connected to Cardano wallet:', walletName);
        console.log('✓ Connected address:', address);

        set({
          cardanoAddress: address,
          isCardanoConnected: true
        });

        // Fetch balances
        await get().refreshBalances();
      } else {
        throw new Error('Failed to connect Cardano wallet');
      }
    } catch (error) {
      console.error('Cardano connection error:', error);
      throw error;
    }
  },

  // Disconnect Cardano wallet
  disconnectCardano: async () => {
    await cardanoWalletManager.disconnect();
    set({
      cardanoAddress: null,
      isCardanoConnected: false,
      aldeaTokenBalance: '0',
      adaBalance: '0',
      transferAmount: '',
      estimatedFee: '0'
    });
  },

  // Refresh balances
  refreshBalances: async () => {
    if (!get().isCardanoConnected) return;

    try {
      // Get ALDEA token balance
      const tokenBalance = await cardanoWalletManager.getTokenBalance(
        BRIDGE_CONFIG.aldeaPolicyId,
        BRIDGE_CONFIG.tokenNameHex
      );

      // Get ADA balance
      const adaBalance = await cardanoWalletManager.getAdaBalance();

      set({
        aldeaTokenBalance: tokenBalance.toString(),
        adaBalance: adaBalance.toString()
      });
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  },

  // Set transfer amount
  setTransferAmount: (amount: string) => {
    set({ transferAmount: amount });
    // Estimate fee when amount changes
    if (amount && parseFloat(amount) > 0) {
      get().estimateFee();
    }
  },

  // Set max amount
  setMaxAmount: () => {
    const { aldeaTokenBalance } = get();
    const balance = BigInt(aldeaTokenBalance || '0');

    if (balance > 0) {
      // Convert from token smallest unit (assuming 6 decimals for ALDEA)
      const maxAmount = Number(balance) / 1_000_000;
      set({ transferAmount: maxAmount.toString() });
      get().estimateFee();
    }
  },

  // Estimate transaction fee
  estimateFee: async () => {
    const { transferAmount, isCardanoConnected } = get();

    if (!isCardanoConnected || !transferAmount || parseFloat(transferAmount) <= 0) {
      set({ estimatedFee: '0' });
      return;
    }

    try {
      // Convert amount to smallest unit (assuming 6 decimals)
      const amountInSmallestUnit = BigInt(Math.floor(parseFloat(transferAmount) * 1_000_000));

      console.log(amountInSmallestUnit);

      const fee = await cardanoWalletManager.estimateBridgeFee(
        BRIDGE_CONFIG.bridgeAddress,
        BRIDGE_CONFIG.aldeaPolicyId,
        BRIDGE_CONFIG.tokenNameHex,
        amountInSmallestUnit
      );

      set({ estimatedFee: fee.toString() });
    } catch (error) {
      console.error('Failed to estimate fee:', error);
      // Default to ~0.2 ADA
      set({ estimatedFee: '200000' });
    }
  },

  // Bridge tokens to MetaMask/Pyrope
  bridgeToMetaMask: async (destinationAddress: string) => {
    const { transferAmount, isCardanoConnected, cardanoAddress } = get();

    if (!isCardanoConnected || !cardanoAddress) {
      throw new Error('Cardano wallet not connected');
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      throw new Error('Invalid amount');
    }

    if (!destinationAddress) {
      throw new Error('Destination Ethereum address required');
    }

    try {
      // Convert amount to smallest unit (assuming 6 decimals)
      const amountInSmallestUnit = BigInt(Math.floor(parseFloat(transferAmount) * 1_000_000));

      // Send tokens to bridge address
      const result = await cardanoWalletManager.sendTokensToBridge(
        BRIDGE_CONFIG.bridgeAddress,
        BRIDGE_CONFIG.aldeaPolicyId,
        BRIDGE_CONFIG.tokenNameHex,
        amountInSmallestUnit,
        destinationAddress
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      // Refresh balances after successful transaction
      await get().refreshBalances();

      return result.txHash;
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
