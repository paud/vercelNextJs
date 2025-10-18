export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Form from "next/form";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function NewUser({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NewUser' });

  async function createUser(formData: FormData) {
    "use server";

    try {
      const username = formData.get("username") as string;
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const password = formData.get("password") as string;

      console.log('尝试创建用户:', { username, email, name, phone });

      // 创建用户
      const user = await prisma.user.create({
        data: { username, name, email, phone: phone || undefined, password } as any,
      });

      console.log('User created:', user);
      console.log('Setting cookies...');

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

      console.log('Cookies set, redirecting...');
      redirect(`/${locale}`);
    } catch (error) {
      console.error('创建用户失败:', error);
      // 不重定向，让用户看到错误
      throw error;
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('title')}</h1>
      <Form action={createUser} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="flex text-lg font-medium mb-2 items-center text-gray-700"
          >
            {t('username')}
            <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">
              {t('required')}
            </span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            placeholder={t('username_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-lg font-medium mb-2 text-gray-700">
            {t('name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder={t('name_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="flex text-lg font-medium mb-2 items-center text-gray-700"
          >
            {t('password')}
            <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">
              {t('required')}
            </span>
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
        <div>
          <label
            htmlFor="email"
            className="flex text-lg font-medium mb-2 items-center text-gray-700"
          >
            {t('email')}
            <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">
              {t('required')}
            </span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder={t('email_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-lg font-medium mb-2 text-gray-700">
            {t('phone')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder={t('phone_placeholder')}
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
        <p className="text-gray-600 mb-2">{t('have_account')}</p>
        <Link
          href={`/${locale}/auth/signin`}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          {t('login_link')}
        </Link>
      </div>
    </div>
  );
}
