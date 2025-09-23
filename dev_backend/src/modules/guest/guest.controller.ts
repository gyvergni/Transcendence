import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { findUserByPseudo } from "../user/user.service";

import { CreateGuestBody, DeleteGuestBody } from "./guest.schema";
import { getGuestList, createGuest, deleteGuest } from "./guest.service";

// export async function getGuestListHandler(req: FastifyRequest, reply: FastifyReply) {
//     const body = req.body;

//     try {
//         const currentUser = req.user;

//         const guestList = await getGuestList(currentUser.id);
//         return reply.status(StatusCodes.OK).send({message: "Guest list retrieved successfully", guests: guestList, numberOfGuests: guestList.length});
//     } 
//     catch (e) {
//         return httpError({
//             reply,
//             message: "Failed to fetch guests",
//             code: StatusCodes.INTERNAL_SERVER_ERROR,
//         });
//     }

// }

export async function getGuestListByPseudoHandler(req: FastifyRequest<{Params: {username: string}, Querystring: {guestname: string}}>, reply: FastifyReply) {
    try {
        if (req.params.username)
        {
            //console.log("Username provided:", req.params.username);
            const username = req.params.username;
            const userId = await findUserByPseudo(username);
            if (!userId) {
                return httpError({
                    reply,
                    message: "User not found",
                    code: StatusCodes.NOT_FOUND,
                });
            }
            const guestname = req.query.guestname;
            const guestList = await getGuestList(userId.id);
            if (guestname){
                //console.log("Guestname provided:", req.query.guestname);
                let guestFound = guestList.find(g => g.pseudo === guestname);
                if (!guestFound) {
                    return httpError({
                        reply,
                        message: "Guest not found",
                        code: StatusCodes.NOT_FOUND,
                    });
                }
                const guestFoundArray = [guestFound];
                return reply.status(StatusCodes.OK).send({guests: guestFoundArray, message: "Guest found successfully", user: username, numberOfGuests: guestFoundArray.length});
            }
            else {
                //console.log("No guestname provided, returning full guest list");
                return reply.status(StatusCodes.OK).send({message: "Guest list retrieved successfully", guests: guestList, user: username, numberOfGuests: guestList.length});
            }
        }
        else {
            const currentUser = req.user;
            //console.log("TAG: ", currentUser);
            const guestList = await getGuestList(currentUser.id);
			const user = await findUserByPseudo(currentUser.pseudo);
			if (!user) {
				return httpError({
					reply,
					message: "Failed to fetch guests",
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				});
			}
            return reply.status(StatusCodes.OK).send({message: "Guest list retrieved successfully", user: user.game_username, guests: guestList, numberOfGuests: guestList.length});
        }
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

    if (body.pseudo === "Deleted Guest") {
        return httpError({
            reply,
            code: StatusCodes.BAD_REQUEST,
            message: "Pseudo 'Deleted Guest' is reserved and cannot be used",
        });
    }
    try {
        const currentUser = req.user;

		const user = await findUserByPseudo(currentUser.pseudo);
		if (!user) {
			return httpError({
				reply,
				message: "Failed to create guest",
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		} else if (body.pseudo === user.game_username) {
			return httpError({
				reply,
				code: StatusCodes.BAD_REQUEST,
				message: "Guest pseudo cannot be the same as your user in-game username",
			});
		}

        const guestList = await getGuestList(currentUser.id);
        const guestListLength = guestList.length;
        if (guestListLength >= 10) {
            return httpError({
                reply,
                code: StatusCodes.CONFLICT,
                message: "Guest list is full, you cannot create more than 10 guests",
            });
        }
        if (guestList.find(g => g.pseudo === body.pseudo && g.active === true)) {
            return httpError({
                reply,
                code: StatusCodes.CONFLICT,
                message: "Guest with this pseudo already exists",
            });

        }
        const guest = await createGuest(currentUser.id, body.pseudo);
        return reply.status(StatusCodes.CREATED).send({
            message: "Guest created successfully",
            userPseudo: currentUser.pseudo,
            guestId: guest.id,
            guestPseudo: guest.pseudo,
        });
    }
    catch (e) {
        return httpError({
            reply,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "An error occurred while creating the guest",
        })
    }
}

export async function deleteGuestHandler(req: FastifyRequest<{Body: DeleteGuestBody}>, reply: FastifyReply) {
    const body = req.body;

    try {
        const currentUser = req.user;

        const guestList = await getGuestList(currentUser.id);
        const guestToDelete = guestList.find(g => g.pseudo === body.guestPseudo && g.active === true); 
        if (!guestToDelete) {
            return httpError({
                reply,
                code: StatusCodes.NOT_FOUND,
                message: "Guest not found",
            });
        }
        await deleteGuest(guestToDelete.id);
        return reply.status(StatusCodes.OK).send({
            message: "Guest deleted successfully",
        });
    } catch (e) {
        return httpError({
            reply,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "An error occurred while deleting the guest",
        });
    }
}