import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "The Bet — D1 Football Predictor",
  description:
    "AI-powered D1 college football game predictions: winner, spread, and over/under using stats, player data, coaching analysis, and social media signals.",
  keywords: ["college football", "CFB predictions", "spread picks", "over under", "D1 football", "AI predictor"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <footer className="border-t border-border mt-16 py-8 text-center text-muted text-sm">
          <p>
            The Bet · D1 Football Predictor · 2026 Season ·{" "}
            <span className="text-primary">For entertainment purposes</span>
          </p>
          <p className="mt-1 text-xs opacity-60">
            Predictions use team stats, coaching data, recruiting rankings &amp; social media signals.
            Always gamble responsibly.
          </p>
        </footer>
      </body>
    </html>
  );
}
