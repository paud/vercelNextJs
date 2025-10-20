export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Form from "next/form";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function LoginUser({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LoginUser' });

  async function loginUser(formData: FormData) {
    "use server";

    try {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      console.log('尝试登录用户:', { username });

      // 查找用户
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username } as any,
            { email: username }
          ]
        }
      } as any);

      if (!user) {
        console.log('用户不存在');
        throw new Error('用户名或密码错误');
      }

      // 简单的密码验证（实际项目中应该使用哈希验证）
      if ((user as any).password !== password) {
        console.log('密码错误');
        throw new Error('用户名或密码错误');
      }

      console.log('用户登录成功:', user);

      // 设置登录cookie
      const cookieStore = await cookies();
      cookieStore.set('userId', user.id.toString(), {
        httpOnly: true,
        secure: false, // 本地开发环境设置为false
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7天
        path: '/'
      });

      cookieStore.set('userInfo', JSON.stringify({
        id: user.id,
        username: (user as any).username,
        email: user.email,
        name: user.name
      }), {
        httpOnly: false, // 允许客户端读取用户信息
        secure: false, // 本地开发环境设置为false
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7天
        path: '/'
      });

      console.log('登录cookie已设置，重定向中...');
      redirect(`/${locale}`);
    } catch (error) {
      console.error('登录失败:', error);
      // 在实际项目中，应该显示错误消息而不是抛出错误
      throw error;
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-12 mb-24">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">{t('title')}</h1>
      
      <Form action={loginUser} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-lg font-medium mb-2 text-gray-700"
          >
            {t('username_or_email')}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            placeholder={t('username_or_email_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-lg font-medium mb-2 text-gray-700"
          >
            {t('password')}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder={t('password_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold"
        >
          {t('submit')}
        </button>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-2">{t('no_account')}</p>
        <Link
          href={`/${locale}/users/new`}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          {t('register_link')}
        </Link>
      </div>
    </div>
  );
}
