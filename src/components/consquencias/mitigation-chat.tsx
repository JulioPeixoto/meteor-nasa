"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatZone = {
  name: string;
  severity: string;
  radiusKm: number;
  casualties: number;
  description?: string;
};

type MitigationChatProps = {
  zones: ChatZone[];
  isOpen?: boolean;
  className?: string;
};

export function MitigationChat({ zones, isOpen = true, className }: MitigationChatProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "pt";

  type ChatMessage = { role: "user" | "assistant"; content: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [chatMessages, isStreaming]);

  // Initialize session once (or when zones change materially)
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/mitigation-chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, consequences: zones }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.sessionId) setSessionId(data.sessionId);
      } catch (e) {
        // ignore
      }
    };
    if (!sessionId && zones?.length) init();
  }, [zones]);

  const sendMessage = async () => {
    if (!chatInput.trim() || sending) return;
    setSending(true);
    setChatError(null);

    const userText = chatInput.trim();
    const historyBefore = [...chatMessages];
    setChatMessages([...historyBefore, { role: "user", content: userText }, { role: "assistant", content: "" }]);
    setChatInput("");

    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      const res = await fetch("/api/mitigation-chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message: userText, history: historyBefore, sessionId, locale }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Erro ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneStreaming = false;
      while (!doneStreaming) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep = buffer.indexOf("\n\n");
        while (sep !== -1) {
          const block = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const line = block.split("\n").find(l => l.startsWith("data:"));
          if (line) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") { doneStreaming = true; break; }
            try {
              const token = JSON.parse(data);
              if (typeof token === 'string' && token.length > 0) {
                setChatMessages(prev => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === 'assistant') {
                    copy[copy.length - 1] = { role: 'assistant', content: last.content + token };
                  }
                  return copy;
                });
              }
            } catch { /* ignore */ }
          }
          sep = buffer.indexOf("\n\n");
        }
      }
    } catch (e: any) {
      setChatError(e?.message || "Falha ao enviar mensagem");
      setChatMessages(historyBefore);
    } finally {
      setSending(false);
      setIsStreaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={"fixed right-[400px] top-[80px] h-[calc(100vh-80px)] w-96 bg-secondary-background border-l-4 border-border z-40 overflow-y-auto shadow-[0px_0px_0px_4px_rgba(0,0,0,1)] " + (className || '')}>
      {/* Header */}
      <div className="p-4 bg-main border-b-4 border-border relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 border-2 border-border rounded-none flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-heading text-main-foreground">CHAT DE MITIGAÇÃO</h2>
            <p className="text-sm text-main-foreground/80">Assistente de Estratégias</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-heading text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Conversa
        </h3>

        <div className="h-[60vh] min-h-[260px] overflow-y-auto border-2 border-border bg-white p-3 mb-3 rounded-base shadow-shadow">
          {chatMessages.length === 0 && (
            <div className="mb-3">
              <div className="text-[10px] uppercase text-gray-800 font-bold mb-1 bg-gray-300 px-2 py-1 rounded inline-block">Assistente</div>
              <div className="text-sm p-3 border-2 border-border rounded-base bg-secondary-background text-foreground whitespace-pre-wrap">
                Faça perguntas sobre mitigação (evacuação, abrigos, prioridades por zona). O contexto do impacto já foi carregado.
              </div>
            </div>
          )}

          {chatMessages.map((m, i) => (
            <div key={i} className="mb-3">
              <div className={`text-[10px] uppercase font-bold mb-1 px-2 py-1 rounded inline-block ${m.role === 'user' ? 'text-blue-800 bg-blue-100' : 'text-gray-800 bg-gray-100'}`}>
                {m.role === 'user' ? 'Você' : 'Assistente'}
              </div>
              <div className={`text-sm p-3 border-2 border-border rounded-base whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-50 text-gray-900 border-blue-200' : 'bg-secondary-background text-foreground'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {(() => {
            const last = chatMessages[chatMessages.length - 1]
            const show = isStreaming && last && last.role === 'assistant' && last.content.length === 0
            return show
          })() && (
            <div className="mb-3">
              <div className="text-[10px] uppercase font-bold mb-1 px-2 py-1 rounded inline-block text-gray-800 bg-gray-100">Assistente</div>
              <div className="text-sm p-3 border-2 border-dashed border-border rounded-base bg-secondary-background text-foreground">Digitando...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Pergunte como mitigar os efeitos..."
            className="flex-1 min-h-[48px] max-h-32 resize-none rounded-base border-2 border-border bg-secondary-background text-foreground placeholder:text-foreground/60 px-3 py-2 text-sm font-base focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} disabled={sending} className="h-12 px-4">
            {sending ? "Enviando..." : "Enviar"}
          </Button>
        </div>

        {chatError && (
          <div className="mt-2 text-xs text-red-800 bg-red-100 border-2 border-red-400 p-2 rounded">{chatError}</div>
        )}
      </div>
    </div>
  );
}

