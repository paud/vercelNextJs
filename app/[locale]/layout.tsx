import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '../Header';
import Footer from '../Footer';

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return (
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col main-layout">
            <Header />
            <main className="flex-1 overflow-auto main-content">{children}</main>
            <Footer /> 
          </div>
        </NextIntlClientProvider>
  );
}
