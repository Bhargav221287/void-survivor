import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOID SURVIVOR - Wave Survival Arena Shooter",
  description:
    "Fast-paced retro-futuristic single-player top-down wave-survival arena shooter. Pilot your vessel, upgrade tech trees, and climb the global leaderboard.",
  keywords: ["game", "shooter", "survival", "arena", "retro", "nextjs", "canvas", "arcade"],
  authors: [{ name: "Bhargav", url: "https://github.com/Bhargav221287" }],
  openGraph: {
    title: "VOID SURVIVOR",
    description: "Survive infinite hostile swarm waves in deep space. Can you reach the leaderboard?",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-slate-950 text-slate-100">
      <body className="overflow-hidden bg-slate-950 text-slate-100 min-h-screen select-none antialiased">
        {children}
      </body>
    </html>
  );
}
