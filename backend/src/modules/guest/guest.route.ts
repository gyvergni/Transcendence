import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { getGuestListSchema, createGuestSchema, deleteGuestSchema } from "./guest.schema";
import { createGuestHandler, deleteGuestHandler, getGuestListByPseudoHandler } from "./guest.controller";

export async function guestRoutes(server: FastifyInstance) {

    server.withTypeProvider<ZodTypeProvider>().get("/:username?", {
        schema: getGuestListSchema,
        preHandler: [server.auth],
        handler: getGuestListByPseudoHandler,
    })

    server.withTypeProvider<ZodTypeProvider>().post("/create", {
        schema: createGuestSchema,
        preHandler: [server.auth],
        handler: createGuestHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().delete("/delete", {
        schema: deleteGuestSchema,
        preHandler: [server.auth],
        handler: deleteGuestHandler,
    });
}