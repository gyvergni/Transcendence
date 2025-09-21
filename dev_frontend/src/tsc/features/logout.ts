import { setContentView } from "../views.js";
import { disconnectWebSocket } from "./auth.js";
import { API_BASE_URL } from "./utils-api.js";

export async function logoutUser() {
	try {
		const logoutResponse = await fetch(API_BASE_URL + "/users/logout", {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("accessToken")}`
			}
		});
		if (!logoutResponse.ok) {
			console.error("Logout failed:", logoutResponse.statusText);
			return;
		}
		localStorage.removeItem("accessToken");
		setContentView("views/login.html");
		disconnectWebSocket();
	} catch (error) {
		console.error("Logout failed:", error);
	}
}