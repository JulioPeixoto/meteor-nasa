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
 * Componente que renderiza a Terra em rotação com texturas.
 */
function RotatingEarth({ earthData }: { earthData: EarthData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

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
  const size = earthData.diameter ? earthData.diameter / 6371 : 2;

  // Velocidade de rotação baseada no período (padrão: 24 horas = rotação da Terra)
  const rotationSpeed = earthData.rotationPeriod
    ? (24 / earthData.rotationPeriod) * 0.1
    : 0.1;

  // Animação de rotação
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * rotationSpeed * 1.05; // Nuvens giram um pouco mais rápido
    }
  });

  return (
    <group>
      {/* Terra */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap}
          roughnessMap={specularMap}
          roughness={1}
          metalness={0.1}
          color={texture ? '#ffffff' : '#2563eb'}
        />
      </mesh>

      {/* Camada de nuvens (opcional) */}
      {cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[size * 1.01, 64, 64]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}
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
    textureUrl: './textures/earth_atmos_2048.jpg', // MUDE AQUI para o caminho da sua imagem
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
      <div className="w-full h-96 border-2 border-blue-500/50 rounded-lg overflow-hidden bg-black relative">
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

export { RotatingEarth };
