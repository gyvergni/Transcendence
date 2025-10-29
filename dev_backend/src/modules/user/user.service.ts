import prisma from "../../utils/prisma";
import { CreateUserBody } from "./user.schema";
import bcrypt from "bcrypt";

export async function createUser(input: CreateUserBody) {
    return await prisma.$transaction(async (tx) => {
        const identitie = await tx.identities.create({});
        const user = await tx.users.create({
            data: {
                id: identitie.id,
                pseudo: input.pseudo,
                password: await bcrypt.hash(input.password, 10),
                game_username: input.pseudo,
            },
        });
		const twoFactorAuth = await tx.twoFactorAuth.create({
			data: {
				user_id: user.id,
				status: false,
				secret: null,
			},
		});
        await tx.stats.create({
            data: {
                id: identitie.id,
            },
        });
        return user;
    });
};

export async function loginUser(id: number) {
    
    await prisma.users.update({
        where: { id: id },
        data: { status: true },
    })
}

export async function findUserByPseudo(pseudo: string) {
    return await prisma.users.findUnique({
        where: { pseudo }
    });
};

export async function findUsers() {
    return await prisma.users.findMany({
        omit: {
            password: true,
        },
    });
};

export async function findFriends(userId: number) {
	const friends = await prisma.friends.findMany({
		where: { user_id: userId },
		select: {
			users_friends_friend_idTousers: {
				select: {
					id: true,
					pseudo: true,
					game_username: true,
					status: true,
					avatar: true,
				}
			}
		}
	});

	return friends.map(f => ({
		id	: f.users_friends_friend_idTousers.id,
		pseudo: f.users_friends_friend_idTousers.pseudo,
		game_username: f.users_friends_friend_idTousers.game_username,
		status: f.users_friends_friend_idTousers.status,
		avatar: f.users_friends_friend_idTousers.avatar,
	}));
}

export async function addFriend(userId: number, friendId: number) {
    await prisma.friends.create({
        data: {
            user_id: userId,
            friend_id: friendId,
        }
    });
}

export async function deleteFriend(userId: number, friendId: number) {
    const result = await prisma.friends.deleteMany({
        where: {
            user_id: userId,
            friend_id: friendId,
        }
    });
    return result.count;
}

export async function updatePassword(userPseudo: string, newPassword: string) {
    return await prisma.users.update({
        where: {pseudo: userPseudo},
        data: {password: newPassword}
    });
}

export async function logoutUser(userId: number) {
    return await prisma.users.update({
        where: { id: userId },
        data: { status: false },
    });
}

export async function updateUsername(userId: number, newPseudo: string) {
    return await prisma.users.update({
        where: { id: userId },
        data: { game_username: newPseudo },
    });
}

export async function updateAvatar(userId: number, avatar: string) {
    return await prisma.users.update({
        where: { id: userId },
        data: { avatar: avatar },
    });
}

export async function twoFactorAuthStatus(userId: number) {
	const user = await prisma.twoFactorAuth.findUnique({
		where: { user_id: userId }});
	if (!user) {
		throw new Error("Two-factor authentication not found for this user.");
	}
	return user.status;
}