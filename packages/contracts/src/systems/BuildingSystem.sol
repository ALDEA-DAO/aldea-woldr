// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Character, Building, BuildingType, Inventory } from "../codegen/index.sol";

contract BuildingSystem is System {

  uint32 private buildingCounter = 0;

  // Construct a building at a location
  function constructBuilding(
    uint32 characterId,
    uint32 buildingTypeId,
    int32 x,
    int32 y
  ) public returns (uint32) {
    // Verify character exists and caller owns it
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    // Verify building type exists
    require(bytes(BuildingType.getName(buildingTypeId)).length > 0, "Invalid building type");
    
    // Check for material requirements (simplified - could be expanded)
    // In a full implementation, we'd check inventory for required materials
    
    // Create new building instance
    buildingCounter++;
    uint32 newBuildingId = buildingCounter;
    
    Building.set(
      newBuildingId,
      buildingTypeId,
      characterId,
      x,
      y,
      1, // level
      block.number // lastUsedBlock
    );
    
    return newBuildingId;
  }

  // Upgrade building level
  function upgradeBuilding(uint32 buildingInstanceId) public {
    uint32 ownerId = Building.getOwnerCharacterId(buildingInstanceId);
    require(Character.getPlayer(ownerId) == _msgSender(), "Not building owner");
    
    uint32 currentLevel = Building.getLevel(buildingInstanceId);
    Building.setLevel(buildingInstanceId, currentLevel + 1);
  }

  // Destroy a building
  function destroyBuilding(uint32 buildingInstanceId) public {
    uint32 ownerId = Building.getOwnerCharacterId(buildingInstanceId);
    require(Character.getPlayer(ownerId) == _msgSender(), "Not building owner");
    
    // Clear building data
    Building.deleteRecord(buildingInstanceId);
  }

  // Check if a location is occupied
  function isLocationOccupied(int32 x, int32 y) public view returns (bool) {
    // This would need to iterate through buildings - simplified for now
    // In production, you'd want a spatial index table
    return false;
  }

  // Get building at location (simplified)
  function getBuildingAtLocation(int32 x, int32 y) public view returns (uint32) {
    // Would need spatial indexing table for efficiency
    // Returning 0 for now as placeholder
    return 0;
  }
}
