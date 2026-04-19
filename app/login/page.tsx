import { redirect } from "next/navigation";
import { login, isAuthed } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Only allow redirecting back to a same-origin relative path. Anything else
// (absolute URLs, protocol-relative `//evil.com`, backslashes, etc.) falls
// back to `/` to prevent open-redirect abuse.
function safeNext(next: string | undefined | null): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}

async function doLogin(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await login(password);
  if (!ok) {
    redirect("/login?error=1");
  }
  const next = safeNext(String(formData.get("next") ?? "/"));
  redirect(next);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await isAuthed()) {
    redirect(next);
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Kilo Control</CardTitle>
          <CardDescription>Enter the app password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={doLogin} className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              autoFocus
              required
            />
            {params.error && (
              <p className="text-sm text-destructive">Incorrect password.</p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
