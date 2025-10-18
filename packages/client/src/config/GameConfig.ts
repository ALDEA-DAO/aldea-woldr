export const GameConfig = {
  // Game settings
  TILE_SIZE: 32,
  PLAYER_SPEED: 160,
  
  // World size
  WORLD_WIDTH: 50,
  WORLD_HEIGHT: 50,
  
  // Scene keys
  SCENES: {
    BOOT: 'BootScene',
    MENU: 'MenuScene',
    GAME: 'GameScene'
  },
  
  // Asset keys
  ASSETS: {
    PLAYER: 'player',
    TILESET: 'tileset',
    NPC: 'npc',
    ITEMS: 'items'
  },
  
  // Layer names
  LAYERS: {
    GROUND: 'ground',
    OBSTACLES: 'obstacles',
    OBJECTS: 'objects'
  }
};
