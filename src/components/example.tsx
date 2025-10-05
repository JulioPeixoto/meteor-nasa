'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { RotatingEarth } from '@/components/EarthComponent'; // Importa o componente da Terra

export interface AsteroidData {
  name?: string;
  diameter?: number;
  orbitalPeriod?: number;
  rotationPeriod?: number;
  absoluteMagnitude?: number;
  isPotentiallyHazardous?: boolean;
  composition?: 'rocky' | 'metallic' | 'carbonaceous' | 'icy';
  albedo?: number;
  relativeVelocity?: number;
  textureUrl?: string;
  normalMapUrl?: string;
  roughnessMapUrl?: string;
  displacementMapUrl?: string;
  aoMapUrl?: string; 
  displacementScale?: number;
}

// Adiciona dados da Terra nas props
interface MeteorProps {
  asteroidData?: Partial<AsteroidData>;
  showStars?: boolean;
  cameraDistance?: number;
  showEarth?: boolean; // Nova prop para mostrar/ocultar a Terra
  earthTextureUrl?: string;
  earthNormalMapUrl?: string;
  earthSpecularMapUrl?: string;
  earthCloudsTextureUrl?: string;
}

function RotatingAsteroid({ asteroidData }: { asteroidData: AsteroidData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = asteroidData.textureUrl
    ? useLoader(THREE.TextureLoader, asteroidData.textureUrl)
    : null;
  const normalMap = asteroidData.normalMapUrl
    ? useLoader(THREE.TextureLoader, asteroidData.normalMapUrl)
    : null;
  const roughnessMap = asteroidData.roughnessMapUrl
    ? useLoader(THREE.TextureLoader, asteroidData.roughnessMapUrl)
    : null;
  const displacementMap = asteroidData.displacementMapUrl
    ? useLoader(THREE.TextureLoader, asteroidData.displacementMapUrl)
    : null;
  const aoMap = asteroidData.aoMapUrl
    ? useLoader(THREE.TextureLoader, asteroidData.aoMapUrl)
    : null;

  const size = asteroidData.diameter
    ? Math.log10(asteroidData.diameter + 1) * 0.5 + 0.5
    : 1.5;

  const rotationSpeed = asteroidData.rotationPeriod
    ? {
        x: (24 / asteroidData.rotationPeriod) * 0.1,
        y: (24 / asteroidData.rotationPeriod) * 0.15,
      }
    : { x: 0.1, y: 0.15 };

  const getMaterialProps = () => {
    const composition = asteroidData.composition || 'rocky';
    switch (composition) {
      case 'metallic':
        return { color: '#C0C0C0', roughness: 0.3, metalness: 0.9 };
      case 'carbonaceous':
        return { color: '#2C2C2C', roughness: 0.95, metalness: 0.05 };
      case 'icy':
        return { color: '#E0F0FF', roughness: 0.2, metalness: 0.4 };
      default:
        return { color: '#8B4513', roughness: 0.8, metalness: 0.2 };
    }
  };
  const materialProps = getMaterialProps();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed.x;
      meshRef.current.rotation.y += delta * rotationSpeed.y;
    }
  });

  return (
    <mesh ref={meshRef} position={[4, 0, 0]} castShadow receiveShadow> {/* Posicionado ao lado */}
      <sphereGeometry args={[size, 128, 128]} />
      <meshStandardMaterial
        map={texture}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        displacementMap={displacementMap}
        aoMap={aoMap}
        aoMapIntensity={1}
        displacementScale={asteroidData.displacementScale || 0.1}
        color={texture ? '#ffffff' : materialProps.color}
        roughness={1}
        metalness={materialProps.metalness}
      />
    </mesh>
  );
}

// Atualiza a Scene para incluir a Terra
interface SceneProps {
  asteroidData: AsteroidData;
  showStars: boolean;
  showEarth: boolean;
  earthData: {
    textureUrl?: string;
    normalMapUrl?: string;
    specularMapUrl?: string;
    cloudsTextureUrl?: string;
  };
}

function Scene({ asteroidData, showStars, showEarth, earthData }: SceneProps) {
  const dangerGlow = asteroidData.isPotentiallyHazardous ? 0.5 : 0;

  return (
    <>
      <ambientLight intensity={3} />
      <pointLight position={[10, 10, 10]} intensity={4} />
      <directionalLight position={[-10, 5, 5]} intensity={3} castShadow />

      {asteroidData.isPotentiallyHazardous && (
        <pointLight position={[0, 0, 0]} color="#ff4400" intensity={dangerGlow} distance={10} />
      )}

      <Suspense fallback={null}>
        {showEarth && (
          <group position={[-8, 0, 0]}> {/* Terra posicionada à esquerda */}
            <RotatingEarth earthData={earthData} />
          </group>
        )}
        <RotatingAsteroid asteroidData={asteroidData} />
      </Suspense>

      {showStars && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}

      <OrbitControls enableZoom={true} enablePan={true} minDistance={12} autoRotate={false} autoRotateSpeed={0.4} />
    </>
  );
}

export function ThreeJSExample({
  asteroidData: incomingData,
  showStars = true,
  cameraDistance = 8, // Aumentado para ver ambos
  showEarth = true,
  earthTextureUrl = '/textures/earth/earth_atmos_2048.jpg',
  earthNormalMapUrl = '/textures/earth/earth_normal_2048.jpg',
  earthSpecularMapUrl = '/textures/earth/earth_specular_2048.jpg',
  earthCloudsTextureUrl = '/textures/earth/earth_clouds_1024.png',
}: MeteorProps) {
  const asteroidData: AsteroidData = {
    name: 'Asteroide Rochoso Detalhado',
    diameter: 10,
    composition: 'rocky',
    isPotentiallyHazardous: false,
    rotationPeriod: 30,
    absoluteMagnitude: 16,
    textureUrl: '/textures/meteor/Rock031_2K-JPG_Color.jpg',
    normalMapUrl: '/textures/meteor/Rock031_2K-JPG_NormalGL.jpg',
    roughnessMapUrl: '/textures/meteor/Rock031_2K-JPG_Roughness.jpg',
    displacementMapUrl: '/textures/meteor/Rock031_2K-JPG_Displacement.jpg',
    aoMapUrl: '/textures/meteor/Rock031_2K-JPG_AmbientOcclusion.jpg',
    displacementScale: 0.15, 
    ...incomingData,
  };

  const earthData = {
    textureUrl: earthTextureUrl,
    normalMapUrl: earthNormalMapUrl,
    specularMapUrl: earthSpecularMapUrl,
    cloudsTextureUrl: earthCloudsTextureUrl,
    diameter: 12742,
    rotationPeriod: 24,
  };

  return (
    <div className="w-full space-y-4 text-white">
      {asteroidData.name && (
        <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-white text-lg font-bold mb-2">{asteroidData.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {asteroidData.diameter && (
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">Diâmetro:</span> {asteroidData.diameter.toFixed(2)} km
              </div>
            )}
            {asteroidData.composition && (
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">Tipo:</span> {asteroidData.composition}
              </div>
            )}
            {asteroidData.absoluteMagnitude && (
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">Magnitude:</span> {asteroidData.absoluteMagnitude.toFixed(1)}
              </div>
            )}
            {asteroidData.isPotentiallyHazardous !== undefined && (
              <div className={asteroidData.isPotentiallyHazardous ? 'text-red-400' : 'text-green-400'}>
                <span className="font-semibold text-gray-400">Status:</span> {asteroidData.isPotentiallyHazardous ? 'Potencialmente Perigoso' : 'Seguro'}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="w-full h-[55vh]  border-2 border-gray-500 rounded-lg overflow-hidden bg-black relative">
        <Canvas camera={{ position: [0, 0, cameraDistance], fov: 60 }} shadows>
          <Scene 
            asteroidData={asteroidData} 
            showStars={showStars} 
            showEarth={showEarth}
            earthData={earthData}
          />
        </Canvas>
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
          Use o mouse para girar e dar zoom.
        </div>
      </div>
    </div>
  );
}