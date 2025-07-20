import uiManager from "./main.js";

import {animateContentBoxOut, animateContentBoxIn, toggleBackButton} from "./animations.js";

import {createPlayerSlot} from "./player-selection.js";

import {setupTournament} from "./tournament.js"
import { API_BASE_URL } from "./features/utils-api.js";
import { connectWebSocket } from "./features/auth.js";
import { loginUser } from "./features/login.js";
import { logoutUser } from "./features/logout.js";
import { signupUser } from "./features/signup.js";

async function loadHTML(path: string): Promise<string> {
	const res = await fetch(path);
	if (!res.ok)
		throw new Error(`Failed to load ${path}`);
	return await res.text();
}

// Inject content into the content box and initialize events
export async function setContentView(viewPath: string) {
	if (!uiManager.contentInner) {
		console.error("Missing content-box in DOM");
		return;
	}

	const html = await loadHTML(viewPath);
	uiManager.contentInner.innerHTML = html;
	uiManager.setCurrentView(viewPath);

	if (viewPath.includes("login")) setupLoginEvents();
	else if (viewPath.includes("home")) setupHomeEvents();
	else if (viewPath.includes("settings")) setupSettingsEvents();
	else if (viewPath.includes("signup")) setupSignupEvents();
	else if (viewPath.includes("profile")) setupProfileEvents();
	else if (viewPath.includes("quick-match")) setupQuickMatch();
	else if (viewPath.includes("tournament")) setupTournament();
}


//Transition to gameScreen

export function  setGameView() 
{
	console.log("Setting game view");
	uiManager.setCurrentView("game");
  	animateContentBoxOut();

	if (!window.hasOwnProperty("gameLoaded")) {
		const script = document.createElement("script");
		script.src = "game/pong.js";
		script.defer = true;
		script.onload = () => { (window as any).gameLoaded = true; }; // Mark game as loaded
		document.body.appendChild(script);
	}
}

// Setup login form behavior
function setupLoginEvents() {
	const contentBox = document.querySelector("#content-box")! as HTMLElement;
	contentBox.classList.add("w-[430px]");
	uiManager.setCurrentView("login");
	toggleBackButton(false);
	const form = document.querySelector("#login-form") as HTMLFormElement;
	const signupBtn = document.querySelector("#signup-btn");
	const showPasswordBtn = document.querySelector("#show-password");

	animateContentBoxIn();
	form?.addEventListener("submit",(e) => loginUser(e, form));

	signupBtn?.addEventListener("click", () => {
		setContentView("views/signup.html");
	});

	showPasswordBtn?.addEventListener("click", () => {
		const passwordInput = document.querySelector("#login-password") as HTMLInputElement;
		const eyeOpen = document.querySelector("#eye-open") as SVGElement;
		const eyeClosed = document.querySelector("#eye-closed") as SVGElement;
		const isPassword = passwordInput.type === "password";
		passwordInput.type = isPassword ? "text" : "password";
		
		eyeOpen?.classList.toggle("hidden", isPassword);
		eyeClosed?.classList.toggle("hidden", !isPassword);
		
	})
}

// Setup home view behavior
function setupHomeEvents() {
	uiManager.setCurrentView("home");
	animateContentBoxIn();
	toggleBackButton(false);
	document.querySelectorAll("[data-view]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const view = (btn as HTMLElement).dataset.view;
			if (view === "settings") {
				setContentView("views/settings.html");
			}
			else if (view ==="profile")
				setContentView("views/profile.html")
			else if (view === "q-match")
				setContentView("views/quick-match.html")
			else if (view === "tournament")
				setContentView("views/tournament.html")
			else {
				setGameView();
			}
		});
	});
}

function setupSignupEvents() {
	uiManager.setCurrentView("signup");
	const form = document.querySelector("#signup-form") as HTMLFormElement;
	const loginBtn = document.querySelector("#login-btn");

	toggleBackButton(true, () => 
	{
		setContentView("views/login.html");
	})

	form?.addEventListener("submit", (e) => signupUser(e, form));
}

// Placeholder for future settings events
function setupSettingsEvents() {
	uiManager.setCurrentView("settings");
	toggleBackButton(true, () => 
	{
		setContentView("views/home.html");
	})
}

function setupProfileEvents() {
	const statsBtn = document.querySelector("#stats-btn");
	const logoutBtn = document.querySelector("#logout-btn");

	uiManager.setCurrentView("profile");
	toggleBackButton(true, () =>
	{
		setContentView("views/home.html");
	});
	statsBtn?.addEventListener("click", () => {
		console.log("Show stats view");
		// setContentView("views/stats.html"); // TODO Stats
	});

	logoutBtn?.addEventListener("click", () => logoutUser());
}

function setupQuickMatch() {
	const container = document.querySelector("#player-select-container")!;
	container.innerHTML = "";

  // Widen content box
	uiManager.contentBox.classList.remove("max-w-md");
	uiManager.contentBox.classList.add("max-w-3xl"); // Wider for dual player select

	toggleBackButton(true, () => {
		// Reset content box to default size when going back
		uiManager.contentBox.classList.remove("max-w-3xl");
		uiManager.contentBox.classList.add("max-w-md");
		setContentView("views/home.html");
	});
	const startBtn = document.querySelector("#start-btn");
	const player1 = createPlayerSlot("player1-select");
	const player2 = createPlayerSlot("player2-select");

	container.appendChild(player1);
	container.appendChild(player2);
	startBtn?.addEventListener("click", () =>
	{
		setGameView();
	})
}
