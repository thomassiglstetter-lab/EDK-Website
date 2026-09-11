import type { Metadata } from "next";
import "./globals.css";
import ScrollBackground from "@/components/ScrollBackground";
import GeometricTriangles from "@/components/GeometricTriangles";

export const metadata: Metadata = {
  title: "Eintracht Dachau-Karlsfeld | Handball",
  description:
    "Offizielle 3D-Webpräsenz der Eintracht Dachau-Karlsfeld. Leistungs- und Breitensport, Jugendförderung und Spielbetrieb im Münchner Norden.",
  icons: {
    icon: "/logo-dark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        {/* Dynamic Subtle Scroll-Reactive Ambient Background (Crimson Red -> Azure Blue) */}
        <ScrollBackground />

        {/* Subtle Geometric Triangle Tessellation (Crimson -> Azure Dispersion) */}
        <GeometricTriangles />

        {/* Top Dual Accent Stripe (Clean color separation) */}
        <div className="top-brand-border">
          <div className="stripe-crimson" />
          <div className="stripe-divider" />
          <div className="stripe-azure" />
        </div>

        {/* Ambient subtle vignette */}
        <div className="bg-vignette" />

        {children}
      </body>
    </html>
  );
}
