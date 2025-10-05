'use client'

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { ExitIcon } from '@/components/custom/icons'

export function LogoutButton({ className }: { className?: string }) {
  const t = useTranslations('header');

  return (
    <button
      onClick={() => signOut()}
      className={`flex items-center gap-2 text-black hover:underline ${className}`}
    >
      <ExitIcon size={20} />
      <span className="font-base">{t('logout')}</span>
    </button>
  )
}
