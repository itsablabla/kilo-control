import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kilo Control",
  description: "Control panel for app.kilo.ai",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
