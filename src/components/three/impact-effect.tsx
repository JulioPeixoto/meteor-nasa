'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ImpactEffectProps {
  position: THREE.Vector3;
  isActive: boolean;
  onComplete: () => void;
}

// Componente do efeito de impacto realista
export function ImpactEffect({ position, isActive, onComplete }: ImpactEffectProps) {
  const explosionRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const craterRef = useRef<THREE.Mesh>(null);
  const debrisRefs = useRef<THREE.Mesh[]>([]);
  const fireRefs = useRef<THREE.Mesh[]>([]);
  const smokeRefs = useRef<THREE.Mesh[]>([]);
  const sparkRefs = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);

  // Gerar partículas uma vez
  const [debrisPositions] = useState(() => 
    Array.from({ length: 300 }, () => ({
      position: [
        (Math.random() - 0.5) * 8,
        Math.random() * 4,
        (Math.random() - 0.5) * 8
      ],
      velocity: [
        (Math.random() - 0.5) * 4,
        Math.random() * 5 + 3,
        (Math.random() - 0.5) * 4
      ]
    }))
  );

  const [firePositions] = useState(() => 
    Array.from({ length: 200 }, () => ({
      position: [
        (Math.random() - 0.5) * 7,
        Math.random() * 3.5,
        (Math.random() - 0.5) * 7
      ],
      size: Math.random() * 0.6 + 0.1,
      intensity: Math.random() * 0.5 + 0.5
    }))
  );

  const [smokePositions] = useState(() => 
    Array.from({ length: 150 }, () => ({
      position: [
        (Math.random() - 0.5) * 6,
        Math.random() * 3,
        (Math.random() - 0.5) * 6
      ],
      velocity: [
        (Math.random() - 0.5) * 1.5,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 1.5
      ],
      size: Math.random() * 0.3 + 0.05
    }))
  );

  const [sparkPositions] = useState(() => 
    Array.from({ length: 100 }, () => ({
      position: [
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        (Math.random() - 0.5) * 4
      ],
      velocity: [
        (Math.random() - 0.5) * 5,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 5
      ],
      size: Math.random() * 0.1 + 0.02
    }))
  );

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      timeRef.current = 0;
    }
  }, [isActive]);

  useFrame(({ camera }, delta) => {
    if (!isActive || !isVisible) return;

    timeRef.current += delta;

    // Efeito de tremor da câmera
    if (timeRef.current < 2) {
      const shakeIntensity = Math.max(0, 0.3 - timeRef.current * 0.15);
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      camera.position.y += (Math.random() - 0.5) * shakeIntensity;
      camera.position.z += (Math.random() - 0.5) * shakeIntensity;
    }

    // Animação da explosão inicial
    if (explosionRef.current) {
      const scale = Math.min(timeRef.current * 4, 6);
      explosionRef.current.scale.setScalar(scale);
      const opacity = Math.max(0, 1 - timeRef.current * 0.6);
      (explosionRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }

    // Animação da onda de choque
    if (shockwaveRef.current) {
      const scale = Math.min(timeRef.current * 1.5, 15);
      shockwaveRef.current.scale.setScalar(scale);
      const opacity = Math.max(0, 1 - timeRef.current * 0.15);
      (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }

    // Animação da cratera
    if (craterRef.current) {
      const scale = Math.min(timeRef.current * 0.5, 2);
      craterRef.current.scale.setScalar(scale);
      const opacity = timeRef.current < 2 
        ? Math.min(1, timeRef.current * 0.5)
        : Math.max(0, 1 - (timeRef.current - 2) * 0.2);
      (craterRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }

    // Animação dos detritos
    debrisRefs.current.forEach((debris, i) => {
      if (debris) {
        const data = debrisPositions[i];
        debris.position.x += data.velocity[0] * delta;
        debris.position.y += data.velocity[1] * delta;
        debris.position.z += data.velocity[2] * delta;
        data.velocity[1] -= 2 * delta;
        debris.rotation.x += delta * 1.2;
        debris.rotation.y += delta * 0.8;
        debris.rotation.z += delta * 1.5;
        const opacity = Math.max(0, 1 - timeRef.current * 0.3);
        (debris.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    });

    // Animação do fogo
    fireRefs.current.forEach((fire, i) => {
      if (fire) {
        fire.position.y += Math.sin(timeRef.current * 5 + i) * 0.1 * delta;
        const opacity = Math.max(0, 1 - timeRef.current * 0.4);
        (fire.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    });

    // Animação das faíscas
    sparkRefs.current.forEach((spark, i) => {
      if (spark) {
        const data = sparkPositions[i];
        spark.position.x += data.velocity[0] * delta;
        spark.position.y += data.velocity[1] * delta;
        spark.position.z += data.velocity[2] * delta;
        data.velocity[1] -= 3 * delta;
        spark.rotation.x += delta * 2;
        spark.rotation.y += delta * 1.5;
        spark.rotation.z += delta * 1.8;
        const opacity = Math.max(0, 1 - timeRef.current * 0.8);
        (spark.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    });

    // Animação da fumaça
    smokeRefs.current.forEach((smoke, i) => {
      if (smoke) {
        const data = smokePositions[i];
        smoke.position.x += data.velocity[0] * delta;
        smoke.position.y += data.velocity[1] * delta;
        smoke.position.z += data.velocity[2] * delta;
        smoke.position.y += Math.sin(timeRef.current * 2 + i) * 0.05 * delta;
        const opacity = Math.max(0, 1 - timeRef.current * 0.2);
        (smoke.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    });

    // Finalizar efeito após 8 segundos
    if (timeRef.current > 8) {
      setIsVisible(false);
      onComplete();
    }
  });

  if (!isVisible) return null;

  return (
    <group position={position}>
      {/* Explosão central */}
      <mesh ref={explosionRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Onda de choque */}
      <mesh ref={shockwaveRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Cratera */}
      <mesh ref={craterRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#8B4513"
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Detritos */}
      {debrisPositions.map((data, i) => (
        <mesh 
          key={`debris-${i}`} 
          ref={(el) => { if (el) debrisRefs.current[i] = el; }}
          position={data.position as any}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <boxGeometry args={[
            0.05 * (0.5 + Math.random() * 0.5),
            0.05 * (0.5 + Math.random() * 0.5),
            0.05 * (0.5 + Math.random() * 0.5)
          ]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? "#654321" : i % 3 === 1 ? "#8B4513" : "#A0522D"}
            transparent
            opacity={1}
          />
        </mesh>
      ))}

      {/* Fogo */}
      {firePositions.map((data, i) => (
        <mesh 
          key={`fire-${i}`} 
          ref={(el) => { if (el) fireRefs.current[i] = el; }}
          position={data.position as any}
        >
          <sphereGeometry args={[data.size * (0.4 + Math.random() * 0.3), 8, 8]} />
          <meshBasicMaterial
            color={
              i % 4 === 0 ? "#ff0000" : 
              i % 4 === 1 ? "#ff4400" : 
              i % 4 === 2 ? "#ff8800" : "#ffaa00"
            }
            transparent
            opacity={0.9 * data.intensity}
          />
        </mesh>
      ))}

      {/* Fumaça */}
      {smokePositions.map((data, i) => (
        <mesh 
          key={`smoke-${i}`} 
          ref={(el) => { if (el) smokeRefs.current[i] = el; }}
          position={data.position as any}
        >
          <sphereGeometry args={[data.size, 12, 12]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? "#444444" : i % 3 === 1 ? "#666666" : "#888888"}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Faíscas */}
      {sparkPositions.map((data, i) => (
        <mesh 
          key={`spark-${i}`} 
          ref={(el) => { if (el) sparkRefs.current[i] = el; }}
          position={data.position as any}
        >
          <sphereGeometry args={[data.size * (1.5 + Math.random() * 0.5), 8, 8]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? "#ffff00" : i % 3 === 1 ? "#ffaa00" : "#ff6600"}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}