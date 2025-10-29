import {z} from 'zod';
import { errorResponses } from '../utils/http';

export const getGuestListSchema = {
    tags: ["guest"],
    response: {
        200: z.object({
            message: z.string().describe("Guest list retrieved successfully").optional(),
			user: z.string().describe("Pseudo of the user who is the host"),
            numberOfGuests: z.number().describe("Number of guests in the list").optional(),
            guests: z.array(z.object({
                id: z.number().describe("ID of the guest"),
                pseudo: z.string().describe("Pseudo of the guest"),
            })).describe("List of guests").optional(),
        }),
        400: errorResponses[400].describe("Bad Request"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export const createGuestSchema = {
    tags: ["guest"],
    body: z.object({
        pseudo: z.string().min(3, "Pseudo is required").max(10, "Pseudo must be 10 characters or less").describe("Pseudo of the guest"),
    }),
    response: {
        201: z.object({
            message: z.string().describe("Guest created successfully"),
            userPseudo: z.string().describe("Pseudo of the user who created the guest"),
            guestId: z.number().describe("ID of the created guest"),
            guestPseudo: z.string().describe("Pseudo of the created guest")
        }),
        400: errorResponses[400].describe("Bad Request"),
        409: errorResponses[409].describe("Conflict, Pseudo already exists"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
} as const;

export type CreateGuestBody = z.infer<typeof createGuestSchema.body>;

export const deleteGuestSchema = {
    tags: ["guest"],
    body: z.object({
        guestPseudo: z.string().describe("Pseudo of the guest to delete").min(1, "Guest pseudo is required")
    }),
    response: {
        200: z.object({
            message: z.string().describe("Guest deleted successfully")
        }),
        404: errorResponses[404].describe("Not Found, Guest does not exist"),
        500: errorResponses[500].describe("Internal Server Error"),
    }
}

export type DeleteGuestBody = z.infer<typeof deleteGuestSchema.body>;