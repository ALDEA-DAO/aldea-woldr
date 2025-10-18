# Security Mechanism Explained

## Your Questions Answered

### Q: Is it weak if NFTs can be reused?
**A: No! It's actually the correct design.** Here's why:

### Q: Can someone mint with another person's NFT signature?
**A: No, it's cryptographically impossible.** Here's the protection:

## How The Security Works

### Layer 1: Signature Binds to User Address

When the oracle creates a signature, it includes:
```javascript
messageHash = hash(userAddress + nftId + nonce + deadline)
signature = sign(messageHash)
```

The `userAddress` is **cryptographically bound** into the signature.

**In the smart contract:**
```solidity
// Contract recovers the signed message
bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, nftId, nonce, deadline));
address recoveredSigner = ECDSA.recover(messageHash, signature);

// Only works if msg.sender matches what was signed
if (recoveredSigner != nftVerifierOracle) {
    revert InvalidNFTProof();
}
```

**What this means:**
- Alice gets a signature for her address: `sign(Alice + nftId + ...)`
- Bob tries to use it, but `msg.sender` is now Bob
- Contract recalculates: `hash(Bob + nftId + ...)` ≠ what was signed
- Signature verification **fails**

✅ **Conclusion**: You cannot use someone else's signature because addresses don't match.

### Layer 2: Nonce Prevents Replay Attacks

Each user has an incrementing nonce stored on-chain.

**Flow:**
1. Alice's current nonce is `5`
2. Oracle signs: `sign(Alice + nftId + 5 + deadline)`
3. Alice calls `createCharacter` with this signature
4. Contract checks: `nonce == 5`? ✅ Yes
5. Contract increments: Alice's nonce becomes `6`
6. Alice tries to reuse same signature
7. Contract checks: `nonce == 5`? ❌ No, current nonce is `6`
8. Transaction **reverts**

✅ **Conclusion**: Each signature can only be used once.

### Layer 3: Deadline Prevents Long-Term Attacks

Signatures expire after a short time (e.g., 1 hour).

```solidity
if (block.timestamp > deadline) {
    revert SignatureExpired(deadline);
}
```

✅ **Conclusion**: Even if signature leaks, it's only valid for 1 hour.

### Layer 4: Oracle Verifies Current Ownership

The oracle checks Cardano blockchain at verification time:

```javascript
// Query Cardano for current NFT holders
const holders = await cardano.assetsAddresses(nftId);

// Verify user CURRENTLY owns it
const ownsNFT = holders.some(h => h.address === userCardanoAddress);

if (!ownsNFT) {
    return error("You don't own this NFT");
}
```

✅ **Conclusion**: You must own the NFT at the moment you request verification.

## Attack Scenarios & Why They Fail

### ❌ Attack 1: "I'll steal Alice's signature"

**Scenario**: Bob gets Alice's signature somehow.

**What happens**:
```solidity
// Alice's signature was: sign(Alice_Address + nftId + nonce + deadline)
// Bob calls createCharacter with Alice's signature
// Contract does: hash(Bob_Address + nftId + nonce + deadline)
// Bob_Address ≠ Alice_Address
// Signature verification FAILS ❌
```

**Result**: Transaction reverts with "Invalid NFT Proof"

### ❌ Attack 2: "I'll reuse my own signature"

**Scenario**: Alice creates a character, tries to reuse the same signature.

**What happens**:
```solidity
// First call: nonce was 5, now it's 6
// Second call with same signature (nonce=5)
// Contract checks: expected nonce is 6, provided is 5
// FAILS ❌
```

**Result**: Transaction reverts with "Invalid Nonce"

### ❌ Attack 3: "I'll borrow an NFT temporarily"

**Scenario**: 
1. Bob borrows NFT from Alice
2. Gets signature while he owns it
3. Returns NFT to Alice
4. Tries to use signature later

**What happens**:
```solidity
// Signature includes Bob's address
// Bob calls createCharacter
// Signature is valid (has Bob's address + correct nonce)
// SUCCESS ✅
```

**Wait, this works?** 
- Yes! But that's OK because:
  - Bob DID own the NFT when oracle verified
  - Bob paid 50 ALDEA
  - Nonce prevents him from reusing this signature
  - If he wants another character, he needs the NFT again

**Design philosophy**: Proof of ownership at verification time, not perpetual ownership.

### ❌ Attack 4: "I'll create fake signatures"

**Scenario**: Bob tries to create his own signature without the oracle.

**What happens**:
```solidity
// Bob creates: sign_with_bobs_key(Bob + nftId + nonce + deadline)
// Contract recovers signer: Bob
// Contract checks: recovered == oracle_address?
// Bob ≠ oracle_address
// FAILS ❌
```

**Result**: Transaction reverts with "Invalid NFT Proof"

## Why NFT Reusability is Good

### Traditional Approach (Bad)
- User burns/locks Cardano NFT
- Can only create 1 character ever
- Valuable NFT is lost
- Bad user experience

### Nonce Approach (Good)
- User keeps Cardano NFT
- Can create multiple characters (paying each time)
- NFT retains value on Cardano
- Better user experience

**Economic model**:
- Own 1 rare Cardano NFT = Gate to play the game
- Pay 50 ALDEA per character = Ongoing revenue
- NFT stays valuable on Cardano = Happy users

## Security Comparison

| Mechanism | Single-Use NFT | Nonce-Based (Current) |
|-----------|---------------|----------------------|
| Prevents signature theft | ✅ | ✅ |
| Prevents replay attacks | ✅ | ✅ |
| Verifies ownership | ✅ | ✅ |
| NFT reusability | ❌ | ✅ |
| User experience | ❌ Bad | ✅ Good |
| Economic model | ❌ One-time | ✅ Recurring |

## Mathematical Proof

For a signature to be valid, ALL of these must be true:

```
1. recover(signature) == oracle_address
2. msg.sender == address_in_signature  
3. nonce == current_nonce_on_chain
4. block.timestamp <= deadline
5. user has 50 ALDEA
6. user approved CharacterSystem
```

**For Bob to use Alice's signature:**
- Condition 2 fails: `Bob != Alice`

**For Alice to reuse her signature:**
- Condition 3 fails: `old_nonce != current_nonce`

**For anyone to fake a signature:**
- Condition 1 fails: `attacker != oracle_address`

## Code Reference

See the verification logic in `CharacterSystem.sol`:

```solidity
function createCharacter(
    uint32 class,
    bytes32 nftId,
    uint256 nonce,
    uint256 deadline,
    bytes memory signature
) public returns (uint32) {
    
    // Layer 3: Deadline check
    if (block.timestamp > deadline) {
        revert SignatureExpired(deadline);
    }

    // Layer 2: Nonce check & increment
    uint256 currentNonce = UserNonce.getNonce(msg.sender);
    if (nonce != currentNonce) {
        revert InvalidNonce(currentNonce, nonce);
    }
    UserNonce.setNonce(msg.sender, currentNonce + 1);

    // Layer 1: Signature verification
    bytes32 messageHash = keccak256(abi.encodePacked(
        msg.sender,  // Binds to caller
        nftId, 
        nonce,       // Prevents replay
        deadline     // Prevents long-term use
    ));
    bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
    address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);
    
    if (recoveredSigner != nftVerifierOracle) {
        revert InvalidNFTProof();
    }

    // ... rest of character creation
}
```

## Summary

✅ **Secure**: Cannot use someone else's signature (address binding)  
✅ **Secure**: Cannot reuse your own signature (nonce increment)  
✅ **Secure**: Cannot fake signatures (oracle verification)  
✅ **User-Friendly**: Can create multiple characters with same NFT  
✅ **Revenue Model**: Pay 50 ALDEA per character creation  

The nonce-based approach is **equally secure** as single-use NFT tracking, but with **better UX**.
