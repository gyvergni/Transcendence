import prisma from "../../utils/prisma";
import { AddMatchBody } from "./stats.schema";
import { findUsers } from "../user/user.service";
import { getAllGuests, getInactiveGuests } from "../guest/guest.service";
import { formatDate } from "../utils/formatDate";

export async function addMatch(input: AddMatchBody, winnerId: number, loserId: number) {
    return await prisma.$transaction(async (tx) => {
        const match = await tx.matchHistory.create({
            data: {
                player1_id: input.player1Id,
                player2_id: input.player2Id,
                player1_score: input.player1Score,
                player2_score: input.player2Score,
            },
        });
        await tx.stats.update({
            where: { id: winnerId },
            data: {
                win: { increment: 1 },
            },
        });
        await tx.stats.update({
            where: { id: loserId },
            data: {
                lose: { increment: 1 },
            },
        });
        return match;
    });
}

export async function findPseudoWithId(playerId: number) {
    const users = await findUsers();
    const user = users.find(user => user.id === playerId);
    if (user) {
        return user.pseudo;
    }
    const guestList = await getAllGuests();
    const guest = guestList.find(guest => guest.id === playerId);
    if (guest) {
        return guest.pseudo;
    }

    const inactiveGuestsList = await getInactiveGuests();
    const inactiveGuest = inactiveGuestsList.find(guest => guest.id === playerId);
    if (inactiveGuest) {    
        return inactiveGuest.pseudo;
    }
    return null;
}

export async function getStats(playerId: number, displayMatchHistory: boolean, sizeMatchHistory: number) {
    if (sizeMatchHistory < 0) {
        sizeMatchHistory = 0;
    }
    const stats = await prisma.stats.findUnique({
        where: { id: playerId },
    });
    if (!stats) {
        throw new Error("Stats not found for player ID: " + playerId);
    }
    if (displayMatchHistory === true) {
        const matchHistoryList = await getMatchs(playerId, sizeMatchHistory);
        //console.log("Match history list fetched:", matchHistoryList);
        const matchHistory = await Promise.all(
            matchHistoryList.map(async match => {
                const isPlayer1 = match.player1_id === playerId;

                const player1Id = isPlayer1 ? match.player1_id : match.player2_id;
                const player2Id = isPlayer1 ? match.player2_id : match.player1_id
                const player1Score = isPlayer1 ? match.player1_score : match.player2_score;
                const player2Score = isPlayer1 ? match.player2_score : match.player1_score

                const player1Pseudo = await findPseudoWithId(player1Id);
                const player2Pseudo = await findPseudoWithId(player2Id);
                // console.log("Player 1 Pseudo:", player1Pseudo, "Player 2 Pseudo:", player2Pseudo);

                const result = player1Score > player2Score ? 'win' : 'lose';
                return  {
                    matchId: match.id,
                    player1: player1Pseudo,
                    player2: player2Pseudo,
                    player1Score: player1Score,
                    player2Score: player2Score,
                    result: result,
                    date: formatDate(match.date), // Convert to ISO string for consistency
                };
            })
        );
        // console.log("Match history processed:", matchHistory);
        const result = {
            id: stats.id,
            win: stats.win,
            lose: stats.lose,
            pseudo: await findPseudoWithId(playerId),
            matchHistory: matchHistory,
        }
        //console.log("Match history fetched:", result.matchHistory);
        return result;
    }
    return {
        id : stats.id,
        win: stats.win,
        lose: stats.lose,
        pseudo: await findPseudoWithId(playerId),
    }
}

export async function getMatchs(playerId: number, sizeMatchHistory: number) {
    return await prisma.matchHistory.findMany({
        where: {
            OR: [
                { player1_id: playerId },
                { player2_id: playerId }
            ]
        },
        orderBy: {
            date: 'desc',
        },
        take: sizeMatchHistory,
        select: {
            id: true,
            player1_id: true,
            player2_id: true,
            player1_score: true,
            player2_score: true,
            date: true,
        },
    })
}

export async function checkIdentityExists(playerId: number) {
    const stats = await prisma.stats.findUnique({
        where: { id: playerId },
    });
    return stats !== null;
}