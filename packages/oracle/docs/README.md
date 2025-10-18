# Cardano NFT Oracle Documentation

This folder contains comprehensive documentation for the cross-chain NFT verification system used in the Aldea game.

## Overview

The Aldea game runs on an EVM blockchain but requires players to own NFTs on Cardano. This documentation explains how the oracle-based verification system works.

## Documentation Files

### 📘 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
**Start here!** Quick setup instructions to get the system running.

**Contents:**
- What was implemented
- Quick start guide (5 steps)
- Configuration options
- Testing instructions
- Troubleshooting common issues
- Production checklist

### 📗 [CARDANO_NFT_ORACLE.md](./CARDANO_NFT_ORACLE.md)
**Technical deep-dive** into how the oracle system works.

**Contents:**
- Architecture overview
- Detailed flow explanation
- Oracle implementation example (Node.js)
- Frontend integration code
- Security considerations
- Deployment steps
- Alternative approaches

### 📕 [SECURITY_EXPLAINED.md](./SECURITY_EXPLAINED.md)
**Security analysis** answering common concerns.

**Contents:**
- Why NFT reusability is secure
- Protection against signature theft
- Nonce-based replay protection
- Attack scenarios and why they fail
- Mathematical proof of security
- Security comparison table

## Quick Links

### Implementation Files
- **Smart Contract**: [`../src/systems/CharacterSystem.sol`](../src/systems/CharacterSystem.sol)
- **Oracle Example**: [`../oracle-example.js`](../oracle-example.js)
- **MUD Config**: [`../mud.config.ts`](../mud.config.ts)

### Key Concepts

**Payment Requirement**: Users must pay 50 ALDEA tokens to create a character.

**NFT Verification**: Users must own a specific Cardano NFT at the time of character creation.

**Oracle Service**: A trusted service that verifies NFT ownership on Cardano and generates cryptographic signatures.

**Nonce Protection**: Prevents signature replay attacks while allowing NFT reuse.

## Reading Order

**For Developers:**
1. Read `SETUP_GUIDE.md` to understand the basics
2. Review `CARDANO_NFT_ORACLE.md` for implementation details
3. Check `SECURITY_EXPLAINED.md` if you have security questions
4. Examine the actual code in `CharacterSystem.sol` and `oracle-example.js`

**For Security Auditors:**
1. Start with `SECURITY_EXPLAINED.md`
2. Review the contract code in `CharacterSystem.sol`
3. Read `CARDANO_NFT_ORACLE.md` for full context

**For Quick Setup:**
1. Just follow `SETUP_GUIDE.md` step by step

## System Requirements

### Smart Contract
- Solidity ^0.8.24
- MUD framework
- OpenZeppelin contracts

### Oracle Service
- Node.js 18+
- Blockfrost API key (for Cardano queries)
- Ethers.js v6+

### Frontend
- Web3 wallet integration
- Ability to connect to both Cardano and EVM wallets

## Support

For questions or issues:
- Review the troubleshooting sections in each guide
- Check the inline code comments
- Refer to the example oracle implementation

## License

Same license as the main Aldea project.
