import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "aldea",
  deploy: {
    upgradeableWorldImplementation: true,
  },
  tables: {
    Player: {
      schema: {
        player: "address",
        id: "uint32",
        balance: "uint256",
      },
      key: ["player"]
    },
    Character: {
      schema: {
        id: "uint32",
        player: "address",
        class: "uint32",
        tribe: "uint32",
        x: "int32",
        y: "int32",
      },
      key: ["id"]
    },
    World: {
      schema: {
        totalPopulation: "uint32",
        characterPopulation: "uint32[11]",
        tribePopulation: "uint32[5]",
      },
      key: [],
    },
    // Resource/Item definitions
    ItemType: {
      schema: {
        itemId: "uint32",
        category: "uint32", // 0=Resource, 1=Crafted, 2=Special
        stackable: "bool",
        name: "string",
      },
      key: ["itemId"]
    },
    // Inventory system - each character has inventory slots
    Inventory: {
      schema: {
        characterId: "uint32",
        slotIndex: "uint32",
        itemId: "uint32",
        quantity: "uint64",
      },
      key: ["characterId", "slotIndex"]
    },
    // Building definitions
    BuildingType: {
      schema: {
        buildingId: "uint32",
        category: "uint32", // 0=Extractor, 1=Factory, 2=Defense, 3=Special
        tribe: "uint32", // Which tribe gets bonus (0=all, 1-5=specific tribe)
        inputItem1: "uint32",
        inputQty1: "uint64",
        inputItem2: "uint32",
        inputQty2: "uint64",
        outputItem1: "uint32",
        outputQty1: "uint64",
        outputItem2: "uint32",
        outputQty2: "uint64",
        name: "string",
      },
      key: ["buildingId"]
    },
    // Building instances placed in the world
    Building: {
      schema: {
        buildingInstanceId: "uint32",
        buildingTypeId: "uint32",
        ownerCharacterId: "uint32",
        x: "int32",
        y: "int32",
        level: "uint32",
        lastUsedBlock: "uint256",
      },
      key: ["buildingInstanceId"]
    },
    // Tribal bonuses
    TribeBonus: {
      schema: {
        tribe: "uint32",
        resourceType: "uint32",
        bonusPercentage: "uint32", // Stored as integer (e.g., 30 = 30%)
      },
      key: ["tribe", "resourceType"]
    },
    // Crafting recipes
    Recipe: {
      schema: {
        recipeId: "uint32",
        input1: "uint32",
        inputQty1: "uint64",
        input2: "uint32",
        inputQty2: "uint64",
        input3: "uint32",
        inputQty3: "uint64",
        output: "uint32",
        outputQty: "uint64",
        requiredBuildingType: "uint32",
        name: "string",
      },
      key: ["recipeId"]
    },
    // Nonce tracking for signature replay protection
    UserNonce: {
      schema: {
        user: "address",
        nonce: "uint256",
      },
      key: ["user"]
    },
  },
});
