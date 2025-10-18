// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Character } from "../codegen/index.sol";

contract MovementSystem is System {

  // Move character to a new position
  function moveCharacter(uint32 characterId, int32 newX, int32 newY) public {
    // Verify character exists and caller owns it
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    // Get current position
    int32 currentX = Character.getX(characterId);
    int32 currentY = Character.getY(characterId);
    
    // Calculate distance (Manhattan distance)
    int32 distanceX = newX > currentX ? newX - currentX : currentX - newX;
    int32 distanceY = newY > currentY ? newY - currentY : currentY - newY;
    int32 totalDistance = distanceX + distanceY;
    
    // Limit movement to adjacent tiles or reasonable distance
    require(totalDistance <= 5, "Movement distance too far");
    
    // Update position
    Character.setX(characterId, newX);
    Character.setY(characterId, newY);
  }

  // Teleport character (admin or special ability)
  function teleportCharacter(uint32 characterId, int32 newX, int32 newY) public {
    require(Character.getPlayer(characterId) == _msgSender(), "Not character owner");
    
    Character.setX(characterId, newX);
    Character.setY(characterId, newY);
  }

  // Get character position
  function getPosition(uint32 characterId) public view returns (int32 x, int32 y) {
    x = Character.getX(characterId);
    y = Character.getY(characterId);
  }

  // Check if character is at a specific location
  function isAtLocation(uint32 characterId, int32 x, int32 y) public view returns (bool) {
    return Character.getX(characterId) == x && Character.getY(characterId) == y;
  }
}
