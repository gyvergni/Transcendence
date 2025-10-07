import { setContentView } from "../views.js";
import { API_BASE_URL, getApiErrorText } from "./utils-api.js";
import { loginWithWebSocket } from "./auth.js";

const temp = false;

function verifySignupInputDatas(input: any) {
	if (input.username === "a")
		return "BAD USERNAME";
	return "true";
}

export async function signupUser(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	form.classList.add("was-validated");
	try {
		const usernameDiv = document.querySelector('#signup-username')!;
		const passwordDiv = document.querySelector('#signup-password')!;
		const passwordVerifyDiv = document.querySelector('#signup-verify-password')!;
		usernameDiv.classList.remove("wrong-signup-input");
		passwordDiv.classList.remove("wrong-signup-input");
		passwordVerifyDiv.classList.remove("wrong-signup-input");

		const formData = new FormData(form);
		const username = formData.get("signup-username");
		const password = formData.get("signup-password");
		const verifyPassword = formData.get("signup-verify-password");
		const errorDiv = document.querySelector("#login-error-message") as HTMLDivElement;
		if (!username || !password) {
			errorDiv.textContent = "Username and password are required";
			usernameDiv.classList.add("wrong-signup-input")
			return ;
		} else if (password !== verifyPassword) {
			errorDiv.textContent = "Password and Verify Password didn't match";
			passwordDiv.classList.add("wrong-signup-input");
			passwordVerifyDiv.classList.add("wrong-signup-input");
			return ;
		}
		const valid = verifySignupInputDatas({username, password});
		if (valid != "true") {
			errorDiv.textContent = valid;
			usernameDiv.classList.add("wrong-signup-input");
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
				errorDiv.textContent = "Internal Error";
			}
			if (signupResponse.status === 409) {
				const usernameDiv = document.querySelector('#signup-username')!;
				usernameDiv.classList.add("wrong-signup-input");
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
		const contentBox = document.querySelector("#content-box")! as HTMLElement;
		contentBox.classList.remove("w-[430px]");

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
	
	// setContentView("views/home.html");
}