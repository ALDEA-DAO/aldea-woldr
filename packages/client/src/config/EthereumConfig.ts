import { defineChain } from 'viem';

/**
 * Pyrope Chain Configuration
 * Chain ID: 695569 (0xa9d11)
 * RPC: https://rpc.pyropechain.com
 * WSS: wss://rpc.pyropechain.com
 */
export const pyropeChain = defineChain({
  id: 695569,
  name: 'Pyrope',
  nativeCurrency: {
    decimals: 18,
    name: 'Pyrope',
    symbol: 'PYROPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.pyropechain.com'],
      webSocket: ['wss://rpc.pyropechain.com'],
    },
    public: {
      http: ['https://rpc.pyropechain.com'],
      webSocket: ['wss://rpc.pyropechain.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.pyropechain.com' },
  },
});

/**
 * Ethereum Wallet Configuration
 */
export const EthereumConfig = {
  // ALDEA Token Contract Address (ERC-20)
  // This should be set in .env as VITE_ALDEA_TOKEN_ADDRESS
  aldeaTokenAddress: import.meta.env.VITE_ALDEA_TOKEN_ADDRESS as string || '0x0000000000000000000000000000000000000000',
  
  // Chain ID - Pyrope Chain
  chainId: 695569,
  
  // RPC URL - Pyrope Chain
  rpcUrl: 'https://rpc.pyropechain.com',
  
  // WebSocket RPC URL
  wsRpcUrl: 'wss://rpc.pyropechain.com',
  
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
