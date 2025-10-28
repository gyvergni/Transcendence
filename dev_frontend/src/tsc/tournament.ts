// tournament.ts
import uiManager from "./main.js";
import { toggleBackButton } from "./animations.js";
import { createPlayerSlot } from "./player-selection.js";
import { setContentView, setGameView } from "./views.js";
import { PlayerConfig, MatchSetup, TournamentManager } from "./models.js";
import { startTournament } from "./game/pong.js";
import {currentLang, setLang} from "./translation.js";


export async function setupTournament() {
  uiManager.setCurrentView("tournament");

  uiManager.contentBox.classList.remove("max-w-md", "flexbox");
  uiManager.contentBox.classList.add("max-w-4xl");

  toggleBackButton(true, () => setContentView("views/home.html"));

  const container = document.getElementById("player-select-container");
  if (!container) return;
  container.innerHTML = "";
  container.className = "grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-4xl mx-auto mt-8";

  let tournament = new TournamentManager();

  for (let i = 0; i < 4; i++)
  {
    const config = new PlayerConfig("human");
    const slotId = `player-select-${i}`;
    const playerSlot = await createPlayerSlot(slotId, config, tournament);
    container.appendChild(playerSlot);
  }
  setLang(currentLang);
console.log("tournament length: ", tournament.players.length);
  const startBtn = document.getElementById("start-btn");
  startBtn?.addEventListener("click", () => 
  {
    if (tournament.players.some((p) => !p.isReady()))
    {
      alert("All 4 players must be locked in before starting!");
      return;
    }
    if (tournament.players.length !== 4)
      throw new Error("Need 4 players to start tournament");

    const shuffled = [...tournament.players].sort(() => Math.random() - 0.5);
    tournament.firstRound = [new MatchSetup(), new MatchSetup()];

    // First match: players 0 and 1
    tournament.firstRound[0].addPlayer(shuffled[0]);
    tournament.firstRound[0].addPlayer(shuffled[1]);
    tournament.firstRound[0].gameMode = "t-first";
    // Second match: players 2 and 3
    tournament.firstRound[1].addPlayer(shuffled[2]);
    tournament.firstRound[1].addPlayer(shuffled[3]);
    tournament.firstRound[1].gameMode = "t-first";

    console.log("Match 1:", tournament.firstRound[0].players.map(p => p.name));
    console.log("Match 2:", tournament.firstRound[1].players.map(p => p.name));

    startTournament(tournament);
    setGameView();
  })
}
