"use client";

import { useMemo } from "react";
import { getPopulationByCoordinates } from "./population-estimation";

export type ImpactCalculationParams = {
  diameter: number; // meters
  speed: number; // m/s (converted from km/s internally)
  impactAngle: number; // degrees
  location: "land" | "ocean";
  density?: number; // kg/m³ (default: 3000 for rocky asteroids)
  // Optional coordinates for population estimation
  latitude?: number;
  longitude?: number;
};

export type ImpactResults = {
  mass: number; // kg
  energy: number; // Joules
  yieldKT: number; // kilotons TNT equivalent
  craterDiameter: number; // meters
  craterDepth: number; // meters
  blastRadius: number; // meters
  tsunamiHeight?: number; // meters (only for ocean impacts)
  earthquakeMagnitude: number; // Richter scale
};

export type DamageZone = {
  name: string;
  radiusKm: number;
  severity: "catastrophic" | "severe" | "moderate" | "light";
  casualties: number; // estimated percentage
  description: string;
  preventionMeasures: string[];
  // Real population estimates
  estimatedPopulation?: number;
  estimatedDeaths?: number;
  estimatedInjured?: number;
};

export function useImpactCalculations({
  diameter,
  speed,
  impactAngle = 45,
  location,
  density = 3000,
  latitude,
  longitude,
}: ImpactCalculationParams): ImpactResults & { damageZones: DamageZone[] } {
  return useMemo(() => {
    // Basic physics calculations
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;

    // Kinetic energy
    const velocityMs = speed; // speed is already in m/s
    const energy = 0.5 * mass * Math.pow(velocityMs, 2);

    // TNT equivalent (1 kg TNT = 4.184 MJ)
    const yieldKT = energy / 4.184e12;

    // Crater calculations (simplified Collins et al. model)
    const impactAngleRad = (impactAngle * Math.PI) / 180;
    const angleEfficiency = Math.pow(Math.sin(impactAngleRad), 1 / 3);
    const craterDiameter =
      1.161 * Math.pow(energy / 1e15, 0.22) * angleEfficiency * 1000;
    const craterDepth = craterDiameter * 0.13; // typical depth-to-diameter ratio

    // Blast radius (air blast damage)
    const blastRadius = 2.2 * Math.pow(yieldKT, 0.33) * 1000; // meters

    // Tsunami height (for ocean impacts)
    let tsunamiHeight: number | undefined;
    if (location === "ocean") {
      tsunamiHeight = 0.016 * Math.pow(energy / 1e15, 0.5) * 1000; // meters
    }

    // Earthquake magnitude
    const earthquakeMagnitude = Math.log10(energy / 1e9) - 5.87;

    // Damage zones calculation
    const baseRadius = Math.max(0.1, blastRadius / 1000); // convert to km, minimum 100m

    // Helper function to create damage zones with population estimates
    const createDamageZone = (name: string, radiusKm: number, severity: DamageZone["severity"], casualties: number, description: string, preventionMeasures: string[]): DamageZone => {
      let estimatedPopulation = 0;
      let estimatedDeaths = 0;
      let estimatedInjured = 0;

      // Calculate population if coordinates are provided
      if (latitude !== undefined && longitude !== undefined) {
        const populationData = getPopulationByCoordinates(latitude, longitude, radiusKm);
        estimatedPopulation = populationData.estimatedPopulation;
        estimatedDeaths = Math.round(estimatedPopulation * (casualties / 100));
        estimatedInjured = Math.round(estimatedPopulation * ((100 - casualties) * 0.3 / 100));
      }

      // Cap population to reasonable values per zone
      estimatedPopulation = Math.min(estimatedPopulation, 10000000); // Max 10M per zone
      estimatedDeaths = Math.min(estimatedDeaths, estimatedPopulation);
      estimatedInjured = Math.min(estimatedInjured, estimatedPopulation - estimatedDeaths);

      return {
        name,
        radiusKm,
        severity,
        casualties,
        description,
        preventionMeasures,
        estimatedPopulation,
        estimatedDeaths,
        estimatedInjured,
      };
    };

    const damageZones: DamageZone[] = [
      createDamageZone(
        "Zona de Vaporização",
        Math.max(0.05, baseRadius * 0.3),
        "catastrophic",
        100,
        "Destruição instantânea e completa",
        [
          "Evacuação obrigatória",
          "Zona de exclusão permanente",
          "Nenhuma estrutura deve permanecer",
        ]
      ),
      {
        name: "Destruição Total",
        radiusKm: Math.max(0.1, baseRadius * 0.8),
        severity: "catastrophic",
        casualties: 95,
        description: "Colapso completo de todas as estruturas",
        preventionMeasures: [
          "Evacuação completa da população",
          "Desligamento de infraestrutura crítica",
          "Abrigos subterrâneos reforçados",
        ],
      },
      {
        name: "Danos Severos",
        radiusKm: Math.max(0.2, baseRadius * 1.5),
        severity: "severe",
        casualties: 70,
        description: "Colapso de edifícios, ventos destrutivos",
        preventionMeasures: [
          "Abrigos anticiclônicos",
          "Evacuação de edifícios altos",
          "Corte preventivo de energia",
        ],
      },
      {
        name: "Danos Estruturais",
        radiusKm: Math.max(0.4, baseRadius * 2.5),
        severity: "severe",
        casualties: 40,
        description: "Janelas quebradas, estruturas danificadas",
        preventionMeasures: [
          "Proteção contra fragmentos",
          "Reforço de estruturas críticas",
          "Planos de evacuação rápida",
        ],
      },
      {
        name: "Danos Leves",
        radiusKm: Math.max(0.8, baseRadius * 4.0),
        severity: "moderate",
        casualties: 10,
        description: "Danos auditivos, janelas quebradas",
        preventionMeasures: [
          "Proteção auditiva",
          "Primeiros socorros especializados",
          "Comunicação de emergência",
        ],
      },
      {
        name: "Área de Alerta",
        radiusKm: Math.max(1.5, baseRadius * 6.0),
        severity: "light",
        casualties: 1,
        description: "Tremores, ruído extremo",
        preventionMeasures: [
          "Alerta populacional",
          "Monitoramento médico",
          "Preparação para evacuação",
        ],
      },
    ];

    // Add tsunami zones if ocean impact
    if (location === "ocean" && tsunamiHeight) {
      const tsunamiZone: DamageZone = {
        name: "Zona de Tsunami",
        radiusKm: Math.min(1000, tsunamiHeight * 50), // coastal reach
        severity: "catastrophic",
        casualties: 85,
        description: `Ondas de ${Math.round(tsunamiHeight)}m atingindo costa`,
        preventionMeasures: [
          "Evacuação imediata de áreas costeiras",
          "Sistemas de alerta tsunami",
          "Barreiras de proteção marítima",
          "Rotas de fuga para terrenos elevados",
        ],
      };
      damageZones.unshift(tsunamiZone);
    }

    return {
      mass,
      energy,
      yieldKT,
      craterDiameter,
      craterDepth,
      blastRadius,
      tsunamiHeight,
      earthquakeMagnitude,
      damageZones: damageZones.sort((a, b) => b.radiusKm - a.radiusKm),
    };
  }, [diameter, speed, impactAngle, location, density]);
}


