'use client';
import { useLocale } from 'next-intl';
import React from 'react'

export default function TestAuthPage() {
  const locale = useLocale();
  return (
    <>
    <div>Locale atual: {locale}</div>
    <div>TestAuthPage</div>
    </>
  )
}
