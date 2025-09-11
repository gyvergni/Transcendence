export const API_BASE_URL = "https://127.0.0.1:8443/api";

export function parseApiErrorMessage(message: string): string {
	// Enlève "body/xxx " au début si présent
	return message.replace(/^body\/\w+\s+/, "");
}