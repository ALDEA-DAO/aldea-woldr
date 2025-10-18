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
      policyId: '4084c311448c4d9bfa49c7cf6c83d7b1bb54ced13296e6a2d4211196',
      assetName: 'Test ALDEA', // Human readable name
      assetNameHex: '5465737420414c444541', // Hex encoded asset name (empty for fungible tokens)
      minAmount: 1, // Minimum amount required (1 for NFT, higher for fungible tokens)
      displayName: 'Test ALDEA'
    }
  ],

  // Mint URL for users who don't have the required assets
  MINT_URL: 'https://alma.adasouls.io',

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
