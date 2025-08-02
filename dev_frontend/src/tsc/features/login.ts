import { setContentView } from "../views.js";
import { a2fStatus, connectWebSocket, reconnectWebSocket } from "./auth.js";
import { API_BASE_URL } from "./utils-api.js";


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
		if (await a2fStatus() === false) {
			const data = await loginResponse.json();
			localStorage.setItem("accessToken", data.accessToken);
			const contentBox = document.querySelector("#content-box")! as HTMLElement;
			contentBox.classList.remove("w-[430px]");
			setContentView("views/home.html");
			reconnectWebSocket();
		} else {
			errorDiv!.textContent = "Two-factor authentication is enabled. Please complete the authentication process.";
			await a2fLogin();
		}
	} catch (error) {
		console.error("Login failed:", error);
	}
};

async function a2fLogin() {
	
}