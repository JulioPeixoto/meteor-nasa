import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { i18n } from '../../../i18n/request';
import Header from '@/components/Header';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthGuard } from '@/components/auth/auth-guard';

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children, params } = props;
  const { locale } = await params;

  if (!i18n.locales.includes(locale)) notFound();

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <AuthProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthGuard>
          <Header locale={locale} />
          {children}
        </AuthGuard>
      </NextIntlClientProvider>
    </AuthProvider>
  );
}