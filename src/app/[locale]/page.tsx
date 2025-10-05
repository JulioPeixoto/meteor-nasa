'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ThreeJSExample } from '@/components/example';
import FloatingForm from '@/components/floatingform';
import type { AsteroidData } from '@/components/example';

export default function HomePage() {
  const t = useTranslations();
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidData | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const handleAsteroidSelect = (asteroidData: any) => {
    console.log('Asteroid data received in HomePage:', asteroidData);
    
    const neo = asteroidData.neo || asteroidData;
    
    const findApproachInRange = () => {
      if (!dateRange || !neo.close_approach_data) return neo.close_approach_data?.[0];
      
      return neo.close_approach_data.find((approach: any) => {
        const approachDate = new Date(approach.close_approach_date).getTime();
        const startDate = new Date(dateRange.start).getTime();
        const endDate = new Date(dateRange.end).getTime();
        
        return approachDate >= startDate && approachDate <= endDate;
      }) || neo.close_approach_data[0]; // Fallback para o primeiro se nenhum estiver no range
    };
    
    const approachData = findApproachInRange();
    
    const mappedData: AsteroidData = {
      name: neo.name,
      estimated_diameter_min: neo.estimated_diameter?.meters?.estimated_diameter_min,
      estimated_diameter_max: neo.estimated_diameter?.meters?.estimated_diameter_max,
      absolute_magnitude_h: neo.absolute_magnitude_h,
      is_potentially_hazardous_asteroid: neo.is_potentially_hazardous_asteroid,
      relative_velocity: approachData?.relative_velocity,
      close_approach_date: approachData?.close_approach_date,
      close_approach_date_full: approachData?.close_approach_date_full,
      composition: neo.composition || 'rocky',
    };
    
    setSelectedAsteroid(mappedData);
  };

  return (
    <main className="bg-background relative overflow-hidden">
      <div>
        <div className="h-full flex flex-col">
          <div className="flex-1 flex gap-2 m-2">
            <div className="w-1/4 backdrop-blur-sm rounded-xl p-4">
              <FloatingForm 
                onAsteroidSelect={handleAsteroidSelect}
                onDateRangeChange={setDateRange}
              />
            </div>
            
            <div className="flex-1 backdrop-blur-sm rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-2">
                {t('sections.asteroid')}
              </h2>
              <ThreeJSExample
                asteroidData={selectedAsteroid || undefined}
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