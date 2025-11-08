import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body;
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  // 用微信接口换取 openid
  const appid = process.env.WECHAT_MINIPROGRAM_APPID;
  const secret = process.env.WECHAT_MINIPROGRAM_SECRET;
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
  const wxRes = await fetch(url);
  const wxData = await wxRes.json();

  if (!wxData.openid) {
    return NextResponse.json({ error: 'WeChat auth failed', detail: wxData }, { status: 400 });
  }

  // 查找或创建 account
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

  // 如果没有 account，则新建用户和 account
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: wxData.openid, // 可根据实际需求调整
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

  // 返回用户信息和 openid，供前端走 NextAuth CredentialsProvider 登录
  return NextResponse.json({ user, openid: wxData.openid, session_key: wxData.session_key });
}
