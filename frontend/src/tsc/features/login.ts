import { getTranslatedKey } from "../utils/translation.js";
import { setContentView } from "../display/viewHandler.js";
import { a2fStatus, loginWithWebSocket } from "./auth.js";
import { API_BASE_URL, getApiErrorText } from "../utils/utilsApi.js";

let pendingSessionId: string | null = null;

export async function loginUser(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	try {
		const usernameInput = document.querySelector('#login-username') as HTMLInputElement;
		const passwordInput = document.querySelector('#login-password') as HTMLInputElement;
		const errorDiv = document.querySelector("#login-error-message") as HTMLDivElement;
		
		usernameInput.classList.remove("!border-red-600");
		passwordInput.classList.remove("!border-red-600");
		
		const formData = new FormData(form);
		const username = formData.get("login-username");
		const password = formData.get("login-password");
		
		if (!username || !password) {
			errorDiv.textContent = getTranslatedKey("login.username-password.required");
			if (!username) usernameInput.classList.add("!border-red-600");
			if (!password) passwordInput.classList.add("!border-red-600");
			return;
		}
		const loginResponse = await fetch(API_BASE_URL + "/users/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ pseudo: username, password })
		});
		if (!loginResponse.ok) {
			const errorDiv = document.querySelector("#login-error-message") as HTMLDivElement;
			try {
				const err = await loginResponse.json();
				errorDiv.textContent = getApiErrorText(err);
			} catch {
				errorDiv.textContent = getTranslatedKey("error.internal");
			}
			usernameInput.classList.add("!border-red-600");
			passwordInput.classList.add("!border-red-600");
			return;
		}

		const data = await loginResponse.json();
		if (await a2fStatus(data) === false) {
			const success = await loginWithWebSocket(data.accessToken);
			if (!success) {
				errorDiv!.textContent = getTranslatedKey("websocket.connection_failed");
				return ;
			} else {
				errorDiv!.textContent = "";
				setContentView("views/home.html", {replace:true});
			}
		} else {
			pendingSessionId = data.loginSessionId;
			showLogin2FADiv();
			return ;
		}
	} catch (error) {
		console.error("Login failed:", error);
        return ;
	}
};

function showLogin2FADiv() {
	const div2FA = document.querySelector("#login-2fa-div") as HTMLDivElement;
	if (div2FA) {
		div2FA.classList.add("flex");
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
			errorDiv.textContent = getApiErrorText(data);
			return;
		}

		pendingSessionId = null;
		const success = await loginWithWebSocket(data.accessToken);

		if (success) {
			const div2FA = document.querySelector("#login-2fa-div")! as HTMLDivElement;
			div2FA.classList.add("hidden");
			div2FA.classList.remove("flex");

			setContentView("views/home.html", {replace : true});
		} else {
			const errorDiv = document.querySelector("#login-2fa-error") as HTMLDivElement;
			errorDiv.textContent = getTranslatedKey("websocket.connection_failed");
			return;
		}

	} catch (error) {
		console.error("2FA login failed:", error);
		const errorDiv = document.querySelector("#login-2fa-error") as HTMLDivElement;
		errorDiv.textContent = getTranslatedKey("login.2FA_connect.error");
		return;
	}
}