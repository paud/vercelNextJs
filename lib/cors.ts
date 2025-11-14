// 通用 CORS 中间件
import type { NextApiRequest, NextApiResponse } from 'next';

export default function cors(req: NextApiRequest, res: NextApiResponse, allowAll: boolean = false) {
  let allowOrigin = '*';
  const origin = req.headers.origin;
  if (!allowAll) {
    if (origin && origin.endsWith('.zzzz.tech')) {
      allowOrigin = origin;
    } else if (process.env.CORS_ALLOW_ORIGIN) {
      allowOrigin = process.env.CORS_ALLOW_ORIGIN;
    } else if (process.env.NEXTAUTH_COOKIE_DOMAIN) {
      allowOrigin = process.env.NEXTAUTH_COOKIE_DOMAIN;
    }
  }
  res.setHeader('Access-Control-Allow-Origin', allowOrigin); // 支持环境变量和自动判断
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
