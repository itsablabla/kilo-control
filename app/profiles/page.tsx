import Link from "next/link";
import { PageShell } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kilo } from "@/lib/kilo";
import { formatDate } from "@/lib/utils";
import { createProfile, setDefaultProfile, deleteProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const profiles = await kilo.profiles.list().catch((e) => {
    throw e;
  });
  return (
    <PageShell
      current="/profiles"
      title="Agent Profiles"
      description="Reusable env vars + setup commands for Cloud Agent sessions."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {profiles.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No profiles yet. Create one on the right.
              </CardContent>
            </Card>
          )}
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profiles/${p.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                    {p.isDefault && <Badge variant="success">default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.varCount} vars · {p.commandCount} cmds · updated {formatDate(p.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!p.isDefault && (
                    <form action={setDefaultProfile}>
                      <input type="hidden" name="profileId" value={p.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Set default
                      </Button>
                    </form>
                  )}
                  <Link href={`/profiles/${p.id}`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <form action={deleteProfile}>
                    <input type="hidden" name="profileId" value={p.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New profile</CardTitle>
            <CardDescription>
              Create a blank profile. Add variables and setup commands after.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProfile} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Name</label>
                <Input name="name" placeholder="e.g. Garza MCP" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea name="description" placeholder="Optional" />
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
