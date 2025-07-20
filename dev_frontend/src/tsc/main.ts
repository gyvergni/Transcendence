import {UIManager} from "./ui-manager.js";
import {animateContentBoxOut, animateContentBoxIn} from "./animations.js";
import {setContentView} from "./views.js";
import { checkTokenValidity } from "./features/auth.js";

const uiManager = new UIManager();
export default uiManager;

document.addEventListener("keydown", async (e) => {
	if (e.key === "Escape" && uiManager.getIsAnimating() === false && await checkTokenValidity()) {
		uiManager.setIsAnimating(true);
		if (uiManager.getCurrentView().includes("home"))
		{
			uiManager.setCurrentView("game");
			animateContentBoxOut();
		}
		else
		{
    		animateContentBoxIn();
			setContentView("views/home.html");
  		}
	}
});

// Initial DOM setup
document.addEventListener("DOMContentLoaded",  async () => {
	const isTokenValid = await checkTokenValidity();
	if (!isTokenValid) {
		setContentView("views/login.html");
		return ;
	}
	// console.log("User is authenticated");
	setContentView("views/home.html");
});
