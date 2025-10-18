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
    <html lang="en" className="h-full">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
