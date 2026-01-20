import { NetworkConfig } from './setupNetwork';

export interface CharacterData {
  characterId: number;
  player: string;
  x: number;
  y: number;
  class: number;
  tribe: number;
}

/**
 * Fetch a character's data from the blockchain
 */
export async function fetchCharacterData(
  network: NetworkConfig,
  characterId: number
): Promise<CharacterData | null> {
  try {
    // Read character data using MUD's table structure
    // The Character table stores: id, player, class, tribe, x, y
    
    const data = await network.worldContract.read.aldea__getCharacter([characterId]);
    
    if (data && data[0] !== '0x0000000000000000000000000000000000000000') {
      return {
        characterId,
        player: data[0],
        class: data[1],
        tribe: data[2],
        x: data[3],
        y: data[4],
      };
    }
    
    return null;
  } catch (error) {
    // Character doesn't exist or error reading
    return null;
  }
}

/**
 * Fetch all characters by polling through IDs
 * This is a simple approach - we try IDs from 1 to maxId
 */
export async function fetchAllCharacters(
  network: NetworkConfig,
  maxCharacterId: number = 100
): Promise<CharacterData[]> {
  const characters: CharacterData[] = [];
  
  // Fetch characters in parallel for better performance
  const promises = [];
  for (let i = 1; i <= maxCharacterId; i++) {
    promises.push(fetchCharacterData(network, i));
  }
  
  const results = await Promise.all(promises);
  
  for (const result of results) {
    if (result !== null) {
      characters.push(result);
    }
  }
  
  return characters;
}

/**
 * Watch for character position updates using MUD's Store_SetRecord event
 * This listens to real-time blockchain updates
 */
export function watchCharacterUpdates(
  network: NetworkConfig,
  onUpdate: (character: CharacterData) => void
): () => void {
  // Watch for Store_SetRecord events from MUD's Character table
  // Note: In production, you'd filter by tableId for better performance
  const unwatch = network.publicClient.watchContractEvent({
    address: network.worldAddress,
    abi: [
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: 'tableId', type: 'bytes32' },
          { indexed: false, name: 'keyTuple', type: 'bytes32[]' },
          { indexed: false, name: 'staticData', type: 'bytes' },
          { indexed: false, name: 'encodedLengths', type: 'bytes32' },
          { indexed: false, name: 'dynamicData', type: 'bytes' },
        ],
        name: 'Store_SetRecord',
        type: 'event',
      },
    ],
    eventName: 'Store_SetRecord',
    onLogs: async (logs: any[]) => {
      for (const log of logs) {
        try {
          // Check if this is a Character table update
          // You'd need to match the tableId here
          // For now, we'll refetch the character data
          
          const keyTuple = log.args.keyTuple;
          if (keyTuple && keyTuple.length > 0) {
            // First key is the character ID
            const characterId = Number(keyTuple[0]);
            
            // Fetch the updated character data
            const characterData = await fetchCharacterData(network, characterId);
            if (characterData) {
              onUpdate(characterData);
            }
          }
        } catch (error) {
          console.error('Error processing Store_SetRecord event:', error);
        }
      }
    },
  });

  return unwatch;
}

/**
 * Setup periodic polling for character updates
 * This is a fallback in case event watching doesn't work
 */
export function setupCharacterPolling(
  network: NetworkConfig,
  onUpdate: (characters: CharacterData[]) => void,
  intervalMs: number = 3000,
  maxCharacterId: number = 100
): () => void {
  const poll = async () => {
    try {
      const characters = await fetchAllCharacters(network, maxCharacterId);
      onUpdate(characters);
    } catch (error) {
      console.error('Error polling characters:', error);
    }
  };

  // Initial fetch
  poll();

  // Setup interval
  const intervalId = setInterval(poll, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
