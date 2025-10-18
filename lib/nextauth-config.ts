import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      // 如果是演示配置，显示警告但允许继续
      if (process.env.GOOGLE_CLIENT_ID === "demo_google_client_id_for_testing") {
        console.warn("Using demo Google OAuth credentials. Please configure real credentials for production.");
        return false; // 阻止使用演示凭据登录
      }
      return true;
    },
    async session({ session, token, user }) {
      // 确保 session 中包含数据库用户的 ID（数字类型）
      if (session?.user && user?.id) {
        session.user.id = user.id; // 使用数据库中的数字 ID
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/en/auth/signin", // 使用默认语言的路径
  },
}
