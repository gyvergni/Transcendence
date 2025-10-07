import {UIManager} from "./ui-manager.js";
import {setContentView} from "./views.js";
import { checkTokenValidity } from "./features/auth.js";
import {Lang, setLang} from "./translation.js"
const uiManager = new UIManager();
export default uiManager;

console.log("version 0.41");

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
	
	console.log("Language from storage:", lang);
	setLang(lang);
	// console.log("User is authenticated");//
	setContentView("views/home.html");
});
//0969396999