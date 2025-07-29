export const API_BASE_URL = "http://127.0.0.1:3000/api";

export function parseApiErrorMessage(message: string): string {
	// Enlève "body/xxx " au début si présent
	return message.replace(/^body\/\w+\s+/, "");
}