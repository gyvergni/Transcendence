import prisma from "../../utils/prisma";
import { AddMatchBody } from "./stats.schema";
import { findUsers } from "../user/user.service";
import { getAllGuests, getInactiveGuests } from "../guest/guest.service";
import { formatDate } from "../utils/formatDate";

export async function addMatch(input: AddMatchBody, winnerId: number, loserId: number, winnerScore: number, loserScore: number, isPlayer1: boolean) {
	const wallBounce1 = isPlayer1 ? input.match.matchStats.wallBounce1 : input.match.matchStats.wallBounce2;
    const wallBounce2 = isPlayer1 ? input.match.matchStats.wallBounce2 : input.match.matchStats.wallBounce1;
    const totalInputs1 = isPlayer1 ? input.match.matchStats.totalInputs1 : input.match.matchStats.totalInputs2;
    const totalInputs2 = isPlayer1 ? input.match.matchStats.totalInputs2 : input.match.matchStats.totalInputs1;
	let pointsOrder = input.match.matchStats.pointsOrder;
	if (!isPlayer1) {
		pointsOrder = pointsOrder.replace(/[12]/g, (digit) => digit === '1' ? '2' : '1');
	}

    return await prisma.$transaction(async (tx: any) => {
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
                pointsOrder: pointsOrder,
                timeOrder: input.match.matchStats.timeOrder,
                wallBounce1: wallBounce1,
                wallBounce2: wallBounce2,
                totalInputs1: totalInputs1,
                totalInputs2: totalInputs2,
            },
        });
        await tx.stats.update({
            where: { id: winnerId },
            data: {
                wins: { increment: 1 },
            },
        });
        await tx.stats.update({
            where: { id: loserId },
            data: {
                losses: { increment: 1 },
            },
        });
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
        return user.game_username;
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

export async function getStats(player: { id: number, game_username: string }) {
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

            const player1Pseudo = await findPseudoWithId(player1Id);
            const player2Pseudo = await findPseudoWithId(player2Id);
            if (!player1Pseudo || !player2Pseudo) {
                throw new Error("Pseudo not found for player ID: " + (player1Pseudo ? player2Id : player1Id));
            }

            const player1Score = isPlayer1 ? match.player1_score : match.player2_score;
            const player2Score = isPlayer1 ? match.player2_score : match.player1_score;

            const result = player1Score > player2Score ? 'win' : 'lose';
            const wallBounce1 = isPlayer1 ? match.wallBounce1 : match.wallBounce2;
            const wallBounce2 = isPlayer1 ? match.wallBounce2 : match.wallBounce1;
            const totalInputs1 = isPlayer1 ? match.totalInputs1 : match.totalInputs2;
            const totalInputs2 = isPlayer1 ? match.totalInputs2 : match.totalInputs1;

            let pointsOrder = match.pointsOrder;
            if (!isPlayer1) {
                pointsOrder = pointsOrder.replace(/[12]/g, (digit) => digit === '1' ? '2' : '1');
			}

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
                    pointsOrder: pointsOrder,
                    timeOrder: match.timeOrder,
                    wallBounce1: wallBounce1,
                    wallBounce2: wallBounce2,
                    totalInputs1: totalInputs1,
                    totalInputs2: totalInputs2,
                }
            };
        })
    );

    const result = {
        id: stats.id,
        username: player.game_username,
        wins: stats.wins,
        losses: stats.losses,
        matchHistory: matchHistory,
    }

    return result;


}