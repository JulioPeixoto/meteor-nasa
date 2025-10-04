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
    { code: 'pt', label: t('portuguese'), flag: '/flags/brasil.png' }
  ];

  const currentLocale = locales.find(l => l.code === locale);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white relative">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        Meteor NASA
      </h1>

      {/* Botão de logout e dropdown de idiomas */}
      <div className="flex items-center gap-4">
        <LogoutButton />
        
        <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-md hover:bg-slate-600 cursor-pointer"
        >
          <Image src={currentLocale?.flag || '/flags/united-states.png'} alt={currentLocale?.label || 'lang'} width={20} height={20} />
          <span>{currentLocale?.label}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <ul className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
            {locales.map(({ code, label, flag }) => (
              <li key={code}>
                <Link
                  href={`/${code}${pathname.replace(`/${locale}`, '')}`}
                  className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-700 ${
                    code === locale ? 'bg-slate-700' : ''
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Image src={flag} alt={label} width={20} height={20} />
                  {label}
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
