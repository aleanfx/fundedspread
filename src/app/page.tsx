"use client";

import { useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { SocialProofTicker } from "@/components/landing/InteractiveElements";
import {
  Navbar,
  HeroSection,
  StatsSection,
  PricingSection,
  ProtocolSection,
  LevelUpSection,
  FinalCTA,
  Footer,
} from "@/components/landing/Sections";

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authTab} />
      <Navbar onOpenAuth={openAuth} />
      <HeroSection heroOpacity={heroOpacity} heroY={heroY} onOpenAuth={openAuth} />
      <SocialProofTicker />
      <StatsSection />
      <PricingSection onOpenAuth={openAuth} />
      <ProtocolSection />
      <LevelUpSection />
      <FinalCTA onOpenAuth={openAuth} />
      <Footer />
    </div>
  );
}
