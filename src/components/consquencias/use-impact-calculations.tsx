"use client";

import { useMemo } from "react";

export type ImpactCalculationParams = {
  diameter: number; // meters
  speed: number; // m/s (converted from km/s internally)
  impactAngle: number; // degrees
  location: "land" | "ocean";
  density?: number; // kg/m³ (default: 3000 for rocky asteroids)
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
  preventionTime: {
    detection: number; // days needed for detection
    deflection: number; // days needed for deflection mission
    evacuation: number; // days needed for evacuation
  };
};

export type DamageZone = {
  name: string;
  radiusKm: number;
  severity: "catastrophic" | "severe" | "moderate" | "light";
  casualties: number; // estimated percentage
  description: string;
  preventionMeasures: string[];
};

export function useImpactCalculations({
  diameter,
  speed,
  impactAngle = 45,
  location,
  density = 3000,
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

    // Prevention timeline
    const asteroidDiameterKm = diameter / 1000;
    const preventionTime = {
      detection: Math.max(365, asteroidDiameterKm * 100), // days
      deflection: Math.max(1800, asteroidDiameterKm * 500), // days (5+ years for large objects)
      evacuation: Math.max(30, asteroidDiameterKm * 10), // days
    };

    // Damage zones calculation
    const baseRadius = Math.max(0.1, blastRadius / 1000); // convert to km, minimum 100m

    const damageZones: DamageZone[] = [
      {
        name: "Zona de Vaporização",
        radiusKm: Math.max(0.05, baseRadius * 0.3),
        severity: "catastrophic",
        casualties: 100,
        description: "Destruição instantânea e completa",
        preventionMeasures: [
          "Evacuação obrigatória",
          "Zona de exclusão permanente",
          "Nenhuma estrutura deve permanecer",
        ],
      },
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
      preventionTime,
      damageZones: damageZones.sort((a, b) => a.radiusKm - b.radiusKm),
    };
  }, [diameter, speed, impactAngle, location, density]);
}

// Utility functions for prevention planning
export function getPreventionStrategy(
  yieldKT: number,
  preventionTime: ImpactResults["preventionTime"]
) {
  const strategies = [];

  if (preventionTime.deflection > 1825) {
    // 5+ years
    strategies.push({
      method: "Impacto Cinético (DART-style)",
      probability: 85,
      timeRequired: 1825,
      description: "Nave espacial colide com asteroide para alterar trajetória",
    });

    strategies.push({
      method: "Trator Gravitacional",
      probability: 70,
      timeRequired: 2555,
      description: "Nave permanece próxima ao asteroide usando gravidade",
    });
  }

  if (preventionTime.deflection > 365) {
    // 1+ year
    strategies.push({
      method: "Explosão Nuclear",
      probability: 60,
      timeRequired: 365,
      description: "Último recurso - detonação próxima ao asteroide",
    });
  }

  // Always available
  strategies.push({
    method: "Evacuação e Mitigação",
    probability: 95,
    timeRequired: 30,
    description: "Evacuação populacional e preparação de abrigos",
  });

  return strategies;
}

export function getEvacuationPlan(damageZones: DamageZone[]) {
  const totalRadius = Math.max(...damageZones.map((z) => z.radiusKm));

  return {
    evacuationRadius: totalRadius * 1.2, // safety margin
    estimatedPopulation: Math.PI * Math.pow(totalRadius, 2) * 50, // rough estimate (50 people/km²)
    timeRequired: Math.max(7, totalRadius / 10), // days
    sheltersNeeded: Math.ceil((Math.PI * Math.pow(totalRadius, 2) * 50) / 1000), // capacity for 1000 people each
    resources: [
      "Transporte para evacuação em massa",
      "Abrigos temporários equipados",
      "Suprimentos médicos e alimentares",
      "Sistemas de comunicação de emergência",
      "Combustível e energia de reserva",
    ],
  };
}
