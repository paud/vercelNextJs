// 通用 CORS 中间件
import type { NextApiRequest, NextApiResponse } from 'next';

const allowOrigin = process.env.NEXTAUTH_COOKIE_DOMAIN || '*';

export default function cors(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', allowOrigin); // 支持环境变量配置
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
