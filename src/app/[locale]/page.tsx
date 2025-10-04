'use client';

import { useTranslations } from 'next-intl';
import { ThreeJSExample } from '@/components/example';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            {t('app.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            {t('app.subtitle')}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            {t('sections.asteroid')}
          </h2>
          <ThreeJSExample />
          <p className="text-sm text-slate-300 mt-4">
            {t('sections.instructions')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              {t('sections.neoDataTitle')}
            </h3>
            <p className="text-slate-300">
              {t('sections.neoDataText')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              {t('sections.impactTitle')}
            </h3>
            <p className="text-slate-300">
              {t('sections.impactText')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              {t('sections.visualizationTitle')}
            </h3>
            <p className="text-slate-300">
              {t('sections.visualizationText')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
