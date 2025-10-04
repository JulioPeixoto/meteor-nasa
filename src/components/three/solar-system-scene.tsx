'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useMemo, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { Meteor } from './meteor'

type SolarSystemSceneProps = {
  widthClass?: string
  heightClass?: string
  meteorTexture?: string
  meteorSize?: number
  running?: boolean
  speed?: number
  startKey?: number
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const radius = 0
  
  const dayTexture = useLoader(THREE.TextureLoader, '/textures/earth/earth_day_4096.jpg')
  const nightTexture = useLoader(THREE.TextureLoader, '/textures/earth/earth_night_4096.jpg')
  const normalTexture = useLoader(THREE.TextureLoader, '/textures/earth/earth_normal_2048.jpg')
  const specularTexture = useLoader(THREE.TextureLoader, '/textures/earth/earth_specular_2048.jpg')
  const cloudsTexture = useLoader(THREE.TextureLoader, '/textures/earth/earth_clouds_1024.png')
  
  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += 0.4 * delta
  })
  
  return (
    <Suspense fallback={null}>
      <group>
        <mesh ref={meshRef} position={[radius, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[2.0, 64, 64]} />
          <meshStandardMaterial
            map={dayTexture}
            normalMap={normalTexture}
            roughnessMap={specularTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh ref={meshRef} position={[radius, 0, 0]}>
          <sphereGeometry args={[2.01, 64, 64]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.4}
            alphaMap={cloudsTexture}
          />
        </mesh>
      </group>
    </Suspense>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.8} />
    </>
  )
}

export function SolarSystemScene3D({ widthClass = 'w-full', heightClass = 'h-96', meteorTexture, meteorSize = 0.8, running = true, speed = 1, startKey }: SolarSystemSceneProps) {
  const meteorProps = useMemo(() => ({
    radius: meteorSize,
    textureUrl: '/textures/meteor/Rock031_2K-JPG_Color.jpg',
    normalMapUrl: '/textures/meteor/Rock031_2K-JPG_NormalGL.jpg',
    roughnessMapUrl: '/textures/meteor/Rock031_2K-JPG_Roughness.jpg',
    displacementMapUrl: '/textures/meteor/Rock031_2K-JPG_Displacement.jpg',
    aoMapUrl: '/textures/meteor/Rock031_2K-JPG_AmbientOcclusion.jpg',
    displacementScale: 0.15,
    position: [-8, 2, -3] as [number, number, number],
    velocity: [4, -0.3, 0.7] as [number, number, number],
    isRunning: running,
    speed,
    resetKey: startKey
  }), [meteorSize, running, speed, startKey])

  return (
    <div className={`${widthClass} ${heightClass} border-2 border-gray-300 rounded-lg overflow-hidden`}>
      <Canvas camera={{ position: [0, 4, 10], fov: 60 }} shadows>
        <Lighting />
        <Earth />
        <Meteor {...meteorProps} />
        <Stars radius={120} depth={60} count={7000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
    </div>
  )
}


