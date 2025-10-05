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
  results: ImpactResults,
  t: (key: string, values?: Record<string, any>) => string
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
        name: t('zones.tsunami.name'),
        radiusKm: Math.min(500, Math.sqrt(results.yieldKT) * 10),
        severity: 'catastrophic',
        casualties: 85,
        description: t('zones.tsunami.description', { height: Math.round(tsunamiHeight) }),
        preventionMeasures: [
          t('zones.tsunami.measures.evacuation'),
          t('zones.tsunami.measures.alerts'),
          t('zones.tsunami.measures.routes'),
        ],
      })
    )
  }

  zones.push(
    withPopulation({
      name: t('zones.vaporization.name'),
      radiusKm: Math.max(0.05, baseRadius * 0.3),
      severity: 'catastrophic',
      casualties: 100,
      description: t('zones.vaporization.description'),
      preventionMeasures: [
        t('zones.vaporization.measures.evacuation'),
        t('zones.vaporization.measures.exclusion')
      ],
    }),
    withPopulation({
      name: t('zones.totalDestruction.name'),
      radiusKm: Math.max(0.1, baseRadius * 0.8),
      severity: 'catastrophic',
      casualties: 95,
      description: t('zones.totalDestruction.description'),
      preventionMeasures: [
        t('zones.totalDestruction.measures.evacuation'),
        t('zones.totalDestruction.measures.infrastructure')
      ],
    }),
    withPopulation({
      name: t('zones.severeDamage.name'),
      radiusKm: Math.max(0.2, baseRadius * 1.5),
      severity: 'severe',
      casualties: 70,
      description: t('zones.severeDamage.description'),
      preventionMeasures: [
        t('zones.severeDamage.measures.shelters'),
        t('zones.severeDamage.measures.highBuildings')
      ],
    }),
    withPopulation({
      name: t('zones.structuralDamage.name'),
      radiusKm: Math.max(0.4, baseRadius * 2.5),
      severity: 'severe',
      casualties: 40,
      description: t('zones.structuralDamage.description'),
      preventionMeasures: [
        t('zones.structuralDamage.measures.shrapnel'),
        t('zones.structuralDamage.measures.criticalStructures')
      ],
    }),
    withPopulation({
      name: t('zones.lightDamage.name'),
      radiusKm: Math.max(0.8, baseRadius * 4.0),
      severity: 'moderate',
      casualties: 10,
      description: t('zones.lightDamage.description'),
      preventionMeasures: [
        t('zones.lightDamage.measures.hearing'),
        t('zones.lightDamage.measures.firstAid')
      ],
    }),
    withPopulation({
      name: t('zones.alertArea.name'),
      radiusKm: Math.max(1.5, baseRadius * 6.0),
      severity: 'light',
      casualties: 1,
      description: t('zones.alertArea.description'),
      preventionMeasures: [
        t('zones.alertArea.measures.alerts'),
        t('zones.alertArea.measures.evacuationPrep')
      ],
    })
  )

  return zones.sort((a, b) => b.radiusKm - a.radiusKm)
}

