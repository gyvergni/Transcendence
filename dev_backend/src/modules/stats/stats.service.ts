import prisma from "../../utils/prisma";
import { AddMatchBody } from "./stats.schema";
import { findUsers } from "../user/user.service";
import { getAllGuests, getInactiveGuests } from "../guest/guest.service";
import { formatDate } from "../utils/formatDate";

export async function addMatch(input: AddMatchBody, winnerId: number, loserId: number, winnerScore: number, loserScore: number) {
    console.log("Adding match with input:", input);
    return await prisma.$transaction(async (tx: any) => {
        console.log("0");
        const match = await tx.matchHistory.create({
            data: {
                player1_id: winnerId,
                player2_id: loserId,
                player1_score: winnerScore,
                player2_score: loserScore,
                ballSize: input.match.matchSettings.ballSize,
                ballSpeed: input.match.matchSettings.ballSpeed,
                paddleSize: input.match.matchSettings.paddleSize,       
                paddleSpeed: input.match.matchSettings.paddleSpeed,
                gameMode: input.match.matchSettings.gameMode,
                totalHits: input.match.matchStats.totalHits,
                longestRallyHits: input.match.matchStats.longestRallyHits,
                longestRallyTime: input.match.matchStats.longestRallyTime,
                timeDuration: input.match.matchStats.timeDuration,
                pointsOrder: input.match.matchStats.pointsOrder,
            },
        });
        console.log("1");
        await tx.stats.update({
            where: { id: winnerId },
            data: {
                wins: { increment: 1 },
            },
        });
        console.log("2");
        await tx.stats.update({
            where: { id: loserId },
            data: {
                losses: { increment: 1 },
            },
        });
        console.log("3");
        return match;
    });
}

export async function findPseudoWithId(playerId: number) {
    if (playerId >= 1 && playerId <= 3) {
        const aiNames = ["ai-easy", "ai-medium", "ai-hard"];
        return aiNames[playerId - 1];
    }
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
        const matchHistoryList = await getMatchs(playerId);
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
            win: stats.wins,
            lose: stats.losses,
            pseudo: await findPseudoWithId(playerId),
            matchHistory: matchHistory,
        }
        //console.log("Match history fetched:", result.matchHistory);
        return result;
    }
    return {
        id : stats.id,
        win: stats.wins,
        lose: stats.losses,
        pseudo: await findPseudoWithId(playerId),
    }
}

export async function getMatchs(playerId: number) {
    return await prisma.matchHistory.findMany({
        where: {
            OR: [
                { player1_id: playerId },
                { player2_id: playerId }
            ]
        },
        orderBy: {
            date: 'desc',
        }
    })
}

export async function checkIdentityExists(playerId: number) {
    const stats = await prisma.stats.findUnique({
        where: { id: playerId },
    });
    return stats !== null;
}

export async function getStats2(player: { id: number, pseudo: string }) {
    const stats = await prisma.stats.findUnique({
        where: { id: player.id },
    });
    if (!stats) {
        throw new Error("Stats not found for player ID: " + player.id);
    }

    const matchHistoryList = await getMatchs(player.id);
    if (!matchHistoryList) {
        throw new Error("Match history not found for player ID: " + player.id);
    }

    const matchHistory = await Promise.all(
        matchHistoryList.map(async match => {
            const isPlayer1 = match.player1_id === player.id;

            const player1Id = isPlayer1 ? match.player1_id : match.player2_id;
            const player2Id = isPlayer1 ? match.player2_id : match.player1_id
            const player1Score = isPlayer1 ? match.player1_score : match.player2_score;
            const player2Score = isPlayer1 ? match.player2_score : match.player1_score;

            const player1Pseudo = await findPseudoWithId(player1Id);
            const player2Pseudo = await findPseudoWithId(player2Id);

            if (!player1Pseudo || !player2Pseudo) {
                throw new Error("Pseudo not found for player ID: " + (player1Pseudo ? player2Id : player1Id));
            }
            const result = player1Score > player2Score ? 'win' : 'lose';
            return {
                matchId: match.id,
                player1Username: player1Pseudo,
                player2Username: player2Pseudo,
                player1Score: player1Score,
                player2Score: player2Score,
                result: result,
                date: formatDate(match.date),
                matchSettings: {
                    ballSize: match.ballSize,
                    ballSpeed: match.ballSpeed,
                    paddleSize: match.paddleSize,
                    paddleSpeed: match.paddleSpeed,
                    gameMode: match.gameMode,
                },
                matchStats: {
                    totalHits: match.totalHits,
                    longestRallyHits: match.longestRallyHits,
                    longestRallyTime: match.longestRallyTime,
                    timeDuration: match.timeDuration,
                    pointsOrder: match.pointsOrder,
                }
            };
        })
    );

    const result = {
        id: stats.id,
        username: player.pseudo,
        wins: stats.wins,
        losses: stats.losses,
        matchHistory: matchHistory,
    }

    return result;


}