import uiManager from "./main.js";

import {animateContentBoxOut, animateContentBoxIn, toggleBackButton} from "./animations.js";
import { startMatch } from "./pong.js";
import {createPlayerSlot} from "./player-selection.js";
import { PlayerConfig, MatchSetup, GuestsManager } from "./models.js";
import {setupTournament} from "./tournament.js"
import { API_BASE_URL } from "./features/utils-api.js";
import { checkTokenValidity } from "./features/auth.js";
import { loginUser, submitLogin2FA } from "./features/login.js";
import { logoutUser } from "./features/logout.js";
import { signupUser } from "./features/signup.js";
import { account2FAHandler, accountEditAvatar, editIgUsername, editPassword, setup2FA, loadAccountAvatar, loadAccountInfo, enable2FA, disable2FA } from "./features/account.js";
import { getSettings } from "./settings.js";
import { setLang, currentLang } from "./translation.js";

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
	setLang(currentLang);
	if (viewPath.includes("login")) setupLoginEvents();
	else if (viewPath.includes("home")) setupHomeEvents();
	else if (viewPath.includes("settings")) setupSettingsEvents();
	else if (viewPath.includes("signup")) setupSignupEvents();
	else if (viewPath.includes("profile")) setupProfileEvents();
	else if (viewPath.includes("quick-match")) setQuickMatchView();
	else if (viewPath.includes("tournament")) setupTournament();
	else if (viewPath.includes("account")) setupAccountEvents();
}

export async function setupPause(match: MatchSetup)
{
	if (!uiManager.contentInner) {
		console.error("Missing content-box in DOM");
		return;
	}
	const html = await loadHTML("views/pause.html");
	uiManager.contentInner.innerHTML = html;
	uiManager.setCurrentView("views/pause.html");
	toggleBackButton(false);
	uiManager.setIsAnimating(false);
	document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const option = (btn as HTMLElement).dataset.view;
      if (option === "resume") {
		// if (uiManager.match != null && uiManager.match.game != null)
		match!.game!.pause = false;
		setGameView();
	  }
      else if (option === "quit")
	  {
		match!.game?.endGame();
		match!.game = null;
		setContentView("views/home.html");
	  }
    });
  })
}


//Transition to gameScreen

export function setGameView() {
  uiManager.setCurrentView("game");
  animateContentBoxOut();
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

	// A2F Form
	const cancel2FABtn = document.querySelector("#login-2fa-cancel");
	cancel2FABtn?.addEventListener("click", () => {
		toggleBackButton(false);
		document.querySelector("#login-2fa-div")?.classList.add("hidden");
	});

	const form2FA = document.querySelector("#login-2fa-form") as HTMLFormElement;
	form2FA?.addEventListener("submit", (e) => submitLogin2FA(e, form2FA));
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

function setupAccountEvents() {
	checkTokenValidity();
	uiManager.setCurrentView("account");
	animateContentBoxIn();
	toggleBackButton(true, () => {
		setContentView("views/profile.html");
	});
	// loadAccountInfos;

	// Load account infos
	loadAccountInfo();

	// Edit avatar
	document.querySelector("#account-edit-avatar")?.addEventListener('click', () => accountEditAvatar())

	// Edit IG username
	document.querySelector("#account-edit-igUsername")?.addEventListener("click", () => {
		toggleBackButton(false);
		document.querySelector("#edit-igUsername-form-container")?.classList.replace("hidden", "flex");
	});
	document.querySelector("#edit-igUsername-cancel-btn")?.addEventListener("click", () => {
		toggleBackButton(true, () => {
			setContentView("views/profile.html");
		});
		document.querySelector("#edit-igUsername-form-container")?.classList.replace("flex", "hidden");
	});
	const igUsernameForm = document.querySelector("#edit-igUsername-form") as HTMLFormElement;
	igUsernameForm?.addEventListener("submit", (e) => editIgUsername(e, igUsernameForm));

	// Edit password
	document.querySelector("#account-edit-password")?.addEventListener("click", () => {
		toggleBackButton(false);
		document.querySelector("#edit-password-form-container")?.classList.replace("hidden", "flex");
	});
	document.querySelector("#edit-password-cancel-btn")?.addEventListener("click", () => {
		toggleBackButton(true, () => {
			setContentView("views/profile.html");
		});
		document.querySelector("#edit-password-form-container")?.classList.replace("flex", "hidden");
	});
	const passwordForm = document.querySelector("#edit-password-form") as HTMLFormElement;
	passwordForm?.addEventListener("submit", (e) => editPassword(e, passwordForm));

	// Edit A2F
	document.querySelector("#toggle-2fa")?.addEventListener("click",  () => account2FAHandler());
	document.querySelector("#edit-2fa-cancel-btn")?.addEventListener("click", () => {
		toggleBackButton(true, () => {
			setContentView("views/profile.html");
		});
		setContentView("views/account.html");
		document.querySelector("#edit-2fa-form-container")?.classList.add("hidden");
	});
	const form2FA = document.querySelector("#edit-2fa-form") as HTMLFormElement;
	form2FA?.addEventListener("submit", (e) => enable2FA(e, form2FA));
 
	const formDisable2FA = document.querySelector("#disable-2fa-form") as HTMLFormElement;
	formDisable2FA?.addEventListener("submit", (e) => disable2FA(e, formDisable2FA));
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
	const showPasswordBtn = document.querySelector("#show-password");
	const showConfirmPasswordBtn = document.querySelector("#show-verify-password");
	showPasswordBtn?.addEventListener("click", () => {
		const passwordInput = document.querySelector("#signup-password") as HTMLInputElement;
		const eyeOpen = document.querySelector("#eye-open") as SVGElement;
		const eyeClosed = document.querySelector("#eye-closed") as SVGElement;
		const isPassword = passwordInput.type === "password";
		passwordInput.type = isPassword ? "text" : "password";
		
		eyeOpen?.classList.toggle("hidden", isPassword);
		eyeClosed?.classList.toggle("hidden", !isPassword);
		
	})
	showConfirmPasswordBtn?.addEventListener("click", () => {
		const confirmPasswordInput = document.querySelector("#signup-verify-password") as HTMLInputElement;
		const eyeOpen = document.querySelector("#eye-open-confirm") as SVGElement;
		const eyeClosed = document.querySelector("#eye-closed-confirm") as SVGElement;
		const isPassword = confirmPasswordInput.type === "password";
		confirmPasswordInput.type = isPassword ? "text" : "password";
		
		eyeOpen?.classList.toggle("hidden", isPassword);
		eyeClosed?.classList.toggle("hidden", !isPassword);
		
	})
}

// Placeholder for future settings events
function setupSettingsEvents() {
	uiManager.setCurrentView("settings");
	toggleBackButton(true, () => 
	{
		setContentView("views/home.html");
	})
	const gameSettings = getSettings();
	// console.log(gameSettings.paddleSize);
}

function setupProfileEvents() {
	const statsBtn = document.querySelector("#stats-btn")!;
	const accountBtn = document.querySelector("#account-btn")!;
	const logoutBtn = document.querySelector("#logout-btn")!;
	
	uiManager.setCurrentView("profile");
	toggleBackButton(true, () =>
	{
		setContentView("views/home.html");
	});
	statsBtn.addEventListener("click", () => {
		console.log("Show stats view");
		setContentView("views/stats.html"); // TODO Stats
	});

	accountBtn.addEventListener("click", () => {
		console.log("Show account");
		setContentView("views/account.html");
	})

	logoutBtn?.addEventListener("click", () => logoutUser());
}

function setQuickMatchView() {
  const container = document.getElementById("player-select-container")!;
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
  
  let match = new MatchSetup();
  
  //uiManager.match = match;
  const player1 = createPlayerSlot("player1-select", player1Config, match);
  const player2 = createPlayerSlot("player2-select", player2Config, match);
  player1Config.position = 0; //left
  player2Config.position = 1; //right
  container.appendChild(player1);
  container.appendChild(player2);

  startBtn?.addEventListener("click", () => {
    if (!match.isReady()) {
      alert("Both players must be locked in before starting!");
      return;
    }

    setGameView();
    setTimeout(() => startMatch(match), 100);
  });
}
