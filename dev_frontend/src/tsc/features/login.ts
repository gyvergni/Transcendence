import { setContentView } from "../views.js";
import { a2fStatus, connectWebSocket, reconnectWebSocket } from "./auth.js";
import { API_BASE_URL } from "./utils-api.js";

let pendingSessionId: string | null = null;

export async function loginUser(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	form.classList.add("was-validated"); 
	try {
		const formData = new FormData(form);
		const username = formData.get("login-username");
		const password = formData.get("login-password");
		const errorDiv = document.querySelector("#login-error-message") as HTMLDivElement;
		if (!username || !password) {
			// console.error("Username and password are required");
			errorDiv.textContent = "Username and password are required";
			return;
		}
		const loginResponse = await fetch(API_BASE_URL + "/users/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ pseudo: username, password })
		});
		if (loginResponse.status === 401) {
			// console.error("Login failed:", loginResponse.statusText);
			errorDiv!.textContent = "Invalid username or password";
			return;
		} else if (!loginResponse.ok) {
			errorDiv!.textContent = "Internal Error";
			return ;
		}

		const data = await loginResponse.json();
		console.log("Login successful:", data);
		if (await a2fStatus(data) === false) {
			localStorage.setItem("accessToken", data.accessToken);
			const contentBox = document.querySelector("#content-box")! as HTMLElement;
			contentBox.classList.remove("w-[430px]");
			setContentView("views/home.html");
			reconnectWebSocket();
		} else {
			pendingSessionId = data.loginSessionId;
			showLogin2FADiv();
			return ;
		}
	} catch (error) {
		console.error("Login failed:", error);
	}
};

function showLogin2FADiv() {
	const div2FA = document.querySelector("#login-2fa-div") as HTMLDivElement;
	if (div2FA) {
		div2FA.classList.remove("hidden");
		const input = document.querySelector("#login-2fa-token") as HTMLInputElement;
		const errorDiv = document.querySelector("#login-2fa-error") as HTMLDivElement;
		if (errorDiv) {
			errorDiv.textContent = "";
		}
		if (input) {
			input.value = "";
			input.focus();
		}
	}
}

export async function submitLogin2FA(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	const formData = new FormData(form);
	const token = formData.get("login-2fa-token") as string;

	if (!token || !pendingSessionId) {
		const errorDiv = document.querySelector("#login-2fa-error") as HTMLDivElement;
		errorDiv.textContent = "2FA token is required";
		return;
	}

	try {
		const response = await fetch(API_BASE_URL + "/users/auth/login/2fa-verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				loginSessionId: pendingSessionId,
				token
			})
		});

		const data = await response.json();
		if (!response.ok) {
			const errorDiv = document.querySelector("#login-2fa-error") as HTMLDivElement;
			if (response.status === 401) {
				errorDiv.textContent = "Invalid 2FA token";
			} else {
				errorDiv.textContent = "Internal Error";
			}
			return;
		}

		pendingSessionId = null;
		localStorage.setItem("accessToken", data.accessToken);

		const div2FA = document.querySelector("#login-2fa-div")! as HTMLDivElement;
		div2FA.classList.add("hidden");

		const contentBox = document.querySelector("#content-box")! as HTMLElement;
		contentBox.classList.remove("w-[430px]");

		connectWebSocket();
		setContentView("views/home.html");

	} catch (error) {
		console.error("2FA login failed:", error);
		const errorDiv = document.querySelector("#login-2fa-error") as HTMLDivElement;
		errorDiv.textContent = "2FA login failed. Please try again.";
		return;
	}
}