import {Lang, setLang} from "./translation.js"

interface GameSettings {
	paddleSize: number;
	paddleColor: string;
	ballColor: string;
	ballSize: number;
	language: string;
}

const STORAGE_KEY = "pong-settings";

const defaultSettings: GameSettings = {
	paddleSize: 5,
	paddleColor: "#ffffff",
	ballColor: "#ffffff",
	ballSize: 5,
	language: "en",
};

// Load from localStorage (or defaults if empty)
function loadSettings(): GameSettings {
	PaddleSizeSetting();
	PaddleColorSetting();
	BallColorSetting();
	BallSizeSetting();
	LanguageSetting();
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? JSON.parse(stored) : { ...defaultSettings };
}

function saveSettings(settings: GameSettings) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings() {
	saveSettings(defaultSettings);
}

// Initialize current settings
const settings: GameSettings = loadSettings();

// ---------- Paddle Size ----------
export function PaddleSizeSetting() {
	const paddleSizeInput = document.getElementById("paddle-size-value") as HTMLInputElement;
	if (paddleSizeInput) {
		paddleSizeInput.value = settings.paddleSize.toString();

		paddleSizeInput.addEventListener("input", () => {
			settings.paddleSize = parseInt(paddleSizeInput.value, 10);
			saveSettings(settings);
			console.log("Paddle size saved:", settings.paddleSize);
		});
	}
}

// ---------- Paddle Color ----------
export function PaddleColorSetting() {
	const paddleColorButtons = document.querySelectorAll<HTMLDivElement>("[data-pdl-color]");
	paddleColorButtons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const color = btn.getAttribute("data-pdl-color");
			if (color) {
				settings.paddleColor = color;
				saveSettings(settings);
				console.log("Paddle color saved:", settings.paddleColor);
			}
		});
	});
}

// ---------- Ball Color ----------
export function BallColorSetting() {
	const ballColorButtons = document.querySelectorAll<HTMLDivElement>("[data-ball-color]");
	ballColorButtons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const color = btn.getAttribute("data-ball-color");
			if (color) {
				settings.ballColor = color;
				saveSettings(settings);
				console.log("Ball color saved:", settings.ballColor);
			}
		});
	});
}

// ---------- Ball Size ----------
export function BallSizeSetting() {
	const ballSizeInput = document.getElementById("ball-size") as HTMLInputElement;
	const ballSizeValue = document.getElementById("ball-size-value");

	if (ballSizeInput) {
		ballSizeInput.value = settings.ballSize.toString();
		if (ballSizeValue) {
			ballSizeValue.textContent = settings.ballSize.toString();
		}

		ballSizeInput.addEventListener("input", () => {
			settings.ballSize = parseInt(ballSizeInput.value, 10);
			saveSettings(settings);
			if (ballSizeValue) {
				ballSizeValue.textContent = settings.ballSize.toString();
			}
			console.log("Ball size saved:", settings.ballSize);
		});
	}
}

// ---------- Language Selection ----------
export function LanguageSetting() {
	const langButtons = document.querySelectorAll<HTMLImageElement>("[data-lang]");
	langButtons.forEach((flag) => {
		flag.addEventListener("click", () => {
			const lang: Lang = flag.getAttribute("data-lang") as Lang;
			if (lang) {
				settings.language = lang;
				saveSettings(settings);
				console.log("Language saved:", settings.language);
				setLang(lang);
			}
		});
	});
}



// Export settings loader for the game to return saved version
export function getSettings(): GameSettings {
	return loadSettings();
}