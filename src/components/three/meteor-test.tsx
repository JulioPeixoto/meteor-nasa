'use client'

import { SolarSystemScene3D } from './solar-system-scene'

type MeteorTestProps = {
  size?: number
  texture?: string
  running?: boolean
  speed?: number
  startKey?: number
}

export function MeteorTest({ size = 1.3, texture, running = true, speed = 1, startKey }: MeteorTestProps) {
  return (
    <SolarSystemScene3D meteorSize={size} meteorTexture={texture} running={running} speed={speed} startKey={startKey} />
  )
}
