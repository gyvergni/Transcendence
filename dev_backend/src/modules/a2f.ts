import speakeasy from "speakeasy";
import qrcode from "qrcode";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";

import { FastifyRequest, FastifyReply } from "fastify";
import { TwoFactorAuthDisableInput, TwoFactorAuthEnableInput, TwoFactorAuthLoginVerifyInput, TwoFactorAuthVerifyInput } from "./user/user.schema";
import crypto from "crypto";

export class TwoFactorAuthService {
	static async generateTempSecret(userId: number) {
		const user = await prisma.users.findUnique({
			where: { id: userId }
		});
		if (!user) {
			throw new Error("User not found");
		}

		const secret = speakeasy.generateSecret({
			length: 32,
			name: `Transcendence (${user.pseudo})`,
			issuer: "Transcendence"
		});

		return {
			secret: secret.base32,
			qrCodeUrl: secret.otpauth_url!,
		}
	}

	static async generateQRCode(otpauthUrl: string): Promise<string> {
		try {
			return await qrcode.toDataURL(otpauthUrl);
		} catch (error) {
			console.error("Error generating QR code:", error);
			throw new Error("Failed to generate QR code");
		}
	}

	static verifyToken(secret: string, token: string): boolean {
		return speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token: token,
			window: 1,
		});
	}

	static async enableTwoFactorAuth(userId: number, secret: string, token: string) {
		if (!this.verifyToken(secret, token)) {
			return { success: false, message: "Invalid token", errorKey: "account.2FA.invalid_token"  };
		}

		await prisma.twoFactorAuth.update({
			where: { user_id: userId },
			data: {
				status: true,
				secret: secret,
			}
		})
		return { success: true, message: "Two-factor authentication enabled" };
	}

	static async disableTwoFactorAuth(userId: number) {
		await prisma.twoFactorAuth.update({
			where: { user_id: userId },
			data: {
				status: false,
				secret: null,
			}
		});
		return { success: true, message: "Two-factor authentication disabled" };
	}

	static async verifyTwoFactorAuth(userId: number, token: string): Promise<boolean> {
		const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
			where: { user_id: userId }
		});
		if (!twoFactorAuth || !twoFactorAuth.status || !twoFactorAuth.secret) {
			return false;
		}

		return this.verifyToken(twoFactorAuth.secret, token);
	}

	static async getTwoFactorAuthStatus(userId: number) {
		const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
			where: { user_id: userId }
		});
		return {
			enable: twoFactorAuth?.status || false
		}
	}

}

const tempSecret = new Map(); 

export async function generateTwoFactorAuthHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		const { secret, qrCodeUrl } = await TwoFactorAuthService.generateTempSecret(userId);
		const qrCodeDataUrl = await TwoFactorAuthService.generateQRCode(qrCodeUrl);

		const sessionId = crypto.randomUUID();
		tempSecret.set(sessionId, { secret, userId, expires: Date.now() + 300000 }); // 5 minutes expiration
		return reply.status(200).send({
			sessionId,
			qrCode: qrCodeDataUrl
		});
	} catch (error) {
		console.error("Error generating two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

export async function enableTwoFactorAuthHandler(req: FastifyRequest<{Body: TwoFactorAuthEnableInput}>, reply: FastifyReply) {
	try {
		const { sessionId, token } = req.body as { sessionId: string, token: string };
		const userId = req.user.id;
		const storedData = tempSecret.get(sessionId);

		if (!storedData || storedData.expires < Date.now()) {
			return reply.status(400).send({ error: "Session expired or invalid", errorKey: "error.auth.session_expired" });
		}

		const res = await TwoFactorAuthService.enableTwoFactorAuth(userId, storedData.secret, token);
		if (!res.success) {
			return reply.status(401).send({ error: res.message, errorKey: res.errorKey});
		}
		return reply.status(200).send({ success: true, message: "Two-factor authentication enabled successfully" });
	} catch (error) {
		console.error("Error enabling two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

export async function disableTwoFactorAuthHandler(req: FastifyRequest<{Body: TwoFactorAuthDisableInput}>, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		const { password, token} = req.body as { password: string, token: string};

		if (!password || !token) {
			return reply.status(400).send({ message: "Password and token are required", errorKey: "account.2FA.password_and_token_required" });
		}

		const user = await prisma.users.findUnique({
			where: { id: userId }
		});

		if (!user) {
			return reply.status(404).send({ message: "User not found", errorKey: "error.user.not_found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return reply.status(401).send({ message: "Invalid password", errorKey: "account.2FA.invalid_password" });
		}
		const isTokenValid = await TwoFactorAuthService.verifyTwoFactorAuth(userId, token);
		if (!isTokenValid) {
			return reply.status(401).send({ message: "Invalid 2FA token", errorKey: "account.2FA.invalid_token" });
		}

		await TwoFactorAuthService.disableTwoFactorAuth(userId);
		return reply.status(200).send({ success: true, message: "Two-factor authentication disabled successfully" });
	} catch (error) {
		console.error("Error disabling two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

export async function verifyTwoFactorAuthHandler(req: FastifyRequest<{Body: TwoFactorAuthVerifyInput}>, reply: FastifyReply) {
	try {
		const { userId, token } = req.body as { userId: number, token: string };
		const isValid = await TwoFactorAuthService.verifyTwoFactorAuth(userId, token);

		if (isValid) {
			return reply.status(200).send({ success: true, message: "Two-factor authentication verified successfully" });
		} else {
			return reply.status(401).send({ error: "Invalid two-factor authentication token", errorKey: "account.2FA.invalid_token" });
		}
	} catch (error) {
		console.error("Error verifying two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

let pendingLoginSessions = new Map<string, { userId: number, expires: number }>();

export async function createPendingLoginSession(userId: number): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expires = Date.now() + 300000; // 5 minutes
    pendingLoginSessions.set(sessionId, { userId, expires });
    return sessionId;
}

export async function verifyAndCompleteLogin(req: FastifyRequest<{Body: TwoFactorAuthLoginVerifyInput}>, reply: FastifyReply) {
    try {
        const { loginSessionId, token } = req.body as { loginSessionId: string, token: string };
        const session = pendingLoginSessions.get(loginSessionId);

        if (!session || session.expires < Date.now()) {
            return reply.status(400).send({ error: "Login session expired or invalid", errorKey: "error.auth.session_expired" });
        }

        const isValid = await TwoFactorAuthService.verifyTwoFactorAuth(session.userId, token);
        if (!isValid) {
            return reply.status(401).send({ error: "Invalid 2FA token", errorKey: "account.2FA.invalid_token" });
        }

        pendingLoginSessions.delete(loginSessionId);

        const user = await prisma.users.findUnique({ where: { id: session.userId } });
        if (!user) {
            return reply.status(404).send({ error: "User not found", errorKey: "error.user.not_found" });
        }

        const accessToken = req.server.jwt.sign({ id: user.id, pseudo: user.pseudo });
        
        return reply.status(200).send({ 
            accessToken,
            message: "Login successful" 
        });

    } catch (error) {
        console.error("Error completing 2FA login:", error);
        reply.status(500).send({ error: "Internal Server Error" });
    }
}