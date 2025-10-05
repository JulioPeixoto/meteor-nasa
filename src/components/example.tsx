'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RotatingEarth } from '@/components/EarthComponent';

export interface AsteroidData {
  name?: string;
  orbitalPeriod?: number;
  rotationPeriod?: number;
  estimated_diameter_min?: number;
  estimated_diameter_max?: number;
  absolute_magnitude_h?: number;
  is_potentially_hazardous_asteroid?: boolean;
  composition?: 'rocky' | 'metallic' | 'carbonaceous' | 'icy';
  relative_velocity?: {
    kilometers_per_second?: string;
    kilometers_per_hour?: string;
  };
  close_approach_date?: string;
  close_approach_date_full?: string;
  textureUrl?: string;
  normalMapUrl?: string;
  roughnessMapUrl?: string;
  displacementMapUrl?: string;
  aoMapUrl?: string; 
  displacementScale?: number;
}

interface MeteorProps {
  asteroidData?: Partial<AsteroidData>;
  showStars?: boolean;
  cameraDistance?: number;
  showEarth?: boolean;
  earthTextureUrl?: string;
  earthNormalMapUrl?: string;
  earthSpecularMapUrl?: string;
  earthCloudsTextureUrl?: string;
  enableImpact?: boolean;
}

function RotatingAsteroid({ 
  asteroidData, 
  isColliding, 
  onCollisionComplete 
}: { 
  asteroidData: AsteroidData;
  isColliding: boolean;
  onCollisionComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const collisionTimeRef = useRef(0);

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

  const diameter = asteroidData.estimated_diameter_min ?? 10; 
  const scaleFactor = 0.001; 

  let size = diameter * scaleFactor;
  if (size < 0.15) size = 0.15;
  if (size > 2.5) size = 2.5;

  const rotationSpeed = asteroidData.rotationPeriod
    ? {
        x: (24 / asteroidData.rotationPeriod) * 0.05,
        y: (24 / asteroidData.rotationPeriod) * 0.08,
        z: (24 / asteroidData.rotationPeriod) * 0.03,
      }
    : { x: 0.05, y: 0.08, z: 0.03 };

  // Órbita específica do asteroide (mais próxima da Terra)
  const orbitalRadius = 12; // Distância orbital
  const orbitalSpeed = asteroidData.orbitalPeriod 
    ? (365 / asteroidData.orbitalPeriod) * 0.05 
    : 0.05;

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
    timeRef.current += delta;
    
    if (isColliding) {
      collisionTimeRef.current += delta;
      
      if (groupRef.current && meshRef.current) {
        // Animação de colisão - movimento em direção à Terra
        const collisionProgress = Math.min(collisionTimeRef.current / 3, 1); // 3 segundos de colisão
        
        // Movimento em direção à Terra
        groupRef.current.position.x = THREE.MathUtils.lerp(orbitalRadius, -8, collisionProgress);
        groupRef.current.position.z = THREE.MathUtils.lerp(0, 0, collisionProgress);
        groupRef.current.position.y = THREE.MathUtils.lerp(0, 0, collisionProgress);
        
        // Rotação mais rápida durante a colisão
        meshRef.current.rotation.x += delta * rotationSpeed.x * 3;
        meshRef.current.rotation.y += delta * rotationSpeed.y * 3;
        meshRef.current.rotation.z += delta * rotationSpeed.z * 3;
        
        // Escala aumenta durante a colisão (efeito de impacto)
        const scale = 1 + Math.sin(collisionTimeRef.current * 10) * 0.2;
        meshRef.current.scale.setScalar(scale);
        
        // Finalizar colisão
        if (collisionProgress >= 1) {
          onCollisionComplete();
        }
      }
    } else {
      // Movimento orbital normal
      if (meshRef.current) {
        // Rotação suave do asteroide
        meshRef.current.rotation.x += delta * rotationSpeed.x;
        meshRef.current.rotation.y += delta * rotationSpeed.y;
        meshRef.current.rotation.z += delta * rotationSpeed.z;
        
        // Pequena oscilação para simular movimento irregular
        const wobble = Math.sin(timeRef.current * 2) * 0.1;
        meshRef.current.rotation.x += wobble * delta;
        
        // Reset da escala
        meshRef.current.scale.setScalar(1);
      }

      if (groupRef.current) {
        // Órbita elíptica ao redor da Terra
        const angle = timeRef.current * orbitalSpeed;
        groupRef.current.position.x = Math.cos(angle) * orbitalRadius;
        groupRef.current.position.z = Math.sin(angle) * orbitalRadius * 0.3; // Órbita mais elíptica
        groupRef.current.position.y = Math.sin(angle * 0.5) * 2; // Movimento vertical
        
        // Inclinação orbital
        groupRef.current.rotation.y = angle * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Trail
        width={0.5}
        length={20}
        color={asteroidData.is_potentially_hazardous_asteroid ? "#ff4400" : "#888888"}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
            displacementMap={displacementMap}
            aoMap={aoMap}
            aoMapIntensity={1}
            displacementScale={asteroidData.displacementScale || 0.1}
            color={texture ? '#ffffff' : materialProps.color}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
            envMapIntensity={0.3}
          />
        </mesh>
      </Trail>
      
      {/* Efeito de brilho para asteroides perigosos */}
      {asteroidData.is_potentially_hazardous_asteroid && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 32, 32]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

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
  isColliding: boolean;
  onCollisionComplete: () => void;
}

function Scene({ asteroidData, showStars, showEarth, earthData, isColliding, onCollisionComplete }: SceneProps) {
  const dangerGlow = asteroidData.is_potentially_hazardous_asteroid ? 0.8 : 0;

  return (
    <>
      {/* Iluminação ambiente suave */}
      <ambientLight intensity={0.9} color="#404040" />
      
      {/* Sol - luz principal */}
      <directionalLight 
        position={[10, 5, 5]} 
        intensity={8} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Luz de preenchimento */}
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#4A90E2" />
      
      {/* Luz de destaque para a Terra */}
      {showEarth && (
        <pointLight 
          position={[-8, 0, 0]} 
          intensity={1.2} 
          color="#87CEEB" 
          distance={15}
        />
      )}

      {/* Efeito de perigo para asteroides perigosos */}
      {asteroidData.is_potentially_hazardous_asteroid && (
        <pointLight 
          position={[0, 0, 0]} 
          color="#ff4400" 
          intensity={dangerGlow} 
          distance={8}
        />
      )}

      {/* Luz ambiente espacial */}
      <hemisphereLight 
        args={["#001122", "#000000", 0.5]} 
      />

      <Suspense fallback={null}>
        {showEarth && (
          <group position={[-8, 0, 0]}>
            <RotatingEarth earthData={earthData} />
          </group>
        )}
        <RotatingAsteroid 
          asteroidData={asteroidData} 
          isColliding={isColliding}
          onCollisionComplete={onCollisionComplete}
        />
      </Suspense>

      {showStars && (
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
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

export function ThreeJSExample({
  asteroidData: incomingData,
  showStars = true,
  cameraDistance = 8,
  showEarth = true,
  earthTextureUrl = '/textures/earth/earth_atmos_2048.jpg',
  earthNormalMapUrl = '/textures/earth/earth_normal_2048.jpg',
  earthSpecularMapUrl = '/textures/earth/earth_specular_2048.jpg',
  earthCloudsTextureUrl = '/textures/earth/earth_clouds_1024.png',
  enableImpact = true,
}: MeteorProps) {
  const [isColliding, setIsColliding] = useState(false);
  
  const defaultAsteroidData: AsteroidData = {
    textureUrl: '/textures/meteor/Rock031_2K-JPG_Color.jpg',
    normalMapUrl: '/textures/meteor/Rock031_2K-JPG_NormalGL.jpg',
    roughnessMapUrl: '/textures/meteor/Rock031_2K-JPG_Roughness.jpg',
    displacementMapUrl: '/textures/meteor/Rock031_2K-JPG_Displacement.jpg',
    aoMapUrl: '/textures/meteor/Rock031_2K-JPG_AmbientOcclusion.jpg',
    displacementScale: 0.15,
  };

  const asteroidData: AsteroidData = {
    ...defaultAsteroidData,
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


  const handleCollisionComplete = () => {
    setIsColliding(false);
  };

  return (
    <div className="w-full space-y-4 text-white">
      <div className="p-4 rounded-lg border border-white/10">
        {asteroidData.name ? (
          <>
            <h3 className="text-white text-lg font-bold mb-2">{asteroidData.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {asteroidData.estimated_diameter_min && (
                <div className="text-gray-300">
                  <span className="font-semibold text-gray-400">Diâmetro Mínimo:</span>{' '}
                  {asteroidData.estimated_diameter_min.toFixed(2)} m
                </div>
              )}
              {asteroidData.estimated_diameter_max && (
                <div className="text-gray-300">
                  <span className="font-semibold text-gray-400">Diâmetro Máximo:</span>{' '}
                  {asteroidData.estimated_diameter_max.toFixed(2)} m
                </div>
              )}
              {asteroidData.composition && (
                <div className="text-gray-300">
                  <span className="font-semibold text-gray-400">Tipo:</span> {asteroidData.composition}
                </div>
              )}
              {asteroidData.absolute_magnitude_h && (
                <div className="text-gray-300">
                  <span className="font-semibold text-gray-400">Magnitude:</span> {asteroidData.absolute_magnitude_h.toFixed(1)}
                </div>
              )}
              {asteroidData.relative_velocity?.kilometers_per_second && (
                <div className="text-gray-300">
                  <span className="font-semibold text-gray-400">Velocidade Mínima:</span>{' '}
                  {parseFloat(asteroidData.relative_velocity.kilometers_per_second).toFixed(2)} km/s
                </div>
              )}
              {asteroidData.relative_velocity?.kilometers_per_second && (
                <div className="text-gray-300">
                  <span className="font-semibold text-gray-400">Velocidade Max:</span>{' '}
                  {parseFloat(asteroidData.relative_velocity.kilometers_per_second).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km/s
                </div>
              )}
              {asteroidData.close_approach_date && (
                <div className="text-gray-300 col-span-2">
                  <span className="font-semibold text-gray-400">Data de Aproximação:</span> {asteroidData.close_approach_date}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-4">
            <p className="text-sm">Select an asteroid to see more information</p>
          </div>
        )}
      </div>
      <div className="w-full h-[55vh] border-2 border-gray-500 rounded-lg overflow-hidden bg-black relative">
        <Canvas camera={{ position: [0, 0, cameraDistance], fov: 60 }} shadows>
          <Scene 
            asteroidData={asteroidData} 
            showStars={showStars} 
            showEarth={showEarth}
            earthData={earthData}
            isColliding={isColliding}
            onCollisionComplete={handleCollisionComplete}
          />
        </Canvas>
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
          Use o mouse para girar e dar zoom.
        </div>
      </div>
    </div>
  );
}