# Quick Setup Guide for Character Creation Payment & NFT Verification

## What Was Implemented

### ✅ Payment Requirement
- Users must pay **50 ALDEA tokens** to call `createCharacter`
- Tokens are transferred to the CharacterSystem contract
- Contract owner can withdraw accumulated fees

### ✅ Cross-Chain NFT Verification
- Verifies ownership of Cardano NFTs from EVM blockchain
- Uses signature-based oracle approach with nonce protection
- **NFTs can be reused** - just need to own it at verification time
- Prevents signature replay attacks via incrementing nonce

## Quick Start

### 1. Generate Oracle Wallet

```bash
# Install ethers
npm install ethers

# Generate a new wallet
node -e "console.log(require('ethers').Wallet.createRandom().mnemonic.phrase)"
```

Save the mnemonic securely! This wallet will be your oracle.

### 2. Deploy Contracts

You need to deploy with the oracle address and ALDEA token address:

```solidity
// When deploying CharacterSystem, pass:
constructor(
  address _aldeaToken,      // Your deployed ALDEA token address
  address _nftVerifierOracle // Oracle wallet address from step 1
)
```

### 3. Set Up Oracle Service

```bash
# Navigate to contracts directory
cd packages/contracts

# Install dependencies
npm install express ethers @blockfrost/blockfrost-js cors express-rate-limit

# Create .env file
cat > .env << EOL
PORT=3000
BLOCKFROST_API_KEY=your_blockfrost_api_key
ORACLE_PRIVATE_KEY=your_oracle_private_key
CHARACTER_SYSTEM_ADDRESS=deployed_contract_address
EVM_RPC_URL=your_evm_rpc_url
EOL

# Run the oracle
node oracle-example.js
```

### 4. Get Blockfrost API Key

1. Go to https://blockfrost.io/
2. Sign up for free account
3. Create a new project (Preprod or Mainnet)
4. Copy the API key to your `.env` file

### 5. Update Frontend

The frontend needs to:

1. **Request verification from oracle**:
```typescript
const response = await fetch('http://localhost:3000/verify-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evmAddress: userWalletAddress,
    cardanoAddress: userCardanoWalletAddress,
    cardanoPolicyId: 'YOUR_NFT_POLICY_ID',
    cardanoAssetName: 'YOUR_NFT_ASSET_NAME'
  })
});

const { nftId, nonce, deadline, signature } = await response.json();
```

2. **Approve ALDEA spending**:
```typescript
const aldeaToken = new ethers.Contract(ALDEA_ADDRESS, ALDEA_ABI, signer);
await aldeaToken.approve(
  CHARACTER_SYSTEM_ADDRESS, 
  ethers.parseEther('50')
);
```

3. **Call createCharacter**:
```typescript
const tx = await worldContract.aldea__createCharacter(
  classChoice,  // 0 for random, or specific class number
  nftId,        // From oracle response
  nonce,        // From oracle response
  deadline,     // From oracle response
  signature     // From oracle response
);
await tx.wait();
```

## Configuration

### Update Oracle Address (if needed)

```solidity
// Call this on CharacterSystem
setNFTVerifierOracle(newOracleAddress);
```

### Update ALDEA Token Address (if needed)

```solidity
// Call this on CharacterSystem
setAldeaToken(newAldeaTokenAddress);
```

### Withdraw Fees

```solidity
// Withdraw accumulated ALDEA tokens
withdrawFees(recipientAddress, amount);
```

## Testing

### Test Oracle

```bash
curl -X POST http://localhost:3000/verify-nft \
  -H "Content-Type: application/json" \
  -d '{
    "evmAddress": "0x1234...",
    "cardanoAddress": "addr1...",
    "cardanoPolicyId": "...",
    "cardanoAssetName": "..."
  }'
```

Expected response:
```json
{
  "success": true,
  "nftId": "0x...",
  "nonce": "0",
  "deadline": 1234567890,
  "signature": "0x...",
  "oracleAddress": "0x...",
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

### Test Smart Contract

```javascript
// Get user's current nonce
const nonce = await characterSystem.getUserNonce(userAddress);

// Try creating a character
const tx = await characterSystem.createCharacter(
  0,         // Random class
  nftId,
  nonce,
  deadline,
  signature
);
await tx.wait();

// Nonce should have incremented
const newNonce = await characterSystem.getUserNonce(userAddress);
console.log('Nonce incremented:', nonce, '->', newNonce);
```

## Troubleshooting

### "Invalid NFT Proof" Error
- ✅ Verify oracle address in contract matches the signing wallet
- ✅ Check signature format
- ✅ Ensure nftId, deadline match exactly what was signed

### "Invalid Nonce" Error
- Signature contains wrong nonce (likely already used)
- Get fresh signature with current nonce from oracle
- Each signature can only be used once

### "Signature Expired" Error
- Signatures expire after 1 hour
- Request a new signature from oracle

### "Insufficient Payment" Error
- User needs at least 50 ALDEA tokens
- Must approve CharacterSystem to spend ALDEA
- Check approval: `aldeaToken.allowance(user, characterSystem)`

### Oracle Can't Verify Cardano NFT
- Check Blockfrost API key is valid
- Verify policy ID and asset name are correct
- Make sure NFT exists on the correct network (preprod vs mainnet)

## Production Checklist

- [ ] Secure oracle private key (use AWS KMS, HashiCorp Vault, etc.)
- [ ] Set up monitoring for oracle service
- [ ] Implement proper logging
- [ ] Add authentication to oracle endpoints
- [ ] Use HTTPS for oracle service
- [ ] Add access control to admin functions (setAldeaToken, setNFTVerifierOracle, withdrawFees)
- [ ] Test on testnet thoroughly
- [ ] Test NFT reusability (create multiple characters with same NFT)
- [ ] Set up alerts for oracle downtime
- [ ] Document your specific NFT policy ID and asset names
- [ ] Configure CORS properly for production
- [ ] Set up backup oracles (optional)

## Architecture Diagram

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 1. Request verification
       ↓
┌──────────────────┐
│  Oracle Service  │
│                  │
│  Queries:        │
│  ┌─────────────┐ │
│  │   Cardano   │ │  2. Verify NFT ownership
│  │ Blockchain  │ │
│  └─────────────┘ │
│                  │
│  ┌─────────────┐ │
│  │     EVM     │ │  3. Check if NFT used
│  │  Contract   │ │
│  └─────────────┘ │
│                  │
│  4. Sign proof   │
└────────┬─────────┘
         │ 5. Return signature
         ↓
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 6. Call createCharacter
       │    + Send signature
       │    + Pay 50 ALDEA
       ↓
┌──────────────────┐
│  CharacterSystem │
│     Contract     │
│                  │
│  Verifies:       │
│  ✓ Signature     │
│  ✓ Nonce match    │
│  ✓ Payment       │
│  ✓ Deadline      │
│                  │
│  Creates:        │
│  → Character     │
│  → Increments nonce│
└──────────────────┘
```

## Next Steps

1. **Deploy the updated contracts** (after running `pnpm build` to generate the UserNonce table code)
2. **Set up and test the oracle service**
3. **Update your frontend** to integrate with the oracle
4. **Test the complete flow** on testnet
5. **Deploy to production**

## Support

- Read `CARDANO_NFT_ORACLE.md` for detailed explanation
- Check `oracle-example.js` for the sample implementation
- Review `CharacterSystem.sol` for smart contract logic

## Security Notes

⚠️ **IMPORTANT**: 
- The oracle's private key is a critical security component
- If compromised, attackers could create fake NFT verifications
- Use proper key management in production
- Consider multi-signature schemes for additional security
- Regularly audit oracle logs for suspicious activity

### NFT Reusability is Secure ✅

**By Design**: NFTs can be reused because:
1. **Signature binds to user**: Each signature includes `msg.sender`, preventing theft
2. **Nonce prevents replay**: Each signature can only be used once via nonce increment
3. **Current ownership verified**: Oracle checks current Cardano ownership at verification time
4. **Payment required each time**: User pays 50 ALDEA per character regardless

This means if you own a Cardano NFT, you can create multiple characters by:
- Paying 50 ALDEA each time
- Getting a fresh signature each time (with new nonce)
- Continuing to own the NFT on Cardano

**Why this is better**: You don't lose your valuable Cardano NFT after first use!
