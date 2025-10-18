// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IBuildingKind
 * @notice Interface for custom building behavior
 * @dev Inspired by Downstream's BuildingKind pattern
 * 
 * Buildings can implement custom logic by inheriting from BuildingKind
 * and overriding these hooks. This allows for specialized buildings
 * with unique mechanics while maintaining the core building system.
 */
interface IBuildingKind {
    /**
     * @notice Called when a character uses the building
     * @param characterId The character using the building
     * @param buildingInstanceId The building being used
     * @param payload Custom data for the building to process
     */
    function use(
        uint32 characterId,
        uint32 buildingInstanceId,
        bytes calldata payload
    ) external;

    /**
     * @notice Called when a building is constructed
     * @param characterId The character constructing the building
     * @param buildingInstanceId The newly constructed building
     * @param payload Construction parameters
     */
    function onConstruct(
        uint32 characterId,
        uint32 buildingInstanceId,
        bytes calldata payload
    ) external;

    /**
     * @notice Called when a character arrives at the building location
     * @param characterId The arriving character
     * @param buildingInstanceId The building at the location
     */
    function onCharacterArrive(
        uint32 characterId,
        uint32 buildingInstanceId
    ) external;

    /**
     * @notice Called when a character leaves the building location
     * @param characterId The departing character
     * @param buildingInstanceId The building at the location
     */
    function onCharacterLeave(
        uint32 characterId,
        uint32 buildingInstanceId
    ) external;

    /**
     * @notice Called when a building is upgraded
     * @param buildingInstanceId The building being upgraded
     * @param newLevel The new level
     */
    function onUpgrade(
        uint32 buildingInstanceId,
        uint32 newLevel
    ) external;
}

/**
 * @title BuildingKind
 * @notice Base implementation of IBuildingKind with empty hooks
 * @dev Inherit from this and override specific functions you need
 */
abstract contract BuildingKind is IBuildingKind {
    
    function use(
        uint32 characterId,
        uint32 buildingInstanceId,
        bytes calldata payload
    ) external virtual {
        // Override to implement custom use behavior
    }

    function onConstruct(
        uint32 characterId,
        uint32 buildingInstanceId,
        bytes calldata payload
    ) external virtual {
        // Override to implement custom construction behavior
    }

    function onCharacterArrive(
        uint32 characterId,
        uint32 buildingInstanceId
    ) external virtual {
        // Override to implement arrival behavior
    }

    function onCharacterLeave(
        uint32 characterId,
        uint32 buildingInstanceId
    ) external virtual {
        // Override to implement departure behavior
    }

    function onUpgrade(
        uint32 buildingInstanceId,
        uint32 newLevel
    ) external virtual {
        // Override to implement upgrade behavior
    }
}
