import { FastifyReply, FastifyRequest } from "fastify";
import { server } from "../..";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, Prisma } from "../../generated/prisma";

import { getGuestListByPseudoHandler } from "../guest/guest.controller";
import { getGuestList } from "../guest/guest.service";
import { addMatchSchema } from "./stats.schema";
import { addMatch, checkIdentityExists, getStats } from "./stats.service";
import { size } from "zod/v4";

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
    const body = req.body as { player1Id: number, player2Id: number, player1Score: number, player2Score: number };
    const currentUser = req.user;

    try {
        const guestList = await getGuestList(currentUser.id);
    
        // console.log("Current user ID:", currentUser.id);
        // console.log("Guest list:", guestList);

        if (!isValidMatchBody(currentUser.id, body, guestList)) {
            return httpError({
                reply,
                message: "Invalid match data",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
            });
        };

        const winnerId = body.player1Score > body.player2Score ? body.player1Id : body.player2Id;
        const loserId = body.player1Score < body.player2Score ? body.player1Id : body.player2Id;

    
        const match = await addMatch(body, winnerId, loserId);

        return reply.status(StatusCodes.CREATED).send({message: "Match added successfully"});
    } catch (e) {

    }
}

export async function getStatsHandler(req: FastifyRequest<{Params: {id: number}, Querystring: {match: string, list: number}}>, reply: FastifyReply) {
    const playerId = req.params.id ? +req.params.id as number : req.user.id as number;
    const displayMatchHistory = req.query.match === 'true';
    const sizeMatchHistory = req.query.list ? +req.query.list as number : 10; // Default to 10 if not provided
    const currentUser = req.user;
    // console.log("Player ID:", playerId, typeof playerId);
    // console.log("Display match history:", displayMatchHistory);
    // console.log("Size of match history:", sizeMatchHistory);
    try {
        // Only the current user can see their own stats, or a guest can see their own stats
        
        // const guestList = await getGuestList(currentUser.id);
        // if (playerId != currentUser.id && !guestList.some(guest => guest.id === playerId)) {
        //     return httpError({
        //         reply,
        //         message: "This id does not exist in your guest list",
        //         code: StatusCodes.NOT_FOUND,
        //     });
        // }

        // Everyone can see stats of any player, so we don't check the guest list here
        if (await checkIdentityExists(playerId) === false) {
            return httpError({
                reply,
                message: "This id does not exist",
                code: StatusCodes.NOT_FOUND,
            });
        }
        const stats = await getStats(playerId, displayMatchHistory, sizeMatchHistory);
        // console.log("Stats fetched:", stats);
        return reply.status(StatusCodes.OK).send(stats);
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to fetch stats",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}