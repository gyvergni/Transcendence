var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// views.ts
import uiManager from "./main.js";
import { animateContentBoxIn, animateContentBoxOut, toggleBackButton } from "./animations.js";
import { createPlayerSlot } from "./player-selection.js";
import { PlayerConfig, MatchSetup } from "./models.js";
import { setupTournament } from "./tournament.js";
import { startQuickMatch } from "./pong.js";
function loadHTML(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(path);
        if (!res.ok)
            throw new Error(`Failed to load ${path}`);
        return yield res.text();
    });
}
export function setContentView(viewPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uiManager.contentInner) {
            console.error("Missing content-box in DOM");
            return;
        }
        const html = yield loadHTML(viewPath);
        uiManager.contentInner.innerHTML = html;
        uiManager.setCurrentView(viewPath);
        if (viewPath.includes("login"))
            setupLoginEvents();
        else if (viewPath.includes("home"))
            setupHomeEvents();
        else if (viewPath.includes("settings"))
            setupSettingsEvents();
        else if (viewPath.includes("signup"))
            setupSignupEvents();
        else if (viewPath.includes("profile"))
            setupProfileEvents();
        else if (viewPath.includes("quick-match"))
            setQuickMatchView();
        else if (viewPath.includes("tournament"))
            setupTournament();
    });
}
export function setGameView() {
    uiManager.setCurrentView("game");
    animateContentBoxOut();
}
// ---------------------------
// Views
// ---------------------------
function setupLoginEvents() {
    uiManager.setCurrentView("login");
    toggleBackButton(false);
    const form = document.getElementById("login-form");
    const signupBtn = document.getElementById("signup-btn");
    animateContentBoxIn();
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
        e.preventDefault();
        setContentView("views/home.html");
    });
    signupBtn === null || signupBtn === void 0 ? void 0 : signupBtn.addEventListener("click", () => {
        setContentView("views/signup.html");
    });
}
function setupHomeEvents() {
    uiManager.setCurrentView("home");
    animateContentBoxIn();
    toggleBackButton(false);
    document.querySelectorAll("[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;
            if (view === "settings")
                setContentView("views/settings.html");
            else if (view === "profile")
                setContentView("views/profile.html");
            else if (view === "q-match")
                setContentView("views/quick-match.html");
            else if (view === "tournament")
                setContentView("views/tournament.html");
            else
                setGameView();
        });
    });
}
function setupSignupEvents() {
    uiManager.setCurrentView("signup");
    const form = document.getElementById("signup-form");
    const loginBtn = document.getElementById("login-btn");
    toggleBackButton(true, () => setContentView("views/login.html"));
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
        e.preventDefault();
        setContentView("views/home.html");
    });
}
function setupSettingsEvents() {
    uiManager.setCurrentView("settings");
    toggleBackButton(true, () => setContentView("views/home.html"));
}
function setupProfileEvents() {
    const statsBtn = document.getElementById("stats-btn");
    const logoutBtn = document.getElementById("logout-btn");
    uiManager.setCurrentView("profile");
    toggleBackButton(true, () => setContentView("views/home.html"));
    statsBtn === null || statsBtn === void 0 ? void 0 : statsBtn.addEventListener("click", () => console.log("Show stats view"));
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener("click", () => setContentView("views/login.html"));
}
function setQuickMatchView() {
    const container = document.getElementById("player-select-container");
    container.innerHTML = "";
    uiManager.contentBox.classList.remove("max-w-md");
    uiManager.contentBox.classList.add("max-w-3xl");
    toggleBackButton(true, () => {
        uiManager.contentBox.classList.remove("max-w-3xl");
        uiManager.contentBox.classList.add("max-w-md");
        setContentView("views/home.html");
    });
    const startBtn = document.getElementById("start-btn");
    const player1Config = new PlayerConfig("human");
    const player2Config = new PlayerConfig("human");
    const match = new MatchSetup();
    const player1 = createPlayerSlot("player1-select", player1Config, match);
    const player2 = createPlayerSlot("player2-select", player2Config, match);
    player1Config.position = 0; //left
    player2Config.position = 1; //right
    container.appendChild(player1);
    container.appendChild(player2);
    startBtn === null || startBtn === void 0 ? void 0 : startBtn.addEventListener("click", () => {
        if (!match.isReady()) {
            alert("Both players must be locked in before starting!");
            return;
        }
        setGameView();
        setTimeout(() => startQuickMatch(player1Config, player2Config), 100);
    });
}
