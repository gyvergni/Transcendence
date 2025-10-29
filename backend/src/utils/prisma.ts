import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

export default prisma;

export async function createAIIdentities() {

    const existingAIs = await prisma.identities.findMany();
    if (existingAIs.length >= 3) {
        return;
    }
    console.log("Creating AI identities...");
    try {
        await prisma.$transaction(async (tx) => {
            const aiEasy = await tx.identities.create({});
            const aiMedium = await tx.identities.create({});
            const aiHard = await tx.identities.create({});
            
            await tx.stats.createMany({
                data: [
                    { id: aiEasy.id },
                    { id: aiMedium.id },
                    { id: aiHard.id },
                ]
            })
        })

    } catch (error) {
        console.error("Error creating AI identities:", error);
    }
}