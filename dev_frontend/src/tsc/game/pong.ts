
import { API_BASE_URL, getApiErrorText } from "../utils/utilsApi.js";

import { MatchSetup, TournamentManager } from "../utils/models.js";
import {setupTournamentEndScreen, setupTournamentWaitingRoom} from "../display/gameScreens.js";

import { Game } from "./game.js";

import { getSettings } from "../features/settings.js"

export let paddle_size: number;
export let PaddleColor: string;
export let PaddleSpeed: number;

export let BallSize: number;
export let BallColor: string;
export let BallSpeed: number;
export let BallShape: string;

export type matchStatsSend = {
    player1Username: string | null,
		player2Username: string | null,
		player1Score: number,
		player2Score: number,
		match: {
			matchSettings: {
				ballSize: number,
				ballSpeed:number,
				paddleSize: number,
				paddleSpeed: number,
				gameMode: string,
			},
			matchStats: {
				totalHits: number | undefined,
				longestRallyHits: number | undefined,
				longestRallyTime: number | undefined,
				timeDuration: number | undefined,
				pointsOrder: string | undefined,
                timeOrder: string | undefined,
                wallBounce1: number | undefined,
                wallBounce2: number | undefined,
                totalInputs1: number | undefined,
                totalInputs2: number | undefined,
			},
    }
}


function setUpSettings() {
	const gameSettings = getSettings(); 
	paddle_size = gameSettings.paddleSize;
	PaddleColor = gameSettings.paddleColor;
	PaddleSpeed = gameSettings.paddleSpeed;

	BallSize = gameSettings.ballSize;
	BallColor = gameSettings.ballColor;
	BallSpeed = gameSettings.ballSpeed;
	BallShape = gameSettings.ballShape;
}

export function getMatchStats(match: MatchSetup)
{
    const gameSettings = getSettings();
	console.log("player 1 " + match.players[0].name);
	console.log("player 2 " + match.players[1].name);
	// Build the clean payload
	let stats: matchStatsSend;
    stats = {
		player1Username: match.players[0].name,
		player2Username: match.players[1].name,
		player1Score: match.players[0].score,
		player2Score: match.players[1].score,
		match: {
			matchSettings: {
				ballSize: gameSettings.ballSize,
				ballSpeed: gameSettings.ballSpeed,
				paddleSize: gameSettings.paddleSize,
				paddleSpeed: gameSettings.paddleSpeed,
				gameMode: match.gameMode,
			},
			matchStats: {
				totalHits: match.game?.ball.rebound,
				longestRallyHits: match.game?.ball.maxRallyBounce,
				longestRallyTime: match.game?.clock?.pointMaxTime,
				timeDuration: match.game?.clock?.gameTime,
				pointsOrder: match.game?.ball.pointOrder,
                timeOrder: match.game?.ball.timeOrder,
                wallBounce1: match.game?.ball.wallBounce1,
                wallBounce2: match.game?.ball.wallBounce2,
                totalInputs1: match.game?.player1.totalInputs,
                totalInputs2: match.game?.player2.totalInputs,
			},
		},
	};
    match.stats = stats;
}

export async function postMatchStats(stats: matchStatsSend) {
	

	console.log("📤 Preparing to send match stats:", stats);

	try {
		const res = await fetch(`${API_BASE_URL}/stats/match/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
			},
			body: JSON.stringify(stats),
		});

		console.log("✅ Response received:", res);

		if (!res.ok) {
			try {
				const body = await res.json();
				console.error("❌ Failed to post stats:", getApiErrorText(body));
			} catch (e) {
				const errorText = await res.text();
				console.error(`❌ Failed to post stats: ${res.status} ${res.statusText}`, errorText);
			}
			throw new Error(`Failed to post stats: ${res.status} ${res.statusText}`);
		}

		const data = await res.json();
		console.log("✅ Stats successfully saved:", data);
		return data;
	} catch (err) {
		console.error("❌ Error posting match stats:", err);
		throw err;
	}
}

// ################### Run the Game ###################
export function startMatch(match_setup: MatchSetup, type: number): Promise<MatchSetup> {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    setUpSettings();
    console.log("Game settings loaded:", { paddle_size, PaddleColor, BallSize, BallColor });
    const game = new Game(canvas, match_setup, type);
    match_setup.game = game;
    match_setup.escape();
    game.launch();
    //resetSettings();
	return game.whenEnded();
}


export async function startTournament(tournament: TournamentManager): Promise<void>
{
	console.log("started tournament with", tournament.firstRound[0].players[0].name);
    await startMatch(tournament.firstRound[0], 1);
    if (!tournament.firstRound[0].winner)
        return ;
	await setupTournamentWaitingRoom(tournament);
	await startMatch(tournament.firstRound[1], 1);
    if (!tournament.firstRound[1].winner)
        return ;
	tournament.currentRound = 1;
    tournament.final = new MatchSetup;
    if (tournament.firstRound[0].winner && tournament.firstRound[1].winner)
    {
    	tournament.final.addPlayer(tournament.firstRound[0].winner);
    	tournament.final.addPlayer(tournament.firstRound[1].winner);
		tournament.final.gameMode = "t-final";
		await setupTournamentWaitingRoom(tournament);
    	tournament.currentRound = 2;
		await startMatch(tournament.final, 2);
		console.log("Tournament winner:", tournament.final.winner!.name);
		if (tournament.final?.game?.pause === false)
        {
            postMatchStats(tournament.firstRound[0].stats!);
            postMatchStats(tournament.firstRound[1].stats!);
			postMatchStats(tournament.final.stats!);
            await setupTournamentEndScreen(tournament);
        }
    }
}
