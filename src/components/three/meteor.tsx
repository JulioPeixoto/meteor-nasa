'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, Suspense } from 'react'
import * as THREE from 'three'

type MeteorProps = {
  radius?: number
  detail?: number
  irregularity?: number
  rotationSpeed?: [number, number, number]
  position?: [number, number, number]
  velocity?: [number, number, number]
  color?: string
  textureUrl?: string
  normalMapUrl?: string
  roughnessMapUrl?: string
  displacementMapUrl?: string
  aoMapUrl?: string
  displacementScale?: number
  roughness?: number
  metalness?: number
  isRunning?: boolean
  speed?: number
  resetKey?: number
}

function pseudoNoise3(x: number, y: number, z: number, seed: number) {
  const s1 = Math.sin((x + seed) * 2.1) + Math.sin((y - seed) * 1.7) + Math.sin((z + seed * 0.5) * 2.3)
  const s2 = Math.sin((x - y + seed) * 0.7) + Math.sin((y - z - seed) * 1.3)
  return (s1 + s2) * 0.25
}

export function Meteor(props: MeteorProps) {
  const {
    radius = 1.2,
    detail = 4,
    irregularity = 0.35,
    rotationSpeed = [0.5, 0.35, 0.2],
    position = [-5, 1, 0],
    velocity = [1.5, -0.2, 0.4],
    color = '#7a5d44',
    textureUrl,
    normalMapUrl,
    roughnessMapUrl,
    displacementMapUrl,
    aoMapUrl,
    displacementScale = 0.1,
    roughness = 0.9,
    metalness = 0.15,
    isRunning = true,
    speed = 1,
    resetKey
  } = props

  const meshRef = useRef<THREE.Mesh>(null)
  const velocityVec = useMemo(() => new THREE.Vector3(...velocity), [velocity])
  const seed = useMemo(() => Math.random() * 10 + 1, [])

  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null
  const normalMap = normalMapUrl
    ? useLoader(THREE.TextureLoader, normalMapUrl)
    : null
  const roughnessMap = roughnessMapUrl
    ? useLoader(THREE.TextureLoader, roughnessMapUrl)
    : null
  const displacementMap = displacementMapUrl
    ? useLoader(THREE.TextureLoader, displacementMapUrl)
    : null
  const aoMap = aoMapUrl
    ? useLoader(THREE.TextureLoader, aoMapUrl)
    : null

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, 64, 64)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const n = pseudoNoise3(v.x * 1.5, v.y * 1.5, v.z * 1.5, seed)
      const displacement = irregularity * n * 0.2
      v.normalize().multiplyScalar(radius * (1 + displacement))
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [radius, detail, irregularity, seed])

  useEffect(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(position[0], position[1], position[2])
  }, [resetKey, position])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (!isRunning) return
    meshRef.current.rotation.x += rotationSpeed[0] * delta * speed
    meshRef.current.rotation.y += rotationSpeed[1] * delta * speed
    meshRef.current.rotation.z += rotationSpeed[2] * delta * speed
    meshRef.current.position.addScaledVector(velocityVec, delta * speed)
  })

  return (
    <Suspense fallback={null}>
      <mesh ref={meshRef} geometry={geometry} position={position as any} castShadow receiveShadow>
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          displacementMap={displacementMap}
          aoMap={aoMap}
          aoMapIntensity={1}
          displacementScale={displacementScale}
          color={texture ? '#ffffff' : color}
          roughness={1}
          metalness={metalness}
          wireframe={false}
          flatShading={false}
        />
      </mesh>
    </Suspense>
  )
}


