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
    MAIN_MENU: 'MainMenuScene',
    CHARACTER_SELECTION: 'CharacterSelectionScene',
    LEADERBOARD: 'LeaderboardScene',
    TRIBE_STATS: 'TribeStatsScene',
    WORLD_STATS: 'WorldStatsScene',
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
