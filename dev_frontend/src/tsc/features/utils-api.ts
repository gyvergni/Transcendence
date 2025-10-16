import { getTranslatedKey } from "../translation.js";

export const API_BASE_URL = "https://127.0.0.1:8443/api";

export function parseApiErrorMessage(message: string): string {
	// Enlève "body/xxx " au début si présent
	return message.replace(/body\/\w+\s+/g, "");
}

export function getApiErrorText(err: any): string {
	console.log(err);
	if (!err) return "Internal Error";
	if (typeof err === "string") return getTranslatedKey(err);
	if (err.errorKey) return getTranslatedKey(err.errorKey);
	if (err.message) return parseApiErrorMessage(err.message);
	return "Internal Error";
}