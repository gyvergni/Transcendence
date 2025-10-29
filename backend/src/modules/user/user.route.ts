import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { createUserSchema, loginUserSchema, getUsersSchema, changePasswordSchema, logoutUserSchema, changeUsernameSchema, changeAvatarSchema, getMeSchema, editFriendSchema, twoFactorAuthStatusSchema, twoFactorAuthSetupSchema, twoFactorAuthEnableSchema, twoFactorAuthDisableSchema, twoFactorAuthVerifySchema, validateJwtTokenSchema, twoFactorAuthLoginVerifySchema, getFriendsSchema, getAvatarSchema } from "./user.schema";
import { createUserHandler, loginUserHandler, getUsersHandler, addFriendHandler, changePasswordHandler, logoutUserHandler, deleteFriendHandler, changeUsernameHandler, changeAvatarHandler, getAvatarHandler, getMeHandler, getFriendsHandler } from "./user.controller";
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

	server.withTypeProvider<ZodTypeProvider>().get("/friend", {
		schema: getFriendsSchema,
		preHandler: [server.auth],
		handler: getFriendsHandler,
	});

    server.withTypeProvider<ZodTypeProvider>().post("/friend", {
        schema: editFriendSchema,
        preHandler: [server.auth],
        handler: addFriendHandler,
    });

    server.withTypeProvider<ZodTypeProvider>().delete("/friend", {
        schema: editFriendSchema,
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

    server.withTypeProvider<ZodTypeProvider>().post("/avatar", {
        schema: changeAvatarSchema,
        preHandler: [server.auth],
        handler: changeAvatarHandler,
    });

	server.withTypeProvider<ZodTypeProvider>().get("/avatar", {
		schema: getAvatarSchema,
		preHandler: [server.auth],
		handler: getAvatarHandler,
	});

	server.withTypeProvider<ZodTypeProvider>().get("/auth/validate-jwt-token", {
		schema: validateJwtTokenSchema,
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

	server.withTypeProvider<ZodTypeProvider>().get("/auth/two-factor-auth/status", {
		schema: twoFactorAuthStatusSchema,
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

	server.withTypeProvider<ZodTypeProvider>().get("/auth/two-factor-auth/setup", {
		schema: twoFactorAuthSetupSchema,
		preHandler: [server.auth],
		handler: generateTwoFactorAuthHandler,
	});

	server.withTypeProvider<ZodTypeProvider>().post("/auth/two-factor-auth/enable", {
		schema: twoFactorAuthEnableSchema,
		preHandler: [server.auth],
		handler: enableTwoFactorAuthHandler
	});

	server.withTypeProvider<ZodTypeProvider>().delete("/auth/two-factor-auth/disable", {
		schema: twoFactorAuthDisableSchema,
		preHandler: [server.auth],
		handler: disableTwoFactorAuthHandler
	});

	server.withTypeProvider<ZodTypeProvider>().post("/auth/two-factor-auth/verify", {
		schema: twoFactorAuthVerifySchema,
		preHandler: [server.auth],
		handler: verifyTwoFactorAuthHandler
	});

    server.withTypeProvider<ZodTypeProvider>().post("/auth/login/2fa-verify", {
		schema: twoFactorAuthLoginVerifySchema,
		handler: verifyAndCompleteLogin
	});

}