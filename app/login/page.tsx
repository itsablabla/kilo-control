import { redirect } from "next/navigation";
import { login, isAuthed } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function doLogin(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await login(password);
  if (!ok) {
    redirect("/login?error=1");
  }
  const next = String(formData.get("next") ?? "/");
  redirect(next || "/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  if (await isAuthed()) {
    redirect(params.next || "/");
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
            <input type="hidden" name="next" value={params.next ?? "/"} />
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
