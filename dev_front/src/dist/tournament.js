import uiManager from "./main.js";
import { toggleBackButton } from "./animations.js";
import { createPlayerSlot } from "./player-selection.js";
import { setContentView, setGameView } from "./views.js";
export function setupTournament() {
    uiManager.setCurrentView("tournament");
    // Set layout classes on contentBox if it's the grid
    uiManager.contentBox.classList.remove("max-w-md", "flexbox");
    uiManager.contentBox.classList.add("max-w-4xl");
    toggleBackButton(true, () => setContentView("views/home.html"));
    const container = document.getElementById("player-select-container");
    if (!container)
        return;
    // Apply grid layout to container
    container.className = "grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-4xl mx-auto mt-8";
    container.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        const player = createPlayerSlot(`player-select-${i}`);
        container.appendChild(player);
    }
    const startBtn = document.getElementById("start-btn");
    startBtn === null || startBtn === void 0 ? void 0 : startBtn.addEventListener("click", () => {
        setGameView();
    });
}
