import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { identifier, password } = credentials;
        // 支持用户名或邮箱登录
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
      // Check if OAuth credentials are properly configured
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
        return false;
      }
      
      // 如果是演示配置，显示警告但允许继续
      if (process.env.GOOGLE_CLIENT_ID === "demo_google_client_id_for_testing") {
        console.warn("Using demo Google OAuth credentials. Please configure real credentials for production.");
        return false; // 阻止使用演示凭据登录
      }
      
      // Log successful sign-in for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("OAuth sign-in successful:", { 
          provider: account?.provider, 
          userId: user?.id,
          email: user?.email 
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
              username: profile.email.split('@')[0],
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
        user.id = String(dbUser.id); // 用本地数据库ID覆盖 user.id，确保为字符串
      }
      // Credentials 登录也确保 user.id 为字符串
      if (account?.provider === 'credentials' && user?.id) {
        user.id = String(user.id);
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.username) {
        session.user.username = token.username;
      }
      if (session?.user && token?.uid) {
        session.user.id = String(token.uid);
      } else if (session?.user && token?.sub) {
        session.user.id = String(token.sub);
      }
      return session;
    },
    async jwt({ user, token, account }) {
      if (user?.id) {
        token.uid = String(user.id);
      }
      if (user?.username) {
        token.username = user.username;
      }
      if (account?.provider === 'credentials' && user?.id) {
        token.sub = String(user.id);
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/en/auth/signin", // 使用默认语言的路径
  },
}
