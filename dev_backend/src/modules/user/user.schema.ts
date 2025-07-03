import {z} from 'zod';
import { errorResponses } from '../utils/http';

export const createUserSchema = {
    tags: ["users"],
    body: z.object({
        pseudo: z.string(),
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
            accessToken: z.string()
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
            status: z.boolean(),
        })),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export const addFriendSchema = {
    tags: ["users"],
    body: z.object({
        pseudo: z.string({
            required_error: "Pseudo is required",
            invalid_type_error: "Pseudo must be a string"
        })
    }),
    response: {
        200: z.object({
            message: z.string().describe("Friend added successfully"),
        }),
        400: errorResponses[400].describe("Bad Request"),
        401: errorResponses[401].describe("Unauthorized"),
        404: errorResponses[404].describe("User not found"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type AddFriendInput = z.infer<typeof addFriendSchema.body>;

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
