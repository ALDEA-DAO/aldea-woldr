import Phaser from 'phaser';
import { NetworkConfig } from '../mud/setupNetwork';

/**
 * GameStateManager
 * 
 * Manages game state and serves as the bridge for blockchain integration.
 * This manager syncs with smart contracts via MUD.
 */
export class GameStateManager {
  private _scene: Phaser.Scene; // Reserved for future scene-specific features
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private coins: number = 0;
  private inventory: Map<string, number> = new Map();
  private questProgress: Map<string, any> = new Map();
  
  // Blockchain integration
  private walletAddress?: string;
  private nftItems: any[] = [];
  private characterId?: number;
  private network?: NetworkConfig;

  constructor(scene: Phaser.Scene, network?: NetworkConfig, characterId?: number) {
    this._scene = scene;
    this.network = network;
    this.characterId = characterId;
    this.loadState();
  }

  // Scene access (for future features like UI overlays, events, etc.)
  getScene(): Phaser.Scene {
    return this._scene;
  }

  // Player stats
  getPlayerHealth(): number {
    return this.playerHealth;
  }

  setPlayerHealth(health: number) {
    this.playerHealth = Math.max(0, Math.min(health, this.maxHealth));
    this.saveState();
  }

  damagePlayer(amount: number) {
    this.playerHealth = Math.max(0, this.playerHealth - amount);
    this.saveState();
  }

  healPlayer(amount: number) {
    this.playerHealth = Math.min(this.maxHealth, this.playerHealth + amount);
    this.saveState();
  }

  // Currency
  getCoins(): number {
    return this.coins;
  }

  addCoins(amount: number) {
    this.coins += amount;
    this.saveState();
  }

  removeCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  // Inventory management
  addItem(itemId: string, quantity: number = 1) {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
    this.saveState();
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    if (current >= quantity) {
      this.inventory.set(itemId, current - quantity);
      this.saveState();
      return true;
    }
    return false;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    return current >= quantity;
  }

  getInventory(): Map<string, number> {
    return new Map(this.inventory);
  }

  // Quest management
  setQuestProgress(questId: string, progress: any) {
    this.questProgress.set(questId, progress);
    this.saveState();
  }

  getQuestProgress(questId: string): any {
    return this.questProgress.get(questId);
  }

  // State persistence
  private saveState() {
    const state = {
      playerHealth: this.playerHealth,
      coins: this.coins,
      inventory: Array.from(this.inventory.entries()),
      questProgress: Array.from(this.questProgress.entries())
    };
    localStorage.setItem('aldeaGameState', JSON.stringify(state));
  }

  private loadState() {
    const saved = localStorage.getItem('aldeaGameState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.playerHealth = state.playerHealth || 100;
        this.coins = state.coins || 0;
        this.inventory = new Map(state.inventory || []);
        this.questProgress = new Map(state.questProgress || []);
      } catch (e) {
        console.error('Failed to load game state:', e);
      }
    }
  }

  resetState() {
    this.playerHealth = 100;
    this.coins = 0;
    this.inventory.clear();
    this.questProgress.clear();
    localStorage.removeItem('aldeaGameState');
  }

  // Blockchain integration placeholders
  // These methods will be implemented when connecting to blockchain

  async connectWallet(): Promise<boolean> {
    // TODO: Implement Web3 wallet connection
    console.log('Wallet connection - To be implemented');
    return false;
  }

  getWalletAddress(): string | undefined {
    return this.walletAddress;
  }

  async syncWithBlockchain(): Promise<void> {
    // TODO: Sync game state with smart contracts
    console.log('Blockchain sync - To be implemented');
  }

  async loadNFTItems(): Promise<void> {
    // TODO: Load NFT items from wallet
    console.log('NFT loading - To be implemented');
  }

  getNFTItems(): any[] {
    return this.nftItems;
  }

  // Character ID management
  getCharacterId(): number | undefined {
    return this.characterId;
  }

  setCharacterId(characterId: number) {
    this.characterId = characterId;
    this.saveState();
  }

  // Network access
  getNetwork(): NetworkConfig | undefined {
    return this.network;
  }

  setNetwork(network: NetworkConfig) {
    this.network = network;
  }
}
