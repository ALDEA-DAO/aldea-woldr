import { EthereumConfig, ERC20_ABI, pyropeChain } from '../config/EthereumConfig';

export class EthereumWalletManager {
  private connectedAddress: string | null = null;
  private provider: any = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Switch to Pyrope Chain
   */
  async switchToPyropeChain(): Promise<boolean> {
    if (!this.provider) return false;

    try {
      // Try to switch to Pyrope chain
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${EthereumConfig.chainId.toString(16)}` }], // 0xa9d11
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${EthereumConfig.chainId.toString(16)}`, // 0xa9d11
                chainName: 'Pyrope',
                rpcUrls: [EthereumConfig.rpcUrl],
                nativeCurrency: {
                  name: 'Pyrope',
                  symbol: 'PYROPE',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://explorer.pyropechain.com'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Pyrope chain:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Pyrope chain:', switchError);
      return false;
    }
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    if (!this.isMetaMaskInstalled()) {
      return {
        success: false,
        error: 'MetaMask is not installed. Please install MetaMask extension.',
      };
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        return {
          success: false,
          error: 'No accounts found. Please unlock MetaMask.',
        };
      }

      this.connectedAddress = accounts[0];
      this.provider = window.ethereum;

      // Check current chain
      const chainId = await this.provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);

      // Switch to Pyrope chain if not already on it
      if (currentChainId !== EthereumConfig.chainId) {
        const switched = await this.switchToPyropeChain();
        if (!switched) {
          return {
            success: false,
            error: 'Please switch to Pyrope Chain (695569) in MetaMask',
          };
        }
      }

      // Listen for account changes
      this.setupEventListeners();

      return {
        success: true,
        address: this.connectedAddress || undefined,
      };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect wallet',
      };
    }
  }

  /**
   * Get ALDEA token balance for connected wallet
   */
  async getAldeaBalance(): Promise<{ balance: string; error?: string }> {
    if (!this.connectedAddress) {
      return { balance: '0', error: 'Wallet not connected' };
    }

    try {
      // Import viem for contract interaction
      const { createPublicClient, http, formatUnits, getContract } = await import('viem');

      const publicClient = createPublicClient({
        chain: pyropeChain,
        transport: http(EthereumConfig.rpcUrl),
      });

      // Create contract instance
      const tokenContract = getContract({
        address: EthereumConfig.aldeaTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      // Get balance
      const balance = await tokenContract.read.balanceOf([this.connectedAddress! as `0x${string}`]);
      
      // Format balance (18 decimals)
      const formattedBalance = formatUnits(balance as bigint, EthereumConfig.tokenDecimals);

      return { balance: formattedBalance };
    } catch (error: any) {
      console.error('Failed to get ALDEA balance:', error);
      return { balance: '0', error: error.message };
    }
  }

  /**
   * Get connected wallet address
   */
  getConnectedAddress(): string | null {
    return this.connectedAddress;
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.connectedAddress = null;
    this.provider = null;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connectedAddress !== null;
  }

  /**
   * Format address for display (0x1234...5678)
   */
  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Setup event listeners for wallet events
   */
  private setupEventListeners(): void {
    if (!this.provider) return;

    // Listen for account changes
    this.provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.connectedAddress = accounts[0];
      }
    });

    // Listen for chain changes
    this.provider.on('chainChanged', () => {
      // Reload the page on chain change
      window.location.reload();
    });
  }
}

// Global declarations
declare global {
  interface Window {
    ethereum?: any;
  }
}
