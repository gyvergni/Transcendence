import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByPseudo, loginUser, findUsers, addFriend, updatePassword, logoutUser } from "./user.service";
import { CreateUserBody, LoginUserInput, AddFriendInput, ChangePasswordInput } from "./user.schema";
import { server } from "../..";
import { z } from "zod";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, Prisma } from "../../generated/prisma";
import bcrypt from "bcrypt";
import { ca, id } from "zod/v4/locales";

export async function createUserHandler(req: FastifyRequest<{Body: CreateUserBody}>, reply: FastifyReply) {
    const body = req.body;

    try {
        const user = await createUser(body);
        return reply.code(StatusCodes.CREATED).send({id: user.id, pseudo: user.pseudo,
            message: "User created successfully"});
    } 
    catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return httpError({
                    reply,
                    message: "Pseudo already exists",
                    code: StatusCodes.CONFLICT,
                })
            }
        }
        return httpError({
            reply,
            message: "Failed to create user",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function loginUserHandler(req: FastifyRequest<{Body: LoginUserInput}>, reply: FastifyReply){
    const body = req.body;

    const user = await findUserByPseudo(body.pseudo);
    if (!user) {
        return httpError({
            reply,
            message: "Invalid pseudo or password",
            code: StatusCodes.UNAUTHORIZED,
        })
    }

    const unHashedPassword = await bcrypt.hash(body.password, 10);
    console.log("Unhashed password:", unHashedPassword);

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
        return httpError({
            reply,
            message: "Invalid pseudo or password",
            code: StatusCodes.UNAUTHORIZED,
        })
    }

    try {
        await loginUser(user.id);
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to login user",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    const {password, status, ...rest} = user;

    return reply.code(StatusCodes.OK).send({accessToken: await server.jwt.sign(rest)});
}

export async function getUsersHandler(req: FastifyRequest, reply: FastifyReply) {
    
    try {
        const users = await findUsers();
        return reply.code(StatusCodes.OK).send(users);
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to fetch users",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function addFriendHandler(req: FastifyRequest<{Body: AddFriendInput}>, reply: FastifyReply) {
    const body = req.body;
    const token = req.headers.authorization?.substring(7);

    try {
        const user = await findUserByPseudo(body.pseudo);

        if (!user) {
            return httpError({
                reply,
                message: "User not found",
                code: StatusCodes.NOT_FOUND,
            });
        }
        
        const currentUser = await server.jwt.verify<{id: number}>(token || "");
        if (!currentUser) {
            return httpError({
                reply,
                message: "Invalid access token",
                code: StatusCodes.UNAUTHORIZED,
            });
        }

        await addFriend(currentUser.id, user.id);
        return reply.code(StatusCodes.OK).send({message: "Friend added successfully"});

    } catch (e) {
        console.error("Prisma error:", e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return httpError({
                    reply,
                    message: "You are already friends with this user",
                    code: StatusCodes.CONFLICT,
                });
            }
        }
        if (e instanceof Prisma.PrismaClientUnknownRequestError) {
            if (e.message.includes("CHECK constraint failed: user_id != friend_id")) {
                return httpError({
                    reply,
                    message: "You cannot add yourself as a friend",
                    code: StatusCodes.UNPROCESSABLE_ENTITY,
                });
            }
        }
        return httpError({
            reply,
            message: "Failed to find user",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
    

}

export async function changePasswordHandler(req: FastifyRequest<{Body: ChangePasswordInput}>, reply: FastifyReply) {
    const body = req.body;
    const token = req.headers.authorization?.substring(7);
    if (!token) {
        return httpError({
            reply,
            message: "No access token provided",
            code: StatusCodes.UNAUTHORIZED,
        });
    }

    try {
        const user = await server.jwt.verify<{pseudo: string}>(token);

        const dbUser = await findUserByPseudo(user.pseudo);
        if (!dbUser) {
            return httpError({
                reply,
                message: "User not found",
                code: StatusCodes.NOT_FOUND,
            });
        }

        const isOldPasswordValid = await bcrypt.compare(body.oldPassword, dbUser.password);
        if (!isOldPasswordValid) {
            return httpError({
                reply,
                message: "Invalid old password",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
            });
        }

        const newPasswordHash = await bcrypt.hash(body.newPassword, 10);
        
        await updatePassword(dbUser.pseudo, newPasswordHash);
        
        return reply.code(StatusCodes.OK).send({message: "Password changed successfully"});
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to change password",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function logoutUserHandler(req: FastifyRequest, reply: FastifyReply) {
    const token = req.headers.authorization?.substring(7);

    if (!token) {
        return httpError({
            reply,
            message: "No access token provided",
            code: StatusCodes.UNAUTHORIZED,
        });
    }
    try {
        const user = await server.jwt.verify<{id: number}>(token);
        await logoutUser(user.id);
        return reply.code(StatusCodes.OK).send({message: "User logged out successfully"});
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to logout user",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}