import {UIManager} from "./display/uiManager.js";
import {setContentView} from "./display/viewHandler.js";
import { checkTokenValidity, markWebSocketCloseAsIntentional } from "./features/auth.js";
import {Lang, setLang} from "./utils/translation.js"
const uiManager = new UIManager();
export default uiManager;

window.addEventListener("beforeunload", () => {
	markWebSocketCloseAsIntentional();
});

// Initial DOM setup
document.addEventListener("DOMContentLoaded",  async () => {
	const isTokenValid = await checkTokenValidity();
	if (!isTokenValid) {
		return ;
	}

	const settingsStr = localStorage.getItem("pong-settings");
	let lang: Lang = "en";
	if (settingsStr) {
		const settings = JSON.parse(settingsStr);
		lang = (settings.language as Lang) || "en";
	}
	setLang(lang);
    window.addEventListener("popstate", (event) => {
        const viewName = event.state?.view || "views/home.html";
        if (!event.state?.view.includes("login"))
            setContentView(viewName);
    });
	setContentView("views/home.html");
});