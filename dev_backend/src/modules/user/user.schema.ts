import {z} from 'zod';
import { errorResponses } from '../utils/http';

export const createUserSchema = {
    tags: ["users"],
    body: z.object({
        pseudo: z.string({
            required_error: "Pseudo is required",
            invalid_type_error: "Pseudo must be a string"
        }).min(3, {
            message: "Pseudo must be at least 3 characters",
        }).max(10, {
            message: "Pseudo must not exceed 10 characters"
        }),
        password: z.string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string"
        }).min(6, {
            message: "Password must be at least 6 characters"
        })
    }),
    response: {
        201: z.object({
            id: z.number(),
            pseudo: z.string(),
        }),     
        400: errorResponses[400].describe("Bad Request"),
        409: errorResponses[409].describe("Conflict, Pseudo already exists"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type CreateUserBody = z.infer<typeof createUserSchema.body>;

export const loginUserSchema = {
    tags: ["users"],
    body: z.object({
        pseudo: z.string({
            required_error: "Pseudo is required",
            invalid_type_error: "Pseudo must be a string"
        }),
        password: z.string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string"
        })
    }),
    response: {
        200: z.object({
            accessToken: z.string().optional(),
            message: z.string().optional(),
            loginSessionId: z.string().optional(),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized, Invalid pseudo or password"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type LoginUserInput = z.infer<typeof loginUserSchema.body>;

export const getUsersSchema = {
    tags: ["users"],
    response: {
        200: z.array(z.object({
            id: z.number(),
            pseudo: z.string(),
            game_username: z.string(),
            status: z.boolean(),
        })),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export const getMeSchema = {
    tags: ["users"],
    response: {
        200: z.object({
            id: z.number(),
            pseudo: z.string(),
            game_username: z.string(),
            status: z.boolean(),
			avatar: z.string(),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export const getFriendsSchema = {
	tags: ["users"],
	response: {
		200: z.array(z.object({
				id: z.number(),
				pseudo: z.string(),
				game_username: z.string(),
				status: z.boolean(),
				avatar: z.string(),
			})),
		404: errorResponses[404].describe("Not Found / User has no friends"),
		500: errorResponses[500].describe("Internal Server Error"),
	}
}

export const editFriendSchema = {
    tags: ["users"],
    body: z.object({
        pseudo: z.string({
            required_error: "Pseudo is required",
            invalid_type_error: "Pseudo must be a string"
        })
    }),
    response: {
        201: z.object({
            message: z.string().describe("Friend added / deleted successfully"),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        404: errorResponses[404].describe("User not found"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type AddFriendInput = z.infer<typeof editFriendSchema.body>;

export const changePasswordSchema = {
    tags: ["users"],
    body: z.object({
        oldPassword: z.string({
            required_error: "Old password is required",
            invalid_type_error: "Old password must be a string"}),
        newPassword: z.string({
            required_error: "New password is required",
            invalid_type_error: "New password must be a string"
        }).min(6, {
            message: "New password must be at least 6 characters"
        }),
    }),
    response: {
        200: z.object({
            message: z.string().describe("Password changed successfully"),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        404: errorResponses[404].describe("User not found"),
        422: errorResponses[422].describe("Unprocessable Entity, Invalid old password"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;     

export type ChangePasswordInput = z.infer<typeof changePasswordSchema.body>;

export const changeUsernameSchema = {
    tags: ["users"],
    body: z.object({
        password: z.string({
            required_error: "Old password is required",
            invalid_type_error: "Old password must be a string"}),
        newPseudo: z.string({
            required_error: "New pseudo is required",
            invalid_type_error: "New pseudo must be a string"
        }).min(3, {
            message: "New pseudo must be at least 3 characters"
        }).max(10, {
            message: "New pseudo must not exceed 10 characters",
			
        }),
    }),
    response: {
        200: z.object({
            message: z.string().describe("Game Username changed successfully"),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        404: errorResponses[404].describe("User not found"),
        422: errorResponses[422].describe("Unprocessable Entity, Invalid password"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema.body>;

export const logoutUserSchema = {
    tags: ["users"],
    response: {
        200: z.object({
            message: z.string().describe("User logged out successfully"),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export const changeAvatarSchema = {
    tags: ["users"],
    response: {
        200: z.object({
            message: z.string().describe("Avatar changed successfully"),
			avatarUrl: z.string().describe("URL of the new avatar"),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        404: errorResponses[404].describe("User not found"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export const getAvatarSchema = {
	tags: ["users"],
	response: {
		200: z.object({
			avatarUrl: z.string().describe("Data URL of the user's avatar image")
		}),
		404: errorResponses[404].describe("Not Found, User or avatar does not exist"),
		500: errorResponses[500].describe("Internal Server Error"),
	}
} as const;

export const validateJwtTokenSchema = {
    tags: ["auth"],
    response: {
        200: z.object({
            message: z.string().describe("Token is valid"),
        }),
        401: errorResponses[401].describe("Unauthorized"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

// Status 2FA
export const twoFactorAuthStatusSchema = {
    tags: ["auth"],
    response: {
        200: z.object({
            status: z.boolean().describe("Two-factor authentication enabled status"),
        }),
        401: errorResponses[401].describe("Unauthorized"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

// Setup 2FA (QR code + sessionId)
export const twoFactorAuthSetupSchema = {
    tags: ["auth"],
    response: {
        200: z.object({
            sessionId: z.string().describe("Temporary session ID for 2FA setup"),
            qrCode: z.string().describe("Data URL for QR code"),
        }),
        401: errorResponses[401].describe("Unauthorized"),
        500: z.object({
            error: z.string().describe("Internal Server Error"),
        }),
    }
} as const;

// Enable 2FA
export const twoFactorAuthEnableSchema = {
    tags: ["auth"],
    body: z.object({
        sessionId: z.string().describe("Temporary session ID obtained from setup"),
        token: z.string().describe("TOTP code from authenticator app"),
    }),
    response: {
        200: z.object({
            success: z.boolean().describe("Operation success flag"),
            message: z.string().describe("Result message"),
        }),
        400: z.object({
            error: z.string().describe("Error message"),
            errorKey: z.string().describe("Session expired or invalid - error.auth.session_expired"),
        }),
        401: z.object({
            error: z.string().describe("Error message"),
            errorKey: z.string().describe("Invalid token - account.2FA.invalid_token"),
        }),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type TwoFactorAuthEnableInput = z.infer<typeof twoFactorAuthEnableSchema.body>;

// Disable 2FA
export const twoFactorAuthDisableSchema = {
    tags: ["auth"],
    body: z.object({
        password: z.string().describe("Account password"),
        token: z.string().describe("Current TOTP code"),
    }),
    response: {
        200: z.object({
            success: z.boolean().describe("Operation success flag"),
            message: z.string().describe("Result message"),
        }),
        400: z.object({
            message: z.string().describe("Error message"),
            errorKey: z.string().describe("Password and token required - account.2FA.password_and_token_required"),
        }),
        401: z.object({
            message: z.string().describe("Error message"),
            errorKey: z.string().describe("Invalid password or token - account.2FA.invalid_password or account.2FA.invalid_token"),
        }),
        404: z.object({
            message: z.string().describe("Error message"),
            errorKey: z.string().describe("User not found - error.user.not_found"),
        }),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type TwoFactorAuthDisableInput = z.infer<typeof twoFactorAuthDisableSchema.body>;

// Verify 2FA code (generic)
export const twoFactorAuthVerifySchema = {
    tags: ["auth"],
    body: z.object({
        userId: z.number().describe("User ID to verify 2FA for"),
        token: z.string().describe("TOTP code"),
    }),
    response: {
        200: z.object({
            success: z.boolean().describe("Operation success flag"),
            message: z.string().describe("Result message"),
        }),
        401: z.object({
            error: z.string().describe("Error message"),
            errorKey: z.string().describe("Invalid token - account.2FA.invalid_token"),
        }),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type TwoFactorAuthVerifyInput = z.infer<typeof twoFactorAuthVerifySchema.body>;

// Verify and complete login (2FA step)
export const twoFactorAuthLoginVerifySchema = {
    tags: ["auth"],
    body: z.object({
        loginSessionId: z.string().describe("Pending login session ID"),
        token: z.string().describe("TOTP code"),
    }),
    response: {
        200: z.object({
            accessToken: z.string().describe("JWT access token"),
            message: z.string().describe("Login successful"),
        }),
        400: z.object({
            error: z.string().describe("Error message"),
            errorKey: z.string().describe("Session expired or invalid - error.auth.session_expired"),
        }),
        401: z.object({
            error: z.string().describe("Error message"),
            errorKey: z.string().describe("Invalid token - account.2FA.invalid_token"),
        }),
        404: z.object({
            error: z.string().describe("Error message"),
            errorKey: z.string().describe("User not found - error.user.not_found"),
        }),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type TwoFactorAuthLoginVerifyInput = z.infer<typeof twoFactorAuthLoginVerifySchema.body>;