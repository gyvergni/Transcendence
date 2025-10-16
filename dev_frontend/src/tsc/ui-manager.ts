import {animateContentBoxOut, animateContentBoxIn} from "./animations.js";
import {setContentView} from "./views.js";
import {MatchSetup} from "./models.js";
import { LanguageSetting, loadSettings } from "./settings.js";


export class UIManager {
	public doorLeft = document.getElementById("door-left")!;
	public doorRight = document.getElementById("door-right")!;
	public contentInner = document.getElementById("content-inner")!;
	public canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
	public contentBox = document.getElementById("content-box")!;
	match: MatchSetup | null = null;

	public getCurrentView() {
		return currentView;
	}

	async setCurrentView(view: string): Promise<void> {
		currentView = view;
		loadSettings();
	}

	public getIsAnimating() {
		return isAnimating;
	}

	public setIsAnimating(value: boolean) {
		isAnimating = value;
	}
}


let currentView: string = "login"; // default at start
let isAnimating = false;

