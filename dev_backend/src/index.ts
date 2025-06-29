import Fastify, { fastify, FastifyReply, FastifyRequest } from "fastify";
import fjwt from "@fastify/jwt";
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { userRoutes } from "./modules/user/user.route";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { createUserSchema } from "./modules/user/user.schema";

export const server = Fastify({
    // logger: true,
}); 

declare module "fastify" {
    export interface FastifyInstance {
        auth: any;
    }
};

server.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET,
    sign: {
        algorithm: 'HS256',
        issuer: 'transcendence',
        audience: 'transcendence',
        expiresIn: '60m', // x minutes
    },
    verify: {
        algorithms: ['HS256'],
        issuer: 'transcendence',
        audience: 'transcendence',
    }
});


server.decorate("auth", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (e) {
        return reply.send(e);
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
    server

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