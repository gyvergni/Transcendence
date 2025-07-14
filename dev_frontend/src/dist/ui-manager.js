export class UIManager {
    constructor() {
        this.doorLeft = document.getElementById("door-left");
        this.doorRight = document.getElementById("door-right");
        this.contentInner = document.getElementById("content-inner");
        this.canvas = document.getElementById("game-canvas");
        this.contentBox = document.getElementById("content-box");
    }
    getCurrentView() {
        return currentView;
    }
    setCurrentView(view) {
        currentView = view;
    }
    getIsAnimating() {
        return isAnimating;
    }
    setIsAnimating(value) {
        isAnimating = value;
    }
}
let currentView = "login"; // default at start
let isAnimating = false;
