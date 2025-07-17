import {UIManager} from "./ui-manager.js";
import {animateContentBoxOut, animateContentBoxIn} from "./animations.js";
import {setContentView} from "./views.js";

const uiManager = new UIManager();
export default uiManager;

export const API_BASE_URL = "http://127.0.0.1:3000/api"

let websocket: WebSocket | null = null;

export function connectWebSocket() {
	if (websocket) {
		websocket.close();
	}

	websocket = new WebSocket("ws://127.0.0.1:3000/ws");

	websocket.onopen = () => {
		console.log("WebSocket connection established");
		const token = localStorage.getItem("accessToken");
		if (token) {
			websocket?.send(JSON.stringify({ type: "auth", token }));
		}
	};

	websocket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("WebSocket message received:", data);

		if (data.type === 'status' && data.online) {
			console.log("User is online");
		} else if (data.type === 'error') {
			console.error("WebSocket error:", data.message);
			disconnectWebSocket();
		}
	}

	websocket.onclose = (event) => {
		console.log("WebSocket connection closed", event);
		websocket = null;
	};

	websocket.onerror = (error) => {
		console.error("WebSocket error:", error);
	};
}

export function disconnectWebSocket() {
	if (websocket) {
		websocket.close();
		websocket = null;
		console.log("WebSocket disconnected");
	}
}

document.addEventListener("keydown", (e) => {
	

	if (e.key === "Escape" && uiManager.getIsAnimating() === false) {
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

async function checkTokenValidity(token: string) {
	try {
		const response = await fetch(API_BASE_URL + "/users/auth/validate-jwt-token");
		if (response.ok) {
			return true;
		}
		return false;
	} catch (error) {
		console.error("Error validating token:", error);
		return false;
	}
};

// Initial DOM setup
document.addEventListener("DOMContentLoaded",  () => {
	// const token = localStorage.getItem("accessToken");
	// console.log("Token:", token);
	// if (!token) {
	// 	setContentView("views/login.html");
	// 	return ;
	// }

	// const isTokenValid = await checkTokenValidity(token);
	// if (!isTokenValid) {
	// 	localStorage.removeItem("accessToken");
	// 	setContentView("views/login.html");
	// 	return ;
	// }
	// console.log("User is authenticated");
	setContentView("views/login.html");
});
