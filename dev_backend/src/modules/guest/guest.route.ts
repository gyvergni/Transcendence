import fastify, { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { getGuestListSchema, createGuestSchema, deleteGuestSchema } from "./guest.schema";
import { getGuestListHandler, createGuestHandler } from "./guest.controller";

export async function guestRoutes(server: FastifyInstance) {
    server.withTypeProvider<ZodTypeProvider>().get("/list", {
        schema: getGuestListSchema,
        preHandler: [server.auth],
        handler: getGuestListHandler,
    })

    server.withTypeProvider<ZodTypeProvider>().post("/create", {
        schema: createGuestSchema,
        preHandler: [server.auth],
        handler: createGuestHandler,
    });

    // server.withTypeProvider<ZodTypeProvider>().delete("/delete", {
    //     schema: deleteGuestSchema,
    //     handler: deleteGuestHandler,
    // });
}