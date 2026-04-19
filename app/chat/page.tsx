import { PageShell } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kilo } from "@/lib/kilo";
import { ChatUI } from "./chat-ui";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const models = await kilo.models.list().catch(() => []);
  const preferred = models
    .filter((m) => m.isPreferred)
    .map((m) => ({ id: m.id, name: m.name, supportsVision: m.supportsVision }));
  return (
    <PageShell
      current="/chat"
      title="Chat"
      description="Direct access to the Kilo LLM gateway. Uses your account credits."
    >
      <Card>
        <CardHeader>
          <CardTitle>Gateway</CardTitle>
          <CardDescription>
            {models.length > 0
              ? `${models.length} models available (${preferred.length} preferred shown).`
              : "No models available."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatUI
            models={
              preferred.length > 0
                ? preferred
                : models.slice(0, 25).map((m) => ({
                    id: m.id,
                    name: m.name,
                    supportsVision: m.supportsVision,
                  }))
            }
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
