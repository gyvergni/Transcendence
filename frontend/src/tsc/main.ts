import {UIManager} from "./display/uiManager.js";
import {setContentView} from "./display/viewHandler.js";
import { checkTokenValidity, markWebSocketCloseAsIntentional } from "./features/auth.js";
import {Lang, setLang} from "./utils/translation.js"
const uiManager = new UIManager();
export default uiManager;

window.addEventListener("beforeunload", () => {
	markWebSocketCloseAsIntentional();
});

window.addEventListener("popstate", async (event) => {
    const stateView = event.state?.view as string | undefined;
    const isAuth = await checkTokenValidity();
    if (!isAuth) {
        // Unauthenticated: back to login or to signup if we just went back from there
        if (uiManager.getCurrentView().includes("login") && stateView?.includes("signup"))
            await setContentView("views/signup.html");
        else
            await setContentView("views/login.html", { push: false });
        return;
    }

    // Default to home
    if (!stateView || ( (!(uiManager.getCurrentView().includes("login")) && !(uiManager.getCurrentView().includes("signup"))) && (stateView.includes("login") || stateView.includes("signup")))) {
        history.replaceState({view: "views/home.html"}, "", "#" + "views/home.html");
        return ;
    }
    if (uiManager.getCurrentView().includes("game") || uiManager.getCurrentView().includes("quickMatch") || stateView.includes("game-end"))
    {
        history.pushState({view: "views/quick-match.html"}, "", "#" + "views/quick-match.html");
        return;
    }
    if (uiManager.getCurrentView().includes("t-"))
    {
        history.pushState({view: "views/tournament.html"}, "", "#" + "views/tournament.html");
        return;
    }
    //normal pop, no push to preserve history
    await setContentView(stateView, { push: false });
});

// Initial DOM setup
document.addEventListener("DOMContentLoaded",  async () => {
	const isTokenValid = await checkTokenValidity();

	const settingsStr = localStorage.getItem("pong-settings");
	let lang: Lang = "en";
	if (settingsStr) {
		const settings = JSON.parse(settingsStr);
		lang = (settings.language as Lang) || "en";
	}
	setLang(lang);
    //initial load, login if not authenticated, home if already authenticated
	if (!isTokenValid)
		await setContentView("views/login.html", {replace: true})
	else
        await setContentView("views/home.html", {replace: true});
});
