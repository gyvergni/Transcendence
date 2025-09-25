import {z} from 'zod';
import { errorResponses } from '../utils/http';
import { platform } from 'os';

// export const addMatchSchema = {
//     tags: ['matches'],
//     body: z.object({
//         player1Id: z.number({
//             required_error: 'Player 1 ID is required',
//             invalid_type_error: 'Player 1 ID must be a number'}),
//         player2Id: z.number({
//             required_error: 'Player 2 ID is required',
//             invalid_type_error: 'Player 2 ID must be a number'}),
//         player1Score: z.number({
//             required_error: 'Player 1 score is required',
//             invalid_type_error: 'Player 1 score must be a number'}),
//         player2Score: z.number({
//             required_error: 'Player 2 score is required',
//             invalid_type_error: 'Player 2 score must be a number'}),
//     }),
//     response: {
//         201: z.object({
//             message: z.string().describe('Match added successfully'),
//         }),
//         400: errorResponses[400].describe('Bad Request'),
//         500: errorResponses[500].describe('Internal Server Error'),
//     }
// } as const;

export const addMatchSchema = {
    tags: ['stats'],
    body: z.object({
        player1Username: z.string().describe('The username of player 1'),
        player2Username: z.string().describe('The username of player 2'),
        player1Score: z.number().describe('The score of player 1'),
        player2Score: z.number().describe('The score of player 2'),
        match: z.object({
            matchSettings: z.object({
                ballSize: z.number().describe('The size of the ball'),
                ballSpeed: z.number().describe('The speed of the ball'),
                paddleSize: z.number().describe('The size of the paddles'),
                paddleSpeed: z.number().describe('The speed of the paddles'),
                gameMode: z.string().describe('The game mode'),
            }),
            matchStats: z.object({
                totalHits: z.number().describe('Total number of hits in the match'),
                longestRallyHits: z.number().describe('Longest rally in terms of hits'),
                longestRallyTime: z.number().describe('Longest rally in terms of time'),
                timeDuration: z.number().describe('Total duration of the match'),
                pointsOrder: z.string().describe('Order of points scored during the match'),
            }),
        }),
    }),
    response: {
        201: z.object({
            message: z.string().describe('Match added successfully'),
        }),
        400: errorResponses[400].describe('Bad Request'),
        500: errorResponses[500].describe('Internal Server Error'),
    }
} as const;

export type AddMatchBody = z.infer<typeof addMatchSchema.body>;

export const getStatsSchema = {
    tags: ['stats'],
    response: {
        200: z.object({
            id: z.number().describe('The ID of the user'),
            username: z.string().describe('The username of the user'),
            wins: z.number().describe('The number of wins'),
            losses: z.number().describe('The number of losses'),
            matchHistory: z.array(
                z.object({
                    matchId: z.number().describe('The ID of the match'),
                    player1Username: z.string().describe('The username of player 1'),
                    player2Username: z.string().describe('The username of player 2'),
                    player1Score: z.number().describe('The score of player 1'),
                    player2Score: z.number().describe('The score of player 2'),
                    date: z.string().describe('The date and time when the match was created'),
                    matchSettings: z.object({
                        ballSize: z.number().describe('The size of the ball'),
                        ballSpeed: z.number().describe('The speed of the ball'),
                        paddleSize: z.number().describe('The size of the paddles'),
                        paddleSpeed: z.number().describe('The speed of the paddles'),
                        gameMode: z.string().describe('The game mode'),
                    }),
                    matchStats: z.object({
                        totalHits: z.number().describe('Total number of hits in the match'),
                        longestRallyHits: z.number().describe('Longest rally in terms of hits'),
                        longestRallyTime: z.number().describe('Longest rally in terms of time'),
                        timeDuration: z.number().describe('Total duration of the match'),
                        pointsOrder: z.string().describe('Order of points scored during the match'),
                    }),
                }),
            ).optional(),
        }),
        400: errorResponses[400].describe('Bad Request'),
        404: errorResponses[404].describe('User or Guest not found'),
        500: errorResponses[500].describe('Internal Server Error'),
    }
} as const;