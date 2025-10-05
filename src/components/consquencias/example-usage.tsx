"use client";

import { useState } from "react";
import { ImpactConsequencesSidebar } from "../consquencias";
import { Button } from "../ui/button";
import { Calculator } from "lucide-react";

export function ImpactSimulatorExample() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [impactParams, setImpactParams] = useState({
    diameter: 100, // meters
    speed: 20, // km/s
    impactAngle: 45, // degrees
    location: "land" as "land" | "ocean",
    density: 3000, // kg/m³
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Main Content Area */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading text-foreground mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-main border-4 border-border rounded-none flex items-center justify-center">
              <Calculator className="w-6 h-6 text-main-foreground" />
            </div>
            SIMULADOR DE IMPACTO DE METEOROS
          </h1>

          {/* Control Panel */}
          <div className="bg-white border-4 border-border p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            <h2 className="font-heading text-lg text-foreground mb-4">
              PARÂMETROS DO ASTEROIDE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diameter Slider */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Diâmetro: {impactParams.diameter}m
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={impactParams.diameter}
                  onChange={(e) =>
                    setImpactParams((prev) => ({
                      ...prev,
                      diameter: Number(e.target.value),
                    }))
                  }
                  className="w-full h-3 bg-gray-200 border-2 border-border appearance-none cursor-pointer slider"
                />
              </div>

              {/* Speed Slider */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Velocidade: {impactParams.speed} km/s
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={impactParams.speed}
                  onChange={(e) =>
                    setImpactParams((prev) => ({
                      ...prev,
                      speed: Number(e.target.value),
                    }))
                  }
                  className="w-full h-3 bg-gray-200 border-2 border-border appearance-none cursor-pointer slider"
                />
              </div>

              {/* Impact Angle Slider */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ângulo de Impacto: {impactParams.impactAngle}°
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={impactParams.impactAngle}
                  onChange={(e) =>
                    setImpactParams((prev) => ({
                      ...prev,
                      impactAngle: Number(e.target.value),
                    }))
                  }
                  className="w-full h-3 bg-gray-200 border-2 border-border appearance-none cursor-pointer slider"
                />
              </div>

              {/* Location Toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Local do Impacto
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      impactParams.location === "land" ? "default" : "neutral"
                    }
                    size="sm"
                    onClick={() =>
                      setImpactParams((prev) => ({ ...prev, location: "land" }))
                    }
                  >
                    Terra
                  </Button>
                  <Button
                    variant={
                      impactParams.location === "ocean" ? "default" : "neutral"
                    }
                    size="sm"
                    onClick={() =>
                      setImpactParams((prev) => ({
                        ...prev,
                        location: "ocean",
                      }))
                    }
                  >
                    Oceano
                  </Button>
                </div>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="mt-6 pt-4 border-t-2 border-border">
              <h3 className="font-heading text-foreground mb-3">
                CENÁRIOS PRÉ-DEFINIDOS
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() =>
                    setImpactParams({
                      diameter: 50,
                      speed: 15,
                      impactAngle: 45,
                      location: "land",
                      density: 3000,
                    })
                  }
                >
                  Meteoro Pequeno
                </Button>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() =>
                    setImpactParams({
                      diameter: 200,
                      speed: 25,
                      impactAngle: 60,
                      location: "ocean",
                      density: 3000,
                    })
                  }
                >
                  Evento de Tunguska
                </Button>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() =>
                    setImpactParams({
                      diameter: 1000,
                      speed: 30,
                      impactAngle: 45,
                      location: "land",
                      density: 3000,
                    })
                  }
                >
                  Extinção em Massa
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Toggle */}
          <div className="flex justify-end mb-4">
            <Button
              variant="default"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "Fechar Análise" : "Abrir Análise"}
            </Button>
          </div>

          {/* Placeholder for 3D Visualization */}
          <div className="bg-gray-900 border-4 border-border h-96 flex items-center justify-center text-white">
            <div className="text-center">
              <h3 className="text-2xl font-heading mb-2">VISUALIZAÇÃO 3D</h3>
              <p className="text-gray-400">
                Aqui ficaria o globe 3D com Three.js
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Mostrando trajetória do meteoro e zonas de impacto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ImpactConsequencesSidebar
        {...impactParams}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* CSS for custom slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: #7a83ff;
          border: 2px solid #000;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: #7a83ff;
          border: 2px solid #000;
          cursor: pointer;
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
