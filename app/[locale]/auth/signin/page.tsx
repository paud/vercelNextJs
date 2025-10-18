"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Auth');
  const locale = useLocale();

  useEffect(() => {
    const setUpProviders = async () => {
      try {
        const response = await getProviders();
        setProviders(response);
      } catch (error) {
        console.error("Failed to load providers:", error);
      } finally {
        setLoading(false);
      }
    };
    setUpProviders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {t('signin_title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('signin_subtitle')}
        </p>
        <p className="mt-1 text-center text-xs text-gray-500">
          {t('signin_or_register_note')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {providers && Object.values(providers).length > 0 ? (
                <>
                  {/* 检查是否使用演示配置 */}
                  {process.env.NEXT_PUBLIC_DEMO_MODE && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Demo mode: Google login is not configured with real credentials.
                      </p>
                    </div>
                  )}
                  
                  {Object.values(providers).map((provider) => (
                    <div key={provider.name} className="mb-4">
                      <button
                        onClick={() => signIn(provider.id, { callbackUrl: `/${locale}` })}
                        className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        {provider.id === 'google' && (
                          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        )}
                        {t('signin_with')} {provider.name}
                      </button>
                      {provider.id === 'google' && (
                        <p className="mt-1 text-xs text-gray-500 text-center">
                          {t('google_signin_note')}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">{t('or')}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{t('oauth_not_configured')}</p>
                </div>
              )}
            </>
          )}
          
          <div className="mt-6">
            <Link
              href={`/${locale}/users/login`}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {t('signin_traditional')}
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={`/${locale}`}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {t('back_home')}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              {t('no_account')} {' '}
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
    </div>
  );
}
