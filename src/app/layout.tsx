import type { Metadata, Viewport } from "next";
import "./globals.css";
import ScrollBackground from "@/components/ScrollBackground";
import GeometricTriangles from "@/components/GeometricTriangles";

export const viewport: Viewport = {
  themeColor: "#07090D",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Eintracht Dachau-Karlsfeld | Handball",
  description:
    "Offizielle 3D-Webpräsenz der Eintracht Dachau-Karlsfeld. Leistungs- und Breitensport, Jugendförderung und Spielbetrieb im Münchner Norden.",
  icons: {
    icon: "/logo-dark.png",
    apple: "/logo-dark.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Eintracht Handball",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: "Eintracht Dachau-Karlsfeld | Handball",
    description:
      "Offizielle Webpräsenz der HSG Eintracht Dachau-Karlsfeld. Spielpläne, Tabellen, Mannschaften und News.",
    url: "https://edk-website-nu.vercel.app",
    siteName: "Eintracht Dachau-Karlsfeld",
    locale: "de_DE",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
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
