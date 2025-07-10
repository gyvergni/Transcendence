import {z} from 'zod';
import { errorResponses } from '../utils/http';

export const addMatchSchema = {
    tags: ['matches'],
    body: z.object({
        player1Id: z.number({
            required_error: 'Player 1 ID is required',
            invalid_type_error: 'Player 1 ID must be a number'}),
        player2Id: z.number({
            required_error: 'Player 2 ID is required',
            invalid_type_error: 'Player 2 ID must be a number'}),
        player1Score: z.number({
            required_error: 'Player 1 score is required',
            invalid_type_error: 'Player 1 score must be a number'}),
        player2Score: z.number({
            required_error: 'Player 2 score is required',
            invalid_type_error: 'Player 2 score must be a number'}),
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
            pseudo: z.string().describe('The pseudo of the user'),
            win: z.number().describe('The number of wins'),
            lose: z.number().describe('The number of losses'),
            matchHistory: z.array(
                z.object({
                    matchId: z.number().describe('The ID of the match'),
                    player1: z.string().describe('The ID of player 1'),
                    player2: z.string().describe('The ID of player 2'),
                    player1Score: z.number().describe('The score of player 1'),
                    player2Score: z.number().describe('The score of player 2'),
                    result: z.string().describe('The result of the match (win/loss)'),
                    date: z.string().describe('The date and time when the match was created'),
                })
            ).optional()
        }),
        400: errorResponses[400].describe('Bad Request'),
        404: errorResponses[404].describe('User not found'),
        500: errorResponses[500].describe('Internal Server Error'),
    }
} as const;