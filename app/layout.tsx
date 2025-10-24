// app/layout.tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "2.zzzz.tech",
  description: "A 2nd hand trade platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full force-light-theme">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-white text-gray-900 force-light-theme">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
