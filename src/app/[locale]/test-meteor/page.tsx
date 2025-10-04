'use client';
import { useLocale } from 'next-intl';
import React from 'react'

export default function TestAuthPage() {
  const locale = useLocale();
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm border-2 border-border rounded-base shadow-shadow p-6">
          <h1 className="text-2xl font-heading text-white mb-4">Página de Teste</h1>
          <div className="text-foreground font-base space-y-2">
            <p>Locale atual: <span className="text-main font-base">{locale}</span></p>
            <p>Esta é uma página de teste para verificar a estilização consistente.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
