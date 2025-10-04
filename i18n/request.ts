import { getRequestConfig } from 'next-intl/server';

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'pt']
};

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? i18n.defaultLocale,
  messages: (await import(`../src/messages/${locale ?? i18n.defaultLocale}.json`)).default
}));
