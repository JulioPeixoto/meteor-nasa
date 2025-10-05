'use client';
import React from 'react'
import { ImpactConsequencesSidebar } from '@/components/consquencias'

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-[80px] p-8">
      <div className={`max-w-4xl mx-auto transition-all duration-300 ${sidebarOpen ? 'mr-[400px]' : ''}`}>
        <div className="bg-white/10 backdrop-blur-sm border-2 border-border rounded-base shadow-shadow p-6">
          <h1 className="text-2xl font-heading text-white mb-4">Simulador de Meteoro</h1>
          <p className="text-slate-300 mb-6">Ajuste os parâmetros e inicie a simulação.</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Diameter Control */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white font-medium">Diâmetro: {diameter}m</label>
                <input 
                  aria-label="Diâmetro do meteoro" 
                  className="accent-emerald-500 w-full" 
                  type="range" 
                  min={10} 
                  max={1000} 
                  step={10} 
                  value={diameter} 
                  onChange={e => setDiameter(parseInt(e.target.value))} 
                />
                <div className="text-xs text-slate-400">10m - 1000m</div>
              </div>

              {/* Speed Control */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white font-medium">Velocidade: {(speed/1000).toFixed(1)} km/s</label>
                <input 
                  aria-label="Velocidade do meteoro" 
                  className="accent-emerald-500 w-full" 
                  type="range" 
                  min={5000} 
                  max={50000} 
                  step={1000} 
                  value={speed} 
                  onChange={e => setSpeed(parseInt(e.target.value))} 
                />
                <div className="text-xs text-slate-400">5 km/s - 50 km/s</div>
              </div>

              {/* Impact Angle Control */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white font-medium">Ângulo de Impacto: {impactAngle}°</label>
                <input 
                  aria-label="Ângulo de impacto" 
                  className="accent-emerald-500 w-full" 
                  type="range" 
                  min={15} 
                  max={90} 
                  step={5} 
                  value={impactAngle} 
                  onChange={e => setImpactAngle(parseInt(e.target.value))} 
                />
                <div className="text-xs text-slate-400">15° - 90°</div>
              </div>

              {/* Location Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white font-medium">Local do Impacto</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLocation('land')}
                    className={`px-4 py-2 rounded border-2 transition-all ${
                      location === 'land' 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-transparent border-white/30 text-white hover:border-white/50'
                    }`}
                  >
                    Terra
                  </button>
                  <button 
                    onClick={() => setLocation('ocean')}
                    className={`px-4 py-2 rounded border-2 transition-all ${
                      location === 'ocean' 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-transparent border-white/30 text-white hover:border-white/50'
                    }`}
                  >
                    Oceano
                  </button>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/20">
              <button 
                onClick={running ? () => setRunning(false) : startSimulation} 
                className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium border-2 border-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transition-all"
              >
                {running ? 'Pausar' : (started ? 'Continuar' : 'Iniciar')}
              </button>
              
              <button 
                onClick={resetSimulation} 
                className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-medium border-2 border-slate-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transition-all"
              >
                Resetar
              </button>

              <div className="ml-auto">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium border-2 border-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transition-all"
                >
                  {sidebarOpen ? 'Fechar Análise' : 'Abrir Análise'}
                </button>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-lg font-heading text-white mb-3">Cenários Pré-definidos</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  setDiameter(50)
                  setSpeed(15000)
                  setImpactAngle(45)
                  setLocation('land')
                }}
                className="px-3 py-2 text-sm rounded bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500"
              >
                Meteoro Pequeno (50m)
              </button>
              <button 
                onClick={() => {
                  setDiameter(200)
                  setSpeed(20000)
                  setImpactAngle(60)
                  setLocation('land')
                }}
                className="px-3 py-2 text-sm rounded bg-orange-600 hover:bg-orange-700 text-white border border-orange-500"
              >
                Evento Tunguska (200m)
              </button>
              <button 
                onClick={() => {
                  setDiameter(500)
                  setSpeed(25000)
                  setImpactAngle(45)
                  setLocation('ocean')
                }}
                className="px-3 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white border border-red-500"
              >
                Impacto Oceânico (500m)
              </button>
              <button 
                onClick={() => {
                  setDiameter(1000)
                  setSpeed(30000)
                  setImpactAngle(45)
                  setLocation('land')
                }}
                className="px-3 py-2 text-sm rounded bg-purple-600 hover:bg-purple-700 text-white border border-purple-500"
              >
                Extinção em Massa (1km)
              </button>
            </div>
          </div>
        </div>
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