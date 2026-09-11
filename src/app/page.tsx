"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroContent from "@/components/HeroContent";
import NewsSection from "@/components/NewsSection";
import ClubIdentity from "@/components/ClubIdentity";
import TeamsSection from "@/components/TeamsSection";
import ScheduleSection from "@/components/ScheduleSection";
import ContactSection from "@/components/ContactSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";

// Dynamically import 3D Canvas
const Handball3D = dynamic(() => import("@/components/Handball3D"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        fontSize: "0.85rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      <span>3D Umgebung wird geladen...</span>
    </div>
  ),
});

export default function Home() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <Header />

      {/* Hero / Start Section with 3D Background */}
      <section
        id="uebersicht"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Full-bleed 3D Three.js Scene */}
        <div className="canvas-container">
          <Handball3D />
        </div>

        {/* Foreground Content */}
        <div className="content-layer">
          <HeroContent />
        </div>
      </section>

      {/* News & Updates Section (directly after Start) */}
      <NewsSection />

      {/* Club Identity, Values & Highlights */}
      <ClubIdentity />

      {/* Teams & Training */}
      <TeamsSection />

      {/* Schedule & Results */}
      <ScheduleSection />

      {/* Contact Form & Club Inquiries */}
      <ContactSection />

      {/* Sponsors & Partners */}
      <SponsorsSection />

      {/* Minimalist Footer */}
      <Footer />
    </main>
  );
}
