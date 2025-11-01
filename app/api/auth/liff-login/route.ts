import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * LIFF 登录/同步 API（统一版本）
 * 
 * 支持两种模式：
 * 1. 完整验证模式：验证 access token，调用 LINE API 获取用户信息
 * 2. 快速同步模式：直接接收前端 profile，适用于已经通过 LIFF SDK 获取的数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, idToken, profile, mode = 'verify' } = body;

    let userData: any = null;

    // 模式 1: 完整验证（新的静默登录）
    if (mode === 'verify' && accessToken) {
      console.log('[LIFF API] 模式：完整验证');
      
      // 1. 验证 LINE access token
      const verifyResponse = await fetch('https://api.line.me/oauth2/v2.1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: accessToken,
        }),
      });

      if (!verifyResponse.ok) {
        console.error('[LIFF API] Token 验证失败');
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        );
      }

      const verifyData = await verifyResponse.json();
      console.log('[LIFF API] Token 验证成功:', verifyData);

      // 2. 获取用户 profile
      const profileResponse = await fetch('https://api.line.me/v2/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        console.error('[LIFF API] 获取 profile 失败');
        return NextResponse.json(
          { error: 'Failed to get user profile' },
          { status: 500 }
        );
      }

      const profileData = await profileResponse.json();
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

      userData = {
        userId: profileData.userId,
        displayName: profileData.displayName,
        pictureUrl: profileData.pictureUrl,
        statusMessage: profileData.statusMessage,
        email: email,
      };
    }
    // 模式 2: 快速同步（兼容旧的 liff-sync）
    else if (profile && profile.userId) {
      console.log('[LIFF API] 模式：快速同步（兼容旧版）');
      console.log('[LIFF API] 接收到的 profile:', profile);
      
      userData = {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        email: profile.email || `${profile.userId}@line.user`,
      };
    }
    else {
      return NextResponse.json(
        { error: 'Missing required parameters. Need either accessToken or profile.' },
        { status: 400 }
      );
    }

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
              access_token: accessToken,
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
          access_token: accessToken,
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
      if (accessToken || idToken) {
        await prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: 'line',
              providerAccountId: userData.userId
            }
          },
          data: {
            access_token: accessToken || account.access_token,
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
      mode: mode,
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
