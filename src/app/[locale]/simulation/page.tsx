'use client';
import React from 'react'
import { ImpactConsequencesSidebar } from '@/components/consquencias'
import { Canvas } from '@react-three/fiber'
import { AsteroidScene } from '@/components/AsteroidScene'
import { asteroidData, earthData } from '@/components/example'
import ScenePage from '../scene/page'
export default function TestAuthPage() {
  const [running, setRunning] = React.useState(false)
  const [diameter, setDiameter] = React.useState(100) // meters
  const [speed, setSpeed] = React.useState(17000) // m/s (17 km/s)
  const [impactAngle, setImpactAngle] = React.useState(45) // degrees
  const [location, setLocation] = React.useState<'land' | 'ocean'>('land')
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [startKey, setStartKey] = React.useState(0)
  const [started, setStarted] = React.useState(false)

  function startSimulation() {
    setStartKey(k => k + 1)
    setRunning(true)
    setStarted(true)
  }

  function resetSimulation() {
    setRunning(false)
    setStartKey(k => k + 1)
    setStarted(false)
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Canvas ocupando toda a tela */}
      <div className={`w-full h-screen transition-all duration-300 ${sidebarOpen ? 'pr-96' : ''}`}>
        <ScenePage />
      </div>

      {/* Impact Consequences Sidebar */}
      <ImpactConsequencesSidebar
        diameter={diameter}
        speed={speed}
        impactAngle={impactAngle}
        location={location}
        latitude={-23.5505}  // São Paulo as default example
        longitude={-46.6333}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </main>
  )
}