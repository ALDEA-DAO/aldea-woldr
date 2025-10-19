import { Lucid, Blockfrost, WalletApi, UTxO } from 'lucid-cardano';
import { CardanoConfig, SupportedWallet, RequiredAsset } from '../config/CardanoConfig';

/**
 * CardanoWalletManager
 * 
 * Handles Cardano wallet connection and asset verification
 */
export class CardanoWalletManager {
  private lucid: Lucid | null = null;
  private walletApi: WalletApi | null = null;
  private connectedWallet: SupportedWallet | null = null;

  constructor() {}

  /**
   * Get available Cardano wallets in the browser
   */
  getAvailableWallets(): SupportedWallet[] {
    if (typeof window === 'undefined' || !window.cardano) {
      return [];
    }

    return CardanoConfig.SUPPORTED_WALLETS.filter(wallet => {
      return window.cardano && window.cardano[wallet];
    });
  }

  /**
   * Connect to a Cardano wallet
   */
  async connectWallet(walletName: SupportedWallet): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.cardano) {
        throw new Error('Cardano wallets not available in this browser');
      }

      const walletExtension = window.cardano[walletName];
      if (!walletExtension) {
        throw new Error(`${walletName} wallet not found`);
      }

      // Request wallet access
      this.walletApi = await walletExtension.enable();
      
      // Check if Blockfrost project ID is configured
      const projectId = import.meta.env.VITE_BLOCKFROST_PROJECT_ID;
      
      console.log('Blockfrost Project ID:', projectId ? '✓ Configured' : '✗ Missing');
      
      if (!projectId || projectId === 'preprodYourProjectIdHere' || projectId === 'mainnetYourProjectIdHere') {
        throw new Error(
          'Blockfrost API key not configured. Please:\n' +
          '1. Get a free API key from https://blockfrost.io\n' +
          '2. Add VITE_BLOCKFROST_PROJECT_ID to packages/client/.env\n' +
          '3. Restart the dev server'
        );
      }
      
      // Initialize Lucid with Blockfrost
      console.log('Initializing Lucid with:', {
        network: CardanoConfig.NETWORK,
        blockfrostUrl: CardanoConfig.BLOCKFROST_URL,
        projectIdConfigured: projectId ? '✓' : '✗'
      });
      
      try {
        this.lucid = await Lucid.new(
          new Blockfrost(
            CardanoConfig.BLOCKFROST_URL,
            projectId
          ),
          CardanoConfig.NETWORK
        );
      } catch (lucidError: any) {
        console.error('Lucid initialization error:', lucidError);
        throw new Error(
          `Failed to initialize Lucid: ${lucidError.message || 'Unknown error'}\n\n` +
          `This might be caused by:\n` +
          `• Invalid Blockfrost API key\n` +
          `• Network connectivity issues\n` +
          `• Blockfrost service temporarily unavailable`
        );
      }

      // Select the wallet
      this.lucid.selectWallet(this.walletApi);
      this.connectedWallet = walletName;

      // Verify wallet is on the correct network
      await this.verifyNetwork();

      console.log(`Connected to ${walletName} wallet on ${CardanoConfig.NETWORK}`);
      return true;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      // Provide more helpful error message
      if (error.message?.includes('transactionbuilder')) {
        throw new Error('Failed to initialize Cardano connection. Please check your Blockfrost API configuration.');
      }
      throw error;
    }
  }

  /**
   * Verify wallet is on the correct network
   */
  private async verifyNetwork(): Promise<void> {
    if (!this.walletApi) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get network ID from wallet (0 = testnet/preprod, 1 = mainnet)
      const networkId = await this.walletApi.getNetworkId();
      const expectedNetwork = CardanoConfig.NETWORK;
      const expectedNetworkId = expectedNetwork === 'Mainnet' ? 1 : 0;

      if (networkId !== expectedNetworkId) {
        const walletNetwork = networkId === 1 ? 'Mainnet' : 'Preprod/Testnet';
        throw new Error(
          `❌ Network Mismatch!\n\n` +
          `Your wallet is connected to ${walletNetwork}, but this app is configured for ${expectedNetwork}.\n\n` +
          `Please switch your wallet to ${expectedNetwork} and try again.\n\n` +
          `In Eternl: Settings → Network → ${expectedNetwork}`
        );
      }

      console.log(`✓ Network verified: ${expectedNetwork} (ID: ${networkId})`);
    } catch (error: any) {
      // If it's our custom error, throw it
      if (error.message?.includes('Network Mismatch')) {
        throw error;
      }
      // Otherwise, log and continue (some wallets might not support getNetworkId)
      console.warn('Could not verify network:', error);
    }
  }

  /**
   * Disconnect the current wallet
   */
  disconnect(): void {
    this.lucid = null;
    this.walletApi = null;
    this.connectedWallet = null;
  }

  /**
   * Get the connected wallet address
   */
  async getAddress(): Promise<string | null> {
    if (!this.lucid) {
      return null;
    }

    try {
      const address = await this.lucid.wallet.address();
      return address;
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }

  /**
   * Check if wallet holds required assets
   */
  async verifyAssetOwnership(): Promise<{
    hasAccess: boolean;
    missingAssets: RequiredAsset[];
    ownedAssets: Map<string, bigint>;
  }> {
    if (!this.lucid) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get all UTxOs from the wallet
      const utxos = await this.lucid.wallet.getUtxos();
      
      // Aggregate all assets from UTxOs
      const allAssets = this.aggregateAssets(utxos);
      
      // Check each required asset
      const missingAssets: RequiredAsset[] = [];
      const ownedAssets = new Map<string, bigint>();

      for (const required of CardanoConfig.REQUIRED_ASSETS) {
        const assetId = this.getAssetId(required.policyId, required.assetNameHex);
        const amount = allAssets.get(assetId) || BigInt(0);
        
        ownedAssets.set(required.displayName, amount);

        if (amount < BigInt(required.minAmount)) {
          missingAssets.push(required);
        }
      }

      return {
        hasAccess: missingAssets.length === 0,
        missingAssets,
        ownedAssets
      };
    } catch (error) {
      console.error('Failed to verify assets:', error);
      throw error;
    }
  }

  /**
   * Aggregate assets from UTxOs
   */
  private aggregateAssets(utxos: UTxO[]): Map<string, bigint> {
    const assets = new Map<string, bigint>();

    for (const utxo of utxos) {
      if (utxo.assets) {
        for (const [assetId, amount] of Object.entries(utxo.assets)) {
          // Skip if amount is undefined, null, or not a valid value
          if (amount === undefined || amount === null) {
            continue;
          }
          
          const currentAmount = assets.get(assetId) || BigInt(0);
          assets.set(assetId, currentAmount + BigInt(amount));
        }
      }
    }

    return assets;
  }

  /**
   * Get asset ID from policy ID and asset name
   */
  private getAssetId(policyId: string, assetNameHex: string): string {
    // For native tokens, if assetNameHex is empty, it's typically the policy ID only
    if (!assetNameHex || assetNameHex === '') {
      return policyId;
    }
    return policyId + assetNameHex;
  }

  /**
   * Check if a wallet is currently connected
   */
  isConnected(): boolean {
    return this.lucid !== null && this.walletApi !== null;
  }

  /**
   * Get the name of the connected wallet
   */
  getConnectedWalletName(): SupportedWallet | null {
    return this.connectedWallet;
  }

  /**
   * Get ADA balance
   */
  async getAdaBalance(): Promise<bigint> {
    if (!this.lucid) {
      return BigInt(0);
    }

    try {
      const utxos = await this.lucid.wallet.getUtxos();
      let total = BigInt(0);
      
      for (const utxo of utxos) {
        const lovelace = utxo.assets?.lovelace;
        if (lovelace !== undefined && lovelace !== null) {
          total += BigInt(lovelace);
        }
      }
      
      return total;
    } catch (error) {
      console.error('Failed to get ADA balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get balance of a specific token
   */
  async getTokenBalance(policyId: string, tokenNameHex: string): Promise<bigint> {
    if (!this.lucid) {
      return BigInt(0);
    }

    try {
      const utxos = await this.lucid.wallet.getUtxos();
      const assets = this.aggregateAssets(utxos);
      const assetId = this.getAssetId(policyId, tokenNameHex);
      
      return assets.get(assetId) || BigInt(0);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Send tokens to bridge address
   */
  async sendTokensToBridge(
    bridgeAddress: string,
    policyId: string,
    tokenNameHex: string,
    amount: bigint,
    destinationEthAddress: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.lucid) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const assetId = policyId + tokenNameHex;
      
      // Build transaction with metadata containing destination address
      const tx = await this.lucid
        .newTx()
        .payToAddress(bridgeAddress, { 
          lovelace: BigInt(2000000), // Min ADA (2 ADA)
          [assetId]: amount 
        })
        .attachMetadata(674, {
          msg: ['ALDEA Bridge Transfer'],
          destination: destinationEthAddress,
          network: 'garnet'
        })
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      return { success: true, txHash };
    } catch (error: any) {
      console.error('Failed to send tokens:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateBridgeFee(
    bridgeAddress: string,
    policyId: string,
    tokenNameHex: string,
    amount: bigint
  ): Promise<bigint> {
    if (!this.lucid) {
      return BigInt(0);
    }

    try {
      const assetId = policyId + tokenNameHex;
      
      const tx = await this.lucid
        .newTx()
        .payToAddress(bridgeAddress, { 
          lovelace: BigInt(2000000),
          [assetId]: amount 
        })
        .attachMetadata(674, {
          msg: ['ALDEA Bridge Transfer'],
          destination: '0x0000000000000000000000000000000000000000',
          network: 'garnet'
        })
        .complete();

      return BigInt(tx.fee);
    } catch (error) {
      console.error('Failed to estimate fee:', error);
      // Return estimated fee of ~0.2 ADA
      return BigInt(200000);
    }
  }
}

// Type definitions for Cardano wallets
declare global {
  interface Window {
    cardano?: {
      [key: string]: {
        enable(): Promise<WalletApi>;
        isEnabled(): Promise<boolean>;
        apiVersion: string;
        name: string;
        icon: string;
      };
    };
  }
}
