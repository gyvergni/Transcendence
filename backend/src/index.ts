import Fastify, { fastify, FastifyReply, FastifyRequest } from "fastify";
import fjwt from "@fastify/jwt";
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { userRoutes } from "./modules/user/user.route";
import { guestRoutes } from "./modules/guest/guest.route";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { StatusCodes } from "http-status-codes";
import { httpError } from "./modules/utils/http";
import { statRoutes } from "./modules/stats/stats.route";
import websocket from '@fastify/websocket';
import { wsRoute } from "./utils/ws";
import { createAIIdentities } from "./utils/prisma";

export const server = Fastify({
}); 

export const path = require('node:path');

declare module "fastify" {
	export interface FastifyInstance {
		auth: any;
    }
};

declare module "@fastify/jwt" {
    export interface FastifyJWT {
		payload: { id: number, pseudo: string };
        user: { id: number, pseudo: string };
    }
}

server.register(require('@fastify/jwt'), {
	secret: process.env.JWT_SECRET,
    sign: {
		algorithm: 'HS256',
        issuer: 'transcendence',
        audience: 'transcendence',
        expiresIn: '7d', // m minutes / h hours /d days   
    },
    verify: {
		algorithms: ['HS256'],
        issuer: 'transcendence',
        audience: 'transcendence',
    }
});

server.decorate("auth", async (request: FastifyRequest, reply: FastifyReply) => {
	const token = request.headers.authorization?.substring(7);
    if (!token) {
        return httpError({
			reply,
            code: StatusCodes.UNAUTHORIZED,
            message: "No access token provided",
            errorKey: "error.auth.no_token"
        });
    }
    try {
		const test = await request.jwtVerify();
    } catch (e) {
        return httpError({
			reply,
            code: StatusCodes.UNAUTHORIZED,
            message: 'Invalid access token',
            errorKey: "error.auth.invalid_token"
        });
    }
});

server.register(require('@fastify/static'), {
	root: path.join(__dirname, '../public/'),
	prefix: '/api/public/',
});

server.register(require('@fastify/multipart'), {
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB
	},
});

server.get('/api/healthcheck', async function() {
    return {status: "OK"};
});


async function main() {
	await server.register(websocket);
	
    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);
	
	
    await server.register(require('@fastify/swagger'), {
		openapi: {
            info: {
                title: 'Fastify API',
                description: 'API documentation for Fastify application',
                version: '1.0.0'
            },
        },
        transform: jsonSchemaTransform,
    });

    server.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
		docExpansion: 'full',
        uiConfig: {
            deepLinking: false,
        }
    });

	await server.register(require('@fastify/cors'), { 
		origin: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true,
	});

    server.register(userRoutes, {prefix: '/api/users'});
    server.register(guestRoutes, {prefix: '/api/guests'});
    server.register(statRoutes, {prefix: '/api/stats'});
	server.register(wsRoute, {prefix: '/ws'});

    try {
        await createAIIdentities();
		const port = parseInt(process.env.BACKEND_PORT || '3000', 10);
        await server.listen({ port: port, host: "0.0.0.0" });
        console.log('Server ready');
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();