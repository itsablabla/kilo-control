import { PageShell } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kilo } from "@/lib/kilo";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const [sessions, kiloclaw] = await Promise.all([
    kilo.sessions.list(),
    kilo.kiloclaw.status().catch(() => null),
  ]);
  return (
    <PageShell
      current="/sessions"
      title="Cloud Sessions"
      description="Active Cloud Agent sessions and KiloClaw sandbox status."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>
              Live Cloud Agent containers. Spawn new sessions from app.kilo.ai → Cloud Agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No active sessions.
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                      {JSON.stringify(s, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KiloClaw sandbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!kiloclaw ? (
              <p className="text-muted-foreground">Unavailable.</p>
            ) : (
              <>
                <Row label="Status">
                  <Badge variant={kiloclaw.status === "running" ? "success" : "secondary"}>
                    {kiloclaw.status}
                  </Badge>
                </Row>
                <Row label="Provider">{kiloclaw.provider}</Row>
                <Row label="Region">{kiloclaw.flyRegion ?? "—"}</Row>
                <Row label="Machine">
                  <code className="text-xs">{kiloclaw.flyMachineId ?? "—"}</code>
                </Row>
                <Row label="Env vars">{kiloclaw.envVarCount}</Row>
                <Row label="Secrets">{kiloclaw.secretCount}</Row>
                <Row label="Channels">{kiloclaw.channelCount}</Row>
                <Row label="Last started">
                  {kiloclaw.lastStartedAt
                    ? new Date(kiloclaw.lastStartedAt).toLocaleString()
                    : "—"}
                </Row>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b pb-1 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}
