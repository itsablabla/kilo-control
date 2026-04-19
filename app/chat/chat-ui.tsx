"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sendChat, type ChatMessage } from "./actions";

export function ChatUI({
  models,
}: {
  models: Array<{ id: string; name: string; supportsVision: boolean }>;
}) {
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<{ total_tokens?: number; cost?: number } | null>(null);

  const submit = () => {
    if (!input.trim() || !model) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setError(null);
    start(async () => {
      try {
        const { content, usage } = await sendChat({ model, messages: next });
        setMessages((m) => [...m, { role: "assistant", content }]);
        setLastUsage(usage ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([]);
              setLastUsage(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="min-h-[240px] space-y-3 rounded-md border p-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Send a message to start.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="flex gap-3">
            <Badge variant={m.role === "user" ? "default" : "secondary"} className="h-5 shrink-0">
              {m.role}
            </Badge>
            <div className="whitespace-pre-wrap text-sm">{m.content}</div>
          </div>
        ))}
        {pending && (
          <p className="text-xs text-muted-foreground">Thinking…</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {lastUsage && (
        <p className="text-xs text-muted-foreground">
          {lastUsage.total_tokens ?? "?"} tokens
          {typeof lastUsage.cost === "number" ? ` · $${lastUsage.cost.toFixed(6)}` : ""}
        </p>
      )}

      <div className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">⌘/Ctrl + Enter to send</p>
          <Button type="button" onClick={submit} disabled={pending || !input.trim() || !model}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
