'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { RotatingEarth } from '@/components/EarthComponent';
import { RotatingAsteroid, AsteroidData } from './rotating-asteroid';
import { ImpactEffect } from './impact-effect';

interface AsteroidSceneProps {
  asteroidData: AsteroidData;
  showStars: boolean;
  showEarth: boolean;
  earthData: {
    textureUrl?: string;
    normalMapUrl?: string;
    specularMapUrl?: string;
    cloudsTextureUrl?: string;
  };
  enableImpact?: boolean;
}

export function AsteroidScene({ 
  asteroidData, 
  showStars, 
  showEarth, 
  earthData, 
  enableImpact = false 
}: AsteroidSceneProps) {
  const [impactState, setImpactState] = useState<{
    isActive: boolean;
    position: THREE.Vector3 | null;
  }>({ isActive: false, position: null });
  const [hasTriggered, setHasTriggered] = useState(false);
  const [earthDestroyed, setEarthDestroyed] = useState(false);

  const handleImpact = (position: THREE.Vector3) => {
    if (enableImpact && !hasTriggered) {
      console.log('Impact detected at:', position);
      setImpactState({ isActive: true, position });
      setHasTriggered(true);
      setEarthDestroyed(true);
    }
  };

  const handleImpactComplete = () => {
    setImpactState({ isActive: false, position: null });
    setTimeout(() => {
      setHasTriggered(false);
      setEarthDestroyed(false);
    }, 5000);
  };

  return (
    <>
      {/* Iluminação */}
      <ambientLight intensity={0.6} color="#606060" />
      
      <directionalLight 
        position={[10, 5, 5]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#4A90E2" />
      
      {showEarth && (
        <pointLight 
          position={[-8, 0, 0]} 
          intensity={1.2} 
          color="#87CEEB" 
          distance={15}
        />
      )}

      <hemisphereLight args={["#ffffff", "#404040", 0.4]} />

      <Suspense fallback={null}>
        {showEarth && (
          <group position={[-8, 0, 0]}>
            <RotatingEarth earthData={earthData} isDestroyed={earthDestroyed} />
          </group>
        )}
        
        <RotatingAsteroid 
          asteroidData={asteroidData}
          onImpact={handleImpact}
        />
        
        {impactState.isActive && impactState.position && (
          <ImpactEffect
            position={impactState.position}
            isActive={impactState.isActive}
            onComplete={handleImpactComplete}
          />
        )}
      </Suspense>

      {showStars && (
        <Stars 
          radius={150} 
          depth={80} 
          count={8000} 
          factor={6} 
          saturation={0.2} 
          fade 
          speed={0.5} 
        />
      )}

      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        minDistance={12} 
        maxDistance={50}
        autoRotate={false} 
        autoRotateSpeed={0.4}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}
