interface GameSettings {
	paddleSize: number;
	paddleColor: string;
	ballColor: string;
	ballSize: number;
	language: string;
}

// LocalStorage key
const STORAGE_KEY = "pong-settings";

// Default settings
const defaultSettings: GameSettings = {
	paddleSize: 5,
	paddleColor: "#ffffff",
	ballColor: "#ffffff",
	ballSize: 5,
	language: "en",
};

// Load from localStorage (or defaults if empty)
function loadSettings(): GameSettings {
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? JSON.parse(stored) : { ...defaultSettings };
}

// Save settings to localStorage
function saveSettings(settings: GameSettings) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Initialize current settings
const settings: GameSettings = loadSettings();

// ---------- Paddle Size ----------
const paddleSizeInput = document.getElementById("paddle-size-value") as HTMLInputElement;
if (paddleSizeInput) {
	// set slider to saved value
	paddleSizeInput.value = settings.paddleSize.toString();

	paddleSizeInput.addEventListener("input", () => {
		settings.paddleSize = parseInt(paddleSizeInput.value, 10);
		saveSettings(settings);
		console.log("Paddle size saved:", settings.paddleSize);
	});
}

// ---------- Paddle Color ----------
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

// ---------- Ball Color ----------
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

// ---------- Ball Size ----------
const ballSizeInput = document.getElementById("ball-size") as HTMLInputElement;
const ballSizeValue = document.getElementById("ball-size-value");

if (ballSizeInput) {
	// set slider to saved value
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

// ---------- Language Selection ----------
const langButtons = document.querySelectorAll<HTMLImageElement>("[data-lang]");
langButtons.forEach((flag) => {
	flag.addEventListener("click", () => {
		const lang = flag.getAttribute("data-lang");
		if (lang) {
			settings.language = lang;
			saveSettings(settings);
			console.log("Language saved:", settings.language);
		}
	});
});

// Export settings loader for the game
export function getSettings(): GameSettings {
	return loadSettings(); // always returns saved version
}
