// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meteor NASA',
  description: 'Next.js App with React, Tailwind and i18n'
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const lang = locale ?? 'en';

  return (
    <html lang={lang} className="dark">
      <body className="bg-background text-foreground font-base" suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
