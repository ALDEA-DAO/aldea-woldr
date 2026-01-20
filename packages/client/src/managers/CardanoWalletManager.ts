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

  constructor() { }

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
   * @param walletName - The wallet to connect to
   * @param forceReconnect - If true, clears previous authorization to force account selection
   */
  async connectWallet(walletName: SupportedWallet, forceReconnect: boolean = false): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.cardano) {
        throw new Error('Cardano wallets not available in this browser');
      }

      const walletExtension = window.cardano[walletName];
      if (!walletExtension) {
        throw new Error(`${walletName} wallet not found`);
      }

      // Force reconnection if requested (clears previous authorization)
      if (forceReconnect) {
        try {
          // Try experimental.disable() for wallets that support it (like Eternl)
          if (walletExtension.experimental?.disable) {
            console.log(`Clearing previous ${walletName} authorization...`);
            await walletExtension.experimental.disable();
          }
        } catch (error) {
          // Silently ignore if disable() isn't supported
          console.log('Wallet does not support experimental.disable()');
        }
      }

      // Request wallet access - will show account selector if not previously authorized
      console.log(`Requesting ${walletName} access...`);
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

      // Get and log all addresses to verify account selection
      const allAddresses = await this.getAllAddresses();
      const currentAddress = await this.lucid.wallet.address();
      
      console.log(`✅ Connected to ${walletName} wallet on ${CardanoConfig.NETWORK}`);
      console.log('📍 Current active address:', currentAddress);
      if (allAddresses.length > 0) {
        console.log('📋 All addresses in this account:', allAddresses.slice(0, 3));
      }
      
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
  async disconnect(): Promise<void> {
    // Try to disable the wallet connection if supported
    if (this.connectedWallet && typeof window !== 'undefined' && window.cardano) {
      try {
        const walletExtension = window.cardano[this.connectedWallet];
        if (walletExtension?.experimental?.disable) {
          console.log(`Disconnecting ${this.connectedWallet}...`);
          await walletExtension.experimental.disable();
        }
      } catch (error) {
        console.log('Could not disable wallet connection:', error);
      }
    }
    
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
   * Get all addresses from the wallet (useful for verifying account)
   */
  async getAllAddresses(): Promise<string[]> {
    if (!this.walletApi) {
      return [];
    }

    try {
      // Get used addresses
      const usedAddresses = await this.walletApi.getUsedAddresses();
      // Get unused addresses 
      const unusedAddresses = await this.walletApi.getUnusedAddresses();
      
      console.log('📍 Wallet addresses detected:');
      console.log('  Used addresses:', usedAddresses.length);
      console.log('  Unused addresses:', unusedAddresses.length);
      
      return [...usedAddresses, ...unusedAddresses];
    } catch (error) {
      console.error('Failed to get wallet addresses:', error);
      return [];
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
      console.log('Building transaction...');
      const tx = await this.lucid
        .newTx()
        .payToAddress(bridgeAddress, {
          lovelace: BigInt(2000000), // Min ADA (2 ADA)
          [assetId]: amount
        })
        .attachMetadata(674, {
          msg: ['ALDEA Bridge Transfer'],
          amount: amount.toString(),
          destination: destinationEthAddress,
          network: 'pyrope'
        })
        .complete();

      console.log('Transaction built, requesting signature from wallet...');
      // Sign the transaction (opens wallet popup)
      const witnessSet = await tx.sign();
      
      console.log('Signature received, completing transaction...');
      // Complete the signed transaction
      const signedTx = await witnessSet.complete();
      
      console.log('Transaction complete, submitting to blockchain...');
      const txHash = await signedTx.submit();
      
      console.log('✅ Transaction submitted:', txHash);

      return { success: true, txHash };
    } catch (error: any) {
      console.error('❌ Failed to send tokens:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        info: error.info,
        stack: error.stack
      });
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Transaction failed';
      
      if (errorMessage.includes('user declined') || errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction cancelled: You declined to sign the transaction in your wallet';
      } else if (errorMessage.includes('insufficient') || errorMessage.includes('not enough')) {
        errorMessage = 'Insufficient funds: Not enough ADA or tokens to complete this transaction';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Wallet signing timeout: Please try again and approve the transaction quickly';
      }
      
      return { success: false, error: errorMessage };
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
          network: 'pyrope'
        })
        .complete();

      return BigInt(tx.fee);
    } catch (error) {
      console.error('Failed to estimate fee:', error);
      // Return estimated fee of ~0.2 ADA
      return BigInt(200000);
    }
  }

  /**
   * Wait for Cardano transaction confirmation
   * Returns true when transaction is confirmed (found in a block)
   */
  async waitForCardanoConfirmation(txHash: string, maxWaitMs: number = 60000): Promise<boolean> {
    if (!this.lucid) {
      return false;
    }

    const startTime = Date.now();
    const pollInterval = 3000; // Check every 3 seconds

    while (Date.now() - startTime < maxWaitMs) {
      try {
        // Use Blockfrost API to check transaction status
        const projectId = import.meta.env.VITE_BLOCKFROST_PROJECT_ID;
        const network = CardanoConfig.NETWORK === 'Mainnet' ? 'mainnet' : 'preprod';
        const url = `https://cardano-${network}.blockfrost.io/api/v0/txs/${txHash}`;

        const response = await fetch(url, {
          headers: {
            'project_id': projectId
          }
        });

        if (response.ok) {
          const txData = await response.json();
          // If transaction has block info, it's confirmed
          if (txData.block) {
            return true;
          }
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error checking transaction status:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    return false;
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
        experimental?: {
          disable?(): Promise<void>;
        };
      };
    };
  }
}
