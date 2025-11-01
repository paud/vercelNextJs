import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LineProvider from "@/lib/providers/line"
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        // LIFF 登录字段
        userId: { label: "User ID", type: "text" },
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
        provider: { label: "Provider", type: "text" },
        image: { label: "Image", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        // LIFF 登录流程
        if (credentials.provider === 'line-liff' && credentials.userId) {
          console.log('[NextAuth] LIFF 登录认证:', credentials);
          
          // 先通过 LINE Account 查找用户
          let account = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'line',
                providerAccountId: credentials.userId
              }
            },
            include: {
              user: true
            }
          });

          let user = account?.user || undefined;

          // 如果没有找到，尝试通过 email 查找
          if (!user && credentials.email) {
            const foundUser = await prisma.user.findUnique({
              where: { email: credentials.email }
            });
            user = foundUser || undefined;
          }

          if (!user && credentials.email) {
            // 创建新用户和 Account
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.name || 'LINE User',
                username: null, // 首次登录 username 留空，用户后续可以设置
                image: credentials.image,
                accounts: {
                  create: {
                    type: 'oauth',
                    provider: 'line',
                    providerAccountId: credentials.userId,
                  }
                }
              }
            });
            console.log('[NextAuth] 创建新用户:', user);
            
            // 首次 LINE LIFF 登录，发送欢迎通知
            await prisma.systemNotification.create({
              data: {
                userId: user.id,
                title: "Welcome!",
                content: "Thank you for registering with LINE. Enjoy our marketplace!",
                type: "welcome"
              }
            });
            console.log('[NextAuth] 欢迎通知已发送');
          } else if (user && !account) {
            // 用户存在但没有 LINE Account，创建关联
            await prisma.account.create({
              data: {
                userId: user.id,
                type: 'oauth',
                provider: 'line',
                providerAccountId: credentials.userId,
              }
            });
            // 更新用户信息
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                image: credentials.image || user.image,
              }
            });
            console.log('[NextAuth] 创建 LINE Account 关联:', user);
          }

          if (user) {
            return {
              id: String(user.id),
              name: user.name,
              email: user.email,
              image: user.image,
            };
          }
          
          return null;
        }
        
        // 原有的用户名/密码登录流程
        const { identifier, password } = credentials;
        if (!identifier || !password) return null;
        
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: identifier },
              { email: identifier }
            ]
          }
        });
        if (!user) return null;
        // 这里假设密码明文存储，实际应加密比对
        if (user.password !== password) return null;
        return { id: String(user.id), name: user.name, email: user.email, username: user.username };
      }
    })
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if OAuth credentials are properly configured for Google
      if (account?.provider === 'google') {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          console.error("Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
          return false;
        }
        
        // 如果是演示配置，显示警告但允许继续
        if (process.env.GOOGLE_CLIENT_ID === "demo_google_client_id_for_testing") {
          console.warn("Using demo Google OAuth credentials. Please configure real credentials for production.");
          return false; // 阻止使用演示凭据登录
        }
      }

      // Check if OAuth credentials are properly configured for LINE
      if (account?.provider === 'line') {
        if (!process.env.LINE_CLIENT_ID || !process.env.LINE_CLIENT_SECRET) {
          console.error("LINE OAuth credentials not configured. Please set LINE_CLIENT_ID and LINE_CLIENT_SECRET environment variables.");
          return false;
        }
      }
      
      // Log successful sign-in for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("OAuth sign-in successful:", { 
          provider: account?.provider, 
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          userImage: user?.image,
          profileId: (profile as any)?.id,
          profileSub: (profile as any)?.sub,
          profileEmail: (profile as any)?.email,
          profileName: (profile as any)?.name
        });
      }
      
      // 自动查找或创建本地用户，并将本地 user.id 写入 user.id
      if (account?.provider === 'google' && profile?.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: profile.email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || null,
              username: null, // 首次 Google 登录 username 留空
            }
          });
          // 首次 Google 登录，发送欢迎通知
          await prisma.systemNotification.create({
            data: {
              userId: dbUser.id,
              title: "Welcome!",
              content: "Thank you for registering with Google. Enjoy our marketplace!",
              type: "welcome"
            }
          });
        }
        user.id = String(dbUser.id);
        (user as any).username = dbUser.username;
      }
      
      // LINE 登录处理（参照Google登录逻辑）
      // 重要：在signIn callback中，profile可能为undefined，我们使用user对象
      if (account?.provider === 'line' && user?.id) {
        // LINE提供的email或者使用占位符email（LINE通常不提供email）
        const lineEmail = user.email || `${user.id}@line.user`; // 统一使用 @line.user
        
        console.log('[NextAuth LINE] Processing sign-in:', { 
          userId: user.id, 
          email: lineEmail,
          name: user.name 
        });
        
        // 首先通过email查找用户（和Google一样）
        let dbUser = await prisma.user.findUnique({ where: { email: lineEmail } });
        
        if (!dbUser) {
          // 用户不存在，创建新用户
          dbUser = await prisma.user.create({
            data: {
              email: lineEmail,
              name: user.name || null,
              username: null, // 和Google一样，username留空
            }
          });
          console.log('[NextAuth LINE] Created new user:', { 
            id: dbUser.id, 
            username: dbUser.username, 
            email: dbUser.email 
          });
          
          // 首次 LINE 登录，发送欢迎通知
          await prisma.systemNotification.create({
            data: {
              userId: dbUser.id,
              title: "Welcome!",
              content: "Thank you for registering with LINE. Enjoy our marketplace!",
              type: "welcome"
            }
          });
        } else {
          console.log('[NextAuth LINE] Found existing user:', { 
            id: dbUser.id, 
            username: dbUser.username, 
            email: dbUser.email 
          });
        }
        
        // 设置user对象（和Google一样）
        user.id = String(dbUser.id);
        user.email = dbUser.email; // 重要：设置email，否则session中email为undefined
        (user as any).username = dbUser.username;
        
        console.log('[NextAuth LINE] Set user object:', { 
          id: user.id, 
          email: user.email,
          username: (user as any).username 
        });
      }

      // Credentials 登录也确保 user.id 为字符串
      if (account?.provider === 'credentials' && user?.id) {
        user.id = String(user.id);
      }
      return true;
    },
    async session({ session, token }) {
      // 确保 session.user 存在
      if (!session?.user) return session;

      // 优先使用 token.uid（从 signIn callback 中设置），其次使用 token.sub
      const userId = token?.uid || token?.sub;
      
      if (userId) {
        session.user.id = String(userId);
      } else {
        console.warn('[NextAuth Session] No user ID found in token:', token);
      }

      // 设置 username
      if (token?.username) {
        (session.user as any).username = token.username;
      }

      // 设置 email（如果token中有email，使用token的email）
      if (token?.email) {
        session.user.email = token.email;
      }

      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log('[NextAuth Session]:', {
          userId: session.user.id,
          username: (session.user as any).username,
          email: session.user.email,
          hasToken: !!token
        });
      }

      return session;
    },
    async jwt({ user, token, account }) {
      // 首次登录时，user 对象存在
      if (user?.id) {
        token.uid = String(user.id);
        
        // 设置 email（重要！）
        if (user.email) {
          token.email = user.email;
        }
        
        // 设置 username
        if ((user as any)?.username) {
          token.username = (user as any).username;
        }
        
        // Credentials provider 特殊处理
        if (account?.provider === 'credentials') {
          token.sub = String(user.id);
        }

        // Debug log in development
        if (process.env.NODE_ENV === "development") {
          console.log('[NextAuth JWT] Initial token created:', {
            uid: token.uid,
            email: token.email,
            username: token.username,
            provider: account?.provider
          });
        }
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: `/${typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'en') : 'en'}/auth/signin`,
  },
}
