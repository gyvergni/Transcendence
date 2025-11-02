import { getTranslatedKey } from "./translation.js";
import { checkTokenValidity } from "../features/auth.js";

export const API_BASE_URL = `${window.location.origin}/api`;

export function parseApiErrorMessage(message: string): string {
	return message.replace(/body\/\w+\s+/g, "");
}

export function getApiErrorText(err: any): string {
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