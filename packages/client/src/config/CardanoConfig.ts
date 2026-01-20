/**
 * Cardano Configuration for NFT/Token Verification
 * 
 * Configure which assets are required to access the game
 */

// Get network from environment variable, default to Preprod
const getNetwork = (): 'Mainnet' | 'Preprod' => {
  const network = import.meta.env.VITE_CARDANO_NETWORK;
  return network === 'Mainnet' ? 'Mainnet' : 'Preprod';
};

// Get Blockfrost URL based on network
const getBlockfrostUrl = (): string => {
  const network = getNetwork();
  return network === 'Mainnet'
    ? 'https://cardano-mainnet.blockfrost.io/api/v0'
    : 'https://cardano-preprod.blockfrost.io/api/v0';
};

export const CardanoConfig = {
  // Network to use (mainnet or preprod)
  NETWORK: getNetwork(),

  // Blockfrost API configuration
  BLOCKFROST_URL: getBlockfrostUrl(),

  // Required assets to play the game
  // Format: PolicyID + AssetName (hex encoded)
  REQUIRED_ASSETS: [
    {
      // ALMA Token - Replace with actual policy ID and asset name
      policyId: '99ad492da6e8a7afeccb91ac7492324686a69a701aa998be519db438',
      assetName: 'ALDEA', // Human readable name
      assetNameHex: '414c444541', // Hex encoded asset name (empty for fungible tokens)
      minAmount: 1, // Minimum amount required (1 for NFT, higher for fungible tokens)
      displayName: 'Test ALDEA'
    }
  ],

  // Mint URL for users who don't have the required assets
  MINT_URL: 'https://alma.aldea.world',

  // Supported wallets
  SUPPORTED_WALLETS: [
    'nami',
    'eternl',
    'flint',
    'gerowallet',
    'typhoncip30',
    'cardwallet',
    'nufi',
    'lace'
  ] as const
};

export type SupportedWallet = typeof CardanoConfig.SUPPORTED_WALLETS[number];

export interface RequiredAsset {
  policyId: string;
  assetName: string;
  assetNameHex: string;
  minAmount: number;
  displayName: string;
}
