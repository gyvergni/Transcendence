import { API_BASE_URL, getApiErrorText} from "../utils/utilsApi.js";
import { toggleBackButton } from "../display/animations.js";
import { setContentView } from "../display/viewHandler.js";
import { a2fStatus, checkTokenValidity } from "./auth.js";
import { getTranslatedKey } from "../utils/translation.js";

export async function accountEditAvatar() {
	const fileInput = document.querySelector("#account-avatar-file") as HTMLInputElement | null;
	if (!fileInput) return ;
	fileInput.click();

	fileInput.onchange = async () => {
		const file = fileInput.files?.[0];
		if (!file) return ;

		const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
		if (!allowedTypes.includes(file.type)) {
			alert(getTranslatedKey("account.avatar.upload.invalid-type"));
			console.error("Invalid file type. Only PNG and JPG are allowed.");
			fileInput.value = ''; // Reset input
			return;
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			alert(getTranslatedKey("account.avatar.upload.too-large"));
			console.error("File too large. Maximum size is 5MB.");
			fileInput.value = ''; // Reset input
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(API_BASE_URL + '/users/avatar', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: formData
		});
		if (response.status === 413) {
			console.error("Failed to upload avatar: File too large, 5MB max");
			alert(getTranslatedKey("account.avatar.upload.too-large"));
			fileInput.value = ''; // Reset input
			return ;
		}
		if (!response.ok) {
			try { 
				const errorData = await response.json();
				alert(getApiErrorText(errorData));
				console.error("Failed to upload avatar:", getApiErrorText(errorData)); 
			} catch {
				alert(getTranslatedKey("account.avatar.upload.error"));
			}
			fileInput.value = ''; // Reset input
			return ;
		}
		const data = await response.json();
		const avatarUrl = API_BASE_URL + data.avatarUrl + '?t=' + Date.now(); // Cache busting
		const avatarImg = document.querySelector("#account-avatar-img")! as HTMLImageElement;
		avatarImg.src = avatarUrl;
		fileInput.value = ''; // Reset input après succès
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
			try { console.error("Failed to load avatar:", getApiErrorText(await response.json())); } catch {}
			return ;
		}
		const data = await response.json();
		const avatarUrl = API_BASE_URL + data.avatarUrl + '?t=' + Date.now(); // Cache busting
		const avatarImg = document.querySelector("#account-avatar-img")! as HTMLImageElement;
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
		if (!response.ok) {
			try { console.error("Failed to load account info:", getApiErrorText(await response.json())); } catch {}
			return ;
		}
		const data = await response.json();
		const usernameElement = document.querySelector("#account-displayed-username")! as HTMLSpanElement;
		const igUsernameElement = document.querySelector("#account-displayed-igUsername")! as HTMLSpanElement;
		const avatarUrl = API_BASE_URL + '/public/avatars/' + data.avatar + '?t=' + Date.now();
		const avatarImg = document.querySelector("#account-avatar-img")! as HTMLImageElement;
		const toggle2FA = document.querySelector("#toggle-2fa")! as HTMLButtonElement;
		usernameElement.textContent = data.pseudo;
		igUsernameElement.textContent = data.game_username;
		avatarImg.src = avatarUrl;
		const A2fStatus = await a2fStatus(null);
		if (A2fStatus === -1) {
			console.error("No token found, cannot check 2FA status");
			return ;
		} else if (A2fStatus === -2) {
			console.error("Failed to fetch 2FA status, retry later");
			return ;
		}
		if (A2fStatus === true) {
			toggle2FA.setAttribute("data-i18n", "account.butt.2FA.disable");
			toggle2FA.textContent = getTranslatedKey("account.butt.2FA.disable");
			toggle2FA.classList.remove("bg-green-500");
			toggle2FA.classList.remove("hover:bg-green-700");
			toggle2FA.classList.add("bg-red-500");
			toggle2FA.classList.add("hover:bg-red-700");
		} else {
			toggle2FA.setAttribute("data-i18n", "account.butt.2FA.enable");
			toggle2FA.textContent = getTranslatedKey("account.butt.2FA.enable");
			toggle2FA.classList.remove("bg-red-500");
			toggle2FA.classList.remove("hover:bg-red-700");
			toggle2FA.classList.add("bg-green-500");
			toggle2FA.classList.add("hover:bg-green-700");
		}
	} catch (error) {
		console.error("Failed to load account info:", error);
	}
}

function verifyIgUsernameInputData(igUsername: string) {
	if (igUsername.match(/[^a-zA-Z0-9_]/))
		return getTranslatedKey("signup.username.invalid-chars");
	if (igUsername.length < 3 || igUsername.length > 10)
		return getTranslatedKey("signup.username.length");
	return "true";
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
		const valid = verifyIgUsernameInputData(igUsername);
		if (valid != "true") {
			const errorDiv = document.querySelector("#edit-igUsername-error") as HTMLDivElement;
			errorDiv.textContent = valid;
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
			errorDiv.textContent = getApiErrorText(errorData);
			console.error("Failed to change IG username:", getApiErrorText(errorData));
			return ;
		}
		loadAccountInfo();
		toggleBackButton(true, () => {
			history.back();
		});
		document.querySelector("#edit-igUsername-form-container")?.classList.replace("flex", "hidden");
	} catch (error) {
		console.error("Failed to edit IG username:", error);
	}
}

function verifyPasswordInputData(password: string) {
	if (password.length < 6)
		return getTranslatedKey("signup.password.length");
	return "true";
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
			errorDiv.textContent = getTranslatedKey("account.change-password.mismatch");
			console.error("New password and confirm password do not match");
			return ;
		}

		const valid = verifyPasswordInputData(newPassword);
		if (valid != "true") {
			errorDiv.textContent = valid;
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
			errorDiv.textContent = getApiErrorText(errorData);
			console.error("Failed to change password:", getApiErrorText(errorData));
			return ;
		}
		toggleBackButton(true, () => {
			history.back();
		});
		document.querySelector("#edit-password-form-container")?.classList.replace("flex", "hidden");
	} catch (error) {
		console.error("Failed to edit password:", error);
	}
}

export async function account2FAHandler() {
	const A2fStatus = await a2fStatus(null);
	if (A2fStatus === -1) {
		console.error("No token found, cannot check 2FA status");
		return ;
	}
	if (A2fStatus === -2) {
		console.error("Failed to fetch 2FA status, retry later");
		return ;
	}
	try {
		if (A2fStatus === true) {
			const form2faDisable = document.querySelector("#edit-2fa-disable-form-container")! as HTMLDivElement;
			const passwordInput = form2faDisable.querySelector("#disable-2fa-password") as HTMLInputElement;
			const tokenInput = form2faDisable.querySelector("#disable-2fa-token") as HTMLInputElement;
			passwordInput.value = "";
			tokenInput.value = "";
			form2faDisable.classList.replace("hidden", "flex");
			toggleBackButton(false);
			const errorDiv = document.querySelector("#div-disable-2fa-error") as HTMLDivElement;
			const successDiv = document.querySelector("#div-disable-2fa-success") as HTMLDivElement;
			if (errorDiv) errorDiv.textContent = "";
            if (successDiv) successDiv.textContent = "";
		} else {
			const form2fa = document.querySelector("#edit-2fa-setup-form-container")! as HTMLDivElement;
			const tokenInput = form2fa.querySelector("#input-2fa-token") as HTMLInputElement;
			tokenInput.value = "";
			form2fa.classList.replace("hidden", "flex");
			toggleBackButton(false);
			const res = await setup2FA();
		}
	} catch (error) {
		console.error("Failed to handle 2FA:", error);
		return ;
	}
}

let tempSessionId: string | null = null;

export async function setup2FA() {
	if (await checkTokenValidity() === false) {
		console.error("Invalid token, cannot enable 2FA");
		return ;
	}
	const errorDiv = document.querySelector("#div-2fa-error") as HTMLDivElement;
	const successDiv = document.querySelector("#div-2fa-success") as HTMLDivElement;
	if (errorDiv) {
		errorDiv.textContent = "";
	}
	if (successDiv) {
		successDiv.textContent = "";
	}
	const token = localStorage.getItem("accessToken")!;

	try {
		const response = await fetch(API_BASE_URL + '/users/auth/two-factor-auth/setup', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
			}
		});
		if (!response.ok) {
			const errorData = await response.json();
			errorDiv.textContent = getApiErrorText(errorData);
			console.error("Failed to enable 2FA:", getApiErrorText(errorData));
			return ;
		}
		const data = await response.json();
		
		tempSessionId = data.sessionId;
		const qrCodeUrl = data.qrCode;
		const qrCodeBlob = await fetch(qrCodeUrl).then(res => res.blob());
		const qrCodeDataUrl = URL.createObjectURL(qrCodeBlob);
		const divQrCode = document.querySelector("#div-qr-code")! as HTMLDivElement;
		const qrCodeImg = divQrCode.querySelector("#qr-code-2fa") as HTMLImageElement | null;
		if (qrCodeImg) {
			qrCodeImg.src = qrCodeDataUrl;
			qrCodeImg.style.display = "block";
		}else {
			const qrCodeImg = document.createElement("img");
			qrCodeImg.id = "qr-code-2fa";
			qrCodeImg.alt = "2FA QR Code";
			qrCodeImg.src = qrCodeDataUrl;
			divQrCode.appendChild(qrCodeImg);
		}
	} catch (error) {
		console.error("Failed to enable 2FA:", error);
		return ;
	}

}

export async function enable2FA(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	const errorDiv = document.querySelector("#div-2fa-error") as HTMLDivElement;

	if (!tempSessionId) {
		errorDiv.textContent = getTranslatedKey("account.2FA.nosession");
		console.error("No session ID found, cannot enable 2FA");
		return ;
	}
	try {
		const formData = new FormData(form);
		const token = formData.get("input-2fa-token") as string;
		if (!token) {
			errorDiv.textContent = getTranslatedKey("account.2FA.enable.token.required");
			console.error("Token is required to enable 2FA");
			return ;
		}
		const response = await fetch(API_BASE_URL + '/users/auth/two-factor-auth/enable', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: JSON.stringify({ sessionId: tempSessionId, token })
		})

		if (!response.ok) {
			const errorData = await response.json();
			errorDiv.textContent = getApiErrorText(errorData);
			console.error("Failed to enable 2FA:", response.statusText);
			return ;
		}

		tempSessionId = null;

		errorDiv.textContent = "";
		const successDiv = document.querySelector("#div-2fa-success") as HTMLDivElement;
		successDiv.textContent = getTranslatedKey("account.2FA.enable.success");
		setTimeout(() => {
			const form2fa = document.querySelector("#edit-2fa-setup-form-container") as HTMLDivElement;
			loadAccountInfo();
			   if (form2fa) {
				form2fa.classList.add("hidden");
				form2fa.classList.remove("flex");
			}
			toggleBackButton(true, () => {
				history.back();
			});
		}, 2000);
	} catch (error) {
		console.error("Failed to enable 2FA:", error);
		errorDiv.textContent = "An error occurred while enabling 2FA";
		return ;
	}
}

export async function disable2FA(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	const errorDiv = document.querySelector("#div-disable-2fa-error") as HTMLDivElement;
	const successDiv = document.querySelector("#div-disable-2fa-success") as HTMLDivElement;

	try {
		const formData = new FormData(form);
		const password = formData.get("disable-2fa-password") as string;
        const token = formData.get("disable-2fa-token") as string;
		if (!password) {
            errorDiv.textContent = getTranslatedKey("account.2FA.disable.password.required");
            return;
        }
        
        if (!token) {
            errorDiv.textContent = getTranslatedKey("account.2FA.disable.token.required");
            return;
        }

		const response = await fetch(API_BASE_URL + "/users/auth/two-factor-auth/disable", {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: JSON.stringify({ password, token })
		});

		if (!response.ok) {
			const errorData = await response.json();
			errorDiv.textContent = getApiErrorText(errorData);
			console.error("Failed to disable 2FA", getApiErrorText(errorData));
			return ;
		}

		errorDiv.textContent = "";
		successDiv.textContent = getTranslatedKey("account.2FA.disable.success");
		setTimeout(() => {
			const form2faDisable = document.querySelector("#edit-2fa-disable-form-container") as HTMLDivElement;
			loadAccountInfo();
			if (form2faDisable) {
				form2faDisable.classList.add("hidden");
				form2faDisable.classList.remove("flex");
			}
			toggleBackButton(true, () => {
				history.back();
			});
		}, 2000);
	} catch (error) {
		console.error("Failed to disable 2FA:", error);
		errorDiv.textContent = "An error occurred while disabling 2FA";
		return ;
	}
}
