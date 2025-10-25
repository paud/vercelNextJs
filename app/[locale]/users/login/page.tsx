"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Turnstile } from '@marsidev/react-turnstile';
import { useRouter } from "next/navigation";

const TURNSTILE_SITEKEY = "0x4AAAAAAB8kSdvfjPElLqJ_";

export default function LoginUser() {
  const t = useTranslations("LoginUser");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // 自动登录逻辑：如果 URL 有 auto 和 pw 参数，则自动登录
    const params = new URLSearchParams(window.location.search);
    const auto = params.get("auto");
    const pw = params.get("pw");
    if (auto && pw && !loading && !error) {
      setUsername(auto);
      setPassword(pw);
      setLoading(true);
      signIn("credentials", {
        redirect: false,
        identifier: auto,
        password: pw,
      }).then(res => {
        setLoading(false);
        if (!res?.error) {
          router.replace(`/${locale}/users/profile`);
        } else {
          setError(res.error);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!turnstileToken) {
      setError(t("human_verification_required"));
      setLoading(false);
      return;
    }
    const res = await signIn("credentials", {
      redirect: false,
      identifier: username,
      password,
      turnstileToken,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      window.location.href = `/${locale}/users/profile`;
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-white rounded-lg shadow-md mt-2 mb-16 min-h-screen flex flex-col justify-start">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="username" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">{t("username_or_email")}</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={t("username_or_email_placeholder")}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">{t("password")}</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t("password_placeholder")}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        {/* Cloudflare Turnstile 验证 */}
        <div>
          <Turnstile siteKey={TURNSTILE_SITEKEY} onSuccess={(token: string) => setTurnstileToken(token)} />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold"
          disabled={loading || !turnstileToken}
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 mb-1 sm:mb-2">{t("no_account")}</p>
        <Link href={`/users/new`} className="text-blue-500 hover:text-blue-600 font-medium">{t("register_link")}</Link>
      </div>
    </div>
  );
}
