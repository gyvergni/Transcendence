import uiManager from "./main.js";

import {animateContentBoxOut, animateContentBoxIn, toggleBackButton} from "./animations.js";

import {createPlayerSlot} from "./player-selection.js";

import {setupTournament} from "./tournament.js"

import {startQuickMatch} from "./pong.js"

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
	uiManager.setCurrentView("game");
  	animateContentBoxOut();
}

// Setup login form behavior
function setupLoginEvents() {
	uiManager.setCurrentView("login");
	toggleBackButton(false);
	const form = document.getElementById("login-form") as HTMLFormElement;
	const signupBtn = document.getElementById("signup-btn");
	animateContentBoxIn();
	form?.addEventListener("submit", (e) => {
		const formData = new FormData(form);
		const username = formData.get("username");
		const password = formData.get("password");
		// A  AJOUTER ICI API LOGIN
		e.preventDefault();
		setContentView("views/home.html");
	});

	signupBtn?.addEventListener("click", () => {
		setContentView("views/signup.html");
	});
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
	const form = document.getElementById("signup-form") as HTMLFormElement;
	const loginBtn = document.getElementById("login-btn");

	toggleBackButton(true, () => 
	{
		setContentView("views/login.html");
	})

	form?.addEventListener("submit", (e) => {
		// TODO API Signup
		const formData = new FormData(form);
		const username = formData.get("username");
		const password1 = formData.get("password1");
		const password2 = formData.get("password2");
		console.log(username);
		console.log(password1);
		console.log(password2);
		e.preventDefault();
		setContentView("views/home.html");
	});
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
	const statsBtn = document.getElementById("stats-btn");
	const logoutBtn = document.getElementById("logout-btn");

	uiManager.setCurrentView("profile");
	toggleBackButton(true, () =>
	{
		setContentView("views/home.html");
	});
	statsBtn?.addEventListener("click", () => {
		console.log("Show stats view");
		// setContentView("views/stats.html"); // TODO Stats
	});

	logoutBtn?.addEventListener("click", () => {
		setContentView("views/login.html");
	});
}

function setupQuickMatch() {
	const container = document.getElementById("player-select-container")!;
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
	const startBtn = document.getElementById("start-btn");
	const player1 = createPlayerSlot("player1-select");
	const player2 = createPlayerSlot("player2-select");

	container.appendChild(player1);
	container.appendChild(player2);
	startBtn?.addEventListener("click", () =>
	{
		setGameView();
		setTimeout(() => {
			startQuickMatch("human", "eric", "ai", "medium");
		}, 100); // delay allows canvas and layout to finish
	});
}
