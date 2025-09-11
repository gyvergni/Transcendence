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
		setContentView("views/login.html");
		return false;
	} catch (error) {
		console.error("Error validating token:", error);
		setContentView("views/login.html");
		return false;
	}
};

let websocket: WebSocket | null = null;

	export function connectWebSocket() {

	if (websocket && websocket.readyState === WebSocket.OPEN) {
		return ;
	}
	if (websocket) {
		console.log("WebSocket already connected");
		websocket.close();
	}

	websocket = new WebSocket("wss://127.0.0.1:8443/ws");

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
			localStorage.removeItem("accessToken");
			setContentView("views/login.html");
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

export function reconnectWebSocket() {
	if (websocket) {
		websocket.close();
		websocket = null;
	}
	connectWebSocket();
}

export async function a2fStatus(data: any) {
	let token;
	if (data) {
		try {
			token = data.accessToken;
		} catch (error) {
			console.error("Error during temp connect to check A2F:", error);
			return -1;
		}
	} else {
		token = localStorage.getItem("accessToken");
	}
	if (!token) {
		console.error("No token found, cannot check 2FA status");
		return -1;
	}
	try {
		const response = await fetch(API_BASE_URL + "/users/auth/two-factor-auth/status", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});
		if (response.ok) {
			const data = await response.json();
			return data.status;
		} else {
			console.error("Failed to fetch 2FA status, retry later:", response.statusText);
			return -2;
		}
	} catch (error) {
		console.error("Error checking 2FA status, retry later:", error);
		return -2;
	}
}