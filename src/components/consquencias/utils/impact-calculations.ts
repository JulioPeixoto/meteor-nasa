// Utils: Impact physics and consequence zones (simplified, educational)
// Calculates:
// - mass, energy (J), TNT yield (kt)
// - crater diameter/depth (Collins et al. inspired, simplified)
// - blast radius (air blast proxy), tsunami height (ocean), earthquake magnitude (approx)
// - damage zones with prevention measures and optional population estimates

export type ImpactCalculationParams = {
  diameter: number // meters
  speed: number // km/s
  impactAngle: number // degrees
  location: 'land' | 'ocean'
  density?: number // kg/m³
  latitude?: number
  longitude?: number
}

export type ImpactResults = {
  mass: number
  energy: number
  yieldKT: number
  craterDiameter: number
  craterDepth: number
  blastRadius: number
  tsunamiHeight?: number
  earthquakeMagnitude: number
}

export type DamageZone = {
  name: string
  radiusKm: number
  severity: 'catastrophic' | 'severe' | 'moderate' | 'light'
  casualties: number // %
  description: string
  preventionMeasures: string[]
  estimatedPopulation?: number
  estimatedDeaths?: number
  estimatedInjured?: number
}

export function computeImpactPhysics({
  diameter,
  speed,
  impactAngle,
  location,
  density = 3000,
}: ImpactCalculationParams): ImpactResults {
  const radius = diameter / 2
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3)
  const mass = volume * density

  const energy = 0.5 * mass * Math.pow(speed, 2) * 1e6
  const yieldKT = energy / 4.184e12 // 1 kt TNT = 4.184e12 J

  const impactAngleRad = (impactAngle * Math.PI) / 180
  const angleEfficiency = impactAngle < 10 
    ? Math.pow(Math.sin(10 * Math.PI / 180), 1/3) 
    : Math.pow(Math.sin(impactAngleRad), 1/3)

  const energyMT = energy / 4.184e15
  const impactorDensity = density
  const targetDensity = location === 'ocean' ? 1000 : 2500 
  const densityFactor = Math.pow(impactorDensity / targetDensity, 1/3)
  const craterDiameter = 1.8 * Math.pow(energyMT, 0.33) * densityFactor * angleEfficiency * 1000

  const craterDepth = craterDiameter * 0.2

  const blastRadius = 0.28 * Math.pow(yieldKT, 0.33) * 1000

  let tsunamiHeight: number | undefined
  if (location === 'ocean') {
    const waterDepth = 4000 
    const impactDiameter = diameter
    tsunamiHeight = Math.min(
      Math.pow(energy / 1e19, 0.5) * 100,
      Math.sqrt(waterDepth * impactDiameter) 
)
  }

  const earthquakeMagnitude = (2/3) * Math.log10(energy / 1e4) - 10.7

  return {
    mass,
    energy,
    yieldKT,
    craterDiameter,
    craterDepth,
    blastRadius,
    tsunamiHeight,
    earthquakeMagnitude,
  }
}

import { getPopulationByCoordinates } from '../population-estimation'

export function buildDamageZones(
  params: ImpactCalculationParams,
  results: ImpactResults
): DamageZone[] {
  const { location, latitude, longitude } = params
  const { blastRadius, tsunamiHeight } = results
  const baseRadius = Math.max(0.1, blastRadius / 1000)

  const withPopulation = (
    zone: Omit<DamageZone, 'estimatedPopulation' | 'estimatedDeaths' | 'estimatedInjured'>
  ): DamageZone => {
    let estimatedPopulation = 0
    let estimatedDeaths = 0
    let estimatedInjured = 0
    if (latitude !== undefined && longitude !== undefined) {
      const p = getPopulationByCoordinates(latitude, longitude, zone.radiusKm)
      estimatedPopulation = p.estimatedPopulation
      estimatedDeaths = Math.round(estimatedPopulation * (zone.casualties / 100))
      estimatedInjured = Math.round(estimatedPopulation * ((100 - zone.casualties) * 0.3) / 100)
      // Caps
      estimatedPopulation = Math.min(estimatedPopulation, 10_000_000)
      estimatedDeaths = Math.min(estimatedDeaths, estimatedPopulation)
      estimatedInjured = Math.min(estimatedInjured, Math.max(0, estimatedPopulation - estimatedDeaths))
    }
    return { ...zone, estimatedPopulation, estimatedDeaths, estimatedInjured }
  }

  const zones: DamageZone[] = []

  if (location === 'ocean' && tsunamiHeight) {
    zones.push(
      withPopulation({
        name: 'Zona de Tsunami',
        radiusKm: Math.min(500, Math.sqrt(results.yieldKT) * 10),
        severity: 'catastrophic',
        casualties: 85,
        description: `Ondas de ${Math.round(tsunamiHeight)}m atingindo costa`,
        preventionMeasures: [
          'Evacuação imediata de áreas costeiras',
          'Sistemas de alerta tsunami',
          'Rotas para terrenos elevados',
        ],
      })
    )
  }

  zones.push(
    withPopulation({
      name: 'Zona de Vaporização',
      radiusKm: Math.max(0.05, baseRadius * 0.3),
      severity: 'catastrophic',
      casualties: 100,
      description: 'Destruição instantânea e completa',
      preventionMeasures: ['Evacuação obrigatória', 'Zona de exclusão permanente'],
    }),
    withPopulation({
      name: 'Destruição Total',
      radiusKm: Math.max(0.1, baseRadius * 0.8),
      severity: 'catastrophic',
      casualties: 95,
      description: 'Colapso completo de estruturas',
      preventionMeasures: ['Evacuação completa', 'Desligamento de infraestrutura crítica'],
    }),
    withPopulation({
      name: 'Danos Severos',
      radiusKm: Math.max(0.2, baseRadius * 1.5),
      severity: 'severe',
      casualties: 70,
      description: 'Colapso de edifícios, ventos destrutivos',
      preventionMeasures: ['Abrigos subterrâneos', 'Evacuação de prédios altos'],
    }),
    withPopulation({
      name: 'Danos Estruturais',
      radiusKm: Math.max(0.4, baseRadius * 2.5),
      severity: 'severe',
      casualties: 40,
      description: 'Janelas quebradas, estruturas danificadas',
      preventionMeasures: ['Proteção contra estilhaços', 'Reforço de estruturas críticas'],
    }),
    withPopulation({
      name: 'Danos Leves',
      radiusKm: Math.max(0.8, baseRadius * 4.0),
      severity: 'moderate',
      casualties: 10,
      description: 'Danos auditivos, janelas quebradas',
      preventionMeasures: ['Proteção auditiva', 'Primeiros socorros'],
    }),
    withPopulation({
      name: 'Área de Alerta',
      radiusKm: Math.max(1.5, baseRadius * 6.0),
      severity: 'light',
      casualties: 1,
      description: 'Tremores e ruído intenso',
      preventionMeasures: ['Alertas à população', 'Preparação para evacuação'],
    })
  )

  return zones.sort((a, b) => b.radiusKm - a.radiusKm)
}

