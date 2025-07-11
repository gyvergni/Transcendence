import { UIManager } from "./ui-manager.js";
import { animateContentBoxOut, animateContentBoxIn } from "./animations.js";
import { setContentView } from "./views.js";
const uiManager = new UIManager();
export default uiManager;
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && uiManager.getIsAnimating() === false) {
        uiManager.setIsAnimating(true);
        if (uiManager.getCurrentView().includes("home")) {
            uiManager.setCurrentView("game");
            animateContentBoxOut();
        }
        else {
            animateContentBoxIn();
            setContentView("views/home.html");
        }
    }
});
// Initial DOM setup
document.addEventListener("DOMContentLoaded", () => {
    setContentView("views/login.html");
});
