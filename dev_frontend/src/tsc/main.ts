import {UIManager} from "./ui-manager.js";
import {setContentView} from "./views.js";
import { checkTokenValidity } from "./features/auth.js";
import {setLang} from "./translation.js"
const uiManager = new UIManager();
export default uiManager;

console.log("version 0.41");

// Initial DOM setup
document.addEventListener("DOMContentLoaded",  async () => {
	const isTokenValid = await checkTokenValidity();
	if (!isTokenValid) {
		return ;
	}
	setLang("en");
	// console.log("User is authenticated");//
	setContentView("views/home.html");
});
//0969396999