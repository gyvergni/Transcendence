import { error } from "console";
import { API_BASE_URL, parseApiErrorMessage } from "./utils-api.js";
import { toggleBackButton } from "../animations.js";
import { setContentView } from "../views.js";

export async function accountEditAvatar() {
	const fileInput = document.querySelector("#account-avatar-file") as HTMLInputElement | null;
	if (!fileInput) return ;
	fileInput.click();

	fileInput.onchange = async () => {
		const file = fileInput.files?.[0];
		if (!file) return ;
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(API_BASE_URL + '/users/avatar', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: formData
		});
		if (!response.ok) {
			console.error("Failed to upload avatar:", response.statusText);
			return ;
		}
		const data = await response.json();
		const avatarUrl = API_BASE_URL + data.avatarUrl + '?t=' + Date.now(); // Cache busting
		const avatarImg = document.querySelector("#account-avatar-img")! as HTMLImageElement;
		avatarImg.src = avatarUrl;
		console.log("Avatar updated successfully:", avatarUrl);
	}
}

export async function loadAccountAvatar() {

	try {
		const response = await fetch(API_BASE_URL + '/users/avatar', {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			}
		});
		if (!response.ok) {
			console.error("Failed to load avatar:", response.statusText);
			return ;
		}
		const data = await response.json();
		const avatarUrl = API_BASE_URL + data.avatarUrl + '?t=' + Date.now(); // Cache busting
		const avatarImg = document.querySelector("#account-avatar-img")! as HTMLImageElement;
		console.log("Avatar loaded successfully:", avatarUrl);
		console.log("Avatar data:", data);
		avatarImg.src = avatarUrl;
	} catch (error) {
		console.error("Failed to load account avatar:", error);
	};
}

export async function loadAccountInfo() {
	try {
		const response = await fetch(API_BASE_URL + '/users/me', {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			}
		});
		// console.log(response);
		if (!response.ok) {
			console.error("Failed to load account info:", response.statusText);
			return ;
		}
		const data = await response.json();
		const usernameElement = document.querySelector("#account-displayed-username")! as HTMLSpanElement;
		const igUsernameElement = document.querySelector("#account-displayed-igUsername")! as HTMLSpanElement;
		const avatarUrl = API_BASE_URL + '/public/avatars/' + data.avatar + '?t=' + Date.now(); // Cache busting
		const avatarImg = document.querySelector("#account-avatar-img")! as HTMLImageElement;

		usernameElement.textContent = data.pseudo;
		igUsernameElement.textContent = data.game_username;
		avatarImg.src = avatarUrl;
	} catch (error) {
		console.error("Failed to load account info 1:", error);
	}
}

export async function editIgUsername(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	try {
		const formData = new FormData(form);
		const igUsername = formData.get("new-igUsername") as string;
		if (!igUsername) {
			console.error("New igUsername is required");
			return ;
		}
		const password = formData.get("igUsername-password") as string;
		if (!password) {
			console.error("Password is required");
			return ;
		}
		const response = await fetch(API_BASE_URL + '/users/change-username', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: JSON.stringify({ newPseudo: igUsername, password })
		})
		if (!response.ok) {
			const errorData = await response.json();
			const errorDiv = document.querySelector("#edit-igUsername-error") as HTMLDivElement;
			errorDiv.textContent = parseApiErrorMessage(errorData.message);
			console.error("Failed to change IG username:", response.statusText);
			return ;
		}
		loadAccountInfo();
		toggleBackButton(true, () => {
			setContentView("views/profile.html");
		});
		document.querySelector("#edit-igUsername-form-container")?.classList.replace("flex", "hidden");
	} catch (error) {
		console.error("Failed to edit IG username:", error);
	}
}

export async function editPassword(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	try {
		const errorDiv = document.querySelector("#edit-password-error") as HTMLDivElement;
		const formData = new FormData(form);
		const oldPassword = formData.get("old-password") as string;
		if (!oldPassword) {
			console.error("Old password is required");
			return ;
		}
		const newPassword = formData.get("new-password") as string;
		if (!newPassword) {
			console.error("New password is required");
			return ;
		}
		const confirmPassword = formData.get("confirm-password") as string;
		if (newPassword !== confirmPassword) {
			errorDiv.textContent = "New password and confirm password do not match";
			console.error("New password and confirm password do not match");
			return ;
		}
		const response = await fetch(API_BASE_URL + '/users/change-password', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
		})
		if (!response.ok) {
			const errorData = await response.json();
			errorDiv.textContent = parseApiErrorMessage(errorData.message);
			console.error("Failed to change password:", response.statusText);
			return ;
		}
		toggleBackButton(true, () => {
			setContentView("views/profile.html");
		});
		document.querySelector("#edit-password-form-container")?.classList.replace("flex", "hidden");
	} catch (error) {
		console.error("Failed to edit password:", error);
	}
}