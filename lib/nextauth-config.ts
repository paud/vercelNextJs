import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
              // 可根据 schema 增加更多字段
            }
          });
        }
        user.id = String(dbUser.id); // 用本地数据库ID覆盖 user.id，确保为字符串
      }
      
      return true;
    },
    async session({ session, token }) {
      // 将用户ID写入 session（JWT 模式下从 token 读取，确保为字符串）
      if (session?.user && token?.uid) {
        session.user.id = String(token.uid);
      }
      return session;
    },
    async jwt({ user, token }) {
      // 用本地 user.id 写入 token.uid
      if (user) {
        token.uid = user.id;
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
