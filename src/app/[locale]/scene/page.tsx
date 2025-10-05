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
    <div className="bg-black relative overflow-hidden w-full h-full">
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
    </div>
  );
}
