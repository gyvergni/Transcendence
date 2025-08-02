import speakeasy from "speakeasy";
import qrcode from "qrcode";
import prisma from "../utils/prisma";

import { FastifyRequest, FastifyReply } from "fastify";

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

	static async enableTwoFactorAuth(userId: number, secret: string) {
		if (!this.verifyToken(secret, secret)) {
			throw new Error("Invalid verification code");
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

// interface TwoFactorAuthRequest extends FastifyRequest {
// 	user: {id: number, pseudo: string};
// }

export async function generateTwoFactorAuthHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		const { secret, qrCodeUrl } = await TwoFactorAuthService.generateTempSecret(userId);
		const qrCodeDataUrl = await TwoFactorAuthService.generateQRCode(qrCodeUrl);

		return reply.status(200).send({
			secret,
			qrCode: qrCodeDataUrl
		});
	} catch (error) {
		console.error("Error generating two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

export async function enableTwoFactorAuthHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const { secret, token } = req.body as { secret: string, token: string };
		const userId = req.user.id;

		await TwoFactorAuthService.enableTwoFactorAuth(userId, secret);
		return reply.status(200).send({ success: true, message: "Two-factor authentication enabled successfully" });
	} catch (error) {
		console.error("Error enabling two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

export async function disableTwoFactorAuthHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id;

		await TwoFactorAuthService.disableTwoFactorAuth(userId);
		return reply.status(200).send({ success: true, message: "Two-factor authentication disabled successfully" });
	} catch (error) {
		console.error("Error disabling two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}

export async function verifyTwoFactorAuthHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId, token } = req.body as { userId: number, token: string };
		const isValid = await TwoFactorAuthService.verifyTwoFactorAuth(userId, token);

		if (isValid) {
			return reply.status(200).send({ success: true, message: "Two-factor authentication verified successfully" });
		} else {
			return reply.status(401).send({ error: "Invalid two-factor authentication token" });
		}
	} catch (error) {
		console.error("Error verifying two-factor auth:", error);
		reply.status(500).send({ error: "Internal Server Error" });
	}
}