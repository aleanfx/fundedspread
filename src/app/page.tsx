"use client";

import { useState, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { SocialProofTicker } from "@/components/landing/InteractiveElements";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Navbar,
  HeroSection,
  StatsSection,
  PricingSection,
  ProtocolSection,
  LevelUpSection,
  FinalCTA,
  Footer,
  SupportFloatingButton,
} from "@/components/landing/Sections";

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [user, setUser] = useState<User | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authTab} />
      <Navbar onOpenAuth={openAuth} user={user} />
      <HeroSection heroOpacity={heroOpacity} heroY={heroY} onOpenAuth={openAuth} user={user} />
      <SocialProofTicker />
      <StatsSection />
      <PricingSection onOpenAuth={openAuth} user={user} />
      <ProtocolSection />
      <LevelUpSection />
      <FinalCTA onOpenAuth={openAuth} user={user} />
      <Footer />
      <SupportFloatingButton />
    </div>
  );
}
