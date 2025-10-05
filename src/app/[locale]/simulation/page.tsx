'use client'
import React from 'react'
import { ImpactConsequencesSidebar } from '@/components/consquencias'
import ScenePage from '../scene/page'

export default function TestAuthPage() {
  const [diameter, setDiameter] = React.useState(100)
  const [speed, setSpeed] = React.useState(17000)
  const [impactAngle, setImpactAngle] = React.useState(45)
  const [location, setLocation] = React.useState<'land' | 'ocean'>('land')
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <main className="flex flex-col bg-black min-h-screen overflow-hidden">
      {/* Canvas ocupa a tela inteira, não encolhe */}
      <div className="w-full h-screen flex-shrink-0">
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
