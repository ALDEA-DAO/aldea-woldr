# Cardano NFT Oracle Service Documentation

## Overview

This document explains how the cross-chain NFT verification system works for the Aldea game. Since the game runs on an EVM blockchain but requires ownership verification of NFTs on Cardano, we use a signature-based oracle approach.

## Architecture

### The Problem
- Game smart contracts run on EVM blockchain
- Required NFTs exist on Cardano blockchain
- Direct cross-chain verification is not possible on-chain

### The Solution
A trusted oracle service that:
1. Monitors Cardano blockchain for NFT ownership
2. Generates cryptographic signatures proving ownership
3. Users submit these signatures to the EVM smart contract
4. Smart contract verifies the signature came from the trusted oracle

## How It Works

### 1. User Requests Verification

The user contacts the oracle service with:
- Their EVM wallet address
- Their Cardano NFT policy ID + asset name

### 2. Oracle Verifies Ownership

The oracle service:
1. Queries Cardano blockchain using Blockfrost, Koios, or similar API
2. Verifies the user owns the specific NFT on Cardano
3. Retrieves user's current nonce from smart contract

### 3. Oracle Generates Signature

If ownership is confirmed, the oracle:
```javascript
// Get user's current nonce from smart contract
const nonce = await contract.getUserNonce(userEVMAddress);

const messageHash = ethers.solidityPackedKeccak256(
  ['address', 'bytes32', 'uint256', 'uint256'],
  [userEVMAddress, nftIdBytes32, nonce, deadline]
);

const signature = await oracleWallet.signMessage(
  ethers.getBytes(messageHash)
);
```

The signature includes:
- `userEVMAddress`: The user's EVM wallet address
- `nftIdBytes32`: Hash of Cardano NFT (policy + asset name)
- `nonce`: User's current nonce (prevents replay attacks)
- `deadline`: Unix timestamp when signature expires (e.g., current time + 1 hour)

### 4. User Calls createCharacter

The user then calls:
```solidity
createCharacter(
  classChoice,      // Character class (0 for random)
  nftIdBytes32,     // Same bytes32 used in signature
  nonce,            // Same nonce used in signature
  deadline,         // Same deadline used in signature
  signature         // Signature from oracle
)
```

### 5. Smart Contract Verification

The smart contract:
1. ✅ Verifies signature hasn't expired
2. ✅ Verifies nonce matches user's current nonce (prevents replay attacks)
3. ✅ Increments user's nonce
4. ✅ Recovers signer address from signature
5. ✅ Confirms signer is the authorized oracle
6. ✅ Transfers 50 ALDEA tokens from user
7. ✅ Creates the character

**Note**: Each NFT can be reused! The requirement is only to **own** the NFT at the time of character creation, not to burn it or lock it.

## Oracle Implementation Example

### Backend Service (Node.js/Express)

```javascript
import express from 'express';
import { ethers } from 'ethers';
import BlockFrostAPI from '@blockfrost/blockfrost-js';

const app = express();
const cardano = new BlockFrostAPI({ projectId: process.env.BLOCKFROST_API_KEY });

// Oracle's private key (KEEP SECURE!)
const oracleWallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY);

// Endpoint to request NFT verification
app.post('/verify-nft', async (req, res) => {
  const { evmAddress, cardanoPolicyId, cardanoAssetName } = req.body;
  
  try {
    // 1. Query Cardano blockchain for NFT ownership
    const assetAddresses = await cardano.assetsAddresses(
      cardanoPolicyId + cardanoAssetName
    );
    
    // 2. Verify user owns this NFT
    const userCardanoAddress = req.body.cardanoAddress;
    const ownsNFT = assetAddresses.some(addr => addr.address === userCardanoAddress);
    
    if (!ownsNFT) {
      return res.status(403).json({ error: 'NFT not owned by this address' });
    }
    
    // 3. Get user's current nonce
    const nftId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string'],
        [cardanoPolicyId, cardanoAssetName]
      )
    );
    
    const nonce = await contract.getUserNonce(evmAddress);
    
    // 4. Generate signature
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256', 'uint256'],
      [evmAddress, nftId, nonce, deadline]
    );
    
    const signature = await oracleWallet.signMessage(
      ethers.getBytes(messageHash)
    );
    
    // 5. Return signature to user
    res.json({
      nftId,
      nonce: nonce.toString(),
      deadline,
      signature,
      oracleAddress: oracleWallet.address
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Frontend Integration

```typescript
// 1. User requests verification from oracle
const response = await fetch('https://your-oracle.com/verify-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evmAddress: userWalletAddress,
    cardanoAddress: userCardanoAddress,
    cardanoPolicyId: 'your_policy_id',
    cardanoAssetName: 'your_asset_name'
  })
});

const { nftId, nonce, deadline, signature } = await response.json();

// 2. Approve ALDEA token spending (if not already done)
const aldeaContract = new ethers.Contract(ALDEA_TOKEN_ADDRESS, ALDEA_ABI, signer);
await aldeaContract.approve(CHARACTER_SYSTEM_ADDRESS, ethers.utils.parseEther('50'));

// 3. Call createCharacter with signature
const tx = await worldContract.aldea__createCharacter(
  classChoice,
  nftId,
  nonce,
  deadline,
  signature
);

await tx.wait();
```

## Security Considerations

### Oracle Security
- **Private Key Protection**: Oracle's private key must be kept highly secure
- **Rate Limiting**: Implement rate limiting to prevent spam
- **HTTPS Only**: All oracle communications must use HTTPS
- **Signature Expiry**: Short expiry times (1 hour) prevent replay attacks

### Smart Contract Security
- **Nonce Protection**: Each signature can only be used once via incrementing nonce
- **NFT Reusability**: NFTs can be reused - just need to own it at verification time
- **Signature Verification**: Only signatures from authorized oracle are accepted
- **Deadline Check**: Expired signatures are rejected
- **Payment First**: Payment is collected before character creation

### Best Practices
1. **Monitoring**: Log all verification requests for audit trail
2. **Oracle Rotation**: Support updating oracle address if compromised
3. **Multiple Oracles**: Consider multi-signature approach with multiple oracles
4. **Cardano Address Verification**: Require users to prove Cardano address ownership

## Deployment Steps

1. **Deploy Contracts**
   ```bash
   # Deploy ALDEA token
   # Deploy CharacterSystem with ALDEA token address and oracle address
   ```

2. **Set Up Oracle Service**
   - Generate oracle wallet: `ethers.Wallet.createRandom()`
   - Save private key securely
   - Deploy oracle backend service
   - Fund oracle with gas (if needed for any transactions)

3. **Configure Frontend**
   - Add oracle endpoint URL
   - Implement NFT verification flow
   - Add ALDEA approval step before character creation

4. **Test Flow**
   - Test with real Cardano NFT
   - Verify signature validation
   - Confirm payment collection
   - Check NFT can't be reused

## Converting Cardano NFT to bytes32

Cardano NFTs are identified by `policyId + assetName`. To convert to bytes32:

```javascript
// Option 1: Keccak256 hash
const nftId = ethers.utils.keccak256(
  ethers.utils.defaultAbiCoder.encode(
    ['string', 'string'],
    [policyId, assetName]
  )
);

// Option 2: If you want deterministic mapping
// Use the same hashing method on both oracle and frontend
```

## Updating Configuration

The CharacterSystem includes admin functions:

```solidity
// Update ALDEA token address
function setAldeaToken(address _aldeaToken) external

// Update oracle address (if oracle key compromised)
function setNFTVerifierOracle(address _nftVerifierOracle) external

// Withdraw collected fees
function withdrawFees(address to, uint256 amount) external
```

**Note**: These functions should be protected by access control in production (add onlyOwner or similar modifiers).

## Troubleshooting

### Common Issues

1. **"Invalid NFT Proof" Error**
   - Verify oracle address matches in contract
   - Check signature format is correct
   - Ensure deadline, nftId, and address match exactly

2. **"Invalid Nonce" Error**
   - The nonce in your signature doesn't match the current on-chain nonce
   - Request a fresh signature from the oracle
   - This prevents replay attacks - each signature can only be used once

3. **"Signature Expired" Error**
   - The signature deadline has passed
   - Request a new signature from oracle

4. **"Insufficient Payment" Error**
   - Ensure user has 50+ ALDEA tokens
   - Verify ALDEA approval for CharacterSystem contract

### How Replay Protection Works

**Question**: Can someone reuse a signature?
**Answer**: No! Here's why:

1. **Signature includes nonce**: `sign(userAddress + nftId + nonce + deadline)`
2. **Contract checks nonce**: Must match user's current on-chain nonce
3. **Nonce increments**: After successful use, nonce increases by 1
4. **Old signatures fail**: Previous signatures have old nonce, so they fail verification

**Question**: Can I create multiple characters with the same NFT?
**Answer**: Yes! As long as you:
- Still own the NFT on Cardano
- Pay 50 ALDEA each time
- Get a fresh signature each time (with new nonce)

**Question**: Can someone steal my signature?
**Answer**: No, because:
- Signature binds to YOUR EVM address
- If someone else tries to use it, `msg.sender` won't match
- Signature verification will fail

## Alternative Approaches

### Chainlink Functions (More Complex)
- Use Chainlink to query Cardano APIs directly
- More decentralized but more expensive
- Requires Chainlink oracle setup

### NFT Bridge (Not Recommended)
- Bridge Cardano NFT to EVM chain
- Loses Cardano NFT in the process
- Complex and expensive

### Multi-Oracle Consensus (Advanced)
- Multiple independent oracles verify ownership
- Require majority agreement
- More secure but more complex

## Contact & Support

For questions about this implementation:
- Review the smart contract: `CharacterSystem.sol`
- Check the MUD config: `mud.config.ts`
- See the table definition: `CardanoNFTUsed`
