// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Character, World, WorldData, UserNonce } from "../codegen/index.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract CharacterSystem is System {

  // ALDEA token address - set this to your deployed ALDEA token address
  address public aldeaToken;
  // Oracle address that signs Cardano NFT ownership proofs
  address public nftVerifierOracle;
  // Required payment amount (50 ALDEA with 18 decimals)
  uint256 public constant CREATION_FEE = 50 * 10**18;

  error InsufficientPayment(uint256 required, uint256 provided);
  error InvalidNFTProof();
  error InvalidNonce(uint256 expected, uint256 provided);
  error SignatureExpired(uint256 deadline);

  event CharacterCreated(uint32 indexed characterId, address indexed player, bytes32 indexed nftId);

  constructor(address _aldeaToken, address _nftVerifierOracle) {
    aldeaToken = _aldeaToken;
    nftVerifierOracle = _nftVerifierOracle;
  }

  enum Classes {
    Archer,
    Alchemist,
    Artisan,
    Blacksmith,
    Chef,
    Magician,
    Merchant,
    Priest,
    Tailor,
    Rebel,
    Warrior
  }

  enum Tribes {
    Amazonians,
    Himalayans,
    Poseidons,
    Raes,
    Tropicals
  }

  uint classesAmount = uint(type(Classes).max) + 1;
  uint tribesAmount = uint(type(Tribes).max) + 1;

  function random(uint between) private view returns (uint) {
    uint randomHash = uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp)));
    return randomHash % between;
  } 

  /**
   * @notice Create a character by paying 50 ALDEA and proving Cardano NFT ownership
   * @param class The character class (0 for random)
   * @param nftId The Cardano NFT ID (as bytes32 hash)
   * @param nonce User's current nonce (prevents replay attacks)
   * @param deadline Signature expiration timestamp
   * @param signature Signature from the oracle verifying NFT ownership
   */
  function createCharacter(
    uint32 class,
    bytes32 nftId,
    uint256 nonce,
    uint256 deadline,
    bytes memory signature
  ) public returns (uint32) {
    
    // 1. Verify signature hasn't expired
    if (block.timestamp > deadline) {
      revert SignatureExpired(deadline);
    }

    // 2. Verify and increment nonce (prevents replay attacks)
    uint256 currentNonce = UserNonce.getNonce(msg.sender);
    if (nonce != currentNonce) {
      revert InvalidNonce(currentNonce, nonce);
    }
    UserNonce.setNonce(msg.sender, currentNonce + 1);

    // 3. Verify the oracle signature
    // Signature includes: user address, NFT ID, nonce, and deadline
    bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, nftId, nonce, deadline));
    bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
    address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);
    
    if (recoveredSigner != nftVerifierOracle) {
      revert InvalidNFTProof();
    }

    // 4. Transfer 50 ALDEA tokens from sender to this contract
    bool success = IERC20(aldeaToken).transferFrom(msg.sender, address(this), CREATION_FEE);
    if (!success) {
      revert InsufficientPayment(CREATION_FEE, 0);
    }
    
    // Get actual world status
    WorldData memory world = World.get();

    // Determine new character id based on current world population
    uint32 newCharacterId = world.totalPopulation + 1;
    
    // Pick a random class if selected
    if (class == 0) {
      class = uint32(random(classesAmount));
    }

    // Pick random tribe
    uint32 tribe = uint32(random(tribesAmount));
    
    // Save new character with tribe and starting position
    Character.set(newCharacterId, msg.sender, class, tribe, 0, 0);
    
    // Update class population
    uint32[11] memory newCharacterPopulation = world.characterPopulation;
    newCharacterPopulation[class] = newCharacterPopulation[class] + 1;
    World.setCharacterPopulation(newCharacterPopulation);

    // Update tribe population
    uint32[5] memory newTribePopulation = world.tribePopulation;
    newTribePopulation[tribe] = newTribePopulation[tribe] + 1;
    World.setTribePopulation(newTribePopulation);

    // Update world population
    World.setTotalPopulation(newCharacterId);
    
    emit CharacterCreated(newCharacterId, msg.sender, nftId);
    
    return newCharacterId;

  }

  /**
   * @notice Update the ALDEA token address (only callable by system owner)
   */
  function setAldeaToken(address _aldeaToken) external {
    aldeaToken = _aldeaToken;
  }

  /**
   * @notice Update the NFT verifier oracle address (only callable by system owner)
   */
  function setNFTVerifierOracle(address _nftVerifierOracle) external {
    nftVerifierOracle = _nftVerifierOracle;
  }

  /**
   * @notice Withdraw accumulated ALDEA tokens (only callable by system owner)
   */
  function withdrawFees(address to, uint256 amount) external {
    IERC20(aldeaToken).transfer(to, amount);
  }

  /**
   * @notice Get the current nonce for a user
   */
  function getUserNonce(address user) external view returns (uint256) {
    return UserNonce.getNonce(user);
  }

}
