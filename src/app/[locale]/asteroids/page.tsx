'use client'; 
import { useState } from 'react'; 
import { useTranslations } from 'next-intl'; 
import { useRouter, useParams } from 'next/navigation'; 
import { ThreeJSExample } from '@/components/example'; 
import FloatingForm from '@/components/floatingform'; 
import type { AsteroidData } from '@/components/example'; 

export default function AsteroidsPage() { 
  const t = useTranslations(); 
  const router = useRouter(); 
  const params = useParams(); 
  const locale = params.locale as string; 
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidData | null>(null); 
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null); 

  const handleAsteroidSelect = (asteroidData: any) => { 
    console.log('Asteroid data received in AsteroidsPage:', asteroidData); 
     
    const neo = asteroidData.neo || asteroidData; 
     
    const findApproachInRange = () => { 
      if (!dateRange || !neo.close_approach_data) return neo.close_approach_data?.[0]; 
       
      return neo.close_approach_data.find((approach: any) => { 
        const approachDate = new Date(approach.close_approach_date).getTime(); 
        const startDate = new Date(dateRange.start).getTime(); 
        const endDate = new Date(dateRange.end).getTime(); 
         
        return approachDate >= startDate && approachDate <= endDate; 
      }) || neo.close_approach_data[0]; 
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
  
  const handleGoToSimulation = () => {
    if (!selectedAsteroid) return;
    
    const kmPerSec = selectedAsteroid.relative_velocity?.kilometers_per_second
      ? parseFloat(selectedAsteroid.relative_velocity.kilometers_per_second)
      : undefined;
    const asteroidParams = new URLSearchParams({
      name: selectedAsteroid.name || '',
      diameter: selectedAsteroid.estimated_diameter_min?.toString() || '100',
      speed: kmPerSec?.toString() || '17000',
      hazardous: selectedAsteroid.is_potentially_hazardous_asteroid?.toString() || 'false',
      composition: selectedAsteroid.composition || 'rocky'
    });
    
    router.push(`/${locale}/simulation?${asteroidParams.toString()}`);
  }; 

  return ( 
    <main className="bg-background relative overflow-hidden min-h-screen"> 
      <div className="h-full flex flex-col"> 
        {/* Layout responsivo: coluna no mobile, linha no desktop */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 m-2"> 
          
          {/* Formulário - largura total no mobile, 1/4 no desktop */}
          <div className="w-full lg:w-1/4 backdrop-blur-sm rounded-xl p-4 max-h-[40vh] lg:max-h-none overflow-y-auto"> 
            <FloatingForm  
              onAsteroidSelect={handleAsteroidSelect} 
              onDateRangeChange={setDateRange} 
            /> 
          </div> 
           
          {/* Visualização 3D - ocupa espaço restante */}
          <div className="flex-1 backdrop-blur-sm rounded-xl p-4 min-h-[50vh] lg:min-h-0 flex flex-col"> 
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-white"> 
                {t('sections.asteroid')} 
              </h2>
            </div>
            <div className="flex-1 min-h-[400px]">
              <ThreeJSExample 
                asteroidData={selectedAsteroid || undefined} 
                showStars={true} 
                cameraDistance={4} 
                onGoToSimulation={handleGoToSimulation}
                isSimulationEnabled={!!selectedAsteroid}
                simulationLabel={t('sections.goToSimulation')}
              /> 
            </div>
            <p className="text-xs text-slate-300 mt-2"> 
              {t('sections.instructions')} 
            </p> 
          </div> 
          
        </div> 
      </div> 
    </main> 
  ); 
}
