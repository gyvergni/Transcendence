import { setContentView } from "../display/viewHandler.js";
import { API_BASE_URL } from "../utils/utilsApi.js";

export async function authenticateWithWebSocket(token: string): Promise<boolean> {
    try {
        const response = await fetch(API_BASE_URL + "/users/auth/validate-jwt-token", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("JWT token validation failed");
            return false;
        }
		if (!token) {
			console.error("No access token found");
			return false;
		}
        await connectWebSocket(token);
        return true;

    } catch (error) {
        console.error("Authentication failed:", error);
        return false;
    }
}

async function authenticateWithWebSocketTemp(token: string): Promise<boolean> {
	try {
        const response = await fetch(API_BASE_URL + "/users/auth/validate-jwt-token", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("JWT token validation failed");
            return false;
        }
        await connectWebSocket(token);
        return true;

    } catch (error) {
        console.error("Authentication failed:", error);
        return false;
    }
}

export async function checkTokenValidity(): Promise<boolean> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        setContentView("views/login.html");
        return false;
    }

    const isAuthenticated = await authenticateWithWebSocket(token);
    
    if (!isAuthenticated) {
        localStorage.removeItem("accessToken");
        setContentView("views/login.html");
        return false;
    }

    return true;
}


export async function loginWithWebSocket(accessToken: string): Promise<boolean> {
    const isAuthenticated = await authenticateWithWebSocketTemp(accessToken);
    
    if (!isAuthenticated) {
		localStorage.removeItem("accessToken");
        return false;
    }
	localStorage.setItem("accessToken", accessToken);
    return true;
}

let websocket: WebSocket | null = null;
let authTimeout: NodeJS.Timeout | null = null;
let isAuthResponseReceived = false;
let pingInterval: NodeJS.Timeout | null = null;
let isIntentionalClose = false;

function connectWebSocket(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            resolve(true);
            return;
        }
        
        if (websocket) {
            websocket.close();
        }

		const wsPath = `${window.location.origin}/ws`;
        websocket = new WebSocket(wsPath);
        isAuthResponseReceived = false;
        isIntentionalClose = false;

        websocket.onopen = () => {
            if (token) {
                websocket?.send(JSON.stringify({ type: "auth", token }));
                
				pingInterval = setInterval(() => {
					if (websocket && websocket.readyState === WebSocket.OPEN) {
						websocket.send(JSON.stringify({ type: "ping" }));
					}
				}, 30000);

                authTimeout = setTimeout(() => {
                    if (!isAuthResponseReceived) {
                        console.error("WebSocket auth timeout - Server did not respond");
                        disconnectWebSocket();
                        reject(new Error("WebSocket authentication timeout"));
                    }
                }, 5000);
            } else {
                reject(new Error("No access token found"));
            }
        };

        websocket.onmessage = (event) => {
            
            isAuthResponseReceived = true;
            if (authTimeout) {
                clearTimeout(authTimeout);
                authTimeout = null;
            }

            try {
                const data = JSON.parse(event.data);

                if (data.type === 'status' && data.online) {
                    resolve(true);
                } else if (data.type === 'pong' && data.online) {
					resolve(true);
				} else if (data.type === 'error') {
                    console.error("WebSocket auth error:", data.message);
                    disconnectWebSocket();
                    reject(new Error(`WebSocket auth error: ${data.message}`));
                } else {
                    console.warn("Unexpected message type:", data.type);
                    resolve(true);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
                reject(new Error("Failed to parse WebSocket response"));
            }
        };

        websocket.onclose = (event) => {
			if (pingInterval) {
				clearInterval(pingInterval);
				pingInterval = null;
			}
            if (authTimeout) {
                clearTimeout(authTimeout);
                authTimeout = null;
            }
            
            const wasAuthenticated = isAuthResponseReceived;
            
            websocket = null;
            isAuthResponseReceived = false;
            
            if (!wasAuthenticated) {
                reject(new Error("WebSocket connection closed before authentication"));
            } else if (isIntentionalClose) {
                isIntentionalClose = false;
            } else {
                console.error("WebSocket connection lost unexpectedly - redirecting to login");
                localStorage.removeItem("accessToken");
                setContentView("views/login.html");
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            
            if (pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }
            
            if (authTimeout) {
                clearTimeout(authTimeout);
                authTimeout = null;
            }
            
            if (isAuthResponseReceived && !isIntentionalClose) {
                console.error("WebSocket error after authentication - redirecting to login");
                localStorage.removeItem("accessToken");
                setContentView("views/login.html");
            } else if (!isAuthResponseReceived) {
                reject(new Error("WebSocket connection error"));
            }
        };
    });
}

export function markWebSocketCloseAsIntentional() {
	isIntentionalClose = true;
}

export function disconnectWebSocket() {
	if (pingInterval) {
		clearInterval(pingInterval);
		pingInterval = null;
	}

    if (authTimeout) {
        clearTimeout(authTimeout);
        authTimeout = null;
    }
    
    if (websocket) {
        isIntentionalClose = true;
        websocket.close();
        websocket = null;
    }
    
    isAuthResponseReceived = false;
	setContentView("views/login.html");
}

export async function a2fStatus(data: any) {
	let token;
	if (data) {
		try {
			token = data.accessToken;
		} catch (error) {
			console.error("Error during temp connect to check A2F:", error);
			return -1;
		}
	} else {
		token = localStorage.getItem("accessToken");
	}
	if (!token) {
		console.error("No token found, cannot check 2FA status");
		return -1;
	}
	try {
		const response = await fetch(API_BASE_URL + "/users/auth/two-factor-auth/status", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});
		if (response.ok) {
			const data = await response.json();
			return data.status;
		} else {
			console.error("Failed to fetch 2FA status, retry later:", response.statusText);
			return -2;
		}
	} catch (error) {
		console.error("Error checking 2FA status, retry later:", error);
		return -2;
	}
}