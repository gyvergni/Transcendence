// models.ts
export class PlayerConfig {
    constructor(type = "human") {
        this.name = null;
        this.difficulty = null;
        this.lockedIn = false;
        this.position = -1;
        this.type = type;
    }
    setName(name) {
        this.name = name;
    }
    setDifficulty(level) {
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
    isReady() {
        if (!this.lockedIn)
            return false;
        if (this.type === "human")
            return !!this.name;
        if (this.type === "ai")
            return !!this.difficulty;
        return false;
    }
}
export class MatchSetup {
    constructor() {
        this.players = [];
    }
    addPlayer(config) {
        this.players.push(config);
    }
    getPlayers() {
        return this.players;
    }
    isReady() {
        var _a;
        return this.players[0].isReady() === true && ((_a = this.players[1]) === null || _a === void 0 ? void 0 : _a.isReady()) === true;
    }
}
export class TournamentManager {
    constructor() {
        this.players = [];
        this.matches = [];
        this.currentRound = 0;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    getPlayers() {
        return this.players;
    }
    setupFirstRound() {
        if (this.players.length !== 4) {
            throw new Error("Need 4 players to start tournament");
        }
        this.matches = [new MatchSetup(), new MatchSetup()];
        //ENTER MATCHMAKING LOGIC
        this.currentRound = 1;
    }
}
