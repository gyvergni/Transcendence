import { FastifyReply, FastifyRequest } from "fastify";
import { server } from "../..";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, Prisma } from "../../generated/prisma";

import { getGuestListByPseudoHandler } from "../guest/guest.controller";
import { getGuestList } from "../guest/guest.service";
import { addMatchSchema } from "./stats.schema";
import { addMatch, checkIdentityExists, getStats2 } from "./stats.service";
import { size } from "zod/v4";
import { ca } from "zod/v4/locales";
import { findUserByPseudo } from "../user/user.service";

function isValidMatchScore(player1Score: number, player2Score: number) {
    if (player1Score < 0 || player2Score < 0) {
        return false;
    }
    if (player1Score === player2Score) {
        return false;
    }
    if (player1Score > 5 || player2Score > 5) {//Change this with the max score range setup in front
        return false;
    }
    return true;
}

function isValidMatchBody(currentUserId: number, body: { player1Id: number, player2Id: number, player1Score: number, player2Score: number}, guestList: { id: number, pseudo: string, active: boolean }[]) {
    if (guestList.find(guest => guest.id === body.player1Id)?.active === false || guestList.find(guest => guest.id === body.player2Id)?.active === false) {
        return false;
    }
    else if (isValidMatchScore(body.player1Score, body.player2Score) === false) {
        return false;
    }
    else if (body.player1Id === body.player2Id) {
        return false;
    }
    else if (currentUserId === body.player1Id || currentUserId === body.player2Id) {
        if (!guestList.some(guest => guest.id === body.player1Id) && !guestList.some(guest => guest.id === body.player2Id)) {
            return false;
        }
        return true;
    }
    else if (guestList.some(guest => guest.id === body.player1Id) && guestList.some(guest => guest.id === body.player2Id)) {
        return true;
    }
    return false;
}

export async function addMatchHandler(req: FastifyRequest, reply: FastifyReply ) {
    const body: any = req.body;
    const currentUser = req.user;

    try {
        const guestList = await getGuestList(currentUser.id);
    
        // console.log("Current user ID:", currentUser.id);
        // console.log("Guest list:", guestList);

        // if (!isValidMatchBody(currentUser.id, body, guestList)) {
        //     return httpError({
        //         reply,
        //         message: "Invalid match data",
        //         code: StatusCodes.UNPROCESSABLE_ENTITY,
        //     });
        // };

        const winnerUsername = body.player1Score > body.player2Score ? body.player1Username : body.player2Username;
        const loserUsername = body.player1Score < body.player2Score ? body.player1Username : body.player2Username;
        const winnerScore = Math.max(body.player1Score, body.player2Score);
        const loserScore = Math.min(body.player1Score, body.player2Score);
		const isPlayer1 = body.player1Score > body.player2Score;

        const aiPlayers = ["ai-easy", "ai-medium", "ai-hard"];

		const currentUserDb = await findUserByPseudo(currentUser.pseudo);
        console.log("Current User DB:", currentUserDb);
        let winner;
        let winnerId;
        if (aiPlayers.includes(winnerUsername)) {
            winnerId = aiPlayers.indexOf(winnerUsername) + 1;
        } else {
			if (currentUserDb && currentUserDb.game_username === winnerUsername) 
				winnerId = currentUserDb.id;
			else {
                const guestPlayer = guestList.find(guest => guest.pseudo === winnerUsername);
                if (guestPlayer)
                    winnerId = guestPlayer.id;
                else {
                    winner = await findUserByPseudo(winnerUsername);
                    winnerId = winner ? winner.id : undefined;
                }
			}
			console.log("WinnerId:", winnerId);
        }   

        let loser;
        let loserId;
        if (aiPlayers.includes(loserUsername)) {
            loserId = aiPlayers.indexOf(loserUsername) + 1;
        } else {
			if (currentUserDb && currentUserDb.game_username === loserUsername)
				loserId = currentUserDb.id;
			else {
                const guestPlayer = guestList.find(guest => guest.pseudo === loserUsername);
                if (guestPlayer)
                    loserId = guestPlayer.id;
                else {
                    loser = await findUserByPseudo(loserUsername);
                    loserId = loser ? loser.id : undefined;
                }
			}
			console.log("LooserId:", loserId);
        }

        // if (!winner && !loser) {
        //     return httpError({
        //         reply,
        //         message: "At least one player must be a registered user",
        //         code: StatusCodes.UNPROCESSABLE_ENTITY,
        //     });
        // }

        if (!winnerId || !loserId) {
            return httpError({
                reply,
                message: "Player not found",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
				errorKey: "error.stats.player_not_found"
            });
        }
    
        // console.log("Body to add match:", body);
        // console.log("Winner ID:", winnerId, "Loser ID:", loserId);
        const match = await addMatch(body, winnerId, loserId, winnerScore, loserScore, isPlayer1);

        return reply.status(StatusCodes.CREATED).send({message: "Match added successfully"});
    } catch (e) {
        console.error("Error in addMatchHandler:", e);
        return httpError({
            reply,
            message: "Failed to add match",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
			errorKey: "error.stats.add_match_failed"
        });
    }
}

export async function getStatsHandler(req: FastifyRequest<{Params: {username: string}, Querystring: {guest: string}}>, reply: FastifyReply) {
    try {
        if (req.params.username) {
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
            const guestname = req.query.guest;
            const guestList = await getGuestList(userId.id);
            if (guestname){
                const guestFound = guestList.find(g => g.pseudo === guestname);
                if (!guestFound) {
                    return httpError({
                        reply,
                        message: "Guest not found",
                        code: StatusCodes.NOT_FOUND,
						errorKey: "error.guest.not_found"
                    });
                }
                const stats = await getStats2({id: guestFound.id, game_username: guestFound.pseudo});
                if (!stats) {
                    return httpError({
                        reply,
                        message: "Faild to fetch stats",
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
						errorKey: "error.stats.fetch_failed"
                    });
                }
                return reply.status(StatusCodes.OK).send(stats);
            } else {
                const stats = await getStats2(userId);
                if (!stats) {
                    return httpError({
                        reply,
                        message: "Faild to fetch stats",
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
						errorKey: "error.stats.fetch_failed"
                    });
                }
                return reply.status(StatusCodes.OK).send(stats);
            }
        } else {
            const currentUser = req.user;
            const stats = await getStats2({id: currentUser.id, game_username: currentUser.pseudo});
            if (!stats) {
                return httpError({
                    reply,
                    message: "Faild to fetch stats",
                    code: StatusCodes.INTERNAL_SERVER_ERROR,
					errorKey: "error.stats.fetch_failed"
                });
            }
            return reply.status(StatusCodes.OK).send(stats);
        }
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to fetch stats",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
			errorKey: "error.stats.fetch_failed"
        });
    }
}