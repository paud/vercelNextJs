import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import cors from '@/lib/cors';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (cors(req, res)) return;
  const user = verifyJWT(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    // 记录用户访问
    const { userId, url, code, title } = req.body;
    console.log('POST user-location-log:', { userId, url, code, title });
    if (!userId || !url) {
      return res.status(400).json({ error: 'Missing userId or url' });
    }
    try {
      await prisma.userLocationLog.upsert({
        where: { userId },
        update: { url, code, title, visitedAt: new Date() },
        create: { userId: String(userId), url, code, title, visitedAt: new Date() }
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Failed to log user location:', err);
      return res.status(500).json({ error: 'Failed to log user location' });
    }
  } else if (req.method === 'GET') {
    // 通过 code 查询 url
    const { code } = req.query;
    console.log('GET user-location-log:', { code });
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid code' });
    }
    try {
      const log = await prisma.userLocationLog.findFirst({
        where: { code },
        orderBy: { visitedAt: 'desc' },
      });
      if (!log) {
        console.log('No record found for code:', code);
        return res.status(404).json({ error: 'No record found for this code' });
      }
      console.log('Found log:', log);
      return res.status(200).json({ url: log.url, userId: log.userId, title: log.title, visitedAt: log.visitedAt });
    } catch (err) {
      console.error('Failed to query user location by code:', err);
      return res.status(500).json({ error: 'Failed to query user location' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
