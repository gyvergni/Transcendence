import { lookupService } from "dns";
import { setContentView } from "../views.js";
import { API_BASE_URL } from "./utils-api.js";
import { errorMonitor } from "events";
import { connectWebSocket, reconnectWebSocket } from "./auth.js";

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

		if (signupResponse.status === 409) {
			errorDiv.textContent = "Pseudo already exists !";
			usernameDiv.classList.add("wrong-signup-input");
			return ;
		} else if (!signupResponse.ok) {
			errorDiv.textContent = "Internal Error / Bad Request (Probleme schema zod pas le meme que le parsing username)";
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
			errorDiv!.textContent = "Internal Error";
			return ;
		}
		const data = await loginResponse.json();
		localStorage.setItem("accessToken", data.accessToken);
		const contentBox = document.querySelector("#content-box")! as HTMLElement;
		contentBox.classList.remove("w-[430px]");
		setContentView("views/home.html");
		reconnectWebSocket();

	} catch (error) {
		console.error("Signup failed:", error);
	}
	
	// setContentView("views/home.html");
}