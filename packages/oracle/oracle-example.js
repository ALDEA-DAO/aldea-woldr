/**
 * Sample Cardano NFT Oracle Service
 * 
 * This is a reference implementation of an oracle service that verifies
 * Cardano NFT ownership and generates signatures for the CharacterSystem contract.
 * 
 * WARNING: This is example code. For production use:
 * - Add proper error handling
 * - Implement rate limiting
 * - Add authentication
 * - Use a secure key management system
 * - Add comprehensive logging
 * - Implement monitoring and alerts
 */

import express from 'express';
import { ethers } from 'ethers';
import BlockFrostAPI from '@blockfrost/blockfrost-js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// ============================================================================
// Configuration
// ============================================================================

const PORT = process.env.PORT || 3000;
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CHARACTER_SYSTEM_ADDRESS;
const RPC_URL = process.env.EVM_RPC_URL;

// Signature validity period (1 hour)
const SIGNATURE_VALIDITY_SECONDS = 3600;

// ============================================================================
// Initialize Services
// ============================================================================

const app = express();
const cardano = new BlockFrostAPI({ 
  projectId: BLOCKFROST_API_KEY,
  // Use 'mainnet' in production
  network: 'preprod'
});

// Oracle wallet (signs verification messages)
const oracleWallet = new ethers.Wallet(ORACLE_PRIVATE_KEY);

// Provider for checking smart contract state
const provider = new ethers.JsonRpcProvider(RPC_URL);

// ============================================================================
// Smart Contract Interface
// ============================================================================

const CHARACTER_SYSTEM_ABI = [
  "function getUserNonce(address user) view returns (uint256)",
  // Add other functions as needed
];

const contractReadOnly = new ethers.Contract(
  CONTRACT_ADDRESS,
  CHARACTER_SYSTEM_ABI,
  provider
);

// ============================================================================
// Middleware
// ============================================================================

app.use(express.json());
app.use(cors());

// Rate limiting: max 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many verification requests, please try again later'
});

app.use('/verify-nft', limiter);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert Cardano NFT identifier to bytes32
 */
function cardanoNFTToBytes32(policyId, assetName) {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string'],
      [policyId, assetName]
    )
  );
}

/**
 * Verify NFT ownership on Cardano blockchain
 */
async function verifyCardanoNFTOwnership(policyId, assetName, cardanoAddress) {
  try {
    const asset = policyId + assetName;
    const assetAddresses = await cardano.assetsAddresses(asset);
    
    // Check if any of the addresses holding this NFT matches the user's address
    const ownsNFT = assetAddresses.some(
      holder => holder.address === cardanoAddress && holder.quantity === '1'
    );
    
    return ownsNFT;
  } catch (error) {
    console.error('Error verifying Cardano ownership:', error);
    throw new Error('Failed to verify NFT ownership on Cardano');
  }
}

/**
 * Get the current nonce for a user
 */
async function getUserNonce(evmAddress) {
  try {
    const nonce = await contractReadOnly.getUserNonce(evmAddress);
    return nonce;
  } catch (error) {
    console.error('Error getting user nonce:', error);
    // If we can't get nonce, return 0 (default for new users)
    return 0n;
  }
}

/**
 * Generate verification signature
 */
async function generateSignature(evmAddress, nftIdBytes32, nonce, deadline) {
  // Create the message hash (must match CharacterSystem contract)
  // Includes: user address, NFT ID, nonce, and deadline
  const messageHash = ethers.solidityPackedKeccak256(
    ['address', 'bytes32', 'uint256', 'uint256'],
    [evmAddress, nftIdBytes32, nonce, deadline]
  );
  
  // Sign the message (adds Ethereum signed message prefix)
  const signature = await oracleWallet.signMessage(
    ethers.getBytes(messageHash)
  );
  
  return signature;
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    oracleAddress: oracleWallet.address,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get oracle address (useful for verification)
 */
app.get('/oracle-address', (req, res) => {
  res.json({ 
    address: oracleWallet.address 
  });
});

/**
 * Main verification endpoint
 * 
 * Request body:
 * {
 *   "evmAddress": "0x...",           // User's EVM wallet address
 *   "cardanoAddress": "addr1...",     // User's Cardano wallet address
 *   "cardanoPolicyId": "...",         // NFT policy ID
 *   "cardanoAssetName": "..."         // NFT asset name (hex encoded)
 * }
 * 
 * Response:
 * {
 *   "nftId": "0x...",                 // bytes32 hash of NFT
 *   "nonce": 123,                     // User's current nonce
 *   "deadline": 1234567890,           // Unix timestamp
 *   "signature": "0x...",             // Oracle signature
 *   "oracleAddress": "0x..."          // Oracle's address (for verification)
 * }
 */
app.post('/verify-nft', async (req, res) => {
  try {
    const { evmAddress, cardanoAddress, cardanoPolicyId, cardanoAssetName } = req.body;
    
    // ========================================================================
    // 1. Validate Input
    // ========================================================================
    
    if (!evmAddress || !ethers.isAddress(evmAddress)) {
      return res.status(400).json({ 
        error: 'Invalid EVM address' 
      });
    }
    
    if (!cardanoAddress || !cardanoAddress.startsWith('addr')) {
      return res.status(400).json({ 
        error: 'Invalid Cardano address' 
      });
    }
    
    if (!cardanoPolicyId || !cardanoAssetName) {
      return res.status(400).json({ 
        error: 'Missing NFT identifier (policyId or assetName)' 
      });
    }
    
    // ========================================================================
    // 2. Convert NFT identifier to bytes32
    // ========================================================================
    
    const nftIdBytes32 = cardanoNFTToBytes32(cardanoPolicyId, cardanoAssetName);
    
    console.log('Verification request:', {
      evmAddress,
      cardanoAddress,
      nftId: nftIdBytes32,
      timestamp: new Date().toISOString()
    });
    
    // ========================================================================
    // 3. Get user's current nonce
    // ========================================================================
    
    const nonce = await getUserNonce(evmAddress);
    
    // ========================================================================
    // 4. Verify NFT ownership on Cardano
    // ========================================================================
    
    const ownsNFT = await verifyCardanoNFTOwnership(
      cardanoPolicyId,
      cardanoAssetName,
      cardanoAddress
    );
    
    if (!ownsNFT) {
      return res.status(403).json({ 
        error: 'Cardano address does not own this NFT',
        cardanoAddress,
        nftId: nftIdBytes32
      });
    }
    
    // ========================================================================
    // 5. Generate signature with nonce and deadline
    // ========================================================================
    
    const deadline = Math.floor(Date.now() / 1000) + SIGNATURE_VALIDITY_SECONDS;
    
    const signature = await generateSignature(
      evmAddress,
      nftIdBytes32,
      nonce,
      deadline
    );
    
    // ========================================================================
    // 6. Return verification proof
    // ========================================================================
    
    const response = {
      success: true,
      nftId: nftIdBytes32,
      nonce: nonce.toString(),
      deadline: deadline,
      signature: signature,
      oracleAddress: oracleWallet.address,
      expiresAt: new Date(deadline * 1000).toISOString()
    };
    
    console.log('Verification successful:', {
      evmAddress,
      nftId: nftIdBytes32,
      nonce: nonce.toString(),
      expiresAt: response.expiresAt
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('Cardano NFT Oracle Service');
  console.log('='.repeat(70));
  console.log(`Server running on port ${PORT}`);
  console.log(`Oracle address: ${oracleWallet.address}`);
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
  console.log('='.repeat(70));
});

// ============================================================================
// Error Handling
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
