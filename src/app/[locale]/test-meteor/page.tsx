'use client';
import { MeteorTest } from '@/components/three/meteor-test'
import React from 'react'

export default function TestAuthPage() {
  const [running, setRunning] = React.useState(false)
  const [size, setSize] = React.useState(1.6)
  const [speed, setSpeed] = React.useState(1)
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Simulador de Meteoro</h1>
        <p className="text-slate-300 mb-6">Ajuste os parâmetros e inicie a simulação.</p>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={running ? () => setRunning(false) : startSimulation} className="px-4 py-2 rounded bg-emerald-600 text-white">
                {running ? 'Pausar' : (started ? 'Continuar' : 'Iniciar')}
              </button>
              <button onClick={resetSimulation} className="px-4 py-2 rounded bg-slate-700 text-white">Resetar</button>
            </div>

            <div className="h-6 w-px bg-white/20" />

            <div className="flex items-center gap-3 text-white">
              <label className="text-sm">Tamanho</label>
              <input aria-label="Tamanho do meteoro" className="accent-emerald-500 w-48" type="range" min={0.6} max={3} step={0.1} value={size} onChange={e => setSize(parseFloat(e.target.value))} />
              <input aria-label="Valor de tamanho" className="w-20 bg-slate-900/60 text-white border border-white/15 rounded px-2 py-1" type="number" min={0.6} max={3} step={0.1} value={size} onChange={e => setSize(Number.isNaN(parseFloat(e.target.value)) ? 1.6 : parseFloat(e.target.value))} />
            </div>

            <div className="flex items-center gap-3 text-white">
              <label className="text-sm">Velocidade</label>
              <input aria-label="Velocidade da simulação" className="accent-emerald-500 w-48" type="range" min={0.2} max={4} step={0.1} value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
              <input aria-label="Valor de velocidade" className="w-20 bg-slate-900/60 text-white border border-white/15 rounded px-2 py-1" type="number" min={0.2} max={4} step={0.1} value={speed} onChange={e => setSpeed(Number.isNaN(parseFloat(e.target.value)) ? 1 : parseFloat(e.target.value))} />
              <span className="text-slate-300 text-sm">{speed.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        <MeteorTest
          size={size}
          texture="/textures/black-white-details-moon-texture-concept.jpg"
          running={running}
          speed={speed}
          startKey={startKey}
        />
      </div>
    </main>
  )
}