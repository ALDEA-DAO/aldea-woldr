# ✅ Configuration Checklist for Cardano Integration

Before the game will work with real $ALMA tokens, you need to configure these items:

## 🔴 REQUIRED - Must Configure

### 1. Blockfrost API Key
**File:** `.env`

```bash
# Create .env file from template
cp .env.example .env

# Edit and add your Blockfrost project ID
VITE_BLOCKFROST_PROJECT_ID=preprodYourProjectIdHere
```

**Get API Key:**
1. Go to https://blockfrost.io
2. Sign up / Login
3. Create new project (Preprod for testing)
4. Copy Project ID

---

### 2. $ALMA Token Configuration
**File:** `src/config/CardanoConfig.ts`

**Current (Placeholder):**
```typescript
REQUIRED_ASSETS: [
  {
    policyId: 'YOUR_ALMA_POLICY_ID_HERE',  // ❌ Must replace
    assetName: 'ALMA',
    assetNameHex: '',
    minAmount: 1,
    displayName: '$ALMA Token'
  }
]
```

**You need to update:**
- ✅ `policyId` - Your actual ALMA token policy ID
- ✅ `assetNameHex` - Hex-encoded asset name (if applicable)
- ✅ `minAmount` - How many tokens required

**How to find these values:**
1. Go to Cardano explorer (cardanoscan.io or pool.pm)
2. Search for your ALMA token
3. Copy Policy ID from token details
4. Copy Asset Name (convert to hex if needed)

Example:
```typescript
policyId: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235'
assetNameHex: '414c4d41'  // Hex of "ALMA"
```

---

## 🟡 OPTIONAL - Recommended Configuration

### 3. Network Selection
**File:** `src/config/CardanoConfig.ts`

**For Testing (Preprod):**
```typescript
NETWORK: 'Preprod' as 'Mainnet' | 'Preprod',
BLOCKFROST_URL: 'https://cardano-preprod.blockfrost.io/api/v0'
```

**For Production (Mainnet):**
```typescript
NETWORK: 'Mainnet' as 'Mainnet' | 'Preprod',
BLOCKFROST_URL: 'https://cardano-mainnet.blockfrost.io/api/v0'
```

⚠️ **Important:** Network in config must match your Blockfrost project network!

---

### 4. Mint Page URL
**File:** `src/config/CardanoConfig.ts`

**Current:**
```typescript
MINT_URL: 'https://alma.adasouls.io'
```

Update this to your actual mint page where users can get $ALMA tokens.

---

## 📋 Quick Start Testing Flow

### Phase 1: Test Without Real Tokens (Dev Mode)

You can temporarily bypass verification for testing:

**Option A:** Comment out verification in `MenuScene.ts` (line 98):
```typescript
// const verification = await this.walletManager.verifyAssetOwnership();
// Mock verification for testing
const verification = { hasAccess: true, missingAssets: [], ownedAssets: new Map() };
```

**Option B:** Create a test token on Preprod to verify the flow works

### Phase 2: Set Up Preprod Testing

1. ✅ Get Blockfrost Preprod API key
2. ✅ Set `NETWORK: 'Preprod'` in CardanoConfig.ts
3. ✅ Add your test token policy ID
4. ✅ Test with preprod wallet + test tokens

### Phase 3: Production Deployment

1. ✅ Deploy real $ALMA token on mainnet
2. ✅ Get Blockfrost Mainnet API key
3. ✅ Update config with real policy ID
4. ✅ Set `NETWORK: 'Mainnet'`
5. ✅ Test thoroughly before release

---

## 🧪 Testing Checklist

Test these scenarios before going live:

- [ ] No wallet installed → Shows install message
- [ ] Wallet installed → Shows wallet selection
- [ ] Wallet connection → Successful connection
- [ ] Has $ALMA token → Access granted
- [ ] No $ALMA token → Access denied with mint link
- [ ] Multiple wallets → Can switch between them
- [ ] Refresh page → Can reconnect wallet

---

## 🚨 Common Issues

### "Failed to verify wallet"
- Check Blockfrost API key in `.env`
- Verify network matches (preprod vs mainnet)
- Check browser console for detailed errors

### "Asset not detected" (when you have it)
- Verify policy ID is correct
- Check asset name hex encoding
- Ensure correct wallet account is connected

### Blockfrost 403 Error
- Invalid API key
- API key for wrong network (preprod key on mainnet config)

---

## 📝 Current Configuration Status

```
✅ Cardano Integration Code - Complete
✅ Wallet Connection UI - Complete  
✅ Asset Verification Logic - Complete
✅ Documentation - Complete

🔴 Blockfrost API Key - NEEDS CONFIGURATION
🔴 $ALMA Token Policy ID - NEEDS CONFIGURATION
🟡 Network Selection - Set to Preprod (change for production)
🟡 Mint URL - Set to alma.adasouls.io (verify correct)
```

---

## 🎯 Next Steps

1. **Immediate:**
   - [ ] Create Blockfrost account and get API key
   - [ ] Add API key to `.env` file
   - [ ] Update ALMA token policy ID in `CardanoConfig.ts`

2. **Testing:**
   - [ ] Test on Preprod network first
   - [ ] Verify wallet connection works
   - [ ] Test asset verification

3. **Production:**
   - [ ] Switch to Mainnet configuration
   - [ ] Update with real token details
   - [ ] Test thoroughly
   - [ ] Deploy!

---

## 📚 Documentation

- **Setup Guide:** `CARDANO_SETUP.md`
- **Integration Notes:** `INTEGRATION_NOTES.md`
- **Architecture:** `ARCHITECTURE.md`

## 🆘 Need Help?

1. Check `CARDANO_SETUP.md` for detailed instructions
2. Review Lucid documentation: https://lucid.spacebudz.io
3. Check Blockfrost docs: https://docs.blockfrost.io
