"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';
import { useTranslations } from "next-intl";
import { apiRequest } from '@/lib/request';

const errorMap: Record<string, string> = {
  "Human verification failed.": "human_verification_failed",
  "This email is already registered. Please use another email.": "email_exists",
  "This username is already taken. Please choose another username.": "username_exists",
  "Registration failed.": "register_failed"
};

export default function NewUser({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations("NewUser");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (!turnstileToken) {
      setError("请完成人机验证");
      setLoading(false);
      return;
    }
    // 注册请求
    const res = await apiRequest("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name, email, phone, password, turnstileToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      const key = errorMap[data.message] || "register_failed";
      setError(t(key as any));
      setIsSuccess(false);
      setLoading(false);
      return;
    }
    setIsSuccess(true);
    setMessage(t("register_success" as any));
    setLoading(false);
    router.replace("/users/login");
  };

  return (
    <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-white rounded-lg shadow-md mt-2 mb-16 min-h-screen flex flex-col justify-start">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">{t('title')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="username" className="flex text-base sm:text-lg font-medium mb-1 sm:mb-2 items-center text-gray-700">
            {t('username')}
            <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{t('required')}</span>
          </label>
          <input type="text" id="username" name="username" required value={username} onChange={e => setUsername(e.target.value)} placeholder={t('username_placeholder')} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="name" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">{t('name')}</label>
          <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('name_placeholder')} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="password" className="flex text-base sm:text-lg font-medium mb-1 sm:mb-2 items-center text-gray-700">{t('password')}<span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{t('required')}</span></label>
          <input type="password" id="password" name="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password_placeholder')} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="email" className="flex text-base sm:text-lg font-medium mb-1 sm:mb-2 items-center text-gray-700">{t('email')}<span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{t('required')}</span></label>
          <input type="email" id="email" name="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email_placeholder')} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">{t('phone')}</label>
          <input type="tel" id="phone" name="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('phone_placeholder')} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        </div>
        <div>
          <Turnstile siteKey="0x4AAAAAAB8kSdvfjPElLqJ_" onSuccess={(token: string) => setTurnstileToken(token)} />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {message && (
          <div className={`mb-4 sm:mb-6 p-4 rounded-lg ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}
        <button type="submit" className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold" disabled={loading || !turnstileToken}>{loading ? t('loading') : t('submit')}</button>
      </form>
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 mb-1 sm:mb-2">{t('have_account')}</p>
        <Link href={`/${locale}/auth/signin`} className="text-blue-500 hover:text-blue-600 font-medium">{t('login_link')}</Link>
      </div>
    </div>
  );
}
