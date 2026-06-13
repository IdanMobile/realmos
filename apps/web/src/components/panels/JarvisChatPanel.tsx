"use client";

import { useState, type FormEvent } from "react";
import type { HealthReport } from "@/lib/api/fetchHealth";
import { sendJarvisOperatorChat, type JarvisChatApiResponse } from "@/lib/api/jarvis-chat";

type JarvisChatPanelProps = {
  health: HealthReport | null;
  dataSource: "api" | "mock";
  onClose: () => void;
};

type ChatMessage = {
  id: string;
  role: "operator" | "jarvis" | "error";
  text: string;
  routing?: JarvisChatApiResponse["routing"];
};

export function JarvisChatPanel({ health, dataSource, onClose }: JarvisChatPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const ollamaLabel = health?.checks.ollama.status ?? "unknown";
  const defaultModel = health?.checks.ollama.defaultModel ?? "llama3.2:3b";
  const fallbackActive =
    health?.checks.ollama.fallbackActive || health?.checks.ollama.status !== "ok";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const operatorMessage: ChatMessage = {
      id: `op_${Date.now()}`,
      role: "operator",
      text: trimmed
    };
    setMessages((current) => [...current, operatorMessage]);
    setInput("");
    setLoading(true);

    if (dataSource !== "api") {
      setMessages((current) => [
        ...current,
        {
          id: `err_${Date.now()}`,
          role: "error",
          text: "Jarvis chat requires Live API mode. Set NEXT_PUBLIC_API_BASE_URL and run @realmos/api."
        }
      ]);
      setLoading(false);
      return;
    }

    const result = await sendJarvisOperatorChat(trimmed);
    setLoading(false);

    if (!result.ok) {
      setMessages((current) => [
        ...current,
        { id: `err_${Date.now()}`, role: "error", text: result.message }
      ]);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `jv_${Date.now()}`,
        role: "jarvis",
        text: result.data.reply,
        routing: result.data.routing
      }
    ]);
  }

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-xl"
      aria-label="Jarvis chat panel"
      data-testid="jarvis-chat-panel"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-textSecondary">Jarvis</p>
          <h3 className="text-lg font-semibold text-textPrimary">Operator Chat</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-2 py-1 text-sm text-textSecondary hover:text-textPrimary"
          data-testid="jarvis-chat-close"
        >
          Close
        </button>
      </header>

      <div className="border-b border-border px-4 py-3 text-xs text-textSecondary" data-testid="jarvis-safety-notice">
        <p className="font-medium text-textPrimary">Jarvis cannot execute actions yet.</p>
        <p className="mt-1">No shell · No Cursor CLI · No work packet dispatch · GUING/side projects blocked.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="badge bg-accent/20 text-accent" data-testid="jarvis-model-badge">
            {defaultModel}
          </span>
          <span
            className={`badge ${fallbackActive ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200"}`}
            data-testid="jarvis-source-badge"
          >
            {fallbackActive ? "fallback/degraded" : `source: ${ollamaLabel}`}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" data-testid="jarvis-chat-messages">
        {messages.length === 0 ? (
          <p className="text-sm text-textSecondary">Ask about RealmOS status, next initiatives, or governance.</p>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              message.role === "operator"
                ? "border-accent/30 bg-accent/10"
                : message.role === "error"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                  : "border-border bg-card/60"
            }`}
            data-testid={`jarvis-message-${message.role}`}
          >
            <p className="text-xs uppercase tracking-wide text-textSecondary">{message.role}</p>
            <p className="mt-1 whitespace-pre-wrap text-textPrimary">{message.text}</p>
            {message.routing ? (
              <p className="mt-2 text-xs text-textSecondary" data-testid="jarvis-message-routing">
                {message.routing.model} · {message.routing.source}
                {message.routing.fallbackActive ? " · fallback" : ""}
                {message.routing.blocked ? " · blocked" : ""}
              </p>
            ) : null}
          </div>
        ))}
        {loading ? (
          <p className="text-sm text-textSecondary" data-testid="jarvis-chat-loading">
            Jarvis is thinking…
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <label className="sr-only" htmlFor="jarvis-chat-input">
          Message Jarvis
        </label>
        <textarea
          id="jarvis-chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          placeholder="Ask Jarvis about RealmOS…"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary"
          data-testid="jarvis-chat-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="mt-2 w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accentMuted disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="jarvis-chat-submit"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
