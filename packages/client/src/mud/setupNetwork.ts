import { createPublicClient, createWalletClient, custom, http, getContract } from 'viem';
import { localhost } from 'viem/chains';
import IWorldAbi from '../abi/IWorld.abi.json';

export interface NetworkConfig {
  publicClient: any;
  walletClient: any;
  worldContract: any;
  worldAddress: `0x${string}`;
  account: `0x${string}`;
  chainId: number;
}

/**
 * Setup MUD network connection
 */
export async function setupNetwork(): Promise<NetworkConfig> {
  const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 31337;
  
  // Get world address from environment or use default localhost deployment
  const worldAddress = import.meta.env.VITE_WORLD_ADDRESS as `0x${string}` ||
    '0x023Ea31D44040dFB8E99904a356e49edCe558A78' as `0x${string}`;

  // Create public client for reading
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http('http://localhost:8545'),
  });

  //  Create wallet client for writing
  let walletClient;
  let account;

  if (typeof window !== 'undefined' && window.ethereum) {
    walletClient = createWalletClient({
      chain: localhost,
      transport: custom(window.ethereum),
    });

    // Get accounts
    const accounts = await walletClient.getAddresses();
    account = accounts[0];
  } else {
    // For dev/testing without MetaMask, use default Anvil account
    walletClient = createWalletClient({
      chain: localhost,
      transport: http('http://localhost:8545'),
    });
    
    // Default Anvil account
    account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as `0x${string}`;
  }

  // Create contract instance
  const worldContract = getContract({
    address: worldAddress,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: walletClient },
  });

  return {
    publicClient,
    walletClient,
    worldContract,
    worldAddress,
    account,
    chainId,
  };
}

// Type definitions
declare global {
  interface Window {
    ethereum?: any;
  }
}
