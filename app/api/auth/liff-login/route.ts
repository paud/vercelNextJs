import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiRequest } from '@/lib/request';
const jwt = require('jsonwebtoken');

/**
 * LIFF 登录 API（安全增强+标准返回结构）
 * 验证 idToken，查找/创建用户，生成 session token（JWT），只返回 token 给前端
 */
export async function POST(request: NextRequest) {
  console.log('[LIFF API] 收到 POST 请求');

  try {
    const body = await request.json();
    console.log('[LIFF API] 请求体:', JSON.stringify(body, null, 2));

    const { idToken } = body;

    // 验证必需参数
    if (!idToken) {
      console.log('[LIFF API] ❌ 缺少 idToken');
      return NextResponse.json(
        { error: 'Missing required parameter: idToken' },
        { status: 400 }
      );
    }

    // 🧪 开发环境测试模式（仅用于本地测试）
    const isMockToken = typeof idToken === 'string' && idToken.startsWith('mock_id_token_');
    console.log('[LIFF API] 检查测试模式:', idToken === 'test_id_token_123456' || isMockToken);

    if (process.env.NODE_ENV === 'development' && (idToken === 'test_id_token_123456' || isMockToken)) {
      console.log('[LIFF API] 🧪 使用测试模式');

      const userData = {
        userId: 'U1234567890abcdef',
        displayName: '测试用户',
        pictureUrl: 'https://via.placeholder.com/150',
        email: 'test@line.user',
      };

      // 查找或创建测试用户
      let user = await prisma.user.findFirst({
        where: { email: userData.email }
      });

      if (!user) {
        console.log('[LIFF API] 🧪 创建测试用户');
        user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.displayName,
            image: userData.pictureUrl,
            accounts: {
              create: {
                type: 'oauth',
                provider: 'line',
                providerAccountId: userData.userId,
                access_token: idToken,
              }
            }
          }
        });
      }

      // 生成 session token（JWT）
      const jwtSecret = process.env.NEXTAUTH_SECRET || 'dev_secret';
      const payload = {
        uid: user.id,
        email: user.email,
        provider: 'line-liff',
      };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

      // 只返回 token 给前端
      return NextResponse.json({ token });
    }

    console.log('[LIFF API] 开始完整验证流程');

    const verifyResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        id_token: idToken, // 参数名必须为 id_token
        client_id: process.env.LINE_CLIENT_ID!,
      }).toString(), // ✅ 注意这里要转成字符串
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error("[LIFF API] Token 验证失败", verifyResponse.status, errorText);
      return NextResponse.json({ error: "Invalid id_token", details: errorText }, { status: 401 });
    }

    const verifyData = await verifyResponse.json(); // ✅ 解析响应
    console.log("Token 验证成功:", verifyData);

    // 查找或创建用户
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'line',
          providerAccountId: verifyData.sub
        }
      },
      include: { user: true }
    });
    let user = account?.user;
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: verifyData.email || `${verifyData.sub}@line.user`,
          name: verifyData.name || verifyData.displayName || 'LINE User',
          image: verifyData.picture || verifyData.pictureUrl,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'line',
              providerAccountId: verifyData.sub,
            }
          }
        }
      });
      // 首次 LINE 登录，发送欢迎通知
      await prisma.systemNotification.create({
        data: {
          userId: user.id,
          title: "Welcome!",
          content: "Thank you for registering with LINE. Enjoy our marketplace!",
          type: "welcome"
        }
      });
    }

    // 生成 session token（JWT）
    const jwtSecret = process.env.NEXTAUTH_SECRET || 'dev_secret';
    const payload = {
      uid: user.id,
      email: user.email,
      provider: 'line-liff',
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    // 只返回 token 给前端
    return NextResponse.json({ token });
  } catch (error) {
    console.error('[LIFF API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
