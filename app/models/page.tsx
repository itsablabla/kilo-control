import { PageShell } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kilo } from "@/lib/kilo";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await kilo.models.list().catch(() => []);
  const preferred = models.filter((m) => m.isPreferred);
  const rest = models.filter((m) => !m.isPreferred);
  return (
    <PageShell
      current="/models"
      title="Models"
      description={`${models.length} models available through the Kilo Gateway.`}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferred ({preferred.length})</CardTitle>
            <CardDescription>Fast, high-quality defaults.</CardDescription>
          </CardHeader>
          <CardContent>
            <ModelGrid models={preferred} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All models ({rest.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ModelGrid models={rest} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function ModelGrid({
  models,
}: {
  models: Array<{ id: string; name: string; supportsVision: boolean }>;
}) {
  if (models.length === 0) {
    return <p className="text-sm text-muted-foreground">None.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{m.name}</div>
            <code className="truncate text-xs text-muted-foreground">{m.id}</code>
          </div>
          {m.supportsVision && <Badge variant="secondary">vision</Badge>}
        </div>
      ))}
    </div>
  );
}
