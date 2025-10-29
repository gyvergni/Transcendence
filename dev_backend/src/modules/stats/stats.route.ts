import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { addMatchSchema, getStatsSchema } from "./stats.schema";
import { addMatchHandler, getStatsHandler } from "./stats.controller";

export async function statRoutes(server: FastifyInstance) {
    server.withTypeProvider<ZodTypeProvider>().post("/match/create", {
        schema: addMatchSchema,
        preHandler: [server.auth],
        handler: addMatchHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().get("/:username?", {
        schema: getStatsSchema,
        preHandler: [server.auth],
        handler: getStatsHandler,
    });
}