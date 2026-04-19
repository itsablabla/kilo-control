import Link from "next/link";
import { PageShell } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kilo } from "@/lib/kilo";
import { formatCredits } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadOverview() {
  const [user, profiles, sessions, kiloclaw, byok] = await Promise.allSettled([
    kilo.user(),
    kilo.profiles.list(),
    kilo.sessions.list(),
    kilo.kiloclaw.status(),
    kilo.byok.list(),
  ]);
  return {
    user: user.status === "fulfilled" ? user.value : null,
    profiles: profiles.status === "fulfilled" ? profiles.value : [],
    sessions: sessions.status === "fulfilled" ? sessions.value : [],
    kiloclaw: kiloclaw.status === "fulfilled" ? kiloclaw.value : null,
    byok: byok.status === "fulfilled" ? byok.value : [],
    errors: [
      user.status === "rejected" ? `user: ${user.reason}` : null,
      profiles.status === "rejected" ? `profiles: ${profiles.reason}` : null,
      sessions.status === "rejected" ? `sessions: ${sessions.reason}` : null,
      kiloclaw.status === "rejected" ? `kiloclaw: ${kiloclaw.reason}` : null,
      byok.status === "rejected" ? `byok: ${byok.reason}` : null,
    ].filter(Boolean) as string[],
  };
}

export default async function HomePage() {
  const { user, profiles, sessions, kiloclaw, byok, errors } = await loadOverview();
  const remaining =
    user ? user.total_microdollars_acquired - user.microdollars_used : 0;
  const defaultProfile = profiles.find((p) => p.isDefault);

  return (
    <PageShell current="/" title="Dashboard" description="At-a-glance view of your Kilo account.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credits remaining</CardDescription>
            <CardTitle>{user ? formatCredits(remaining) : "—"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {user
              ? `${formatCredits(user.microdollars_used)} used of ${formatCredits(
                  user.total_microdollars_acquired
                )}`
              : "unavailable"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Default profile</CardDescription>
            <CardTitle className="truncate">{defaultProfile?.name ?? "none"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {defaultProfile
              ? `${defaultProfile.varCount} vars · ${defaultProfile.commandCount} cmds`
              : "no default set"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Cloud sessions</CardDescription>
            <CardTitle>{sessions.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <Link className="underline-offset-4 hover:underline" href="/sessions">
              view sessions →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>KiloClaw</CardDescription>
            <CardTitle className="capitalize">{kiloclaw?.status ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {kiloclaw
              ? `${kiloclaw.provider} · ${kiloclaw.flyRegion ?? "?"}`
              : "unavailable"}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>
              <Link href="/profiles" className="underline-offset-4 hover:underline">
                manage →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {profiles.length === 0 && (
              <p className="text-sm text-muted-foreground">No profiles yet.</p>
            )}
            {profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{p.name}</span>
                    {p.isDefault && <Badge variant="success">default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.varCount} vars · {p.commandCount} cmds
                  </p>
                </div>
                <Link
                  href={`/profiles/${p.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  edit →
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BYOK providers</CardTitle>
            <CardDescription>Bring-your-own-key providers enabled on this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {byok.length === 0 && (
              <p className="text-sm text-muted-foreground">None configured.</p>
            )}
            {byok.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <div className="font-medium">{b.provider_name}</div>
                  <p className="text-xs text-muted-foreground">{b.provider_id}</p>
                </div>
                <Badge variant={b.is_enabled ? "success" : "secondary"}>
                  {b.is_enabled ? "enabled" : "disabled"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {errors.length > 0 && (
        <Card className="mt-6 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">API errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
