"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Shield,
  Users,
  Clock,
  X,
  ChevronRight,
  ChevronDown,
  Target,
  Zap,
  Activity,
} from "lucide-react";
import {
  useImpactCalculations,
  getPreventionStrategy,
  getEvacuationPlan,
  type ImpactCalculationParams,
} from "./use-impact-calculations";

type SidebarProps = ImpactCalculationParams & {
  isOpen?: boolean;
  onClose?: () => void;
};

export function ImpactConsequencesSidebar({
  diameter,
  speed,
  impactAngle,
  location = "land",
  density = 3000,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<
    "consequences" | "prevention" | "evacuation"
  >("consequences");
  const [expandedZone, setExpandedZone] = useState<number | null>(null);

  const calculations = useImpactCalculations({
    diameter,
    speed,
    impactAngle,
    location,
    density,
  });
  const preventionStrategies = getPreventionStrategy(
    calculations.yieldKT,
    calculations.preventionTime
  );
  const evacuationPlan = getEvacuationPlan(calculations.damageZones);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "catastrophic":
        return "bg-red-500 border-red-700 text-white";
      case "severe":
        return "bg-orange-500 border-orange-700 text-white";
      case "moderate":
        return "bg-yellow-500 border-yellow-700 text-black";
      case "light":
        return "bg-green-500 border-green-700 text-white";
      default:
        return "bg-gray-500 border-gray-700 text-white";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-[80px] h-[calc(100vh-80px)] w-96 bg-secondary-background border-l-4 border-border z-40 overflow-y-auto shadow-[0px_0px_0px_4px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="p-4 bg-main border-b-4 border-border relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 border-2 border-border rounded-none flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-heading text-main-foreground">
                ANÁLISE DE IMPACTO
              </h2>
              <p className="text-sm text-main-foreground/80">
                Sistema de Prevenção
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-4 border-border">
        {[
          { key: "consequences", label: "CONSEQUÊNCIAS", icon: AlertTriangle },
          { key: "prevention", label: "PREVENÇÃO", icon: Shield },
          { key: "evacuation", label: "EVACUAÇÃO", icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`flex-1 p-3 border-r-2 border-border font-heading text-xs transition-all ${
              activeSection === key
                ? "bg-main text-main-foreground shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,0.2)]"
                : "bg-secondary-background text-foreground hover:bg-main/20"
            }`}
          >
            <Icon className="w-4 h-4 mx-auto mb-1" />
            {label}
          </button>
        ))}
      </div>

      {/* Impact Summary - Always visible */}
      <div className="p-4 bg-white border-b-4 border-border">
        <h3 className="font-heading text-black mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-black" />
          PARÂMETROS DO IMPACTO
        </h3>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-gray-100 border-2 border-border">
            <div className="text-xs text-gray-600">Diâmetro</div>
            <div className="font-bold text-black">{diameter}m</div>
          </div>
          <div className="p-2 bg-gray-100 border-2 border-border">
            <div className="text-xs text-gray-600">Velocidade</div>
            <div className="font-bold text-black">{(speed/1000).toFixed(1)} km/s</div>
          </div>
          <div className="p-2 bg-gray-100 border-2 border-border">
            <div className="text-xs text-gray-600">Energia</div>
            <div className="font-bold text-black">
              {formatNumber(calculations.yieldKT)} kt
            </div>
          </div>
          <div className="p-2 bg-gray-100 border-2 border-border">
            <div className="text-xs text-gray-600">Cratera</div>
            <div className="font-bold text-black">
              {Math.round(calculations.craterDiameter)}m
            </div>
          </div>
        </div>

        {/* Energy Comparison */}
        <div className="mt-3 p-2 bg-yellow-100 border-2 border-yellow-600">
          <div className="text-xs text-yellow-800 font-medium">
            💣 Equivalente a {Math.round(calculations.yieldKT / 15)} bombas de
            Hiroshima
          </div>
        </div>
      </div>

      {/* Tsunami Alert */}
      {location === "ocean" && calculations.tsunamiHeight && (
        <div className="p-4 bg-blue-500 border-b-4 border-border">
          <div className="flex items-center gap-2 text-white mb-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              🌊
            </div>
            <h3 className="font-heading">ALERTA TSUNAMI</h3>
          </div>
          <div className="text-white text-sm">
            <div className="flex justify-between items-center mb-1">
              <span>Altura das ondas:</span>
              <span className="font-bold">
                {Math.round(calculations.tsunamiHeight)}m
              </span>
            </div>
            <div className="p-2 bg-white/20 border-2 border-white/40 font-medium text-center">
              🚨 EVACUAÇÃO COSTEIRA IMEDIATA
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="flex-1">
        {/* Consequences Section */}
        {activeSection === "consequences" && (
          <div className="p-4">
            <h3 className="font-heading text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              ZONAS DE CONSEQUÊNCIA
            </h3>

            <div className="space-y-3">
              {calculations.damageZones.map((zone, index) => (
                <div key={index}>
                  <button
                    onClick={() =>
                      setExpandedZone(expandedZone === index ? null : index)
                    }
                    className={`w-full border-4 border-border p-3 ${getSeverityColor(
                      zone.severity
                    )} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-current">
                        {expandedZone === index ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                      <h4 className="font-heading text-sm flex-1 text-left">
                        {zone.name}
                      </h4>
                      <div className="text-current font-bold text-xs">
                        {zone.radiusKm.toFixed(1)}km
                      </div>
                    </div>

                    <div className="mt-2 text-left">
                      <div className="text-xs opacity-90">
                        {zone.description}
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {zone.casualties}% de casualidades estimadas
                      </div>
                    </div>
                  </button>

                  {expandedZone === index && (
                    <div className="mt-2 p-3 bg-white border-4 border-border">
                      <h5 className="font-heading text-sm text-gray-800 mb-2 flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Medidas Preventivas:
                      </h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {zone.preventionMeasures.map((measure, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prevention Section */}
        {activeSection === "prevention" && (
          <div className="p-4">
            <h3 className="font-heading text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              ESTRATÉGIAS DE DEFLEXÃO
            </h3>

            {/* Prevention Timeline */}
            <div className="mb-4 p-3 bg-blue-100 border-4 border-blue-600">
              <h4 className="font-heading text-blue-800 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tempo Necessário:
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>
                  Detecção:{" "}
                  <strong>{calculations.preventionTime.detection} dias</strong>
                </div>
                <div>
                  Deflexão:{" "}
                  <strong>{calculations.preventionTime.deflection} dias</strong>
                </div>
                <div>
                  Evacuação:{" "}
                  <strong>{calculations.preventionTime.evacuation} dias</strong>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {preventionStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className="border-4 border-border p-3 bg-green-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading text-green-800 text-sm">
                      {strategy.method}
                    </h4>
                    <div className="text-green-600 font-bold text-xs">
                      {strategy.probability}% sucesso
                    </div>
                  </div>

                  <p className="text-green-700 text-xs mb-2">
                    {strategy.description}
                  </p>

                  <div className="text-green-600 text-xs font-medium">
                    Tempo mínimo: {strategy.timeRequired} dias
                  </div>
                </div>
              ))}
            </div>

            {/* Global Cooperation */}
            <div className="mt-4 p-3 bg-purple-100 border-4 border-purple-600">
              <h4 className="font-heading text-purple-800 mb-2">
                🌍 COOPERAÇÃO INTERNACIONAL
              </h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• NASA, ESA, JAXA, Roscosmos em coordenação</li>
                <li>• Compartilhamento de dados de telescópios</li>
                <li>• Missões conjuntas de deflexão</li>
                <li>• Protocolos de resposta padronizados</li>
              </ul>
            </div>
          </div>
        )}

        {/* Evacuation Section */}
        {activeSection === "evacuation" && (
          <div className="p-4">
            <h3 className="font-heading text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              PLANO DE EVACUAÇÃO
            </h3>

            {/* Evacuation Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="p-2 bg-orange-100 border-2 border-orange-600">
                <div className="text-xs text-orange-700">Raio de Evacuação</div>
                <div className="font-bold text-orange-800">
                  {evacuationPlan.evacuationRadius.toFixed(1)} km
                </div>
              </div>
              <div className="p-2 bg-orange-100 border-2 border-orange-600">
                <div className="text-xs text-orange-700">
                  População Estimada
                </div>
                <div className="font-bold text-orange-800">
                  {formatNumber(evacuationPlan.estimatedPopulation)}
                </div>
              </div>
              <div className="p-2 bg-orange-100 border-2 border-orange-600">
                <div className="text-xs text-orange-700">Tempo Necessário</div>
                <div className="font-bold text-orange-800">
                  {evacuationPlan.timeRequired} dias
                </div>
              </div>
              <div className="p-2 bg-orange-100 border-2 border-orange-600">
                <div className="text-xs text-orange-700">
                  Abrigos Necessários
                </div>
                <div className="font-bold text-orange-800">
                  {evacuationPlan.sheltersNeeded}
                </div>
              </div>
            </div>

            {/* Resources Needed */}
            <div className="p-3 bg-red-100 border-4 border-red-600">
              <h4 className="font-heading text-red-800 mb-2 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Recursos Necessários:
              </h4>
              <ul className="text-xs text-red-700 space-y-1">
                {evacuationPlan.resources.map((resource, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    {resource}
                  </li>
                ))}
              </ul>
            </div>

            {/* Emergency Contacts */}
            <div className="mt-4 p-3 bg-gray-100 border-4 border-gray-600">
              <h4 className="font-heading text-gray-800 mb-2">
                📞 CONTATOS DE EMERGÊNCIA
              </h4>
              <div className="text-xs text-gray-700 space-y-1">
                <div>• Defesa Civil: 199</div>
                <div>• Bombeiros: 193</div>
                <div>• SAMU: 192</div>
                <div>• Polícia Militar: 190</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-800 text-white text-xs border-t-4 border-border">
        <div className="text-center space-y-1">
          <p className="font-heading text-yellow-400">
            ⚠️ SIMULAÇÃO EDUCACIONAL
          </p>
          <p>Baseado em modelos científicos simplificados</p>
          <p className="text-gray-400">
            Para emergências reais: siga autoridades locais
          </p>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p className="text-gray-400">Fontes: NASA, ESA, Collins et al.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
