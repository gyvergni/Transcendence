import {Lang, setLang} from "./translation.js"

interface GameSettings {
	paddleSize: number;
	paddleColor: string;
	paddleSpeed: number;
	ballColor: string;
	ballSize: number;
	ballShape: string;
	ballSpeed: number;
	language: string;
}

const STORAGE_KEY = "pong-settings";

const defaultSettings: GameSettings = {
	paddleSize: 4,
	paddleColor: "#ffffff",
	paddleSpeed: 10,
	ballColor: "#ffffff",
	ballSize: 5,
	ballShape: "round",
	ballSpeed: 10,
	language: "en",
};

// Load from localStorage (or defaults if empty) right now only doing default
export function loadSettings(): GameSettings {

	PaddleSizeSetting();
		PaddleColorSetting();
		PaddleSpeedSetting();

		BallColorSetting();
		BallSizeSetting();
		BallSpeedSetting();
		BallShapeSetting();

		SettingsResetButton();

		LanguageSetting();

	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) {
		console.log("no stored values");
		return { ...defaultSettings };}
	else {
		console.log("stored values");
		return JSON.parse(stored);}
}


function saveSettings(currentSettings: GameSettings) {
	settings = currentSettings;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
	//settings = loadSettings();
}

export function resetSettings() {
	const tempLang = settings.language;
	localStorage.removeItem(STORAGE_KEY);
	saveSettings(defaultSettings);

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		settings = JSON.parse(stored);
		settings.language = tempLang;
	}
	saveSettings(settings);
}

// Initialize current settings
var settings: GameSettings = loadSettings();

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

// ---------- Paddle Speed ----------
export function PaddleSpeedSetting() {
	const paddleSpeedInput = document.getElementById("paddle-speed-value") as HTMLInputElement;
	if (paddleSpeedInput) {
		paddleSpeedInput.value = settings.paddleSpeed.toString();

		paddleSpeedInput.addEventListener("input", () => {
			settings.paddleSpeed = parseInt(paddleSpeedInput.value, 10);
			saveSettings(settings);
			console.log("Paddle Speed saved:", settings.paddleSpeed);
		});
	}
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

// ---------- Ball Speed ----------
export function BallSpeedSetting() {
	const ballSpeedInput = document.getElementById("ball-speed") as HTMLInputElement;
	const ballSpeedValue = document.getElementById("ball-speed-value");

	if (ballSpeedInput) {
		ballSpeedInput.value = settings.ballSpeed.toString();
		if (ballSpeedValue) {
			ballSpeedValue.textContent = settings.ballSpeed.toString();
		}

		ballSpeedInput.addEventListener("input", () => {
			settings.ballSpeed = parseInt(ballSpeedInput.value, 10);
			saveSettings(settings);
			if (ballSpeedValue) {
				ballSpeedValue.textContent = settings.ballSpeed.toString();
			}
			console.log("Ball Speed saved:", settings.ballSpeed);
		});
	}
}

// ---------- Ball Shape ----------
export function BallShapeSetting() {
	const ballShapeButtons = document.querySelectorAll<HTMLDivElement>("[data-ball-shape]");
	ballShapeButtons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const Shape = btn.getAttribute("data-ball-Shape");
			if (Shape) {
				settings.ballShape = Shape;
				saveSettings(settings);
				console.log("Ball Shape saved:", settings.ballShape);
			}
		});
	});
}

export function SettingsResetButton() {
	const reset = document.querySelectorAll("[reset-btn]")
	reset.forEach((btn) => {
		btn.addEventListener("click", () => {
			resetSettings();
			console.log("reseted settings :", settings);
		});
	});
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
	const settingsVar = localStorage.getItem(STORAGE_KEY);
	const lang = settingsVar ? JSON.parse(settingsVar).language : "en";

	if (lang && (lang === "en" || lang === "fr" || lang === "es")) {
		setLang(lang as Lang);
	} else {
		setLang("en");
		if (settings && settings.language) {
			settings.language = "en";
			saveSettings(settings);
		}
	}
}



// Export settings loader for the game to return saved version
export function getSettings(): GameSettings {
	return loadSettings();
}