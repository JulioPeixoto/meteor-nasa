'use client';

import { useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';

export interface AsteroidData {
  name?: string;
  diameter?: number;
  orbitalPeriod?: number;
  rotationPeriod?: number;
  absoluteMagnitude?: number;
  isPotentiallyHazardous?: boolean;
  composition?: 'rocky' | 'metallic' | 'carbonaceous' | 'icy';
  textureUrl?: string;
  normalMapUrl?: string;
  roughnessMapUrl?: string;
  displacementMapUrl?: string;
  aoMapUrl?: string; 
  displacementScale?: number;
}

interface RotatingAsteroidProps {
  asteroidData: AsteroidData;
  onImpact?: (position: THREE.Vector3) => void;
}

export function RotatingAsteroid({ asteroidData, onImpact }: RotatingAsteroidProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const [isDestroyed, setIsDestroyed] = useState(false);

  // Carregar texturas incondicionalmente
  const [texture, normalMap, roughnessMap, displacementMap, aoMap] = useLoader(
    THREE.TextureLoader,
    [
      asteroidData.textureUrl || '',
      asteroidData.normalMapUrl || '',
      asteroidData.roughnessMapUrl || '',
      asteroidData.displacementMapUrl || '',
      asteroidData.aoMapUrl || '',
    ]
  );

  // Tamanho proporcional à Terra
  const size = asteroidData.diameter
    ? (asteroidData.diameter / 12742) * 0.3 + 0.1
    : 0.2;

  // Velocidade de rotação baseada no período
  const rotationSpeed = asteroidData.rotationPeriod
    ? {
        x: (24 / asteroidData.rotationPeriod) * 0.05,
        y: (24 / asteroidData.rotationPeriod) * 0.08,
        z: (24 / asteroidData.rotationPeriod) * 0.03,
      }
    : { x: 0.05, y: 0.08, z: 0.03 };

  // Parâmetros orbitais
  const orbitalRadius = 7;
  const orbitalSpeed = asteroidData.orbitalPeriod 
    ? (365 / asteroidData.orbitalPeriod) * 0.12 
    : 0.12;

  // Propriedades do material baseadas na composição
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
    
    // Rotação do asteroide
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed.x;
      meshRef.current.rotation.y += delta * rotationSpeed.y;
      meshRef.current.rotation.z += delta * rotationSpeed.z;
      
      // Oscilação para simular movimento irregular
      const wobble = Math.sin(timeRef.current * 2) * 0.1;
      meshRef.current.rotation.x += wobble * delta;
      meshRef.current.scale.setScalar(1);
    }

    // Movimento orbital
    if (groupRef.current) {
      const angle = timeRef.current * orbitalSpeed;
      groupRef.current.position.x = Math.cos(angle) * orbitalRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitalRadius;
      groupRef.current.position.y = Math.sin(angle * 0.3) * 1;
      groupRef.current.rotation.y = angle * 0.05;

      // Detecção de colisão com a Terra
      const earthPosition = new THREE.Vector3(-8, 0, 0);
      const asteroidPosition = groupRef.current.position;
      const distance = asteroidPosition.distanceTo(earthPosition);
      
      if (distance < 5.5 && onImpact && !isDestroyed) {
        const direction = asteroidPosition.clone().sub(earthPosition).normalize();
        const impactPosition = earthPosition.clone().add(direction.multiplyScalar(2.2));
        onImpact(impactPosition);
        setIsDestroyed(true);
      }
    }
  });

  if (isDestroyed) return null;

  return (
    <group ref={groupRef}>
      <Trail
        width={0.3}
        length={15}
        color="#666666"
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
    </group>
  );
}
