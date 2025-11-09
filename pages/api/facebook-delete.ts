import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Facebook App Secret
const APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';

function parseSignedRequest(signedRequest: string) {
  const [encodedSig, payload] = signedRequest.split('.');
  const sig = Buffer.from(encodedSig, 'base64');
  const data = JSON.parse(Buffer.from(payload, 'base64').toString());
  const expectedSig = crypto
    .createHmac('sha256', APP_SECRET)
    .update(payload)
    .digest();
  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error('Invalid signature');
  }
  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed...' });
  }
  const { signed_request } = req.body;
  if (!signed_request) {
    return res.status(400).json({ error: 'Missing signed_request' });
  }
  let data;
  try {
    data = parseSignedRequest(signed_request);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid signed_request' });
  }
  // Facebook 用户ID
  const userId = data.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'No user_id found' });
  }
  /*/ 删除用户相关数据（伪代码，需根据你的实际数据库结构调整）
  try {
    await prisma.user.deleteMany({
      where: {
        accounts: {
          some: {
            provider: 'facebook',
            providerAccountId: userId,
          },
        },
      },
    });
  } catch (err) {
    // 忽略删除失败（如用户不存在）
  }*/
  // Facebook 要求返回 status_url，可用于查询删除进度
  const statusUrl = `${req.headers.origin || ''}/api/facebook-delete-status?user_id=${userId}`;
  return res.json({
    url: statusUrl,
    confirmation_code: userId,
  });
}
