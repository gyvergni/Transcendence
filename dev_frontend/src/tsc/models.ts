// models.ts

export type PlayerType = "human" | "ai";
export type AIDifficulty = "easy" | "medium" | "hard" | null;

export class PlayerConfig {
  name: string | null = null;
  type: PlayerType;
  difficulty: AIDifficulty = null;
  lockedIn: boolean = false;
  position: number = -1;

  constructor(type: PlayerType = "human") {
    this.type = type;
  }

  setName(name: string) {
    this.name = name;
  }

  setDifficulty(level: AIDifficulty) {
    if (this.type === "ai") {
      this.difficulty = level;
    }
  }

  lockIn() {
    if (this.type === "human" && !this.name) {
      throw new Error("Human player must have a name before locking in");
    }
    if (this.type === "ai" && !this.difficulty) {
      throw new Error("AI must have a difficulty before locking in");
    }
    this.lockedIn = true;
  }

  isReady(): boolean {
    if (!this.lockedIn) return false;
    if (this.type === "human") return !!this.name;
    if (this.type === "ai") return !!this.difficulty;
    return false;
  }
}

export interface GameTypeManager {
  getPlayers(): PlayerConfig[];
  addPlayer(config: PlayerConfig): void;
}

export class MatchSetup implements GameTypeManager {
  players: PlayerConfig[] = [];
  winner: PlayerConfig | null = null;
  loser: PlayerConfig | null = null;

  addPlayer(config: PlayerConfig) {
    this.players.push(config);
  }

  getPlayers(): PlayerConfig[] {
    return this.players;
  }

  isReady(): boolean {
    return this.players[0].isReady() === true && this.players[1]?.isReady() === true;
  }
}

export class TournamentManager implements GameTypeManager {
  players: PlayerConfig[] = [];
  firstRound: MatchSetup[] = [];
  final: MatchSetup | null = null;
  currentRound = 0;

  addPlayer(player: PlayerConfig) {
    this.players.push(player);
  }

  getPlayers(): PlayerConfig[] {
    return this.players;
  }
}