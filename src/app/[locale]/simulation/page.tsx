'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { ImpactConsequencesSidebar } from '@/components/consquencias'
import ScenePage from '../scene/page'

export default function TestAuthPage() {
  const searchParams = useSearchParams()
  
  const asteroidName = searchParams.get('name')
  const asteroidDiameter = searchParams.get('diameter')
  const asteroidSpeed = searchParams.get('speed')
  const isHazardous = searchParams.get('hazardous') === 'true'
  const composition = searchParams.get('composition')
  
  const [diameter, setDiameter] = React.useState(asteroidDiameter ? parseFloat(asteroidDiameter) : 100)
  const [speed, setSpeed] = React.useState(asteroidSpeed ? parseFloat(asteroidSpeed) : 17000)
  const [impactAngle, setImpactAngle] = React.useState(45)
  const [location, setLocation] = React.useState<'land' | 'ocean'>('land')
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  return (
    <main className="flex flex-col bg-black">
      {/* Informações do meteoro, se disponível */}
      {asteroidName && (
        <div className="bg-gray-900 text-white p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Simulação de Impacto: {asteroidName}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-300">
            <span>Diâmetro: {diameter.toFixed(1)}m</span>
            <span>Velocidade: {speed.toLocaleString()}m/s</span>
            {composition && <span>Composição: {composition}</span>}
            {isHazardous && <span className="text-red-400">Potencialmente Perigoso</span>}
          </div>
        </div>
      )}
      
      {/* Canvas ocupa a tela inteira, não encolhe */}
      <div className="h-screen">
        <ScenePage />
      </div>

      {/* Sidebar abaixo do canvas */}
      {sidebarOpen && (
        <div className="w-full border-t border-gray-800">
          <ImpactConsequencesSidebar
            diameter={diameter}
            speed={speed}
            impactAngle={impactAngle}
            location={location}
            latitude={-23.5505}
            longitude={-46.6333}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}
    </main>
  )
}
