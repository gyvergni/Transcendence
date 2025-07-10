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


export const server = Fastify({
    // logger: true,
}); 

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
        expiresIn: '365d', // m minutes / h hours /d days   
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
        httpError({
            reply,
            code: StatusCodes.UNAUTHORIZED,
            message: "No access token provided",
        });
        return undefined;
    }
    try {
        const test = await request.jwtVerify();
        console.log("User authenticated:", request.user);   
    } catch (e) {
        console.error("Authentication error");
        return httpError({
            reply,
            code: StatusCodes.UNAUTHORIZED,
            message: 'Invalid access token',
        });
    }
});

server.get('/healthcheck', async function() {
    return {status: "OK"};
});

async function main() {
    
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
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
        }
    });

    server.register(userRoutes, {prefix: '/api/users'});
    server.register(guestRoutes, {prefix: '/api/guests'});
    server.register(statRoutes, {prefix: '/api/stats'});

    try {
        await server.listen({ port: 3000, host: "0.0.0.0" });
        console.log('Server ready');
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();