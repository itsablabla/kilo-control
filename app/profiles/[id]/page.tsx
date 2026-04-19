import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kilo } from "@/lib/kilo";
import { formatDate } from "@/lib/utils";
import {
  deleteProfile,
  saveCommands,
  setDefaultProfile,
  updateProfile,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let profile;
  try {
    profile = await kilo.profiles.get(id);
  } catch {
    notFound();
  }

  const commandsText = profile.commands
    ?.slice()
    .sort((a, b) => a.order - b.order)
    .map((c) => c.command)
    .join("\n") ?? "";

  return (
    <PageShell
      current="/profiles"
      title={profile.name}
      description={profile.description ?? "No description."}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/profiles" className="text-sm text-muted-foreground hover:text-foreground">
            ← all profiles
          </Link>
          {profile.isDefault ? (
            <Badge variant="success">default</Badge>
          ) : (
            <form action={setDefaultProfile}>
              <input type="hidden" name="profileId" value={profile.id} />
              <Button type="submit" variant="outline" size="sm">
                Set as default
              </Button>
            </form>
          )}
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Setup commands</CardTitle>
            <CardDescription>
              One command per line. Each command must be ≤500 chars (Kilo limit).
              Variables referenced as <code>{"{env:NAME}"}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveCommands} className="space-y-3">
              <input type="hidden" name="profileId" value={profile.id} />
              <Textarea
                name="commands"
                defaultValue={commandsText}
                rows={16}
                className="font-mono text-xs"
                placeholder="mkdir -p ~/.config/kilo && echo '{&quot;mcp&quot;:{' > ~/.config/kilo/kilo.json"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {profile.commandCount} commands saved · updated {formatDate(profile.updatedAt)}
                </p>
                <Button type="submit">Save commands</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateProfile} className="space-y-3">
                <input type="hidden" name="profileId" value={profile.id} />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input name="name" defaultValue={profile.name} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Description</label>
                  <Textarea name="description" defaultValue={profile.description ?? ""} />
                </div>
                <Button type="submit" variant="secondary" className="w-full">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variables ({profile.varCount})</CardTitle>
              <CardDescription>
                Variable management requires the Kilo UI for now — visible counts here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.variables?.length ? (
                profile.variables.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-mono">{v.key}</span>
                    {v.isSecret ? (
                      <Badge variant="secondary">secret</Badge>
                    ) : (
                      <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                        {v.value}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile.varCount
                    ? `${profile.varCount} variables (details not exposed by API)`
                    : "No variables."}
                </p>
              )}
              <a
                href="https://app.kilo.ai/cloud"
                target="_blank"
                rel="noreferrer"
                className="block pt-2 text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Manage variables in app.kilo.ai →
              </a>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={deleteProfile}>
                <input type="hidden" name="profileId" value={profile.id} />
                <Button type="submit" variant="destructive" className="w-full">
                  Delete profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
