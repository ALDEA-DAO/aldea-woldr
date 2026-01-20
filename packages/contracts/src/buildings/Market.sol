// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { BuildingKind } from "../ext/IBuildingKind.sol";
import { Character, Building, Inventory, ItemBalance } from "../codegen/index.sol";

/**
 * @title Market
 * @notice A trading hub where players can exchange resources
 * @dev Example of complex building behavior with state management
 * 
 * Markets enable:
 * - Creating trade offers (sell X for Y)
 * - Accepting trade offers
 * - Tribal trading bonuses (Poseidons get better rates)
 */
contract Market is BuildingKind {

    struct TradeOffer {
        uint32 sellerId;
        uint32 offerItemId;
        uint64 offerAmount;
        uint32 requestItemId;
        uint64 requestAmount;
        bool active;
    }

    // Market ID => Offer ID => Trade Offer
    mapping(uint32 => mapping(uint32 => TradeOffer)) public tradeOffers;
    
    // Market ID => Next offer ID
    mapping(uint32 => uint32) public nextOfferId;

    // Events
    event TradeOfferCreated(
        uint32 indexed marketId,
        uint32 indexed offerId,
        uint32 indexed sellerId,
        uint32 offerItemId,
        uint64 offerAmount,
        uint32 requestItemId,
        uint64 requestAmount
    );

    event TradeCompleted(
        uint32 indexed marketId,
        uint32 indexed offerId,
        uint32 indexed buyerId,
        uint32 sellerId
    );

    /**
     * @notice Use market to create or accept trades
     * @dev Payload format: 
     *      - byte 0: action (0=create offer, 1=accept offer)
     *      - bytes 1-4: offer ID (for accept)
     *      - bytes 5-8: offer item ID (for create)
     *      - bytes 9-16: offer amount (for create)
     *      - bytes 17-20: request item ID (for create)
     *      - bytes 21-28: request amount (for create)
     */
    function use(
        uint32 characterId,
        uint32 buildingInstanceId,
        bytes calldata payload
    ) external override {
        require(payload.length > 0, "Market: Empty payload");
        
        uint8 action = uint8(payload[0]);
        
        if (action == 0) {
            _createOffer(characterId, buildingInstanceId, payload);
        } else if (action == 1) {
            _acceptOffer(characterId, buildingInstanceId, payload);
        } else {
            revert("Market: Invalid action");
        }
    }

    /**
     * @notice Create a new trade offer
     */
    function _createOffer(
        uint32 characterId,
        uint32 marketId,
        bytes calldata payload
    ) internal {
        require(payload.length >= 29, "Market: Invalid create payload");
        
        // Parse offer details from payload
        uint32 offerItemId = uint32(bytes4(payload[5:9]));
        uint64 offerAmount = uint64(bytes8(payload[9:17]));
        uint32 requestItemId = uint32(bytes4(payload[17:21]));
        uint64 requestAmount = uint64(bytes8(payload[21:29]));
        
        // Verify character has the items to offer
        uint64 characterItemCount = _getItemCount(characterId, offerItemId);
        require(characterItemCount >= offerAmount, "Market: Insufficient items");
        
        // Remove items from character inventory (held in escrow)
        _removeItems(characterId, offerItemId, offerAmount);
        
        // Create offer
        uint32 offerId = nextOfferId[marketId]++;
        tradeOffers[marketId][offerId] = TradeOffer({
            sellerId: characterId,
            offerItemId: offerItemId,
            offerAmount: offerAmount,
            requestItemId: requestItemId,
            requestAmount: requestAmount,
            active: true
        });
        
        emit TradeOfferCreated(
            marketId,
            offerId,
            characterId,
            offerItemId,
            offerAmount,
            requestItemId,
            requestAmount
        );
    }

    /**
     * @notice Accept an existing trade offer
     */
    function _acceptOffer(
        uint32 characterId,
        uint32 marketId,
        bytes calldata payload
    ) internal {
        require(payload.length >= 5, "Market: Invalid accept payload");
        
        uint32 offerId = uint32(bytes4(payload[1:5]));
        TradeOffer storage offer = tradeOffers[marketId][offerId];
        
        require(offer.active, "Market: Offer not active");
        require(offer.sellerId != characterId, "Market: Cannot accept own offer");
        
        // Verify buyer has requested items
        uint64 buyerItemCount = _getItemCount(characterId, offer.requestItemId);
        
        // Apply Poseidon trading bonus (10% discount)
        uint32 buyerTribe = Character.getTribe(characterId);
        uint64 actualRequestAmount = offer.requestAmount;
        
        if (buyerTribe == 2) { // Poseidons
            actualRequestAmount = (actualRequestAmount * 90) / 100;
        }
        
        require(buyerItemCount >= actualRequestAmount, "Market: Insufficient items");
        
        // Execute trade
        _removeItems(characterId, offer.requestItemId, actualRequestAmount);
        _addItems(characterId, offer.offerItemId, offer.offerAmount);
        _addItems(offer.sellerId, offer.requestItemId, actualRequestAmount);
        
        // Mark offer as completed
        offer.active = false;
        
        emit TradeCompleted(marketId, offerId, characterId, offer.sellerId);
    }

    /**
     * @notice Cancel a trade offer
     */
    function cancelOffer(
        uint32 characterId,
        uint32 marketId,
        uint32 offerId
    ) external {
        TradeOffer storage offer = tradeOffers[marketId][offerId];
        
        require(offer.active, "Market: Offer not active");
        require(offer.sellerId == characterId, "Market: Not offer creator");
        
        // Return items to seller
        _addItems(characterId, offer.offerItemId, offer.offerAmount);
        
        // Mark as inactive
        offer.active = false;
    }

    /**
     * @notice Called when market is constructed
     */
    function onConstruct(
        uint32 /* characterId */,
        uint32 buildingInstanceId,
        bytes calldata /* payload */
    ) external override {
        // Initialize offer counter
        nextOfferId[buildingInstanceId] = 0;
    }

    /**
     * @notice Get active offers at a market
     */
    function getActiveOffers(uint32 marketId, uint32 maxOffers)
        external
        view
        returns (TradeOffer[] memory)
    {
        uint32 count = 0;
        uint32 totalOffers = nextOfferId[marketId];
        
        // Count active offers
        for (uint32 i = 0; i < totalOffers && count < maxOffers; i++) {
            if (tradeOffers[marketId][i].active) {
                count++;
            }
        }
        
        // Build array
        TradeOffer[] memory offers = new TradeOffer[](count);
        uint32 index = 0;
        
        for (uint32 i = 0; i < totalOffers && index < count; i++) {
            if (tradeOffers[marketId][i].active) {
                offers[index] = tradeOffers[marketId][i];
                index++;
            }
        }
        
        return offers;
    }

    // Helper functions - OPTIMIZED with O(1) ItemBalance lookups
    
    function _getItemCount(uint32 characterId, uint32 itemId) 
        internal 
        view 
        returns (uint64) 
    {
        // O(1) lookup using ItemBalance table instead of looping through slots
        return ItemBalance.getTotalQuantity(characterId, itemId);
    }

    function _removeItems(uint32 characterId, uint32 itemId, uint64 quantity) 
        internal 
    {
        // Update ItemBalance first (O(1) operation)
        uint64 currentBalance = ItemBalance.getTotalQuantity(characterId, itemId);
        require(currentBalance >= quantity, "Market: Insufficient items");
        ItemBalance.setTotalQuantity(characterId, itemId, currentBalance - quantity);
        
        // Then update slots for display purposes
        uint64 remaining = quantity;
        for (uint32 slot = 0; slot < 20 && remaining > 0; slot++) {
            if (Inventory.getItemId(characterId, slot) == itemId) {
                uint64 slotQty = Inventory.getQuantity(characterId, slot);
                if (slotQty <= remaining) {
                    Inventory.set(characterId, slot, 0, 0);
                    remaining -= slotQty;
                } else {
                    Inventory.setQuantity(characterId, slot, slotQty - remaining);
                    remaining = 0;
                }
            }
        }
    }

    function _addItems(uint32 characterId, uint32 itemId, uint64 quantity) 
        internal 
    {
        // Update ItemBalance first (O(1) operation)
        uint64 currentBalance = ItemBalance.getTotalQuantity(characterId, itemId);
        ItemBalance.setTotalQuantity(characterId, itemId, currentBalance + quantity);
        
        // Try to stack first
        for (uint32 slot = 0; slot < 20; slot++) {
            if (Inventory.getItemId(characterId, slot) == itemId) {
                uint64 currentQty = Inventory.getQuantity(characterId, slot);
                Inventory.setQuantity(characterId, slot, currentQty + quantity);
                return;
            }
        }
        
        // Find empty slot
        for (uint32 slot = 0; slot < 20; slot++) {
            if (Inventory.getItemId(characterId, slot) == 0) {
                Inventory.set(characterId, slot, itemId, quantity);
                return;
            }
        }
        
        revert("Market: Inventory full");
    }
}
