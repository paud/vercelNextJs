import type { NextApiRequest, NextApiResponse } from 'next';
import cors from '@/lib/cors';
import { verifyJWT } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (cors(req, res)) return;
  const user = verifyJWT(req, res);
  if (!user) return;
  res.status(200).json({ node: process.version });
}
