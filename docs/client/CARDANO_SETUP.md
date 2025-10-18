# Cardano Wallet Integration Setup Guide

## Overview

The game now requires players to hold **$ALMA tokens** to access gameplay. This is verified through Cardano wallet connection.

## Quick Setup

### 1. Configure Required Assets

Edit `src/config/CardanoConfig.ts` and update the `REQUIRED_ASSETS` array:

```typescript
REQUIRED_ASSETS: [
  {
    policyId: 'YOUR_ACTUAL_ALMA_POLICY_ID',  // Replace with real policy ID
    assetName: 'ALMA',
    assetNameHex: '',  // Leave empty for fungible tokens, or add hex for NFTs
    minAmount: 1,      // Minimum amount required
    displayName: '$ALMA Token'
  }
]
```

**How to find your asset details:**

1. Go to [Cardano Scan](https://preprod.cardanoscan.io) (or mainnet version)
2. Search for your token/NFT
3. Copy the Policy ID
4. For NFTs, get the hex-encoded asset name from the asset details

### 2. Set Up Blockfrost API

1. Create a free account at [Blockfrost.io](https://blockfrost.io)
2. Create a new project (choose **Preprod** for testing)
3. Copy your Project ID

4. Create `.env` file in the client package:
```bash
cp .env.example .env
```

5. Edit `.env` and add your Blockfrost Project ID:
```
VITE_BLOCKFROST_PROJECT_ID=preprodYourProjectIdHere
```

### 3. Switch Networks (Optional)

To switch from **Preprod** to **Mainnet**, edit `src/config/CardanoConfig.ts`:

```typescript
export const CardanoConfig = {
  NETWORK: 'Mainnet' as 'Mainnet' | 'Preprod',  // Change this
  BLOCKFROST_URL: 'https://cardano-mainnet.blockfrost.io/api/v0',  // Change this
  // ... rest of config
}
```

Don't forget to update your `.env` with a mainnet Blockfrost project ID!

## How It Works

### User Flow

1. **Click "START GAME"** → Prompted to connect wallet
2. **Select Wallet** → Choose from available wallets (Nami, Eternl, Lace, etc.)
3. **Connect** → Wallet extension prompts for permission
4. **Verify Assets** → Game checks if wallet holds required $ALMA tokens
5. **Access Granted/Denied**:
   - ✅ **Has $ALMA** → Game loads
   - ❌ **No $ALMA** → Shows error with link to mint page

### Supported Wallets

- Nami
- Eternl
- Lace
- Flint
- GeroWallet
- Typhon
- CardWallet
- NuFi

Players must have one of these wallets installed as a browser extension.

## Configuration Options

### Multiple Required Assets

You can require multiple tokens/NFTs:

```typescript
REQUIRED_ASSETS: [
  {
    policyId: 'alma_policy_id',
    assetName: 'ALMA',
    assetNameHex: '',
    minAmount: 100,  // Require 100 ALMA tokens
    displayName: '$ALMA Token'
  },
  {
    policyId: 'nft_collection_policy',
    assetName: 'MyNFT001',
    assetNameHex: '4d794e4654303031',  // Hex encoded
    minAmount: 1,  // Require at least 1 NFT from this collection
    displayName: 'Founder NFT'
  }
]
```

### Customize Mint URL

Change where users are directed if they don't have the required assets:

```typescript
MINT_URL: 'https://your-custom-mint-page.com'
```

## Testing

### Test on Preprod

1. Set up preprod Blockfrost project
2. Use preprod wallet with test ADA
3. Get test tokens from preprod faucet or mint test tokens
4. Test the full flow

### Test Scenarios

- ✅ No wallet installed → Should show "install wallet" message
- ✅ Wallet installed but not connected → Shows wallet selection
- ✅ Connected but no $ALMA → Shows "access denied" with mint link
- ✅ Connected with $ALMA → Grants access to game

## Development

### Run with Wallet Integration

```bash
pnpm --filter client dev
```

The game will be available at `http://localhost:3000`

### Check Console Logs

Open browser DevTools to see:
- Wallet connection status
- Asset verification details
- Any errors during the process

## Troubleshooting

### "No Cardano wallets detected"

**Solution:** Install a Cardano wallet extension (Nami, Eternl, or Lace recommended)

### "Failed to connect wallet"

**Possible causes:**
- Wallet extension not enabled
- User declined connection request
- Wallet locked (needs password)

**Solution:** Unlock wallet and try again

### "Failed to verify wallet"

**Possible causes:**
- Invalid Blockfrost API key
- Network mismatch (mainnet vs preprod)
- Blockfrost API rate limit

**Solution:** 
- Check `.env` configuration
- Verify network settings match
- Check Blockfrost dashboard for API issues

### Asset Not Detected

**Possible causes:**
- Wrong policy ID in config
- Wrong asset name hex encoding
- Asset in different wallet/address

**Solution:**
- Verify policy ID and asset name
- Check on Cardano explorer
- Ensure wallet is connected to correct account

## Asset ID Format

Cardano assets are identified by concatenating:
- Policy ID (56-64 hex characters)
- Asset Name (hex encoded)

Example:
```
Policy ID: a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235
Asset Name (text): ALMA
Asset Name (hex): 414c4d41
Full Asset ID: a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235414c4d41
```

For fungible tokens with no asset name, just use the policy ID.

## Security Notes

- ✅ Wallet connection is non-custodial (user maintains control)
- ✅ Only reads wallet contents, never requests signatures
- ✅ No private keys ever accessed by the game
- ✅ Blockfrost API key is safe to expose (read-only for queries)

## Next Steps

After setting up asset verification, you can:

1. **Track Player Assets** → Store verified assets in GameStateManager
2. **Use NFTs as In-Game Items** → Load NFT metadata and use in game
3. **Token-Gated Features** → Unlock special areas/items based on holdings
4. **Leaderboards** → Track players by wallet address
5. **On-Chain Actions** → Add write operations (staking, trading, etc.)

## Support

- **Cardano Docs:** https://docs.cardano.org
- **Blockfrost Docs:** https://docs.blockfrost.io
- **Lucid Docs:** https://lucid.spacebudz.io

## Example: Real $ALMA Token Configuration

Once you have your real $ALMA token deployed on Cardano, update the config like this:

```typescript
// Example - Replace with your actual values
REQUIRED_ASSETS: [
  {
    policyId: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
    assetName: 'ALMA',
    assetNameHex: '414c4d41',  // Hex of "ALMA"
    minAmount: 1,
    displayName: '$ALMA Token'
  }
]
```

You can find these values on Cardano explorers like:
- https://cardanoscan.io (mainnet)
- https://preprod.cardanoscan.io (preprod)
- https://pool.pm
