import { setContentView } from "../display/viewHandler.js";
import { API_BASE_URL, getApiErrorText } from "../utils/utilsApi.js";
import { loginWithWebSocket } from "./auth.js";
import { getTranslatedKey } from "../utils/translation.js";

const temp = false;

export function verifySignupInputDatas(input: any) {
	const errors: { field: 'username' | 'password' | 'both-passwords', message: string }[] = [];
	
	if (input.username && input.username.match(/[^a-zA-Z0-9_]/))
		errors.push({ field: 'username', message: getTranslatedKey("signup.username.invalid-chars") });
	if (input.username && (input.username.length < 3 || input.username.length > 10))
		errors.push({ field: 'username', message: getTranslatedKey("signup.username.length") });
	if (input.password && input.password.length < 6)
		errors.push({ field: 'both-passwords', message: getTranslatedKey("signup.password.length") });
	
	if (errors.length > 0) {
		return errors[0];
	}
	return null;
}

export async function signupUser(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	try {
		const usernameDiv = document.querySelector('#signup-username')!;
		const passwordDiv = document.querySelector('#signup-password')!;
		const passwordVerifyDiv = document.querySelector('#signup-verify-password')!;
		usernameDiv.classList.remove("!border-red-600");
		passwordDiv.classList.remove("!border-red-600");
		passwordVerifyDiv.classList.remove("!border-red-600");

		const formData = new FormData(form);
		const username = formData.get("signup-username");
		const password = formData.get("signup-password");
		const verifyPassword = formData.get("signup-verify-password");
		const errorDiv = document.querySelector("#login-error-message") as HTMLDivElement;
		
		// Check if fields are empty
		if (!username || !password || !verifyPassword) {
			errorDiv.textContent = getTranslatedKey("login.username-password.required");
			if (!username) usernameDiv.classList.add("!border-red-600");
			if (!password) passwordDiv.classList.add("!border-red-600");
			if (!verifyPassword) passwordVerifyDiv.classList.add("!border-red-600");
			return ;
		}
		
		// Check if passwords match
		if (password !== verifyPassword) {
			errorDiv.textContent = getTranslatedKey("signup.pass-mismatch");
			passwordDiv.classList.add("!border-red-600");
			passwordVerifyDiv.classList.add("!border-red-600");
			return ;
		}
		
		// Validate input data
		const valid = verifySignupInputDatas({username, password});
		if (valid !== null) {
			errorDiv.textContent = valid.message;
			if (valid.field === 'username') {
				usernameDiv.classList.add("!border-red-600");
			} else if (valid.field === 'password') {
				passwordDiv.classList.add("!border-red-600");
			} else if (valid.field === 'both-passwords') {
				passwordDiv.classList.add("!border-red-600");
				passwordVerifyDiv.classList.add("!border-red-600");
			}
			return ;
		}

		const signupResponse = await fetch(API_BASE_URL + "/users/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ pseudo: username, password })
		})

		if (!signupResponse.ok) {
			const errorDiv = document.querySelector("#login-error-message") as HTMLDivElement;
			try {
				const err = await signupResponse.json();
				errorDiv.textContent = getApiErrorText(err);
			} catch {
				errorDiv.textContent = getTranslatedKey("error.internal");
			}
			if (signupResponse.status === 409) {
				const usernameDiv = document.querySelector('#signup-username')!;
				usernameDiv.classList.add("!border-red-600");
			}
			return ;
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
			try { errorDiv.textContent = getApiErrorText(await loginResponse.json()); } catch { errorDiv.textContent = "Internal Error"; }
			return ;
		}
		const data = await loginResponse.json();
		localStorage.setItem("accessToken", data.accessToken);
		const success = await loginWithWebSocket(data.accessToken);
		if (!success) {
			errorDiv!.textContent = "Connection failed. WebSocket required for login. Try to login.";
			setTimeout(() => { setContentView("views/login.html"); }, 3000);
			return ;
		} else {
			errorDiv!.textContent = "";
			setContentView("views/home.html");
		}

	} catch (error) {
		console.error("Signup failed:", error);
	}
}