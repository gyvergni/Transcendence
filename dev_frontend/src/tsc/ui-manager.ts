export class UIManager {
	public doorLeft = document.querySelector("#door-left")!;
	public doorRight = document.querySelector("#door-right")!;
	public contentInner = document.querySelector("#content-inner")!;
	public canvas = document.querySelector("#game-canvas") as HTMLCanvasElement;
	public contentBox = document.querySelector("#content-box")!;

	public getCurrentView() {
		return currentView;
	}

	public setCurrentView(view: string) {
		currentView = view;
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

