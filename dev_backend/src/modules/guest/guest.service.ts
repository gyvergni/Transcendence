import prisma from "../../utils/prisma";

export async function getGuestList(id: number) {
    return await prisma.guests.findMany({
        where: {
            user_id: id,
            active: true,
        },
        select: {
            id: true,
            pseudo: true,
            active: true,
        }
    })
}

export async function createGuest(userId: number, guestPseudo: string) {
    return await prisma.$transaction(async (tx) => {
        const identitie = await tx.identities.create({});
        const guest = await tx.guests.create({
            data: {
                id: identitie.id,
                user_id: userId,
                pseudo: guestPseudo,
            }
        });
        await tx.stats.create({
            data: {
                id: identitie.id,
            },
        });
        return guest;
    })
}

export async function deleteGuest(guestId: number) {
    await prisma.guests.update({
        where: {
            id: guestId,
        },
        data: {
            active: false,
            pseudo: "Deleted Guest",
        }
    })
}

export async function getAllGuests() {
    return await prisma.guests.findMany({
        where: {
            active: true,
        },
        select: {
            id: true,
            pseudo: true,
            user_id: true,
        }
    });
}

export async function getInactiveGuests() {
    return await prisma.guests.findMany({
        where: {
            active: false,
        },
        select: {
            id: true,
            pseudo: true,
            user_id: true,
        }
    });
}