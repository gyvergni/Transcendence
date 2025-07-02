import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, Prisma } from "../../generated/prisma";

import { CreateGuestBody, DeleteGuestBody } from "./guest.schema";
import { getGuestList, createGuest } from "./guest.service";

export async function getGuestListHandler(req: FastifyRequest, reply: FastifyReply) {
    const body = req.body;

    try {
        const currentUser = req.user;

        const guestList = await getGuestList(currentUser.id);
        return reply.status(StatusCodes.OK).send({message: "Guest list retrieved successfully", guests: guestList, numberOfGuests: guestList.length});
    } 
    catch (e) {
        return httpError({
            reply,
            message: "Failed to fetch guests",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

}

export async function createGuestHandler(req: FastifyRequest<{Body: CreateGuestBody}>, reply: FastifyReply) {
    const body = req.body;

    try {
        const currentUser = req.user;

        const guestListLength = (await getGuestList(currentUser.id)).length;
        if (guestListLength >= 10) {
            return httpError({
                reply,
                code: StatusCodes.CONFLICT,
                message: "Guest list is full, you cannot create more than 10 guests",
            });
        }

        const guest = await createGuest(currentUser.id, body.pseudo);
        return reply.status(StatusCodes.CREATED).send({
            message: "Guest created successfully",
            guestId: guest.id,
            guestPseudo: guest.pseudo,
        });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return httpError({
                    reply,
                    message: "Pseudo already exists",
                    code: StatusCodes.CONFLICT,
                })
            }
        }
        return httpError({
            reply,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "An error occurred while creating the guest",
        })
    }
}