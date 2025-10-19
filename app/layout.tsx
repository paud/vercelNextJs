// app/layout.tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AI_UI",
  description: "A blog app using Next.js and Prisma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full force-light-theme">
      <body className="bg-white text-gray-900 force-light-theme">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
