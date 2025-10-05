'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LogoutButton } from '@/components/auth/logout-button';

export default function Header({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations('header');
  const [open, setOpen] = useState(false);

  const locales = [
    { code: 'en', label: t('english'), flag: '/flags/united-states.png' },
    { code: 'pt', label: t('portuguese'), flag: '/flags/brasil.png' },
    { code: 'fr', label: t('france'), flag: '/flags/france.png' },
    { code: 'zh', label: t('chine'), flag: '/flags/china.png' },
    { code: 'es', label: t('spanish'), flag: '/flags/spain.png' },
  ];

  const currentLocale = locales.find(l => l.code === locale);

  return (
    <header className="z-50 flex justify-between items-center px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b-2 border-border">
      <h1 className="flex items-center gap-2 text-xl font-heading text-white">
        Meteor Mitigate
      </h1>

      {/* Botão de logout e dropdown de idiomas */}
      <div className="flex items-center gap-4">
        <LogoutButton />
        
        <div className="relative z-50">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 bg-main border-2 border-border rounded-base shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
        >
          <Image src={currentLocale?.flag || '/flags/united-states.png'} alt={currentLocale?.label || 'lang'} width={20} height={20} />
          <span className="text-main-foreground font-base">{currentLocale?.label}</span>
          <svg
            className={`w-4 h-4 transform transition-transform text-main-foreground ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <ul className="absolute right-0 mt-2 w-40 bg-secondary-background border-2 border-border rounded-base shadow-shadow z-50">
            {locales.map(({ code, label, flag }) => (
              <li key={code}>
                <Link
                  href={`/${code}${pathname.replace(`/${locale}`, '')}`}
                  className={`flex items-center gap-2 px-3 py-2 hover:bg-main hover:text-main-foreground transition-all ${
                    code === locale ? 'bg-main text-main-foreground' : 'text-foreground'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Image src={flag} alt={label} width={20} height={20} />
                  <span className="font-base">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </header>
  );
}
