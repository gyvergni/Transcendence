import { setContentView } from "../views.js";
import { API_BASE_URL } from "./utils-api.js";

export async function checkTokenValidity() {
	const token = localStorage.getItem("accessToken");
		// console.log("Token:", token);
		if (!token) {
			console.log("No token found, redirecting to login view");
			setContentView("views/login.html");
			return false;
		}
		// console.log("Token	 found, checking validity...");
	try {
		const response = await fetch(API_BASE_URL + "/users/auth/validate-jwt-token", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});
		// console.log(response);
		if (response.ok) {
			connectWebSocket();
			return true;
		}
		localStorage.removeItem("accessToken");
		return false;
	} catch (error) {
		console.error("Error validating token:", error);
		return false;
	}
};

let websocket: WebSocket | null = null;

export function connectWebSocket() {
	if (websocket) {
		console.log("WebSocket already connected");
		websocket.close();
	}

	websocket = new WebSocket("ws://127.0.0.1:3000/ws");

	websocket.onopen = () => {
		// console.log("WebSocket connection established");
		const token = localStorage.getItem("accessToken");
		if (token) {
			websocket?.send(JSON.stringify({ type: "auth", token }));
		}
	};

	websocket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		// console.log("WebSocket message received:", data);

		if (data.type === 'status' && data.online) {
			console.log("WebSocket connection is online");
		} else if (data.type === 'error') {
			console.error("WebSocket error:", data.message);
			disconnectWebSocket();
		}
	}

	websocket.onclose = (event) => {
		// console.log("WebSocket connection closed", event);
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
		// console.log("WebSocket disconnected");
	}
}