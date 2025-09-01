import fastify, { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { createUserSchema, loginUserSchema, getUsersSchema, addFriendSchema, changePasswordSchema, logoutUserSchema, changeUsernameSchema, changeAvatarSchema, getMeSchema } from "./user.schema";
import { createUserHandler, loginUserHandler, getUsersHandler, addFriendHandler, changePasswordHandler, logoutUserHandler, deleteFriendHandler, changeUsernameHandler, changeAvatarHandler, getAvatarHandler, getMeHandler } from "./user.controller";
import { loginUser, twoFactorAuthStatus } from "./user.service";
import { disableTwoFactorAuthHandler, enableTwoFactorAuthHandler, generateTwoFactorAuthHandler, verifyAndCompleteLogin, verifyTwoFactorAuthHandler } from "../a2f";

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

	server.withTypeProvider<ZodTypeProvider>().get("/me", {
        schema: getMeSchema,
        preHandler: [server.auth],
        handler: getMeHandler,
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

    server.post("/avatar", {
        schema: changeAvatarSchema,
        preHandler: [server.auth],
        handler: changeAvatarHandler,
    });

	server.get("/avatar", {
		preHandler: [server.auth],
		handler: getAvatarHandler,
	});

	server.get("/auth/validate-jwt-token", {
		preHandler: [server.auth],
		handler: async (request, reply) => {
			try {
				loginUser(request.user.id);
			} catch (error) {
				console.error("Error while changing user status:", error);
				return reply.status(500).send({ message: "Error while changing user status" });
			}
			return reply.status(200).send({ message: "Token is valid" });
		},
	});

	server.get("/auth/two-factor-auth/status", {
		preHandler: [server.auth],
		handler: async (request, reply) => {
			try {
				const status = await twoFactorAuthStatus(request.user.id);
				return reply.status(200).send({ status });
			} catch (error) {
				console.error("Error while fetching two-factor authentication status:", error);
				return reply.status(500).send({ message: "Error while fetching two-factor authentication status" });
			}
		},
	});

	server.get("/auth/two-factor-auth/setup", {
		preHandler: [server.auth],
		handler: generateTwoFactorAuthHandler,
	});

	server.post("/auth/two-factor-auth/enable", {
		preHandler: [server.auth],
		handler: enableTwoFactorAuthHandler
	});

	server.delete("/auth/two-factor-auth/disable", {
		preHandler: [server.auth],
		handler: disableTwoFactorAuthHandler
	});

	server.post("/auth/two-factor-auth/verify", {
		preHandler: [server.auth],
		handler: verifyTwoFactorAuthHandler
	});

    server.post("/auth/login/2fa-verify", verifyAndCompleteLogin);

}