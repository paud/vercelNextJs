import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 微信小程序自动登录 API（安全标准版，无JWT）
 * 用 code 换 openid/session_key，查找/创建用户，返回基础用户信息
 */
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
    console.log('[WeChat MiniProgram API] 微信接口返回:', wxData);
    if (!wxData.openid) {
      console.log('[WeChat MiniProgram API] 微信认证失败:', wxData);
      return NextResponse.json({ error: 'WeChat auth failed', detail: wxData }, { status: 400 });
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

    // 只返回 token 给前端，不返回 openid、session_key、user 信息
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
  }
}
