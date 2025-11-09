"use client";

import { signIn, getProviders } from "next-auth/react";
import type { ClientSafeProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { FaLine, FaWeixin } from "react-icons/fa";
import { SiX } from "react-icons/si";
import LineLoginButton from "@/components/LineLoginButton";

const providerIcons: Record<string, React.ReactNode> = {
  google: (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.23l6.88-6.88C36.18 2.13 30.47 0 24 0 14.82 0 6.7 5.08 2.69 12.44l8.06 6.27C12.6 13.13 17.85 9.5 24 9.5z" />
        <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.44 46.1 24.55z" />
        <path fill="#FBBC05" d="M10.75 28.71c-1.01-2.99-1.01-6.23 0-9.22l-8.06-6.27C.9 17.13 0 20.44 0 24c0 3.56.9 6.87 2.69 9.78l8.06-6.27z" />
        <path fill="#EA4335" d="M24 48c6.47 0 12.18-2.13 16.88-5.86l-7.19-5.6c-2.01 1.35-4.57 2.15-7.69 2.15-6.15 0-11.4-3.63-13.25-8.71l-8.06 6.27C6.7 42.92 14.82 48 24 48z" />
      </g>
    </svg>
  ),
  line: <FaLine className="w-5 h-5 mr-2" />,
  twitter: <SiX className="w-5 h-5 mr-2" color="#fff" />,
};

const defaultProviderIcon = (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 20a10 10 0 100-20 10 10 0 000 20zm1-14a1 1 0 10-2 0v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6z" />
  </svg>
);

const providerStyles: Record<string, string> = {
  line: "bg-[#06C755] text-white hover:bg-[#05b74f] border-transparent",
  twitter: "bg-black text-white hover:bg-gray-900 border-transparent",
};

function isMiniProgram() {
  // 判断是否在微信小程序环境
  return window.__wxjs_environment === 'miniprogram';
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [signingInId, setSigningInId] = useState<string | null>(null);
  const [isMp, setIsMp] = useState(false);
  const t = useTranslations('Auth');
  const locale = useLocale();

  const handleSignIn = async (providerId: string) => {
    if (signingInId) return;
    setSigningInId(providerId);
    try {
      await signIn(providerId, { callbackUrl: `/${locale}/users/profile` });
    } finally {
      // If redirect doesn't happen (e.g., popup blocked), allow retry
      setSigningInId(null);
    }
  };

  useEffect(() => {
    const setUpProviders = async () => {
      try {
        const response = await getProviders();
        setProviders(response);

        // 不再自动触发登录，让 LineAuthWrapper 处理 LINE App 内的登录
        // 如果 LineAuthWrapper 降级，用户可以手动点击登录按钮
      } catch (error: any) {
        console.error("Failed to load providers:", error);
        setLoadError(error);
      } finally {
        setLoading(false);
      }
    };
    setUpProviders();
  }, [locale]);

  useEffect(() => {
    setIsMp(isMiniProgram());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col pt-2 pb-16 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm sm:max-w-md">
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow">
          {t('signin_title')}
        </h2>
        <p className="mt-1 text-center text-sm sm:text-base text-gray-600">
          {t('signin_subtitle')}
        </p>
        <p className="mt-1 text-center text-xs text-gray-500">
          {t('signin_or_register_note')}
        </p>
      </div>

      <div className="mt-3 mx-auto w-full max-w-sm sm:max-w-md">
        <div className="bg-white/90 py-6 px-3 sm:py-8 sm:px-6 shadow-xl rounded-xl sm:rounded-2xl border border-gray-100">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {providers && Object.values(providers).length > 0 ? (
                <div className="flex flex-col gap-3 sm:gap-4">
                  {isMp && (
                    <button
                      className={`flex items-center justify-center py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg font-semibold transition text-base shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed bg-[#07c160] text-white hover:bg-[#06b150] border-transparent w-full`}
                      style={{ marginTop: '0.5rem' }}
                      onClick={async () => {
                          const token = typeof window !== 'undefined' ? localStorage.getItem('wechat_miniprogram_token') : null;
                          if (token) {
                            await signIn('credentials', {
                              redirect: true,
                              provider: 'wechat-miniprogram',
                              token,
                              callbackUrl: `/${locale}/users/profile`,
                            });
                          }
                      }}
                    >
                  <FaWeixin className="w-5 h-5 mr-2" />
                  微信登录（小程序）
                </button>
              )}
              {Object.values(providers)
                .filter((provider) => provider.id !== "credentials")
                .map((provider) => {
                  // 如果是 LINE 登录，使用智能 LINE 登录按钮
                  if (provider.id === 'line') {
                    return <LineLoginButton key={provider.id} />;
                  }

                  // 其他登录方式保持原样
                  return (
                    <button
                      key={provider.id}
                      onClick={() => handleSignIn(provider.id)}
                      disabled={!!signingInId}
                      aria-label={`${t('signin_with')} ${provider.id === 'twitter' ? 'X' : provider.name}`}
                      className={`flex items-center justify-center py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg font-semibold transition text-base shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed ${providerStyles[provider.id] ?? 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'}`}
                    >
                      {providerIcons[provider.id] ?? defaultProviderIcon}
                      {t('signin_with')} {provider.id === 'twitter' ? 'X' : provider.name}
                      {signingInId === provider.id && (
                        <span className="ml-2 inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden />
                      )}
                    </button>
                  );
                })}
            </div>
          ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{t('oauth_not_configured')}</p>
            {loadError && (
              <p className="mt-1 text-xs text-yellow-700">
                Failed to load login providers. Please retry.
              </p>
            )}
          </div>
              )}
        </>
          )}

        <div className="mt-6 sm:mt-8">
          <Link
            href={`/${locale}/users/login`}
            className="w-full flex justify-center py-2.5 px-3 sm:py-3 sm:px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t('signin_traditional')}
          </Link>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <Link
            href={`/${locale}`}
            className="text-base text-blue-600 hover:text-blue-500"
          >
            {t('back_home')}
          </Link>
        </div>

        <div className="mt-3 sm:mt-4 text-center">
          <span className="text-sm text-gray-600">
            {t('no_account')} {" "}
            <Link
              href={`/${locale}/users/new`}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {t('create_account')}
            </Link>
          </span>
        </div>
      </div>
    </div>
    </div >
  );
}
