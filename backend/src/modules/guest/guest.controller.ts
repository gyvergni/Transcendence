import { FastifyReply, FastifyRequest } from "fastify";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { findUserByPseudo } from "../user/user.service";

import { CreateGuestBody, DeleteGuestBody } from "./guest.schema";
import { getGuestList, createGuest, deleteGuest } from "./guest.service";

export async function getGuestListByPseudoHandler(req: FastifyRequest<{Params: {username: string}, Querystring: {guestname: string}}>, reply: FastifyReply) {
    try {
        if (req.params.username)
        {
            const username = req.params.username;
            const userId = await findUserByPseudo(username);
            if (!userId) {
                return httpError({
                    reply,
                    message: "User not found",
                    code: StatusCodes.NOT_FOUND,
					errorKey: "error.user.not_found"
                });
            }
            const guestname = req.query.guestname;
            const guestList = await getGuestList(userId.id);
            if (guestname){
                let guestFound = guestList.find(g => g.pseudo === guestname);
                if (!guestFound) {
                    return httpError({
                        reply,
                        message: "Guest not found",
                        code: StatusCodes.NOT_FOUND,
						errorKey: "error.guest.not_found"
                    });
                }
                const guestFoundArray = [guestFound];
                return reply.status(StatusCodes.OK).send({guests: guestFoundArray, message: "Guest found successfully", user: username, numberOfGuests: guestFoundArray.length});
            }
            else {
                return reply.status(StatusCodes.OK).send({message: "Guest list retrieved successfully", guests: guestList, user: username, numberOfGuests: guestList.length});
            }
        }
        else {
            const currentUser = req.user;
            const guestList = await getGuestList(currentUser.id);
			const user = await findUserByPseudo(currentUser.pseudo);
			if (!user) {
				return httpError({
					reply,
					message: "Failed to fetch guests",
					code: StatusCodes.INTERNAL_SERVER_ERROR,
					errorKey: "error.guest.fetch_failed"
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
			errorKey: "error.guest.fetch_failed"
        });
    }
}

export async function createGuestHandler(req: FastifyRequest<{Body: CreateGuestBody}>, reply: FastifyReply) {
    const body = req.body;

    if (body.pseudo === "Deleted Guest" || body.pseudo === "Invité Supprimé" || body.pseudo === "Invitado Eliminado") {
        return httpError({
            reply,
            code: StatusCodes.BAD_REQUEST,
            message: `Username ${body.pseudo} is reserved and cannot be used`,
			errorKey: "error.guest.username_reserved"
        });
    }
	if (body.pseudo && body.pseudo.match(/[^a-zA-Z0-9_]/)) {
		return httpError({
			reply,
			message: "Pseudo contains invalid characters",
			code: StatusCodes.BAD_REQUEST,
			errorKey: "error.guest.invalid_username_characters"
		});
	}
    try {
        const currentUser = req.user;

		const user = await findUserByPseudo(currentUser.pseudo);
		if (!user) {
			return httpError({
				reply,
				message: "An error occurred while creating the guest",
				code: StatusCodes.INTERNAL_SERVER_ERROR,
				errorKey: "error.guest.create_failed"
			});
		} else if (body.pseudo === user.game_username) {
			return httpError({
				reply,
				code: StatusCodes.BAD_REQUEST,
				message: "Guest pseudo cannot be the same as your host in-game username",
				errorKey: "error.guest.host_username_conflict"
			});
		}

        const guestList = await getGuestList(currentUser.id);
        const guestListLength = guestList.length;
        if (guestListLength >= 10) {
            return httpError({
                reply,
                code: StatusCodes.CONFLICT,
                message: "Guest list is full, you cannot create more than 10 guests",
				errorKey: "error.guest.list_full"
            });
        }
        if (guestList.find(g => g.pseudo === body.pseudo && g.active === true)) {
            return httpError({
                reply,
                code: StatusCodes.CONFLICT,
                message: "Guest with this pseudo already exists",
				errorKey: "error.guest.duplicate_username"
            });

        }
        const guest = await createGuest(currentUser.id, body.pseudo);
        return reply.status(StatusCodes.CREATED).send({
            message: "Guest created successfully",
            userPseudo: currentUser.pseudo,
            guestId:guest.id,
            guestPseudo:guest.pseudo,
        });
    }
    catch (e) {
        return httpError({
            reply,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "An error occurred while creating the guest",
			errorKey: "error.guest.create_failed"
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
				errorKey: "error.guest.not_found"
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
			errorKey: "error.guest.delete_failed"
        });
    }
}



