// app/layout.tsx
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata = {
  title: "AI_UI",
  description: "A blog app using Next.js and Prisma",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <html lang="en" className="h-full">
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* 只渲染 children，不再渲染 Header */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
