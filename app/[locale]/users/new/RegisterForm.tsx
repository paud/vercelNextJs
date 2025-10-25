"use client";
import { Turnstile } from '@marsidev/react-turnstile';
import { useState } from 'react';
import Link from 'next/link';

interface RegisterFormProps {
  locale: string;
  title: string;
  username: string;
  usernamePlaceholder: string;
  name: string;
  namePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  required: string;
  submit: string;
  haveAccount: string;
  loginLink: string;
}

export default function RegisterForm(props: RegisterFormProps) {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const {
    locale,
    title,
    username,
    usernamePlaceholder,
    name,
    namePlaceholder,
    password,
    passwordPlaceholder,
    email,
    emailPlaceholder,
    phone,
    phonePlaceholder,
    required,
    submit,
    haveAccount,
    loginLink,
  } = props;

  return (
    <>
      <div>
        <label htmlFor="username" className="flex text-base sm:text-lg font-medium mb-1 sm:mb-2 items-center text-gray-700">
          {username}
          <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{required}</span>
        </label>
        <input type="text" id="username" name="username" required placeholder={usernamePlaceholder} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="name" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">{name}</label>
        <input type="text" id="name" name="name" placeholder={namePlaceholder} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="password" className="flex text-base sm:text-lg font-medium mb-1 sm:mb-2 items-center text-gray-700">
          {password}
          <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{required}</span>
        </label>
        <input type="password" id="password" name="password" required placeholder={passwordPlaceholder} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="email" className="flex text-base sm:text-lg font-medium mb-1 sm:mb-2 items-center text-gray-700">
          {email}
          <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{required}</span>
        </label>
        <input type="email" id="email" name="email" required placeholder={emailPlaceholder} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">{phone}</label>
        <input type="tel" id="phone" name="phone" placeholder={phonePlaceholder} className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
      </div>
      {/* Cloudflare Turnstile 验证 */}
      <div>
        <Turnstile siteKey="0x4AAAAAAB8kSdvfjPElLqJ_" onSuccess={(token: string) => setTurnstileToken(token)} />
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken || ''} />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold" disabled={!turnstileToken}>{submit}</button>
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 mb-1 sm:mb-2">{haveAccount}</p>
        <Link href={`/${locale}/auth/signin`} className="text-blue-500 hover:text-blue-600 font-medium">{loginLink}</Link>
      </div>
    </>
  );
}
