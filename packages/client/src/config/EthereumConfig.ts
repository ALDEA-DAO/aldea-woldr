/**
 * Ethereum Wallet Configuration
 */

export const EthereumConfig = {
  // ALDEA Token Contract Address (ERC-20)
  // This should be set in .env as VITE_ALDEA_TOKEN_ADDRESS
  aldeaTokenAddress: import.meta.env.VITE_ALDEA_TOKEN_ADDRESS as string || '0x0000000000000000000000000000000000000000',
  
  // Chain ID
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 31337,
  
  // RPC URL
  rpcUrl: import.meta.env.VITE_RPC_URL as string || 'http://localhost:8545',
  
  // Token decimals (typically 18 for ERC-20)
  tokenDecimals: 18,
};

// ERC-20 ABI (minimal interface for balanceOf)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;
