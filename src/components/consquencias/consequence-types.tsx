"use client";

import {
  AlertTriangle,
  Skull,
  Ear,
  Home,
  Building,
  TreePine,
  Zap,
  Waves,
  Activity,
} from "lucide-react";

export const ConsequenceIcons = {
  crater: (
    <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-orange-800 flex items-center justify-center">
      🕳️
    </div>
  ),
  tsunami: <Waves className="w-6 h-6 text-blue-600" />,
  shockwave: <Zap className="w-6 h-6 text-yellow-600" />,
  wind: (
    <div className="w-8 h-8 bg-gray-600 border-2 border-gray-800 rounded-full flex items-center justify-center">
      💨
    </div>
  ),
  buildings: <Building className="w-6 h-6 text-red-600" />,
  homes: <Home className="w-6 h-6 text-orange-600" />,
  trees: <TreePine className="w-6 h-6 text-green-600" />,
  people: (
    <div className="w-8 h-8 bg-red-600 border-2 border-red-800 rounded-full flex items-center justify-center text-white text-xs">
      👥
    </div>
  ),
  lung: (
    <div className="w-8 h-8 bg-pink-600 border-2 border-pink-800 rounded-full flex items-center justify-center">
      🫁
    </div>
  ),
  ears: <Ear className="w-6 h-6 text-purple-600" />,
  earthquake: <Activity className="w-6 h-6 text-brown-600" />,
  nuclear: (
    <div className="w-8 h-8 bg-yellow-500 border-2 border-yellow-700 rounded-full flex items-center justify-center">
      ☢️
    </div>
  ),
};

export type ConsequenceType = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  formula: (energy: number, distance: number) => number;
  unit: string;
  dangerLevel: "extreme" | "severe" | "moderate" | "light";
  preventionMeasures: string[];
};

export const ConsequenceTypes: ConsequenceType[] = [
  {
    id: "crater",
    title: "Cratera de Impacto",
    icon: ConsequenceIcons.crater,
    description: "Formação de cratera permanente no local do impacto",
    formula: (energy, distance) => Math.pow(energy / 1e15, 0.25) * 1000, // diameter in meters
    unit: "metros de diâmetro",
    dangerLevel: "extreme",
    preventionMeasures: [
      "Zona de exclusão permanente",
      "Monitoramento geológico contínuo",
      "Realocação de população local",
    ],
  },
  {
    id: "tsunami",
    title: "Tsunami",
    icon: ConsequenceIcons.tsunami,
    description: "Ondas gigantes causadas por impacto oceânico",
    formula: (energy, distance) => Math.sqrt(energy / 1e15) * 50, // height in meters
    unit: "metros de altura",
    dangerLevel: "extreme",
    preventionMeasures: [
      "Sistema de alerta tsunami global",
      "Evacuação imediata de áreas costeiras",
      "Construção de barreiras marítimas",
      "Rotas de fuga para terrenos elevados",
    ],
  },
  {
    id: "shockwave",
    title: "Onda de Choque Sônica",
    icon: ConsequenceIcons.shockwave,
    description: "Ondas de pressão extremamente altas",
    formula: (energy, distance) => 200 - Math.log10(distance + 1) * 20, // decibels
    unit: "decibéis",
    dangerLevel: "severe",
    preventionMeasures: [
      "Proteção auditiva obrigatória",
      "Abrigos à prova de som",
      "Evacuação preventiva em raio de 50km",
    ],
  },
  {
    id: "wind",
    title: "Ventos Destrutivos",
    icon: ConsequenceIcons.wind,
    description: "Ventos mais fortes que furacões categoria 5",
    formula: (energy, distance) =>
      (Math.sqrt(energy / 1e12) * 500) / (distance + 1), // km/h
    unit: "km/h",
    dangerLevel: "severe",
    preventionMeasures: [
      "Abrigos anticiclônicos",
      "Fixação de estruturas móveis",
      "Corte de energia preventivo",
    ],
  },
  {
    id: "buildings",
    title: "Colapso de Edifícios",
    icon: ConsequenceIcons.buildings,
    description: "Destruição de estruturas urbanas",
    formula: (energy, distance) => 100 - distance * 2, // percentage destruction
    unit: "% de destruição",
    dangerLevel: "severe",
    preventionMeasures: [
      "Códigos de construção antissísmica",
      "Reforço estrutural de edifícios críticos",
      "Inspeção preventiva de estruturas",
    ],
  },
  {
    id: "homes",
    title: "Danos Residenciais",
    icon: ConsequenceIcons.homes,
    description: "Casas danificadas ou destruídas",
    formula: (energy, distance) => Math.max(0, 90 - distance * 1.5), // percentage
    unit: "% de casas afetadas",
    dangerLevel: "moderate",
    preventionMeasures: [
      "Seguros obrigatórios contra catástrofes",
      "Construção com materiais resistentes",
      "Planos de realocação temporária",
    ],
  },
  {
    id: "trees",
    title: "Derrubada de Vegetação",
    icon: ConsequenceIcons.trees,
    description: "Árvores derrubadas em grande escala",
    formula: (energy, distance) => Math.max(0, 95 - distance * 1.2), // percentage
    unit: "% de árvores derrubadas",
    dangerLevel: "moderate",
    preventionMeasures: [
      "Programas de reflorestamento emergencial",
      "Proteção de reservas naturais",
      "Monitoramento de erosão do solo",
    ],
  },
  {
    id: "lung",
    title: "Danos Pulmonares",
    icon: ConsequenceIcons.lung,
    description: "Lesões respiratórias por sobrepressão",
    formula: (energy, distance) => (distance < 15 ? 90 : 0), // percentage of people affected
    unit: "% população afetada",
    dangerLevel: "severe",
    preventionMeasures: [
      "Máscaras respiratórias de emergência",
      "Hospitais de campanha equipados",
      "Treinamento em primeiros socorros",
    ],
  },
  {
    id: "ears",
    title: "Ruptura de Tímpanos",
    icon: ConsequenceIcons.ears,
    description: "Danos auditivos permanentes",
    formula: (energy, distance) => (distance < 20 ? 80 : 0), // percentage
    unit: "% população afetada",
    dangerLevel: "moderate",
    preventionMeasures: [
      "Proteção auditiva distribuída",
      "Centros de tratamento especializados",
      "Equipamentos de comunicação visual",
    ],
  },
  {
    id: "earthquake",
    title: "Abalo Sísmico",
    icon: ConsequenceIcons.earthquake,
    description: "Terremoto induzido pelo impacto",
    formula: (energy, distance) =>
      Math.log10(energy / 1e15) + 5 - distance / 100, // magnitude
    unit: "magnitude Richter",
    dangerLevel: "severe",
    preventionMeasures: [
      "Monitoramento sísmico em tempo real",
      "Protocolos de emergência sísmica",
      "Desligamento automático de infraestrutura crítica",
    ],
  },
];
