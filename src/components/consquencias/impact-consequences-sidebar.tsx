"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Shield,
  ChevronRight,
  ChevronDown,
  Target,
  Zap,
} from "lucide-react";
import {
  computeImpactPhysics,
  buildDamageZones,
  type ImpactCalculationParams,
} from "./utils/impact-calculations";
import { Button } from "@/components/ui/button";

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
  latitude,
  longitude,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<"consequences" | "chat">(
    "consequences"
  );
  const [expandedZone, setExpandedZone] = useState<number | null>(null);

  const tImpact = useTranslations("impact");
  const tMitigationChat = useTranslations("mitigationChat");

  // Wrapper function for translation with proper typing
  const translate = (key: string, values?: Record<string, any>) => {
    try {
      return tImpact(key, values);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`, error);
      return key; // Fallback to key if translation fails
    }
  };

  const results = computeImpactPhysics({ diameter, speed, impactAngle, location, density });
  const damageZones = buildDamageZones({ diameter, speed, impactAngle, location, density, latitude, longitude }, results, translate);
  console.log('speed', speed)
  console.log('diameter', diameter)
  console.log('impactAngle', impactAngle)
  console.log('location', location)
  console.log('density', density)
  console.log('latitude', latitude)
  console.log('longitude', longitude)
  console.log('results', results)
  const buildConsequencesPayload = useCallback(() => {
    return (damageZones || []).map((z) => ({
      name: z.name,
      severity: z.severity,
      radiusKm: z.radiusKm,
      casualties: z.casualties,
      description: z.description,
    }));
  }, [damageZones]);

  // Chat state
  type ChatMessage = { role: "user" | "assistant"; content: string };
  const params = useParams();
  const locale = (params?.locale as string) || "pt";
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, sending, isStreaming, isThinking]);

  // Initialize a session with current consequences once when Chat tab opens
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('/api/mitigation-chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale,
            consequences: buildConsequencesPayload(),
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.sessionId) setSessionId(data.sessionId);
      } catch {}
    };

    if (activeSection === 'chat' && !sessionId) {
      initSession();
    }
  }, [activeSection, buildConsequencesPayload, locale, sessionId]);

  const sendMessage = async () => {
    if (!chatInput.trim() || sending) return;
    setSending(true);
    setChatError(null);

    const userText = chatInput.trim();
    const historyBefore = [...chatMessages];

    // Add user message
    setChatMessages([
      ...historyBefore,
      { role: "user", content: userText },
    ]);
    setChatInput("");
    setIsThinking(true);

    try {
      // cancel previous stream if any
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/mitigation-chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({
          message: userText,
          history: historyBefore,
          sessionId,
          locale,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Erro ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedAny = false;

      let doneStreaming = false;
      
      // Add assistant message placeholder when we start receiving
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", content: "" },
      ]);
      setIsStreaming(true);
      setIsThinking(false);
      while (!doneStreaming) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process all complete SSE events in the buffer
        let sepIndex = buffer.indexOf("\n\n");
        while (sepIndex !== -1) {
          const eventBlock = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);

          const lines = eventBlock.split("\n");
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (dataLine) {
            const data = dataLine.slice(5).trim();
            if (data === "[DONE]") {
              doneStreaming = true;
              break;
            }
          try {
            const token = JSON.parse(data);
            if (typeof token === "string" && token.length > 0) {
              setChatMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.role === "assistant") {
                  copy[copy.length - 1] = {
                    role: "assistant",
                    content: last.content + token,
                  };
                }
                return copy;
              });
              receivedAny = true;
            }
          } catch {
            // Ignore non-JSON payloads
          }
          }

          sepIndex = buffer.indexOf("\n\n");
        }
      }
    } catch (e: any) {
      setChatError(e?.message || tMitigationChat('sendMessageFailed'));
      // rollback to state before sending
      setChatMessages(historyBefore);
    } finally {
      setSending(false);
      setIsStreaming(false);
      setIsThinking(false);
    }
  };

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
<div
  className="
    w-full
    bg-secondary-background
    border-t-4 border-border
    z-40
    overflow-y-auto
    shadow-[0px_0px_0px_4px_rgba(0,0,0,1)]
    md:fixed md:right-0 md:top-[80px] md:h-[calc(100vh-80px)] md:w-96 md:border-t-0 md:border-l-4
  "
>      {/* Header */}
      <div className="p-4 bg-gray-800 border-b-4 border-border relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 border-2 border-border rounded-none flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-white font-heading text-main-foreground">
                {activeSection === "consequences"
                  ? tImpact("title")
                  : tMitigationChat("title")}
              </h2>
              <p className="text-sm text-text-white/80">
                {activeSection === "consequences"
                  ? tImpact("subtitle")
                  : tMitigationChat("subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-2 bg-gray-800 border-b-4 border-border flex gap-2">
        <button
          onClick={() => setActiveSection("consequences")}
          className={`flex-1 h-9 text-sm border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
            activeSection === "consequences"
              ? "bg-main text-main-foreground"
              : "bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          {tImpact("analysisTab")}
        </button>
        <button
          onClick={() => setActiveSection("chat")}
          className={`flex-1 h-9 text-sm border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
            activeSection === "chat"
              ? "bg-main text-main-foreground"
              : "bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          {tMitigationChat("chatTab")}
        </button>
      </div>


      {/* Impact Summary - visible only on Análise */}
      {activeSection === "consequences" && (
        <div className="p-4 bg-gray-800 border-b-4 border-border">
          <h3 className="font-heading text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-white" />
            {tImpact("paramsTitle")}
          </h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-gray-100 border-2 border-border">
              <div className="text-xs text-gray-600">{tImpact("diameter")}</div>
              <div className="font-bold text-black">{diameter.toFixed(2)}m</div>
            </div>
            <div className="p-2 bg-gray-100 border-2 border-border">
              <div className="text-xs text-gray-600">{tImpact("speed")}</div>
              <div className="font-bold text-black">{(speed).toFixed(1)} km/s</div>
            </div>
            <div className="p-2 bg-gray-100 border-2 border-border">
              <div className="text-xs text-gray-600">{tImpact("energy")}</div>
              <div className="font-bold text-black">{formatNumber(results.yieldKT)} kt</div>
            </div>
            <div className="p-2 bg-gray-100 border-2 border-border">
              <div className="text-xs text-gray-600">{tImpact("crater")}</div>
              <div className="font-bold text-black">{Math.round(results.craterDiameter)}m</div>
            </div>
          </div>

          {/* Energy Comparison */}
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-400 rounded">
            <div className="text-xs text-yellow-800 font-medium">
              💣 {tImpact("energyEquivalent", { bombs: Math.round(results.yieldKT / 15) })}
            </div>
          </div>
        </div>
      )}

      {/* Tsunami Alert */}
      {activeSection === "consequences" && location === "ocean" && results.tsunamiHeight && (
        <div className="p-4 bg-blue-500 border-b-4 border-border">
          <div className="flex items-center gap-2 text-white mb-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              🌊
            </div>
            <h3 className="font-heading">{tImpact("tsunamiAlert")}</h3>
          </div>
          <div className="text-white text-sm">
            <div className="flex justify-between items-center mb-1">
              <span>{tImpact("waveHeight")}</span>
              <span className="font-bold">
                {Math.round(results.tsunamiHeight)}m
              </span>
            </div>
            <div className="p-2 bg-white/20 border-2 border-white/40 font-medium text-center">
              🚨 {tImpact("coastalEvacuation")}
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="flex-1">
        {/* Consequences Section */}
        {activeSection === "consequences" && (
          <div className="p-4 bg-gray-800">
            <h3 className="font-heading text-black mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              {tImpact("consequenceZones")}
            </h3>

            <div className="space-y-3">
              {damageZones.map((zone, index) => (
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
                        {(() => {
                          const translatedCasualties = tImpact("estimatedCasualties", { percent: zone.casualties });
                          console.log(`Translated Casualties for zone ${zone.name}:`, translatedCasualties);
                          return translatedCasualties;
                        })()}
                      </div>
                    </div>
                  </button>

                  {expandedZone === index && (
                    <div className="mt-2 p-3 bg-white border-4 border-border">
                      <h5 className="font-heading text-sm text-gray-800 mb-2 flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {tImpact("preventionMeasures")}
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

        {/* Chat Section */}
        {activeSection === "chat" && (
          <div className="p-4">
            <h3 className="font-heading text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {tMitigationChat("title")}
            </h3>

            {/* Chat Messages Area */}
            <div className="h-[60vh] min-h-[260px] overflow-y-auto border-2 border-border bg-white p-3 mb-3 rounded-base shadow-shadow">
              {chatMessages.length === 0 && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase text-gray-800 font-bold mb-1 bg-gray-300 px-2 py-1 rounded inline-block">
                    {tMitigationChat("assistantLabel")}
                  </div>
                  <div className="text-sm p-3 border-2 border-border rounded-base bg-secondary-background text-foreground whitespace-pre-wrap">
                    {tMitigationChat("placeholder")}
                  </div>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className="mb-3">
                  <div className={`text-[10px] uppercase font-bold mb-1 px-2 py-1 rounded inline-block ${
                    m.role === "user" 
                      ? "text-blue-800 bg-blue-100" 
                      : "text-gray-800 bg-gray-100"
                  }`}>
                    {m.role === "user" ? tMitigationChat("youLabel") : tMitigationChat("assistantLabel")}
                  </div>
                  <div
                    className={`text-sm p-3 border-2 border-border rounded-base whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-blue-50 text-gray-900 border-blue-200"
                        : "bg-secondary-background text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-bold mb-1 px-2 py-1 rounded inline-block text-gray-800 bg-gray-100">
                    Assistente
                  </div>
                  <div className="text-sm p-3 border-2 border-border rounded-base bg-secondary-background text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 italic">thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Corrigido espaçamento */}
            <div className="flex gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={tMitigationChat("inputPlaceholder")}
                className="flex-1 min-h-[48px] max-h-32 resize-none rounded-base border-2 border-border bg-secondary-background text-foreground placeholder:text-foreground/60 px-3 py-2 text-sm font-base focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={sending || isThinking}
                variant="default"
                size="default"
                className="h-12 px-4"
              >
                {sending || isThinking ? tMitigationChat("sending") : tMitigationChat("send")}
              </Button>
            </div>

            {chatError && (
              <div className="mt-2 text-xs text-red-800 bg-red-100 border-2 border-red-400 p-2 rounded">
                {chatError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-800 text-white text-xs border-t-4 border-border">
        <div className="text-center space-y-1">
          <p className="font-heading text-yellow-400">
            {tImpact("footer.educational")}
          </p>
          <p>{tImpact("footer.note")}</p>
          <p className="text-gray-400">
            {tImpact("footer.realEmergency")}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p className="text-gray-400">{tImpact("footer.sources")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
