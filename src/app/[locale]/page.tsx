'use client';

import { useTranslations } from 'next-intl';
import { ThreeJSExample } from '@/components/example';
import LayoutPage from '@/components/floatingform';
import type { AsteroidData } from '@/components/example';

export default function HomePage() {
  const t = useTranslations();
  const carbonaceousAsteroid: Partial<AsteroidData> = {
    name: '1 Ceres',
    diameter: 80,
    rotationPeriod: 9.07,
    absoluteMagnitude: 3.4,
    isPotentiallyHazardous: false,
    composition: 'carbonaceous',
    displacementScale: 0.15,
  };

  return (
    <main className="bg-background relative overflow-hidden">
      <div>
      <div className="h-full flex flex-col">


        <div className="flex-1 flex gap-2 m-2">
          {/* FloatingForm - 1/4 da tela */}
          <div className="w-1/4 backdrop-blur-sm rounded-xl p-4">
            <LayoutPage />
          </div>
          
          {/* Asteroide - 3/4 da tela */}
          <div className="flex-1 backdrop-blur-sm rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              {t('sections.asteroid')}
            </h2>
            <ThreeJSExample
              asteroidData={carbonaceousAsteroid}
              showStars={true}
              cameraDistance={4}
            />
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


