// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Character } from "../codegen/index.sol";

contract MovementSystem is System {

  // Move character to a new position - OPTIMIZED: single storage write
  function moveCharacter(uint32 characterId, int32 newX, int32 newY) public {
    // Verify character exists and caller owns it
    address player = Character.getPlayer(characterId);
    require(player == _msgSender(), "Not character owner");
    
    // Get current position
    int32 currentX = Character.getX(characterId);
    int32 currentY = Character.getY(characterId);
    
    // Calculate distance (Manhattan distance)
    int32 distanceX = newX > currentX ? newX - currentX : currentX - newX;
    int32 distanceY = newY > currentY ? newY - currentY : currentY - newY;
    int32 totalDistance = distanceX + distanceY;
    
    // Limit movement to adjacent tiles or reasonable distance
    require(totalDistance <= 5, "Movement distance too far");
    
    // OPTIMIZATION: Single write instead of 2 separate setX/setY calls
    // Get other fields to preserve them
    uint32 class = Character.getClass(characterId);
    uint32 tribe = Character.getTribe(characterId);
    Character.set(characterId, player, class, tribe, newX, newY);
  }

  // Teleport character (admin or special ability) - OPTIMIZED: single storage write
  function teleportCharacter(uint32 characterId, int32 newX, int32 newY) public {
    address player = Character.getPlayer(characterId);
    require(player == _msgSender(), "Not character owner");
    
    // OPTIMIZATION: Single write instead of 2 separate setX/setY calls
    uint32 class = Character.getClass(characterId);
    uint32 tribe = Character.getTribe(characterId);
    Character.set(characterId, player, class, tribe, newX, newY);
  }

  // Get character position
  function getPosition(uint32 characterId) public view returns (int32 x, int32 y) {
    x = Character.getX(characterId);
    y = Character.getY(characterId);
  }

  // OPTIMIZATION: Batch move multiple characters in a single transaction
  function batchMove(
    uint32[] calldata characterIds,
    int32[] calldata newXs,
    int32[] calldata newYs
  ) public {
    require(characterIds.length == newXs.length && newXs.length == newYs.length, "Array length mismatch");
    
    for (uint256 i = 0; i < characterIds.length; i++) {
      uint32 characterId = characterIds[i];
      address player = Character.getPlayer(characterId);
      require(player == _msgSender(), "Not character owner");
      
      int32 currentX = Character.getX(characterId);
      int32 currentY = Character.getY(characterId);
      int32 newX = newXs[i];
      int32 newY = newYs[i];
      
      int32 distanceX = newX > currentX ? newX - currentX : currentX - newX;
      int32 distanceY = newY > currentY ? newY - currentY : currentY - newY;
      int32 totalDistance = distanceX + distanceY;
      
      require(totalDistance <= 5, "Movement distance too far");
      
      uint32 class = Character.getClass(characterId);
      uint32 tribe = Character.getTribe(characterId);
      Character.set(characterId, player, class, tribe, newX, newY);
    }
  }

  // Check if character is at a specific location
  function isAtLocation(uint32 characterId, int32 x, int32 y) public view returns (bool) {
    return Character.getX(characterId) == x && Character.getY(characterId) == y;
  }
}
