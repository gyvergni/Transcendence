import {matchStatsSend} from "../game/pong.js";
import { Game } from "../game/game.js";
import { API_BASE_URL } from "./utilsApi.js";
import { getApiErrorText } from "./utilsApi.js";
import {pause} from "../display/gameScreens.js"
import { getTranslatedKey } from "./translation.js";
import uiManager from "../main.js";

export type PlayerType = "human" | "ai";
export type AIDifficulty = "easy" | "medium" | "hard" | null;

export class PlayerConfig {
	name: string | null = null;
	type: PlayerType;
	difficulty: AIDifficulty = null;
	lockedIn: boolean = false;
	position: number = -1;
	score: number = 0;

	constructor(type: PlayerType = "human") {
		this.type = type;
	}

	setName(name: string) {
		this.name = name;
	}

  setDifficulty(level: AIDifficulty) {
    if (this.type === "ai") {
      this.difficulty = level;
	  this.name = "AI (" + this.difficulty + ")";
    }
  }

	lockIn() {
    	this.lockedIn = true;
	}

	isReady(): boolean {
		if (!this.lockedIn) return false;
		if (this.type === "human") return !!this.name;
		if (this.type === "ai") return !!this.difficulty;
		return false;
	}
}

//Gametype manager interface
export interface GameTypeManager {
	getPlayers(): PlayerConfig[];
	addPlayer(config: PlayerConfig): void;
}

//Match Setup class

export class MatchSetup implements GameTypeManager {
	players: PlayerConfig[] = [];
	game: Game | null = null;
	winner: PlayerConfig | null = null;
	loser: PlayerConfig | null = null;
	guestsManager: GuestsManager;
	rm: boolean | boolean = false;
	gameMode: "t-first" | "t-final" | "quickMatch" = "quickMatch";
    stats: matchStatsSend | null = null;
	private keydownHandler?: (e: KeyboardEvent) => void;

	constructor() {
		this.guestsManager = new GuestsManager();
	}

	addPlayer(config: PlayerConfig) {
		this.players.push(config);
	}

	getPlayers(): PlayerConfig[] {
		return this.players;
	}

	isReady(): boolean {
		if (this.players.length < 2) return false;
		return this.players[0].isReady() === true && this.players[1]?.isReady() === true;
	}

	async escape(): Promise<void> {
		// Store the listener function so we can remove it later
		this.keydownHandler = (e: KeyboardEvent) => {
			if (uiManager.getIsAnimating() === true)
				return;
			if (this.rm) {
				this.rm = false;
				document.removeEventListener("keydown", this.keydownHandler!);
				return;
			}
			pause(this, e);
		};

		document.addEventListener("keydown", this.keydownHandler);
	}

	getGuestsManager(): GuestsManager {
		return this.guestsManager;
	}
}

//Tournament Manager class

export class TournamentManager implements GameTypeManager {
  players: PlayerConfig[] = [];
  firstRound: MatchSetup[] = [];
  final: MatchSetup | null = null;
  currentRound = 0;
  guestsManager: GuestsManager;
  shuffled: PlayerConfig[] = [];

  constructor() {
    this.guestsManager = new GuestsManager();
  }

  addPlayer(player: PlayerConfig) {
    this.players.push(player);
  }

  getPlayers(): PlayerConfig[] {
    return this.players;
  }

  getGuestsManager(): GuestsManager {
    return this.guestsManager;
  }
}


//Interface
export interface Guest {
	id: number;
	pseudo: string;
}

//Manager
export class GuestsManager {
	numberOfGuests: number = 0;
	host: string = "";
	guests: Guest[] = [];

	async fetchGuests(accountPseudo: string | null = null) {
		guests: null;
		try {
            let fetchPath: string;
            if (accountPseudo)
                fetchPath = API_BASE_URL + "/guests" + `/${accountPseudo}`;
            else
                fetchPath = API_BASE_URL + "/guests";
			const response = await fetch(fetchPath, {
				method: "GET",
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
				}
			})
			if (!response.ok)
				return (console.error("Failed to fetch guests"));
			const data = await response.json();
			if (data && data.guests && Array.isArray(data.guests)) {
				this.numberOfGuests = data.numberOfGuests;
				this.guests = data.guests.map((guests: Guest) => ({
					id: guests.id,
					pseudo: guests.pseudo
				}));
			}
			this.host = data.user;
	} catch (error) {
			console.error("Error fetching guests:", error);
		}
	}

	pseudoExists(pseudo: string): boolean {
		return this.guests.some(guest => guest.pseudo === pseudo);
	}

	async addGuest(pseudo: string) {
		try {
			const response = await fetch(API_BASE_URL + "/guests/create", {
				method: "POST",
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ pseudo: pseudo })
			});
			if (!response.ok && response.status !== 400 && response.status !== 409)
				return ( { succes: false, message: getTranslatedKey("error.network") });
			const data = await response.json();
			if (response.status === 400) {
				console.error("Failed to add guest, ", getApiErrorText(data));
				return { succes: false, message: getApiErrorText(data) };
			} else if (response.status === 409) {
				console.error("Failed to add guest, ", getApiErrorText(data));
				return { succes: false, message: getApiErrorText(data) };
			} else if (!response.ok) {
				console.error("Failed to add guest, server error.");
				return { succes: false, message: getApiErrorText(data) };
			}
			await this.fetchGuests(null);
			return { succes: true, message: getTranslatedKey("success.guest.added") };
		} catch (error) {
			console.error("Error adding guest:", error);
			return { succes: false, message: getTranslatedKey("error.network") };
		}
	}

	async deleteGuest(pseudo: string) {
		try {
			const response = await fetch(API_BASE_URL + "/guests/delete", {
				method: "DELETE",
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guestPseudo: pseudo })
			});
			if (!response.ok && response.status !== 404)
				return ( { succes: false, message: getTranslatedKey("error.network") });
			const data = await response.json();
			if (response.status === 404) {
				console.error("Failed to delete guest, ", getApiErrorText(data));
				return { succes: false, message: getApiErrorText(data) };
			} else if (!response.ok) {
				console.error("Failed to delete guest, server error.");
				return { succes: false, message: getApiErrorText(data) };
			}
			await this.fetchGuests(null);
			return { succes: true, message: getTranslatedKey("success.guest.deleted") };
		} catch (error) {
			console.error("Error deleting guest:", error);
			return { succes: false, message: getTranslatedKey("error.network") };
		}
	}

	
}