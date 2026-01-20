# ALDEA-WOLDR Multi-Chain Architecture

## Overview

ALDEA-WOLDR is a multi-chain Autonomous World integrating:
- **EVM** — Core game logic via MUD framework
- **Cardano** — Main token ($ALDEA) and Entry NFTs
- **Midnight** — ZK proofs for privacy-preserving gameplay

---

## Token & Asset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CARDANO LAYER                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ $ALDEA Token│    │ Entry NFT   │    │ Midnight ZK Bridge  │  │
│  │ (Main Token)│    │ (Gate Pass) │    │ (Private Transfers) │  │
│  └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘  │
└─────────┼──────────────────┼─────────────────────┼──────────────┘
          │                  │                     │
          ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BRIDGE LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Wormhole / Custom Bridge + Midnight Privacy Wrapper    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EVM LAYER (MUD)                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐   │
│  │ Character │  │ Inventory │  │ Buildings │  │ World State │   │
│  │  System   │  │  System   │  │  System   │  │   (Events)  │   │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Entry Flow
1. Player holds **Entry NFT** on Cardano (tribe-specific optional)
2. Player bridges **$ALDEA** tokens to EVM via Midnight-wrapped bridge
3. Oracle verifies NFT ownership → unlocks `CharacterSystem.createCharacter()`
4. ZK proof optionally hides *which* NFT was used

---

## ZK Proof Use Cases (Midnight)

### Private Tribal Strategies
- **Hidden Alliances** — Tribes form secret pacts verified on-chain without revealing members
- **Stealth Resource Caches** — Prove you *have* resources without revealing *how much* or *where*
- **Anonymous Voting** — Tribal governance with verifiable votes but hidden identities

### Fog of War Mechanics
- **Location Privacy** — Prove you're "in a region" without revealing exact coordinates
- **Scouting Reports** — Share verified intel (e.g., "enemy has >100 iron") without exposing spy identity

### Fair Randomness & Hidden Actions
- **Commit-Reveal Combat** — Players commit encrypted battle strategies, reveal simultaneously
- **Private Crafting Recipes** — Prove you crafted a legendary item without revealing the secret recipe
- **Hidden Quests** — Complete objectives privately, reveal proof only when claiming rewards

### Anti-Cheat & Verification
- **Proof of Legitimate Play** — Verify achievements without bots/exploits
- **Private Reputation** — Prove trustworthiness (e.g., "never scammed") without full history

### Cross-Chain Privacy
- **Anonymous Bridge Transfers** — Move assets between Cardano/EVM without linking wallets
- **Private NFT Ownership** — Prove you hold the entry NFT without revealing which one

---

## ML Event Generation System

### Conceptual Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONCEPT GRAPH (Knowledge Base)               │
│                                                                 │
│   [Weather]──affects──►[Crops]──affects──►[Food Supply]         │
│       │                   │                    │                │
│       │                   ▼                    ▼                │
│       └──affects──►[Productivity]──affects──►[Tribe Morale]     │
│                           │                                     │
│                           ▼                                     │
│                    [Construction Speed]                         │
│                                                                 │
│   [War]──depletes──►[Resources]──triggers──►[Migration]         │
│                           │                                     │
│                           ▼                                     │
│                    [Trade Prices]                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              INFERENCE ENGINE (ML Layer)                        │
│                                                                 │
│  Option A: Graph Neural Network (GNN)                           │
│  - Learns propagation patterns across concept edges             │
│  - Predicts cascading effects from initial state changes        │
│                                                                 │
│  Option B: Probabilistic Graphical Model (Bayesian Network)     │
│  - Models conditional probabilities between concepts            │
│  - Interpretable, good for game balancing                       │
│                                                                 │
│  Option C: Transformer + Knowledge Graph Embedding              │
│  - Encode concepts as embeddings, use attention for inference   │
│  - Best for complex, emergent narratives                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT GENERATOR                              │
│                                                                 │
│  Input: Current world state (from MUD tables)                   │
│  Output: Probabilistic events with effects                      │
│                                                                 │
│  Example:                                                       │
│  - State: Rainy season + Low wood reserves + Amazonian region   │
│  - Inference: Rain → Flooding → Wood extraction -50%            │
│  - Event: "The Great Flood" — Amazonian lumber mills halted     │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Concept Graph** | Neo4j or NetworkX | Store relationships (weather→crops→food) |
| **Inference** | PyTorch Geometric (GNN) | Learn complex propagation patterns |
| **Interpretability** | pgmpy (Bayesian) | Explainable event chains for balancing |
| **Event Templates** | LLM (GPT/Claude API) | Generate narrative text for events |

### Concept Categories

- **Environmental**: Weather, Seasons, Natural Disasters, Terrain
- **Economic**: Resource Prices, Trade Routes, Scarcity, Abundance
- **Social**: Tribe Relations, Morale, Population, Migration
- **Military**: Conflicts, Sieges, Alliances, Espionage
- **Magical**: Essence Flows, Ley Lines, Curses, Blessings

### Example Inference Chain

```
Drought (Weather) 
  → Crops Fail (Food -40%)
    → Tropicals Suffer (Tribe Morale -20%)
      → Migration to Poseidon Lands (Population Shift)
        → Fishing Pressure (Fish -15%)
          → Trade Prices Rise (Market Event)
```

---

## Implementation Phases

### Phase 1: Foundation
1. Add Cardano NFT oracle to existing `packages/oracle/`
2. Implement basic bridge contract for $ALDEA → EVM
3. Create `WorldEventSystem` in MUD for event effects

### Phase 2: Midnight Integration
1. Deploy Midnight contracts for private actions
2. Add ZK verification to `CharacterSystem` for anonymous entry
3. Implement commit-reveal combat in `CombatSystem`

### Phase 3: ML Event Engine
1. Build concept graph with ~50-100 nodes
2. Train GNN on simulated world states
3. Deploy inference as off-chain service, publish events on-chain

---

## Technology Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Game Logic** | MUD (EVM) | Core world state, systems |
| **Main Token** | Cardano | $ALDEA token, Entry NFTs |
| **Privacy** | Midnight | ZK proofs for hidden actions |
| **Bridge** | Wormhole + Midnight | Cross-chain asset flow |
| **Events** | GNN + Bayesian | Dynamic world events |
