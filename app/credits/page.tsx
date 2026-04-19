import { PageShell } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kilo } from "@/lib/kilo";
import { formatCredits, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const user = await kilo.user();
  const used = user.microdollars_used;
  const acquired = user.total_microdollars_acquired;
  const remaining = acquired - used;
  const pct = acquired ? Math.min(100, (used / acquired) * 100) : 0;
  return (
    <PageShell
      current="/credits"
      title="Credits"
      description="Your Kilo credit balance and account info."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining</CardDescription>
            <CardTitle className="text-3xl">{formatCredits(remaining)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${100 - pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatCredits(used)} used of {formatCredits(acquired)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kilo Pass</CardDescription>
            <CardTitle>{formatCredits(user.kilo_pass_threshold)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {acquired >= user.kilo_pass_threshold
              ? "Pass active"
              : `${formatCredits(user.kilo_pass_threshold - acquired)} to go`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next credit expiry</CardDescription>
            <CardTitle>
              {user.next_credit_expiration_at
                ? formatDate(user.next_credit_expiration_at)
                : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {user.is_admin && <Badge variant="secondary">admin</Badge>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Email">{user.google_user_email}</Row>
          <Row label="Name">{user.google_user_name}</Row>
          <Row label="User ID">
            <code className="text-xs">{user.id}</code>
          </Row>
          <Row label="Stripe customer">
            <code className="text-xs">{user.stripe_customer_id ?? "—"}</code>
          </Row>
        </CardContent>
      </Card>
    </PageShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b pb-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}
