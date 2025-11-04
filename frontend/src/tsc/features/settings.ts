import {Lang, setLang} from "../utils/translation.js"

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

	const stored = localStorage.getItem(STORAGE_KEY);
	PaddleSizeSetting();
	PaddleColorSetting();
	PaddleSpeedSetting();

	BallColorSetting();
	BallSizeSetting();
	BallSpeedSetting();
	BallShapeSetting();

	SettingsResetButton();

	LanguageSetting();
	if (!stored) {
		return { ...defaultSettings };}
	else {
		return JSON.parse(stored);}
}


function saveSettings(currentSettings: GameSettings) {
	settings = currentSettings;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
}


function UpdateSettings() {
	// update paddle size
	const paddleSizeInput = document.getElementById("paddle-size-value") as HTMLInputElement;
	if (paddleSizeInput) {
		paddleSizeInput.value = settings.paddleSize.toString();
	}

	// update paddle speed
	const paddleSpeedInput = document.getElementById("paddle-speed-value") as HTMLInputElement;
	if (paddleSpeedInput) {
		paddleSpeedInput.value = settings.paddleSpeed.toString();
	}

	// update ball size
	const ballSizeValue = document.getElementById("ball-size") as HTMLInputElement;
	if (ballSizeValue) {
		ballSizeValue.value = settings.ballSize.toString();
	}

	// update ball speed
	const ballSpeedValue = document.getElementById("ball-speed") as HTMLInputElement;
	if (ballSpeedValue) {
		ballSpeedValue.value = settings.ballSpeed.toString();
	}	

	// update paddle color
	const paddleColorButtons = document.querySelectorAll<HTMLDivElement>("[data-pdl-color]");
	paddleColorButtons.forEach((btn) => {
		const pdl_color = btn.getAttribute("data-pdl-color");
		if (pdl_color == settings.paddleColor) {

			if (pdl_color=="#ffffff") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			} else if (pdl_color=="#000000") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-black border-2 border-transparent ring-2 ring-white");
			} else if (pdl_color=="#3b82f6") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-blue-500 border-2 border-transparent ring-2 ring-white");
			} else if (pdl_color=="#22c55e") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-green-500 border-2 border-transparent ring-2 ring-white");
			} else if (pdl_color=="#9333ea") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-purple-600 border-2 border-transparent ring-2 ring-white");
			}

		}
		else if (pdl_color != settings.paddleColor) {
			if (pdl_color=="#ffffff") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-white border-2 border-transparent hover:ring-2 hover:ring-cyan-500");
			} else if (pdl_color=="#000000") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-black border-2 border-transparent hover:ring-2 hover:ring-white");
			} else if (pdl_color=="#3b82f6") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-blue-500 border-2 border-transparent hover:ring-2 hover:ring-white");
			} else if (pdl_color=="#22c55e") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-green-500 border-2 border-transparent hover:ring-2 hover:ring-white");
			} else if (pdl_color=="#9333ea") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-purple-600 border-2 border-transparent hover:ring-2 hover:ring-white");
			}
		}
	});

	// update ball color
	const ballColorButtons = document.querySelectorAll<HTMLDivElement>("[data-ball-color]");
	ballColorButtons.forEach((btn) => {
		const ball_color = btn.getAttribute("data-ball-color");
		if (ball_color == settings.ballColor) {

			if (ball_color=="#ffffff") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			} else if (ball_color=="#000000") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-black border-2 border-transparent ring-2 ring-white");
			} else if (ball_color=="#ef4444") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-red-500 border-2 border-transparent ring-2 ring-white");
			} else if (ball_color=="#ec4899") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-pink-500 border-2 border-transparent ring-2 ring-white");
			} else if (ball_color=="#6366f1") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-indigo-500 border-2 border-transparent ring-2 ring-white");
			}
		}
		else if (ball_color != settings.ballColor) {
			if (ball_color=="#ffffff") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-white border-2 border-transparent hover:ring-2 hover:ring-cyan-500");
			} else if (ball_color=="#000000") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-black border-2 border-transparent hover:ring-2 hover:ring-white");
			} else if (ball_color=="#ef4444") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-red-500 border-2 border-transparent hover:ring-2 hover:ring-white");
			} else if (ball_color=="#ec4899") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-pink-500 border-2 border-transparent hover:ring-2 hover:ring-white");
			} else if (ball_color=="#6366f1") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-indigo-500 border-2 border-transparent hover:ring-2 hover:ring-white");
			}
		}
	});

	const ballShapeButtons = document.querySelectorAll<HTMLDivElement>("[data-ball-shape]");
	ballShapeButtons.forEach((btn) => {
		const Shape = btn.getAttribute("data-ball-shape");
		if (Shape == settings.ballShape) {
			if (Shape == "round") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			} else if (Shape == "square") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			}
		}
		else if (Shape != settings.ballShape) {
			if (Shape == "round") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-white border-2 border-transparent hover:ring-2 hover:ring-cyan-500");
			} else if (Shape == "square") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-white border-2 border-transparent hover:ring-2 hover:ring-cyan-500");
			}
		}
	});
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
	UpdateSettings();
}

// Initialize current settings
var settings: GameSettings = loadSettings();

export function PaddleSizeSetting() {
	const paddleSizeInput = document.getElementById("paddle-size-value") as HTMLInputElement;
	if (paddleSizeInput) {
		paddleSizeInput.value = settings.paddleSize.toString();

		paddleSizeInput.addEventListener("input", () => {
			settings.paddleSize = parseInt(paddleSizeInput.value, 10);
			saveSettings(settings);
		});
	}
}

export function PaddleColorSetting() {
	const paddleColorButtons = document.querySelectorAll<HTMLDivElement>("[data-pdl-color]");
	paddleColorButtons.forEach((btn) => {
		const pdl_color = btn.getAttribute("data-pdl-color");
		if (localStorage.getItem(STORAGE_KEY) == null)
			settings.paddleColor = defaultSettings.paddleColor;
		if (pdl_color == settings.paddleColor) {

			if (pdl_color=="#ffffff") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			} else if (pdl_color=="#000000") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-black border-2 border-transparent ring-2 ring-white");
			} else if (pdl_color=="#3b82f6") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-blue-500 border-2 border-transparent ring-2 ring-white");
			} else if (pdl_color=="#22c55e") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-green-500 border-2 border-transparent ring-2 ring-white");
			} else if (pdl_color=="#9333ea") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-purple-600 border-2 border-transparent ring-2 ring-white");
			}

		}

		btn.addEventListener("click", () => {
			const color = btn.getAttribute("data-pdl-color");
			if (color) {
				settings.paddleColor = color;
				saveSettings(settings);
				UpdateSettings();
			}
		});
	});
}

export function PaddleSpeedSetting() {
	const paddleSpeedInput = document.getElementById("paddle-speed-value") as HTMLInputElement;
	if (paddleSpeedInput) {
		paddleSpeedInput.value = settings.paddleSpeed.toString();

		paddleSpeedInput.addEventListener("input", () => {
			settings.paddleSpeed = parseInt(paddleSpeedInput.value, 10);
			saveSettings(settings);
		});
	}
}

export function BallColorSetting() {
	const ballColorButtons = document.querySelectorAll<HTMLDivElement>("[data-ball-color]");
	ballColorButtons.forEach((btn) => {
		const ball_color = btn.getAttribute("data-ball-color");
		if (localStorage.getItem(STORAGE_KEY) == null)
			settings.ballColor = defaultSettings.ballColor;
		if (ball_color == settings.ballColor) {

			if (ball_color=="#ffffff") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			} else if (ball_color=="#000000") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-black border-2 border-transparent ring-2 ring-white");
			} else if (ball_color=="#ef4444") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-red-500 border-2 border-transparent ring-2 ring-white");
			} else if (ball_color=="#ec4899") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-pink-500 border-2 border-transparent ring-2 ring-white");
			} else if (ball_color=="#6366f1") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-indigo-500 border-2 border-transparent ring-2 ring-white");
			}

		}
		btn.addEventListener("click", () => {
			const color = btn.getAttribute("data-ball-color");
			if (color) {
				settings.ballColor = color;
				saveSettings(settings);
				UpdateSettings();
			}
		});
	});
}

export function BallSizeSetting() {
	const ballSizeInput = document.getElementById("ball-size") as HTMLInputElement;

	if (ballSizeInput) {
		ballSizeInput.value = settings.ballSize.toString();

		ballSizeInput.addEventListener("input", () => {
			settings.ballSize = parseInt(ballSizeInput.value, 10);
			saveSettings(settings);
		});
	}
}

export function BallSpeedSetting() {
	const ballSpeedInput = document.getElementById("ball-speed") as HTMLInputElement;

	if (ballSpeedInput) {
		if (localStorage.getItem(STORAGE_KEY) == null)
			settings.ballSpeed = defaultSettings.ballSpeed;
		ballSpeedInput.value = settings.ballSpeed.toString();

		ballSpeedInput.addEventListener("input", () => {
			settings.ballSpeed = parseInt(ballSpeedInput.value, 10);
			saveSettings(settings);
		});
	}
}

export function BallShapeSetting() {
	const ballShapeButtons = document.querySelectorAll<HTMLDivElement>("[data-ball-shape]");
	ballShapeButtons.forEach((btn) => {
		const ballShape = btn.getAttribute("data-ball-shape");
		if (localStorage.getItem(STORAGE_KEY) == null)
			settings.ballShape = defaultSettings.ballShape;
		if (ballShape == settings.ballShape) {
			if (ballShape == "round") {
				btn.setAttribute("class", "w-10 h-10 rounded-full cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			} else if (ballShape == "square") {
				btn.setAttribute("class", "w-10 h-10 rounded cursor-pointer bg-white border-2 border-transparent ring-2 ring-cyan-500");
			}
		}
		
		btn.addEventListener("click", () => {
			const Shape = btn.getAttribute("data-ball-shape");
			if (Shape) {
				settings.ballShape = Shape;
				saveSettings(settings);
				UpdateSettings();
			}
		});
	});
}

export function SettingsResetButton() {
	const reset = document.querySelectorAll("[reset-btn]")
	reset.forEach((btn) => {
		btn.addEventListener("click", () => {
			resetSettings();
		});
	});
}


export function LanguageSetting() {
	const langButtons = document.querySelectorAll<HTMLImageElement>("[data-lang]");
	langButtons.forEach((flag) => {
		flag.addEventListener("click", () => {
			const lang: Lang = flag.getAttribute("data-lang") as Lang;
			if (lang) {
				settings.language = lang;
				saveSettings(settings);
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