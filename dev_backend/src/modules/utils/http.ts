import { FastifyReply } from "fastify";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export function httpError({
    reply,
    message,
    code,
    cause,
	errorKey
}:{
    reply: FastifyReply;
    message: string;
    code: StatusCodes;
    cause?: string;
	errorKey?: string;
}) {
    return reply.status(code).send({
        message,
        cause,
		errorKey
    });
}

export const httpErrorSchema = z.object({
    message: z.string().optional(),
    cause: z.string().optional(),
	error: z.string().optional(),
	code: z.number().optional(),
	errorKey: z.string().optional(),
});

export const errorResponses = {
    400: z.object({
        message: z.string().describe("Validation failed"),
        cause: z.string().optional().describe("Invalid input data"),
		errorKey: z.string().optional().describe("A specific error key for translations"),
    }),
    401: httpErrorSchema,
    403: httpErrorSchema,
    404: httpErrorSchema,
    409: httpErrorSchema,
    422: httpErrorSchema,
    500: httpErrorSchema,
}