import fastify, { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { createUserSchema, loginUserSchema, getUsersSchema, addFriendSchema, changePasswordSchema, logoutUserSchema, changeUsernameSchema } from "./user.schema";
import { createUserHandler, loginUserHandler, getUsersHandler, addFriendHandler, changePasswordHandler, logoutUserHandler, deleteFriendHandler, changeUsernameHandler, changeAvatarHandler } from "./user.controller";

export async function userRoutes(server: FastifyInstance) {
    server.withTypeProvider<ZodTypeProvider>().post("/create", {
        schema: createUserSchema,
        handler: createUserHandler,
    });
    
    server.withTypeProvider<ZodTypeProvider>().post("/login", {
        schema: loginUserSchema,
        handler: loginUserHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().get("/:username?", {
        schema: getUsersSchema,
        preHandler: [server.auth],
        handler: getUsersHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().post("/friend", {
        schema: addFriendSchema,
        preHandler: [server.auth],
        handler: addFriendHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().delete("/friend", {
        schema: addFriendSchema,
        preHandler: [server.auth],
        handler: deleteFriendHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().put("/change-password", {
        schema: changePasswordSchema,
        preHandler: [server.auth],
        handler: changePasswordHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().put("/logout", {
        schema: logoutUserSchema,
        preHandler: [server.auth],
        handler: logoutUserHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().put("/change-username", {
        schema: changeUsernameSchema,
        preHandler: [server.auth],
        handler: changeUsernameHandler,
    });

    server.put("/avatar/:filename", {
        preHandler: [server.auth],
        handler: changeAvatarHandler,
    })
}