import { PrismaClient } from "./generated/prisma-client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient();//.$extends(withAccelerate());

const globalForPrisma = global as unknown as { prisma: typeof prisma };

console.log("Using Accelerate:", !!process.env.PRISMA_ACCELERATE_URL);

export default prisma;
