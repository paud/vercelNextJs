import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * LIFF 登录 API（完整验证模式）
 * 
 * 功能：验证 access token，调用 LINE API 获取用户信息
 * 安全：后端验证 token 真实性，防止伪造
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

      return NextResponse.json({
        success: true,
        user: {
          id: userData.userId,
          dbId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        profile: userData,
        testMode: true,
      });
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

    // 2. 获取用户 profile（直接用 verifyData，不再请求 profile API）
    const profileData = {
      userId: verifyData.sub,
      displayName: verifyData.name || verifyData.displayName,
      pictureUrl: verifyData.picture || verifyData.pictureUrl,
      email: verifyData.email,
    };
    console.log('[LIFF API] 用户 profile:', profileData);

    // 3. 解析 ID token 获取 email（如果提供）
    let email = `${profileData.userId}@line.user`; // 默认邮箱
    if (idToken) {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          email = payload.email || email;
          console.log('[LIFF API] 从 ID token 解析到 email:', email);
        }
      } catch (error) {
        console.error('[LIFF API] ID token 解析失败:', error);
      }
    }

    const userData = {
      userId: profileData.userId,
      displayName: profileData.displayName,
      pictureUrl: profileData.pictureUrl,
      email: email,
    };

    // 4. 查找或创建用户
    console.log('[LIFF API] 查找或创建用户...');

    // 先通过 LINE Account 查找用户
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'line',
          providerAccountId: userData.userId
        }
      },
      include: {
        user: true
      }
    });

    let user = account?.user || undefined;

    // 如果没有找到，尝试通过 email 查找
    if (!user) {
      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      user = foundUser || undefined;
    }

    if (!user) {
      // 创建新用户和 Account
      console.log('[LIFF API] 用户不存在，创建新用户');
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.displayName || 'LINE User',
          username: null, // 首次登录 username 留空，用户后续可以设置
          image: userData.pictureUrl,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'line',
              providerAccountId: userData.userId,
              access_token: idToken,
              id_token: idToken,
            }
          }
        }
      });
      console.log('[LIFF API] 新用户创建成功:', user.id);

      // 首次 LINE 登录，发送欢迎通知
      await prisma.systemNotification.create({
        data: {
          userId: user.id,
          title: "Welcome!",
          content: "Thank you for registering with LINE. Enjoy our marketplace!",
          type: "welcome"
        }
      });
      console.log('[LIFF API] 欢迎通知已发送');
    } else if (!account) {
      // 用户存在但没有 LINE Account，创建关联
      console.log('[LIFF API] 用户已存在，创建 LINE Account 关联');
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'line',
          providerAccountId: userData.userId,
          access_token: idToken,
          id_token: idToken,
        }
      });
      // 更新用户信息
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          image: userData.pictureUrl || user.image,
          name: userData.displayName || user.name,
        }
      });
      console.log('[LIFF API] LINE Account 关联创建成功');
    } else {
      console.log('[LIFF API] 用户已存在:', user.id);
      // 更新 token（如果提供）
      if ( idToken) {
        await prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: 'line',
              providerAccountId: userData.userId
            }
          },
          data: {
            access_token: account.access_token,
            id_token: idToken || account.id_token,
          }
        });
      }
    }

    // 5. 返回用户信息
    return NextResponse.json({
      success: true,
      user: {
        id: userData.userId, // LINE user ID
        dbId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      profile: userData,
    });

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
