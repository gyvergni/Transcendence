import { getTranslatedKey } from "../translation.js";
import { checkTokenValidity } from "./auth.js";

export const API_BASE_URL = "https://127.0.0.1:8443/api";

export function parseApiErrorMessage(message: string): string {
	// Enlève "body/xxx " au début si présent
	return message.replace(/body\/\w+\s+/g, "");
}

export function getApiErrorText(err: any): string {
	console.log(err);
	if (!err) return "Internal Error";
	if (typeof err === "string") return getTranslatedKey(err);
	if (err.errorKey && (err.errorKey === "error.auth.no_token" || err.errorKey === "error.auth.invalid_token")) {
		checkTokenValidity();
		return getTranslatedKey(err.errorKey);
	}
	if (err.errorKey) return getTranslatedKey(err.errorKey);
	if (err.message) return parseApiErrorMessage(err.message);
	return "Internal Error";
}