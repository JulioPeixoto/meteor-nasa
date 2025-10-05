'use client';

import { useTranslations } from 'next-intl';
import { Canvas } from '@react-three/fiber';
import { AsteroidScene } from '@/components/three/asteroid-scene';
import type { AsteroidData } from '@/components/three/rotating-asteroid';
import Link from 'next/link';

export default function ScenePage() {
  const t = useTranslations();
  
  const asteroidData: AsteroidData = {
    name: '1 Ceres',
    diameter: 80,
    rotationPeriod: 9.07,
    absoluteMagnitude: 3.4,
    isPotentiallyHazardous: false,
    composition: 'carbonaceous',
    displacementScale: 0.15,
    textureUrl: '/textures/meteor/Rock031_2K-JPG_Color.jpg',
    normalMapUrl: '/textures/meteor/Rock031_2K-JPG_NormalGL.jpg',
    roughnessMapUrl: '/textures/meteor/Rock031_2K-JPG_Roughness.jpg',
    displacementMapUrl: '/textures/meteor/Rock031_2K-JPG_Displacement.jpg',
    aoMapUrl: '/textures/meteor/Rock031_2K-JPG_AmbientOcclusion.jpg',
  };

  const earthData = {
    textureUrl: '/textures/earth/earth_atmos_2048.jpg',
    normalMapUrl: '/textures/earth/earth_normal_2048.jpg',
    specularMapUrl: '/textures/earth/earth_specular_2048.jpg',
    cloudsTextureUrl: '/textures/earth/earth_clouds_1024.png',
    diameter: 12742,
    rotationPeriod: 24,
  };

  return (
    <main className="bg-black relative overflow-hidden w-screen h-screen">
      {/* Canvas em tela cheia */}
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }} 
        shadows
        className="w-full h-full"
      >
        <AsteroidScene 
          asteroidData={asteroidData} 
          showStars={true} 
          showEarth={true}
          earthData={earthData}
          enableImpact={true}
        />
      </Canvas>
      
      {/* Controles de instrução */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="space-y-1">
          <div>🖱️ Mouse: Girar e dar zoom</div>
          <div>💥 Impacto: Asteroide e Terra desaparecem</div>
          <div>⭐ 8000+ estrelas de fundo</div>
        </div>
      </div>
      
      {/* Botão de voltar */}
      <div className="absolute top-4 left-4">
        <Link 
          href="/" 
          className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          ← Voltar
        </Link>
      </div>
    </main>
  );
}
