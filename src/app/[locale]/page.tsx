'use client';

import { useTranslations } from 'next-intl';
import { ThreeJSExample } from '@/components/example';
import LayoutPage from '@/components/floatingform';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      <div>
      <div className="h-full flex flex-col">
        <div className="text-center p-2">
          <h1 className="text-2xl font-bold text-white mb-1">
            {t('app.title')}
          </h1>
          <p className="text-sm text-slate-300">
            {t('app.subtitle')}
          </p>
        </div>

        <div className="flex-1 flex gap-2 m-2">
          {/* FloatingForm - 1/4 da tela */}
          <div className="w-1/4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <LayoutPage />
          </div>
          
          {/* Asteroide - 3/4 da tela */}
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              {t('sections.asteroid')}
            </h2>
            <ThreeJSExample />
            <p className="text-xs text-slate-300 mt-2">
              {t('sections.instructions')}
            </p>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
