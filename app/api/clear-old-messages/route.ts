import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.message.deleteMany({
    where: { createdAt: { lt: cutoff } }
  });
  await prisma.$disconnect();
  return new Response(JSON.stringify({ success: true, deleted: result.count }), { status: 200 });
}
