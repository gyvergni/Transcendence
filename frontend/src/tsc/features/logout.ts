import { setContentView } from "../display/viewHandler.js";
import { disconnectWebSocket } from "./auth.js";
import { API_BASE_URL, getApiErrorText } from "../utils/utilsApi.js";

export async function logoutUser() {
	try {
		const logoutResponse = await fetch(API_BASE_URL + "/users/logout", {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("accessToken")}`
			}
		});
		if (!logoutResponse.ok) {
			try { console.error("Logout failed:", getApiErrorText(await logoutResponse.json())); } catch { console.error("Logout failed"); }
			return;
		}
		localStorage.removeItem("accessToken");
		setContentView("views/login.html", {replace: true});
		disconnectWebSocket();
	} catch (error) {
		console.error("Logout failed:", error);
	}
}