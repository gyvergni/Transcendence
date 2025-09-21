// models.ts

import {startMatch, Game} from "./pong.js"
import {animateContentBoxOut, animateContentBoxIn, toggleIsAnimation} from "./animations.js";
import {setContentView, setGameView, setupPause} from "./views.js";
import uiManager from "./main.js";
import { API_BASE_URL } from "./features/utils-api.js";

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
	game: Game | null = null;
  winner: PlayerConfig | null = null;
  loser: PlayerConfig | null = null;
  guestsManager: GuestsManager;
	
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
		return this.players[0].isReady() === true && this.players[1]?.isReady() === true;
	}

	async escape()
	{
		console.log(uiManager.getIsAnimating());
		toggleIsAnimation(false);
		document.addEventListener("keydown", (e) => 
		{
			console.log("1: %d", uiManager.getIsAnimating());
			if (e.key === "Escape" && uiManager.getIsAnimating() === false) {
				console.log("2: %d", uiManager.getIsAnimating());
				uiManager.setIsAnimating(true);
				if (uiManager.getCurrentView().includes("pause"))
				{
					if (this.game != null && this.game.pause == true)
						this.game.pause = false;
					setGameView();
					console.log("3: %d", uiManager.getIsAnimating());
				}
				else if (uiManager.getCurrentView().includes("game"))
				{
					if (this.game != null && this.game.pause == false)
						this.game.pause = true;
					animateContentBoxIn();
					console.log("apres 2");
					setupPause(this);
					console.log("4: %d", uiManager.getIsAnimating());
				};
			}
		});
		
	}

	getGuestsManager(): GuestsManager {
		return this.guestsManager;
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

export interface Guest {
	id: number;
	pseudo: string;
}

export class GuestsManager {
	numberOfGuests: number = 0;
	guests: Guest[] = [];

	async fetchGuests() {
		guests: null;
		try {
			const response = await fetch(API_BASE_URL + "/guests", {
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
			const data = await response.json();
			if (response.status === 400) {
				console.error("Failed to add guest, ", data.message);
				return { succes: false, message: data.message };
			} else if (response.status === 409) {
				console.error("Failed to add guest, ", data.message);
				return { succes: false, message: data.message };
			} else if (!response.ok) {
				console.error("Failed to add guest, server error.");
				return { succes: false, message: data.message };
			}
			await this.fetchGuests();
			return { succes: true, message: "Guest added successfully" };
		} catch (error) {
			console.error("Error adding guest:", error);
			return { succes: false, message: "Network error occured" };
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
			const data = await response.json();
			if (response.status === 404) {
				console.error("Failed to delete guest, ", data.message);
				return { succes: false, message: data.message };
			} else if (!response.ok) {
				console.error("Failed to delete guest, server error.");
				return { succes: false, message: data.message };
			}
			await this.fetchGuests();
			return { succes: true, message: "Guest deleted successfully" };
		} catch (error) {
			console.error("Error deleting guest:", error);
			return { succes: false, message: "Network error occured" };
		}
	}
}