import Link from "next/link";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/profiles", label: "Profiles" },
  { href: "/sessions", label: "Sessions" },
  { href: "/chat", label: "Chat" },
  { href: "/models", label: "Models" },
  { href: "/credits", label: "Credits" },
];

export function Nav({ current }: { current?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Kilo Control
        </Link>
        <nav className="flex items-center gap-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent",
                current === it.href && "bg-accent text-foreground"
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <form action="/api/logout" method="post" className="ml-auto">
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

export function PageShell({
  current,
  title,
  description,
  actions,
  children,
}: {
  current?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav current={current} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </>
  );
}
