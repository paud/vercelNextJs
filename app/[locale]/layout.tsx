import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '../Header';
import Footer from '../Footer';
import Providers from '../providers';

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const { locale } = params;
  console.log('locale:', locale); // 调试输出
  const messages = await getMessages({ locale });
  return (
    <Providers>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="min-h-screen flex flex-col main-layout">
          <Header />
          <main className="flex-1 overflow-auto main-content">{children}</main>
          <Footer /> 
        </div>
      </NextIntlClientProvider>
    </Providers>
  );
}
