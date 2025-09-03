import { FastifyReply, FastifyRequest } from "fastify";
import { server } from "../..";
import { httpError } from "../utils/http";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, Prisma } from "../../generated/prisma";
import bcrypt from "bcrypt";
import { createUser, findUserByPseudo, loginUser, findUsers, addFriend, updatePassword, logoutUser, deleteFriend, updateUsername, updateAvatar, twoFactorAuthStatus } from "./user.service";
import { CreateUserBody, LoginUserInput, AddFriendInput, ChangePasswordInput, ChangeUsernameInput } from "./user.schema";
import { getGuestList } from "../guest/guest.service";
import { path } from "../../index"
import { createPendingLoginSession } from "../a2f";

const { pipeline } = require('node:stream/promises');
const fs = require('node:fs');

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

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
        return httpError({
            reply,
            message: "Invalid pseudo or password",
            code: StatusCodes.UNAUTHORIZED,
        })
    }

    try {
        if (await twoFactorAuthStatus(user.id) === true) {
            const loginSessionId = await createPendingLoginSession(user.id);
            return reply.code(StatusCodes.OK).send({
                message: "Two-factor authentication is enabled. Please complete the authentication process.",
                loginSessionId,
            });
        }
        else {
            await loginUser(user.id);
            const {password, status, game_username, avatar, ...rest} = user;
        
            return reply.code(StatusCodes.OK).send({accessToken: await server.jwt.sign(rest)});
        }
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to login user",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function getUsersHandler(req: FastifyRequest<{ Params: {username: string }}>, reply: FastifyReply) {

    try {
        const username = req.params.username;
        let users;
        users = await findUsers();
        if (username && username.length > 0) {
            const user = users.find(u => u.pseudo === username);
            if (!user) {
                return httpError({
                    reply,
                    message: "User not found",
                    code: StatusCodes.NOT_FOUND,
                });
            }
            users = [user];
        }
        return reply.code(StatusCodes.OK).send(users);
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to fetch users",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function getMeHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const user = req.user;
		if (!user) {
			return httpError({
				reply,
				message: "User not found",
				code: StatusCodes.NOT_FOUND,
			});
		}
		const dbUser = await findUserByPseudo(user.pseudo);
		if (!dbUser) {
			return httpError({
				reply,
				message: "User not found in database",
				code: StatusCodes.NOT_FOUND,
			});
		}
		const {password, ...rest} = dbUser;
		return reply.code(StatusCodes.OK).send(rest);
	} catch (e) {
		return httpError({
			reply,
			message: "Failed to fetch user",
			code: StatusCodes.INTERNAL_SERVER_ERROR,
		});
	}
}

export async function addFriendHandler(req: FastifyRequest<{Body: AddFriendInput}>, reply: FastifyReply) {
    const body = req.body;

    try {
        const friend = await findUserByPseudo(body.pseudo);

        if (!friend) {
            return httpError({
                reply,
                message: "User not found",
                code: StatusCodes.NOT_FOUND,
            });
        }
        if (friend.id === req.user.id) {
            return httpError({
                reply,
                message: "You cannot add yourself as a friend",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
            });
        }
        const currentUser = req.user;

        await addFriend(currentUser.id, friend.id);
        return reply.code(StatusCodes.CREATED).send({message: "Friend added successfully"});

    } catch (e) {
        console.error("Prisma error:", e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code ===   'P2002') {
                return httpError({
                    reply,
                    message: "You are already friends with this user",
                    code: StatusCodes.CONFLICT,
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

export async function deleteFriendHandler(req: FastifyRequest<{Body: AddFriendInput}>, reply: FastifyReply) {
    console.log("Delete friend handler called");
    const body = req.body;

    try {
        const friend = await findUserByPseudo(body.pseudo);

        if (!friend) {
            return httpError({
                reply,
                message: "User not found",
                code: StatusCodes.NOT_FOUND,
            });
        }
        const currentUser = req.user;

        const count = await deleteFriend(currentUser.id, friend.id);
        console.log("Count of deleted friends:", count);
        if (count === 0) {
            return httpError({
                reply,
                message: "You are not friends with this user",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
            });
        }
        return reply.code(StatusCodes.OK).send({message: "Friend deleted successfully"});

    } catch (e) {
        console.error("Prisma error:", e);
        return httpError({
            reply,
            message: "Failed to find user",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function changePasswordHandler(req: FastifyRequest<{Body: ChangePasswordInput}>, reply: FastifyReply) {
    const body = req.body;

    try {
        const currentUser = req.user;

        const dbUser = await findUserByPseudo(currentUser.pseudo);
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


export async function changeUsernameHandler(req: FastifyRequest<{Body: ChangeUsernameInput}>, reply: FastifyReply) {
    const body = req.body;
    if (body.newPseudo === "Deleted Guest") {
        return httpError({
            reply,
            code: StatusCodes.BAD_REQUEST,
            message: "Pseudo 'Deleted Guest' is reserved and cannot be used",
        });
    }
    try {
        const currentUser = req.user;

        const dbUser = await findUserByPseudo(currentUser.pseudo);
        if (!dbUser) {
            return httpError({
                reply,
                message: "User not found",
                code: StatusCodes.NOT_FOUND,
            });
        }

        if (await bcrypt.compare(body.password, dbUser.password) === false) {
            return httpError({
                reply,
                message: "Invalid password",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
            });
        }

        const guestList = await getGuestList(currentUser.id);
        if (guestList.some(guest => guest.pseudo === body.newPseudo)) {
            return httpError({
                reply,
                message: "This pseudo is already taken by a guest",
                code: StatusCodes.UNPROCESSABLE_ENTITY,
            });
        }
        await updateUsername(dbUser.id, body.newPseudo);
        return reply.code(StatusCodes.OK).send({message: "Game Username changed successfully"});
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to change username",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }	
}

export async function logoutUserHandler(req: FastifyRequest, reply: FastifyReply) {
	console.log("Logout handler called");
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

export async function changeAvatarHandler(req: FastifyRequest, reply: FastifyReply) {
    const currentUser = req.user;

	
    // if (!avatar || avatar.length === 0) {
		//     return httpError({
			//         reply,
			//         message: "Avatar cannot be empty",
			//         code: StatusCodes.UNPROCESSABLE_ENTITY,
			//     });
			// }
			
	try {
		const data = await (req as FastifyRequest & { file: () => Promise<any> }).file();
	
		// console.log("Received file data:", data); 
	
		if (!data) {
			return httpError({
				reply,
				message: "No file uploaded",
				code: StatusCodes.UNPROCESSABLE_ENTITY,
			});
		}
	
		const ext = path.extname(data.filename);
		const fileName = 'avatar_' + currentUser.id + ext;
		const filePath = path.join(__dirname, '../../../public/avatars', fileName);
	
		await pipeline(data.file, fs.createWriteStream(filePath));
	
		await updateAvatar(currentUser.id, fileName);
        // await updateAvatar(currentUser.id, avatar);
        return reply.code(StatusCodes.OK).send({message: "Avatar changed successfully", avatarUrl: `/public/avatars/${fileName}`});
    } catch (e) {
        return httpError({
            reply,
            message: "Failed to change avatar",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function getAvatarHandler(req: FastifyRequest, reply: FastifyReply) {
	const currentUser = req.user;

	try {
		const user = await findUserByPseudo(currentUser.pseudo);
		if (!user || !user.avatar) {
			return httpError({
				reply,
				message: "Avatar not found",
				code: StatusCodes.NOT_FOUND,
			});
		}

		const avatarUrl = `/public/avatars/${user.avatar}`;
		return reply.code(StatusCodes.OK).send({avatarUrl});
	} catch (e) {
		return httpError({
			reply,
			message: "Failed to get avatar",
			code: StatusCodes.INTERNAL_SERVER_ERROR,
		});
	}
}