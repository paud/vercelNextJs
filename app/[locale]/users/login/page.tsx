"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function LoginUser() {
  const t = useTranslations("LoginUser");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 处理 next-auth 错误参数
  const urlError = searchParams?.get("error");
  const errorMsg =
    urlError === "CredentialsSignin"
      ? t("error_invalid_credentials")
      : urlError
      ? t("error_unknown")
      : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const redirectAfterLogin =
      (typeof window !== "undefined" && localStorage.getItem("redirectAfterLogin")) || `/${locale}`;
    const res = await signIn("credentials", {
      identifier: username,
      password,
      redirect: false,
      callbackUrl: redirectAfterLogin,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? t("error_invalid_credentials")
          : t("error_unknown")
      );
    } else if (res?.ok) {
      router.replace(res.url || `/${locale}`);
    }
  }

  return (
    <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-white rounded-lg shadow-md mt-2 mb-16 min-h-screen flex flex-col justify-start">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <input type="hidden" name="redirectAfterLogin" value={typeof window !== "undefined" ? (localStorage.getItem("redirectAfterLogin") || "") : ""} />
        <div>
          <label htmlFor="username" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">
            {t("username_or_email")}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            placeholder={t("username_or_email_placeholder")}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">
            {t("password")}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder={t("password_placeholder")}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {(error || errorMsg) && (
          <div className="text-red-600 text-sm font-medium text-center py-1">{error || errorMsg}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 mb-1 sm:mb-2">{t("no_account")}</p>
        <Link href={`/${locale}/users/new`} className="text-blue-500 hover:text-blue-600 font-medium">
          {t("register_link")}
        </Link>
      </div>
    </div>
  );
}
