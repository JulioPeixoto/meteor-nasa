import { ThreeJSExample } from '@/components/example'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Meteor Madness
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            NASA Near Earth Object Visualization with React Three Fiber
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            3D Asteroid Visualization Test
          </h2>
          <ThreeJSExample />
          <p className="text-sm text-slate-300 mt-4">
            Use mouse to rotate, zoom and pan around the 3D scene
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">NEO Data</h3>
            <p className="text-slate-300">
              Real-time data from NASA Near Earth Object Web Service
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Impact Simulation</h3>
            <p className="text-slate-300">
              Calculate impact zones and damage estimates
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">3D Visualization</h3>
            <p className="text-slate-300">
              Interactive 3D representation of asteroids and trajectories
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
