import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { corsEdge } from '@/lib/cors-edge';

/**
 * 微信小程序 code 登录 API（wechat_signin_by_code）
 * 只需传入 code，即可自动查找/创建用户并生成 session-token（JWT）
 * 返回 { token }，前端可用于 next-auth credentials 登录
 */
export async function OPTIONS(request: Request) {
  // 专门处理 CORS 预检请求，始终返回 Response
  return corsEdge(request, true) ?? new Response(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // 微信接口换 openid/session_key
    const appid = process.env.WECHAT_MINIPROGRAM_APPID;
    const secret = process.env.WECHAT_MINIPROGRAM_SECRET;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const wxRes = await fetch(url);
    const wxData = await wxRes.json();
    if (!wxData.openid) {
      return NextResponse.json({ error: 'WeChat auth failed', detail: wxData, code }, { status: 400 });
    }

    // 查找或创建用户
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'wechat',
          providerAccountId: wxData.openid,
        },
      },
      include: { user: true },
    });
    let user = account?.user;
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: wxData.openid,
          email: `${wxData.openid}@wechat.user`,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'wechat',
              providerAccountId: wxData.openid,
              access_token: wxData.session_key,
            },
          },
        },
      });
    }

    // 生成 JWT session-token
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.NEXTAUTH_SECRET || 'dev_secret';
    const payload = {
      uid: user.id,
      email: user.email,
      username: user.username || null,
      openid: wxData.openid,
      provider: 'wechat-miniprogram',
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
    localStorage.setItem('wechat_miniprogram_token', token);
    // 只返回 token
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ name: 'wechat_signin_by_code' });
}
