import { EthereumConfig, ERC20_ABI } from '../config/EthereumConfig';

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
      const { localhost } = await import('viem/chains');

      const publicClient = createPublicClient({
        chain: localhost,
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
