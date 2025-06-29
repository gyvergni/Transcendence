import prisma from "../../utils/prisma";
import { CreateUserBody } from "./user.schema";
import bcrypt from "bcrypt";

export async function createUser(input: CreateUserBody) {
    return await prisma.$transaction(async (tx) => {
        const identitie = await tx.identities.create({});
        const user = await tx.users.create({
            data: {
                pseudo: input.pseudo,
                password: await bcrypt.hash(input.password, 10),
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
    return prisma.users.findUnique({
        where: { pseudo }
    });
};

export async function findUsers() {
    return prisma.users.findMany({
        omit: {
            password: true,
        },
        // include: {
        //     identities: true,
        //     guests: {
        //         select: {
        //             id: true,
        //             pseudo: true
        //         }
        //     },
        // }
    });
};

export async function addFriend(userId: number, friendId: number) {
    console.log("Adding friend:", userId, friendId);
    await prisma.friends.create({
        data: {
            user_id: userId,
            friend_id: friendId,
        }
    })
}

export async function updatePassword(userPseudo: string, newPassword: string) {
    return prisma.users.update({
        where: {pseudo: userPseudo},
        data: {password: newPassword}
    });
}

export async function logoutUser(userId: number) {
    return prisma.users.update({
        where: { id: userId },
        data: { status: false },
    });
}
