// Population estimation by coordinates
// Sistema de estimativa populacional baseado em coordenadas geográficas

export interface PopulationEstimate {
  estimatedPopulation: number;
  areaType: string;
  density: number;
  confidence: 'high' | 'medium' | 'low';
  radiusKm: number;
}

// Base de dados das principais cidades mundiais
const majorCities = [
  // Brasil
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, pop: 12300000, radius: 50 },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, pop: 6747815, radius: 40 },
  { name: "Brasília", lat: -15.7975, lng: -47.8919, pop: 3055149, radius: 30 },
  { name: "Salvador", lat: -12.9714, lng: -38.5014, pop: 2886698, radius: 25 },
  { name: "Fortaleza", lat: -3.7327, lng: -38.5267, pop: 2686612, radius: 25 },
  { name: "Belo Horizonte", lat: -19.9208, lng: -43.9378, pop: 2521564, radius: 30 },
  { name: "Manaus", lat: -3.1190, lng: -60.0217, pop: 2219580, radius: 20 },
  { name: "Curitiba", lat: -25.4244, lng: -49.2654, pop: 1963726, radius: 25 },
  { name: "Recife", lat: -8.0476, lng: -34.8770, pop: 1653461, radius: 20 },
  { name: "Goiânia", lat: -16.6869, lng: -49.2648, pop: 1536097, radius: 20 },

  // Estados Unidos
  { name: "New York", lat: 40.7128, lng: -74.0060, pop: 8336817, radius: 35 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, pop: 3979576, radius: 40 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, pop: 2693976, radius: 30 },
  { name: "Houston", lat: 29.7604, lng: -95.3698, pop: 2320268, radius: 35 },
  { name: "Phoenix", lat: 33.4484, lng: -112.0740, pop: 1680992, radius: 25 },

  // Europa
  { name: "London", lat: 51.5074, lng: -0.1278, pop: 9648110, radius: 35 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, pop: 2161000, radius: 25 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, pop: 3669491, radius: 30 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, pop: 3223334, radius: 25 },
  { name: "Rome", lat: 41.9028, lng: 12.4964, pop: 2873494, radius: 25 },

  // Ásia
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, pop: 37400068, radius: 60 },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, pop: 27058480, radius: 50 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, pop: 32900000, radius: 45 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, pop: 20411274, radius: 35 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, pop: 21540000, radius: 40 },
  { name: "Dhaka", lat: 23.8103, lng: 90.4125, pop: 22478116, radius: 30 },
  { name: "Osaka", lat: 34.6937, lng: 135.5023, pop: 18967459, radius: 35 },
  { name: "Karachi", lat: 24.8607, lng: 67.0011, pop: 16094000, radius: 30 },

  // África
  { name: "Lagos", lat: 6.5244, lng: 3.3792, pop: 15388000, radius: 25 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, pop: 20900604, radius: 30 },
  { name: "Kinshasa", lat: -4.4419, lng: 15.2663, pop: 14970460, radius: 25 },

  // Oceania
  { name: "Sydney", lat: -33.8688, lng: 151.2093, pop: 5312163, radius: 30 },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631, pop: 5078193, radius: 25 },
];

// Densidade populacional por tipo de área (pessoas/km²) - valores mais realistas
const densityMap = {
  "urban_mega": 5000,     // Megacidades (Tokyo, Mumbai, São Paulo) - reduzido de 15000
  "urban_high": 3000,     // Grandes cidades (NYC, Londres, Rio) - reduzido de 8000
  "urban_medium": 1500,   // Cidades médias - reduzido de 3000
  "suburban": 500,        // Subúrbios - reduzido de 1000
  "rural": 25,            // Área rural - reduzido de 50
  "remote": 2,            // Áreas remotas - reduzido de 5
  "desert": 0.5,          // Desertos, montanhas - reduzido de 1
  "ocean": 0              // Oceanos, lagos
};

// Calcular distância entre duas coordenadas (fórmula de Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Determinar tipo de área baseado em coordenadas
function determineAreaType(lat: number, lng: number): { type: string; confidence: 'high' | 'medium' | 'low' } {
  // Verificar se está no oceano (aproximação simples)
  if (Math.abs(lat) > 70 || (Math.abs(lat) < 10 && Math.abs(lng) > 160)) {
    return { type: "ocean", confidence: "medium" };
  }

  // Verificar proximidade com grandes cidades
  for (const city of majorCities) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    
    if (distance <= city.radius * 0.3) {
      // Centro da cidade
      if (city.pop > 20000000) return { type: "urban_mega", confidence: "high" };
      if (city.pop > 5000000) return { type: "urban_high", confidence: "high" };
      return { type: "urban_medium", confidence: "high" };
    }
    
    if (distance <= city.radius * 0.7) {
      // Área urbana/suburbana
      if (city.pop > 10000000) return { type: "urban_high", confidence: "medium" };
      return { type: "suburban", confidence: "medium" };
    }
    
    if (distance <= city.radius) {
      // Área metropolitana/subúrbios
      return { type: "suburban", confidence: "medium" };
    }
  }

  // Verificar regiões específicas por coordenadas
  // Desertos
  if ((lat >= 15 && lat <= 35 && lng >= -15 && lng <= 50) || // Sahara/Arábia
      (lat >= 20 && lat <= 35 && lng >= -120 && lng <= -100) || // Deserto do SW dos EUA
      (lat >= -30 && lat <= -20 && lng >= -70 && lng <= -60)) { // Atacama
    return { type: "desert", confidence: "medium" };
  }

  // Ártico/Antártica
  if (Math.abs(lat) > 60) {
    return { type: "remote", confidence: "high" };
  }

  // Amazônia
  if (lat >= -10 && lat <= 5 && lng >= -75 && lng <= -45) {
    return { type: "remote", confidence: "medium" };
  }

  // Sibéria
  if (lat >= 55 && lat <= 75 && lng >= 60 && lng <= 180) {
    return { type: "remote", confidence: "medium" };
  }

  // Default: área rural
  return { type: "rural", confidence: "low" };
}

// Função principal para estimar população por coordenadas
export function getPopulationByCoordinates(lat: number, lng: number, radiusKm: number = 10): PopulationEstimate {
  const { type: areaType, confidence } = determineAreaType(lat, lng);
  const density = densityMap[areaType as keyof typeof densityMap] || densityMap.rural;
  
  // Calcular área do círculo
  const area = Math.PI * radiusKm * radiusKm;
  
  // Verificar se há grandes cidades próximas para ajustar a estimativa (mais conservador)
  let populationMultiplier = 1;
  for (const city of majorCities) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance <= radiusKm) {  // Só considera se a cidade está dentro do raio
      // Ajustar baseado na proximidade com cidade grande (mais conservador)
      const proximityFactor = Math.max(0.1, 1 - (distance / radiusKm));
      const cityInfluence = Math.min(city.pop / 5000000, 2); // Max 2x multiplier, não 10x
      populationMultiplier = Math.max(populationMultiplier, 1 + (proximityFactor * cityInfluence * 0.05)); // 0.05 ao invés de 0.1
    }
  }
  
  // Limitar o multiplicador para evitar valores absurdos
  populationMultiplier = Math.min(populationMultiplier, 3); // Max 3x o valor base
  
  const estimatedPopulation = Math.round(density * area * populationMultiplier);
  
  return {
    estimatedPopulation,
    areaType,
    density,
    confidence,
    radiusKm
  };
}

// Função para testar estimativas em locais conhecidos
export function testPopulationEstimates() {
  const testLocations = [
    { name: "Centro de São Paulo", lat: -23.5505, lng: -46.6333 },
    { name: "Times Square, NYC", lat: 40.7580, lng: -73.9855 },
    { name: "Amazônia", lat: -3.4653, lng: -62.2159 },
    { name: "Deserto do Sahara", lat: 25.0000, lng: 0.0000 },
    { name: "Oceano Atlântico", lat: 0.0000, lng: -30.0000 },
  ];

  console.log("🧪 Testando estimativas populacionais:");
  testLocations.forEach(location => {
    const estimate = getPopulationByCoordinates(location.lat, location.lng, 10);
    console.log(`${location.name}: ${estimate.estimatedPopulation.toLocaleString()} pessoas (${estimate.areaType}, confiança: ${estimate.confidence})`);
  });
}
