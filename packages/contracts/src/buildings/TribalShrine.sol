// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { BuildingKind } from "../ext/IBuildingKind.sol";
import { Character, Building, Inventory } from "../codegen/index.sol";

/**
 * @title TribalShrine
 * @notice A special building that provides tribal blessings and bonuses
 * @dev Example of custom building behavior extending BuildingKind
 * 
 * Tribal Shrines can:
 * - Grant daily blessings (bonus resources)
 * - Store tribal offerings
 * - Provide temporary buffs to tribe members
 */
contract TribalShrine is BuildingKind {

    // Cooldown between blessings (1 day = ~7200 blocks at 12s/block)
    uint256 constant BLESSING_COOLDOWN = 7200;
    
    // Blessing amounts per tribe (item ID => quantity)
    mapping(uint32 => mapping(uint32 => uint64)) public tribeBlessings;
    
    // Last blessing block per building
    mapping(uint32 => uint256) public lastBlessingBlock;

    constructor() {
        _initializeBlessings();
    }

    /**
     * @notice Initialize blessing amounts for each tribe
     */
    function _initializeBlessings() internal {
        // Amazonians (Tribe 0) - Wood blessing
        tribeBlessings[0][1] = 50;  // 50 Wood
        
        // Himalayans (Tribe 1) - Stone blessing
        tribeBlessings[1][2] = 50;  // 50 Stone
        
        // Poseidons (Tribe 2) - Fish blessing
        tribeBlessings[2][9] = 50;  // 50 Fish
        
        // Raes (Tribe 3) - Magic Essence blessing
        tribeBlessings[3][6] = 25;  // 25 Magic Essence
        
        // Tropicals (Tribe 4) - Food blessing
        tribeBlessings[4][4] = 60;  // 60 Food
    }

    /**
     * @notice Use the shrine to receive a tribal blessing
     * @dev Can only be used once per BLESSING_COOLDOWN period
     */
    function use(
        uint32 characterId,
        uint32 buildingInstanceId,
        bytes calldata /* payload */
    ) external override {
        // Check cooldown
        uint256 lastUsed = lastBlessingBlock[buildingInstanceId];
        require(
            block.number >= lastUsed + BLESSING_COOLDOWN,
            "TribalShrine: Blessing on cooldown"
        );

        // Get character's tribe
        uint32 tribe = Character.getTribe(characterId);
        
        // Get blessing item and amount for this tribe
        uint32 blessingItem = _getBlessingItemForTribe(tribe);
        uint64 blessingAmount = tribeBlessings[tribe][blessingItem];
        
        require(blessingAmount > 0, "TribalShrine: No blessing configured");
        
        // Grant blessing by adding items to inventory
        _addItemToInventory(characterId, blessingItem, blessingAmount);
        
        // Update cooldown
        lastBlessingBlock[buildingInstanceId] = block.number;
    }

    /**
     * @notice Called when shrine is constructed - set initial state
     */
    function onConstruct(
        uint32 /* characterId */,
        uint32 buildingInstanceId,
        bytes calldata /* payload */
    ) external override {
        // Initialize blessing cooldown to allow immediate first use
        lastBlessingBlock[buildingInstanceId] = 0;
    }

    /**
     * @notice Called when character arrives - could trigger visual effects
     */
    function onCharacterArrive(
        uint32 characterId,
        uint32 buildingInstanceId
    ) external override {
        // Could emit event for client to show special effects
        uint32 tribe = Character.getTribe(characterId);
        uint32 buildingOwner = Building.getOwnerCharacterId(buildingInstanceId);
        uint32 ownerTribe = Character.getTribe(buildingOwner);
        
        // Different behavior if same tribe vs different tribe
        if (tribe == ownerTribe) {
            // Same tribe - friendly arrival
        } else {
            // Different tribe - neutral arrival
        }
    }

    /**
     * @notice Get the blessing item for a specific tribe
     */
    function _getBlessingItemForTribe(uint32 tribe) internal pure returns (uint32) {
        if (tribe == 0) return 1;  // Amazonians - Wood
        if (tribe == 1) return 2;  // Himalayans - Stone
        if (tribe == 2) return 9;  // Poseidons - Fish
        if (tribe == 3) return 6;  // Raes - Magic Essence
        if (tribe == 4) return 4;  // Tropicals - Food
        return 0;
    }

    /**
     * @notice Add item to character inventory
     * @dev Simplified - in production would call InventorySystem
     */
    function _addItemToInventory(
        uint32 characterId,
        uint32 itemId,
        uint64 quantity
    ) internal {
        // Find empty slot or stack
        for (uint32 slot = 0; slot < 20; slot++) {
            uint32 existingItemId = Inventory.getItemId(characterId, slot);
            
            if (existingItemId == 0) {
                // Empty slot
                Inventory.set(characterId, slot, itemId, quantity);
                return;
            } else if (existingItemId == itemId) {
                // Stack with existing
                uint64 currentQty = Inventory.getQuantity(characterId, slot);
                Inventory.setQuantity(characterId, slot, currentQty + quantity);
                return;
            }
        }
        
        revert("TribalShrine: Inventory full");
    }

    /**
     * @notice Check if blessing is available
     */
    function isBlessingAvailable(uint32 buildingInstanceId) 
        external 
        view 
        returns (bool) 
    {
        uint256 lastUsed = lastBlessingBlock[buildingInstanceId];
        return block.number >= lastUsed + BLESSING_COOLDOWN;
    }

    /**
     * @notice Get blocks until next blessing
     */
    function blocksUntilNextBlessing(uint32 buildingInstanceId) 
        external 
        view 
        returns (uint256) 
    {
        uint256 lastUsed = lastBlessingBlock[buildingInstanceId];
        uint256 nextAvailable = lastUsed + BLESSING_COOLDOWN;
        
        if (block.number >= nextAvailable) {
            return 0;
        }
        
        return nextAvailable - block.number;
    }
}
