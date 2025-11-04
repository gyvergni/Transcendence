import uiManager from "../main.js";

import {animateContentBoxOut, animateContentBoxIn, toggleBackButton} from "./animations.js";
import { startMatch, postMatchStats } from "../game/pong.js";
import {createPlayerSlot} from "./player-selection.js";
import { PlayerConfig, MatchSetup} from "../utils/models.js";
import {setupTournament} from "../features/tournament.js"
import { checkTokenValidity } from "../features/auth.js";
import { loginUser, submitLogin2FA } from "../features/login.js";
import { logoutUser } from "../features/logout.js";
import { signupUser } from "../features/signup.js";
import { account2FAHandler, accountEditAvatar, editIgUsername, editPassword, setup2FA, loadAccountAvatar, loadAccountInfo, enable2FA, disable2FA } from "../features/account.js";
import { getSettings } from "../features/settings.js";
import { getTranslatedKey, setLang, currentLang } from "../utils/translation.js";
import { addFriend, deleteFriend, renderFriends } from "../features/friends.js";
import { setupGameEndScreen } from "./gameScreens.js";
import { initStatsView } from "../features/stats.js";
import { handleMatchDetail } from "../features/match.js";

async function loadHTML(path: string): Promise<string> {
	const res = await fetch(path);
	if (!res.ok)
		throw new Error(`Failed to load ${path}`);
	return await res.text();
}

// Inject content into the content box and initialize events
export async function setContentView(viewPath: string, options: {push?: boolean, replace?: boolean} = {push : true, replace : false}): Promise<void> {
	if (!uiManager.contentInner)
    {
		console.error("Missing content-box in DOM");
		return;
	}
    try
    {
	    const html = await loadHTML(viewPath);
        uiManager.contentInner.innerHTML = html;
    }
    catch (e)
    {
        console.error("View html failed", e);
        return ;
    }
	if (!viewPath.includes("-end") && !viewPath.includes("waiting") && !viewPath.includes("pause") && !viewPath.includes("game"))
        uiManager.setCurrentView(viewPath);
	setLang(currentLang);
    if (options.replace == true)
        history.replaceState({view: viewPath}, "", "#" + viewPath);
    else if (options.push == true && history.state?.view !== viewPath)
        history.pushState({view: viewPath}, "" ,"#" + viewPath);
	if (viewPath.includes("login")) setupLoginEvents();
	else if (viewPath.includes("home")) setupHomeEvents();
	else if (viewPath.includes("settings")) setupSettingsEvents();
	else if (viewPath.includes("signup")) setupSignupEvents();
	else if (viewPath.includes("profile")) setupProfileEvents();
	else if (viewPath.includes("quick-match")) setQuickMatchView();
	else if (viewPath.includes("tournament")) setupTournament();
	else if (viewPath.includes("account")) setupAccountEvents();
	else if (viewPath.includes("friends")) setupFriendsEvents();
    else if (viewPath.includes("stats")) initStatsView();
    else if (viewPath.includes("match-detail")) handleMatchDetail(uiManager.getMatchDetail().match, uiManager.getMatchDetail().info);
}

export async function setupPause(match: MatchSetup)
{
	if (!uiManager.contentInner) {
		console.error("Missing content-box in DOM");
		return;
	}
    try
    {
	    const html = await loadHTML("views/pause.html");
        uiManager.contentInner.innerHTML = html;
    }
    catch (e)
    {
        console.error("Loading pause view failed", e);
        return ;
    }
    toggleBackButton(false);
	setLang(currentLang); 
	document.querySelectorAll("[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const option = (btn as HTMLElement).dataset.view;
            if (option === "resume" && uiManager.getIsAnimating() === false) {
		        match.game!.clock.resumeTimer();
		        match!.game!.pause = false;
		        setGameView(match.gameMode);
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

export function setGameView(type: string) {
    animateContentBoxOut();
    uiManager.setCurrentView(type);
}

// Setup login form behavior
function setupLoginEvents() {
	localStorage.removeItem("pong-settings");
	const contentBox = document.querySelector("#content-box")! as HTMLElement;
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
		document.querySelector("#login-2fa-div")?.classList.remove("flex")
	});

	const form2FA = document.querySelector("#login-2fa-form") as HTMLFormElement;
	form2FA?.addEventListener("submit", (e) => submitLogin2FA(e, form2FA));
}

// Setup home view behavior
function setupHomeEvents() {
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
		});
	});
}

function setupAccountEvents() {
	checkTokenValidity();
	animateContentBoxIn();
	toggleBackButton(true, () => {
		history.back();
	});

	loadAccountInfo();

	// Edit avatar
	document.querySelector("#account-edit-avatar")?.addEventListener('click', () => accountEditAvatar())

	// Edit IG username
	document.querySelector("#account-edit-igUsername")?.addEventListener("click", () => {
		toggleBackButton(false);
		igUsernameForm?.reset();
		const errorDiv = document.querySelector("#edit-igUsername-error") as HTMLDivElement;
        if (errorDiv) errorDiv.textContent = "";
		document.querySelector("#edit-igUsername-form-container")?.classList.replace("hidden", "flex");
	});
	document.querySelector("#edit-igUsername-cancel-btn")?.addEventListener("click", () => {
		igUsernameForm?.reset();
		const errorDiv = document.querySelector("#edit-igUsername-error") as HTMLDivElement;
        if (errorDiv) errorDiv.textContent = "";
		toggleBackButton(true, () => {
			history.back();
		});
		document.querySelector("#edit-igUsername-form-container")?.classList.replace("flex", "hidden");
	});
	const igUsernameForm = document.querySelector("#edit-igUsername-form") as HTMLFormElement;
	igUsernameForm?.addEventListener("submit", (e) => editIgUsername(e, igUsernameForm));

	// Edit password
	document.querySelector("#account-edit-password")?.addEventListener("click", () => {
		toggleBackButton(false);
		passwordForm?.reset();
        const errorDiv = document.querySelector("#edit-password-error") as HTMLDivElement;
        if (errorDiv) errorDiv.textContent = "";
		document.querySelector("#edit-password-form-container")?.classList.replace("hidden", "flex");
	});
	document.querySelector("#edit-password-cancel-btn")?.addEventListener("click", () => {
		passwordForm?.reset();
        const errorDiv = document.querySelector("#edit-password-error") as HTMLDivElement;
        if (errorDiv) errorDiv.textContent = "";
		toggleBackButton(true, () => {
			history.back();
		});
		document.querySelector("#edit-password-form-container")?.classList.replace("flex", "hidden");
	});
	const passwordForm = document.querySelector("#edit-password-form") as HTMLFormElement;
	passwordForm?.addEventListener("submit", (e) => editPassword(e, passwordForm));

	// Edit A2F
	document.querySelector("#toggle-2fa")?.addEventListener("click",    () => account2FAHandler());
	document.querySelector("#edit-2fa-cancel-btn")?.addEventListener("click", () => {
		toggleBackButton(true, () => {
			history.back();
		});
		setContentView("views/account.html");
		document.querySelector("#edit-2fa-form-container")?.classList.add("hidden");
		document.querySelector("#edit-2fa-form-container")?.classList.remove("flex");
	});

	document.querySelector("#disable-2fa-cancel-btn")?.addEventListener("click", () => {
		toggleBackButton(true, () => {
			history.back();
		});
		setContentView("views/account.html");
		document.querySelector("#disable-2fa-form-container")?.classList.add("hidden");
		document.querySelector("#disable-2fa-form-container")?.classList.remove("flex");
	});
	const form2FA = document.querySelector("#edit-2fa-form") as HTMLFormElement;
	form2FA?.addEventListener("submit", (e) => enable2FA(e, form2FA));
 
	const formDisable2FA = document.querySelector("#disable-2fa-form") as HTMLFormElement;
	formDisable2FA?.addEventListener("submit", (e) => disable2FA(e, formDisable2FA));
}

function setupSignupEvents() {
	const form = document.querySelector("#signup-form") as HTMLFormElement;
	const loginBtn = document.querySelector("#login-btn");

	toggleBackButton(true, () => 
	{
		history.back();
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

function setupSettingsEvents() {
	toggleBackButton(true, () => 
	{
		history.back();
	})
	const gameSettings = getSettings();
}

function setupProfileEvents() {
	const statsBtn = document.querySelector("#stats-btn")!;
	const accountBtn = document.querySelector("#account-btn")!;
	const logoutBtn = document.querySelector("#logout-btn")!;
	const friendsBtn = document.querySelector("#friends-btn")!;
	
	toggleBackButton(true, () =>
	{
		history.back();
	});
	statsBtn.addEventListener("click", async () => {
		// Expand the content box to act as a near-fullscreen dashboard
		// Set back button to revert layout back to profile when closing stats
		toggleBackButton(true, async () => {
			history.back();
		});
		// animate the content box into view
		animateContentBoxIn();
        uiManager.setFriendsPseudo(null);
		await setContentView("views/stats-dashboard.html");
	});

	accountBtn.addEventListener("click", () => {
		setContentView("views/account.html");
	})

	friendsBtn.addEventListener("click", () => {
		setContentView("views/friends.html");
	});

	logoutBtn?.addEventListener("click", () => logoutUser());
}

async function setQuickMatchView() {
    const container = document.getElementById("player-select-container")!;
    container.innerHTML = "";

    toggleBackButton(true, async () => {
        history.back();
    });

    const startBtn = document.getElementById("start-btn");
    const player1Config = new PlayerConfig("human");
    const player2Config = new PlayerConfig("human");
    
    let match = new MatchSetup();
    
    //uiManager.match = match;
    try
    {
        const player1 = await createPlayerSlot("player1-select", player1Config, match);
        const player2 = await createPlayerSlot("player2-select", player2Config, match);
        player1Config.position = 0; //left
        player2Config.position = 1; //right
        container.appendChild(player1);
        container.appendChild(player2);
        
        setLang(currentLang);

        startBtn?.addEventListener("click", async () => {
            if (!match.isReady()) {
                alert(getTranslatedKey("error.views.notlockedin"));
                return;
            }
            setGameView("game");
            await startMatch(match);
	        if (match.game?.pause === false)
	        {	
                postMatchStats(match.stats!);
	        	await setupGameEndScreen(match);
	        }
        })
    }
    catch (e)
    {
        console.error(e);
        return ;
    };
}

function setupFriendsEvents() {
	checkTokenValidity();
	animateContentBoxIn();
	toggleBackButton(true, () => {
		history.back();
	});

	const root = document.querySelector("#friends-list")! as HTMLElement;
	const search = document.querySelector("#friends-search")! as HTMLInputElement;
	const addBtn = document.querySelector("#add-friend-btn")! as HTMLButtonElement;
	const reloadBtn = document.querySelector("#reload-friends-status")! as HTMLButtonElement;
	const tpl = document.querySelector("#friend-item-template")! as HTMLTemplateElement;

	if (!root || !search || !addBtn || !tpl) return;

	renderFriends(root, tpl, search.value);

	search.addEventListener("input", () => renderFriends(root, tpl, search.value, true));

	root.addEventListener("click", async (e) => {
		const removeBtn = (e.target as HTMLElement).closest(".remove-friend-btn") as HTMLButtonElement;
		if (removeBtn)
        {
			await deleteFriend(e, root, tpl, search);
			return ;
		}
        else
        {
			const friendBtn = (e.target as HTMLElement).closest("li") as HTMLLIElement;
			if (friendBtn)
            {
				const friendPseudo = friendBtn.getAttribute("data-pseudo");
				if (!friendPseudo)
                    return;
				// Set back button to revert layout back to profile when closing stats
                uiManager.setFriendsPseudo(friendPseudo);
				toggleBackButton(true, async () =>
				{
					history.back();
				});
                await setContentView("views/stats-dashboard.html");
			}
		}
	});

	addBtn?.addEventListener("click", () =>
    {
		toggleBackButton(false);
		document.querySelector("#add-friend-form-container")?.classList.replace("hidden", "flex");
	});

	document.querySelector("#add-friend-cancel-btn")?.addEventListener("click", () => {
		document.querySelector("#add-friend-error")!.textContent = "";
		const form = document.querySelector("#add-friend-form")! as HTMLFormElement;
		form.reset();
		toggleBackButton(true, () => {
			history.back();
		});
		document.querySelector("#add-friend-form-container")?.classList.replace("flex", "hidden");
	});

	const addFriendForm = document.querySelector("#add-friend-form") as HTMLFormElement;
	addFriendForm.addEventListener("submit", async (e) =>
    {
		await addFriend(e, addFriendForm);
		await renderFriends(root, tpl, search.value);
	});

	reloadBtn?.addEventListener("click", async () =>
    {
		await renderFriends(root, tpl, search.value);
	});
}