'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

export interface EarthData {
  name?: string;
  diameter?: number;
  rotationPeriod?: number;
  textureUrl?: string;
  normalMapUrl?: string;
  specularMapUrl?: string;
  cloudsTextureUrl?: string;
}

interface EarthProps {
  earthData?: Partial<EarthData>;
  showStars?: boolean;
  cameraDistance?: number;
}

/**
 * Componente que renderiza a Terra em rotação com texturas e atmosfera.
 */
export function RotatingEarth({ earthData }: { earthData: EarthData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Carrega as texturas
  const texture = earthData.textureUrl
    ? useLoader(THREE.TextureLoader, earthData.textureUrl)
    : null;
  const normalMap = earthData.normalMapUrl
    ? useLoader(THREE.TextureLoader, earthData.normalMapUrl)
    : null;
  const specularMap = earthData.specularMapUrl
    ? useLoader(THREE.TextureLoader, earthData.specularMapUrl)
    : null;
  const cloudsTexture = earthData.cloudsTextureUrl
    ? useLoader(THREE.TextureLoader, earthData.cloudsTextureUrl)
    : null;

  // Tamanho da Terra (padrão 2 unidades)
  const size = earthData.diameter ? earthData.diameter / 3000 : 4;

  // Velocidade de rotação baseada no período (padrão: 24 horas = rotação da Terra)
  const rotationSpeed = earthData.rotationPeriod
    ? (24 / earthData.rotationPeriod) * 0.3
    : 0.1;

  // Animação de rotação suave
  useFrame((_, delta) => {
    timeRef.current += delta;
    
    if (meshRef.current) {
      // Rotação da Terra
      meshRef.current.rotation.y += delta * rotationSpeed;
      
      // Pequena oscilação para simular precessão
      const precession = Math.sin(timeRef.current * 0.1) * 0.01;
      meshRef.current.rotation.x = precession;
    }
    
    if (cloudsRef.current) {
      // Nuvens giram um pouco mais rápido e em direção oposta
      cloudsRef.current.rotation.y += delta * rotationSpeed * 1.2;
    }
    
    if (atmosphereRef.current) {
      // Atmosfera com efeito de pulsação
      const pulse = 1 + Math.sin(timeRef.current * 2) * 0.05;
      atmosphereRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Terra */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[size, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap}
          roughnessMap={specularMap}
          roughness={0.8}
          metalness={0.1}
          color={texture ? '#ffffff' : '#2563eb'}
          envMapIntensity={0.2}
        />
      </mesh>

      {/* Camada de nuvens */}
      {cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[size * 1.005, 128, 128]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.6}
            depthWrite={false}
            alphaTest={0.1}
          />
        </mesh>
      )}

      {/* Atmosfera sutil (sem aura) */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[size * 1.005, 64, 64]} />
        <meshBasicMaterial
          color="#4A90E2"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Componente que configura a cena 3D, luzes e controles.
 */
function Scene({ earthData, showStars }: { earthData: EarthData; showStars: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 0, 10]} intensity={2.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} castShadow />

      <Suspense fallback={null}>
        <RotatingEarth earthData={earthData} />
      </Suspense>

      {showStars && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}

      <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

/**
 * Componente principal que renderiza a Terra.
 */
export function EarthComponent({
  earthData: incomingData,
  showStars = true,
  cameraDistance = 5,
}: EarthProps) {
  const earthData: EarthData = {
    name: 'Terra',
    diameter: 12742, // km
    rotationPeriod: 24, // horas
    textureUrl: './textures/earth_color.jpg', // MUDE AQUI para o caminho da sua imagem
    normalMapUrl: './textures/earth_normal.jpg', // Opcional
    specularMapUrl: './textures/earth_specular.jpg', // Opcional
    cloudsTextureUrl: './textures/earth_clouds.jpg', // Opcional
    ...incomingData,
  };

  return (
    <div className="w-full space-y-4">
      {earthData.name && (
        <div className="bg-blue-900/50 backdrop-blur-sm p-4 rounded-lg border border-blue-500/30">
          <h3 className="text-white text-lg font-bold mb-2">🌍 {earthData.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {earthData.diameter && (
              <div className="text-gray-300">
                <span className="font-semibold text-blue-300">Diâmetro:</span> {earthData.diameter.toFixed(0)} km
              </div>
            )}
            {earthData.rotationPeriod && (
              <div className="text-gray-300">
                <span className="font-semibold text-blue-300">Rotação:</span> {earthData.rotationPeriod} horas
              </div>
            )}
          </div>
        </div>
      )}
      <div className="w-full h-96  border-2 border-blue-500/50 rounded-lg overflow-hidden bg-black relative">
        <Canvas camera={{ position: [0, 0, cameraDistance], fov: 60 }} shadows>
          <Scene earthData={earthData} showStars={showStars} />
        </Canvas>
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
          Use o mouse para girar e dar zoom
        </div>
      </div>
    </div>
  );
}