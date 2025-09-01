// tournament.ts
import uiManager from "./main.js";
import { toggleBackButton } from "./animations.js";
import { createPlayerSlot } from "./player-selection.js";
import { setContentView, setGameView } from "./views.js";
import { PlayerConfig, TournamentManager } from "./models.js";
export function setupTournament() {
    uiManager.setCurrentView("tournament");
    uiManager.contentBox.classList.remove("max-w-md", "flexbox");
    uiManager.contentBox.classList.add("max-w-4xl");
    toggleBackButton(true, () => setContentView("views/home.html"));
    const container = document.getElementById("player-select-container");
    if (!container)
        return;
    container.className = "grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-4xl mx-auto mt-8";
    container.innerHTML = "";
    const tournament = new TournamentManager();
    for (let i = 0; i < 4; i++) {
        const config = new PlayerConfig("human");
        tournament.addPlayer(config);
        const slotId = `player-select-${i}`;
        const playerSlot = createPlayerSlot(slotId, config, tournament);
        container.appendChild(playerSlot);
    }
    const startBtn = document.getElementById("start-btn");
    startBtn === null || startBtn === void 0 ? void 0 : startBtn.addEventListener("click", () => {
        if (tournament.players.some((p) => !p.isReady())) {
            alert("⚠️ All 4 players must be locked in before starting!");
            return;
        }
        tournament.setupFirstRound();
        console.log("🏓 Tournament setup complete:", tournament.matches);
        setGameView();
        // TODO: start semi-final match
    });
}
