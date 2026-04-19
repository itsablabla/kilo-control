"use server";

import { kilo } from "@/lib/kilo";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function sendChat(input: { model: string; messages: ChatMessage[] }) {
  const res = await kilo.gateway.chat({ model: input.model, messages: input.messages });
  const data = (await res.json()) as {
    choices?: Array<{ message?: { role: string; content: string } }>;
    usage?: { total_tokens?: number; cost?: number };
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return { content: text, usage: data.usage };
}
