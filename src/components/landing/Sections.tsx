"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Zap, Target, TrendingUp, Shield, ChevronLeft, ChevronRight, Star, Bitcoin,
  Trophy, ArrowRight, CheckCircle2, DollarSign, BarChart3, Eye,
  Lock, Crosshair, Flame, Swords, Play, LayoutDashboard, Globe, Check,
  WalletCards, LineChart, Gem, X
} from "lucide-react";
import { FundedSpreadLogo } from "@/components/FundedSpreadLogo";
import { AnimatedCounter, FloatingParticles, EquityChart3D, SocialProofTicker } from "./InteractiveElements";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SpainFlag, USAFlag } from "@/components/Flags";

import { Crown } from "lucide-react";

/* ============================================
   DATA CONSTANTS
   ============================================ */
type ChallengeType = "express_1phase" | "classic_2phase";

const ExpressIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#expressGradient)" stroke="#EAB308" strokeWidth="1" strokeLinejoin="round" />
    <defs>
      <linearGradient id="expressGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF08A" />
        <stop offset="0.5" stopColor="#FACC15" />
        <stop offset="1" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
  </svg>
);

const ClassicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
    <path d="M7 4H17M4 4H7V8C7 9.65685 8.34315 11 10 11H14C15.6569 11 17 9.65685 17 8V4H20M4 4V8C4 9.65685 5.34315 11 7 11V11M20 4V8C20 9.65685 18.6569 11 17 11V11M8 20H16M12 11V20" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 4H17V8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8V4Z" fill="url(#classicGradient)" />
    <path d="M4 4H7V8C7 10.65 5.5 12 4 12V4Z" fill="url(#classicGradient)" />
    <path d="M20 4H17V8C17 10.65 18.5 12 20 12V4Z" fill="url(#classicGradient)" />
    <path d="M12 13V20M8 20H16" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="classicGradient" x1="12" y1="4" x2="12" y2="13" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
  </svg>
);

const CHALLENGE_TYPE_INFO: Record<ChallengeType, { label: string; description: string; icon: React.ReactNode }> = {
  express_1phase: { label: "1 Fase", description: "Target 10% → Cuenta Fondeada", icon: <ExpressIcon /> },
  classic_2phase: { label: "2 Fases", description: "Fase 1 (+8%) → Fase 2 (+5%) → Cuenta Fondeada", icon: <ClassicIcon /> },
};

const FEATURES_CLASSIC: Record<string, string[]> = {
  micro: ["Cuenta de $5,000", "Fase 1: +8% | Fase 2: +5%", "4% DD Diario / 10% DD Máx", "80% Profit Split Base", "5 días mínimos"],
  starter: ["Cuenta de $10,000", "Fase 1: +8% | Fase 2: +5%", "4% DD Diario / 10% DD Máx", "80% Profit Split Base", "5 días mínimos"],
  pro: ["Cuenta de $25,000", "Fase 1: +8% | Fase 2: +5%", "4% DD Diario / 10% DD Máx", "80% Profit Split Base", "5 días mínimos"],
  elite: ["Cuenta de $50,000", "Fase 1: +8% | Fase 2: +5%", "4% DD Diario / 10% DD Máx", "80% Profit Split Base", "Soporte Prioritario"],
  legend: ["Cuenta de $100,000", "Fase 1: +8% | Fase 2: +5%", "4% DD Diario / 10% DD Máx", "80% Profit Split Base", "Soporte VIP"],
  apex: ["Cuenta de $200,000", "Fase 1: +8% | Fase 2: +5%", "4% DD Diario / 10% DD Máx", "80% Profit Split Base", "Soporte VIP Extra"],
};

const FEATURES_EXPRESS: Record<string, string[]> = {
  micro: ["Cuenta de $5,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 5% DD Máx", "80% Profit Split Base", "2 días mínimos"],
  starter: ["Cuenta de $10,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 5% DD Máx", "80% Profit Split Base", "2 días mínimos"],
  pro: ["Cuenta de $25,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 5% DD Máx", "80% Profit Split Base", "2 días mínimos"],
  elite: ["Cuenta de $50,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 5% DD Máx", "80% Profit Split Base", "Soporte Prioritario"],
  legend: ["Cuenta de $100,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 5% DD Máx", "80% Profit Split Base", "Soporte VIP"],
  apex: ["Cuenta de $200,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 5% DD Máx", "80% Profit Split Base", "Soporte VIP Extra"],
};

type ChallengeConfig = {
  id: string; name: string; price: number; accountSize: number; icon: any;
  color: string; gradient: string; borderColor: string; glowColor: string; popular: boolean;
};

const routingChallenges: ChallengeConfig[] = [
  { id: "micro", name: "MICRO", price: 35, accountSize: 5000, icon: TrendingUp, color: "zinc-400", gradient: "from-zinc-500/20 to-zinc-900/20", borderColor: "border-zinc-500/40", glowColor: "shadow-zinc-500/20", popular: false },
  { id: "starter", name: "STARTER", price: 56, accountSize: 10000, icon: Zap, color: "neon-green", gradient: "from-green-500/20 to-green-900/20", borderColor: "border-green-500/40", glowColor: "shadow-green-500/20", popular: false },
  { id: "pro", name: "PRO", price: 135, accountSize: 25000, icon: Shield, color: "neon-cyan", gradient: "from-cyan-500/20 to-cyan-900/20", borderColor: "border-cyan-500/40", glowColor: "shadow-cyan-500/20", popular: true },
  { id: "elite", name: "ELITE", price: 225, accountSize: 50000, icon: Crown, color: "neon-purple", gradient: "from-purple-500/20 to-purple-900/20", borderColor: "border-purple-500/40", glowColor: "shadow-purple-500/20", popular: false },
  { id: "legend", name: "LEGEND", price: 389, accountSize: 100000, icon: Flame, color: "yellow-400", gradient: "from-yellow-500/20 to-yellow-900/20", borderColor: "border-yellow-500/40", glowColor: "shadow-yellow-500/20", popular: false },
  { id: "apex", name: "APEX", price: 789, accountSize: 200000, icon: Star, color: "rose-500", gradient: "from-rose-500/20 to-rose-900/20", borderColor: "border-rose-500/40", glowColor: "shadow-rose-500/20", popular: false },
];

const protocolSteps = [
  { num: "1", title: "FONDEAR", desc: "Elige el tamaño de tu reto y obtén tu cuenta de evaluación al instante.", Icon: WalletCards, color: "#00ff88" },
  { num: "2", title: "OPERAR", desc: "Alcanza los objetivos de ganancia respetando las reglas de drawdown.", Icon: LineChart, color: "#00ff88" },
  { num: "3", title: "COBRAR", desc: "Consigue tu fondeo y quédate con hasta el 90% de tus ganancias. Retira en cripto cuando quieras.", Icon: Gem, color: "#00ff88" },
];

const levelData = [
  { id: "novato", color: "#00ff88", icon: Shield },
  { id: "warrior", color: "#06b6d4", icon: Swords },
  { id: "elite", color: "#a855f7", icon: Trophy },
  { id: "legend", color: "#fbbf24", icon: Crown },
];

/* ============================================
   NAVBAR
   ============================================ */
export function Navbar({ onOpenAuth, user }: { onOpenAuth: (tab: "login" | "register") => void; user?: any }) {
  const { t, language, setLanguage } = useLanguage();
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 border-b border-border-subtle/30"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2, type: "spring" as const, stiffness: 200 }}
    >
      <div className="absolute inset-0 bg-bg-primary/70 backdrop-blur-xl" />
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="flex items-center justify-center mr-1"
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.4 }}
          >
            <FundedSpreadLogo className="w-7 h-7 text-neon-green drop-shadow-[0_0_10px_rgba(0,255,136,0.6)]" />
          </motion.div>
          <span className="text-lg font-bold tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>
            FUNDED SPREAD
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider text-text-muted">
          <a href="#pricing" className="hover:text-neon-green transition-colors duration-300">{t("navbar.pricing")}</a>
          <a href="#protocol" className="hover:text-neon-green transition-colors duration-300">{t("navbar.protocol")}</a>
          <a href="#levels" className="hover:text-neon-green transition-colors duration-300">{t("navbar.levels")}</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <motion.a
                href="/dashboard"
                className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-neon-green text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2"
                style={{ fontFamily: "var(--font-orbitron)" }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,255,136,0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="inline">{t("navbar.panel")}</span>
              </motion.a>
              <ProfileDropdown user={user} />
            </div>
          ) : (
            <>
              {/* Language Selector for unauthenticated users */}
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                title={t("profileDropdown.language")}
              >
                <div className="flex gap-1.5 items-center">
                  {language === "es" ? (
                    <SpainFlag className="w-5 h-[14px]" />
                  ) : (
                    <USAFlag className="w-5 h-[14px]" />
                  )}
                  <span className="hidden sm:block text-[10px] font-bold text-text-muted mt-[1px]">{language.toUpperCase()}</span>
                </div>
              </button>

              <motion.button
                onClick={() => onOpenAuth("register")}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-neon-green text-black text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-orbitron)" }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,255,136,0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                {t("navbar.enter")}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

/* ============================================
   HERO SECTION
   ============================================ */
export function HeroSection({ heroOpacity, heroY, onOpenAuth, user }: {
  heroOpacity: any;
  heroY: any;
  onOpenAuth: (tab: "login" | "register") => void;
  user?: any;
}) {
  const { t } = useLanguage();
  return (
    <motion.section className="relative pt-24 pb-8 lg:pt-32 lg:pb-12 px-6 min-h-[85vh] lg:min-h-[90vh] flex items-center" style={{ opacity: heroOpacity }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,136,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(57,255,20,0.06)_0%,transparent_50%)] pointer-events-none" />
      <FloatingParticles />

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <motion.div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10" style={{ y: heroY }}>
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-[10px] font-bold uppercase tracking-widest mb-8"
          >
            <Flame className="w-3 h-3" /> {t("hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {t("hero.title1")}
            <br />
            <span className="text-neon-green">{t("hero.title2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-text-muted text-base md:text-lg max-w-md mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("hero.description") }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <motion.button
              onClick={() => {
                if (user) {
                  window.location.href = "/checkout";
                } else {
                  onOpenAuth("register");
                }
              }}
              className="group px-5 py-3 rounded-xl bg-neon-green text-black font-bold text-sm flex items-center justify-center gap-3"
              style={{ fontFamily: "var(--font-orbitron)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(0,255,136,0.35)" }}
              whileTap={{ scale: 0.97 }}
            >
              {t("hero.startChallenge")}
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
            <button
              onClick={() => document.getElementById("protocol")?.scrollIntoView({ behavior: "smooth" })}
              className="group px-6 py-3.5 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
            >
              <Play className="w-4 h-4" /> {t("hero.howItWorks")}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-5 text-text-muted text-[10px] uppercase tracking-wider"
          >
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> {t("hero.traits.secure")}</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> {t("hero.traits.instant")}</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3" /> {t("hero.traits.traders")}</span>
          </motion.div>
        </div>

        <div className="hidden lg:block">
          <EquityChart3D />
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ============================================
   STATS SECTION
   ============================================ */
const RequirementIndicator = ({ text, color }: { text: string; color: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center">
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsHovered(!isHovered)}
        className="flex items-center cursor-pointer group/req"
      >
        <motion.div
          animate={{
            width: isHovered ? "auto" : "24px",
            backgroundColor: isHovered ? `${color}20` : "transparent",
            borderColor: isHovered ? `${color}40` : "rgba(255,255,255,0.1)",
          }}
          className="flex items-center h-6 rounded-full border border-white/10 transition-colors px-[6px] relative overflow-hidden backdrop-blur-sm"
        >
          <div className="flex items-center justify-center w-3 h-3 flex-shrink-0">
            <Target className="w-2.5 h-2.5" style={{ color }} />
            {!isHovered && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: [`0 0 0px ${color}`, `0 0 8px ${color}`, `0 0 0px ${color}`] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, width: 0, x: -5 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -5 }}
                className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[2px] ml-1.5"
                style={{ color, fontFamily: "var(--font-rajdhani)" }}
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export function StatsSection() {
  const { t } = useLanguage();
  return (
    <section className="py-10 lg:py-16 px-6">
      <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
        {[
          { value: 2400000, label: t("stats.paid"), prefix: "$", suffix: "+" },
          { value: 12500, label: t("stats.active"), suffix: "+" },
          { value: 2200, label: t("stats.avg"), prefix: "$" },
          { value: 90, label: t("stats.split"), suffix: "%" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center bg-white/[0.02] sm:bg-transparent rounded-xl p-3 sm:p-0 border border-white/5 sm:border-transparent"
          >
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-text-primary tracking-tight" style={{ fontFamily: "var(--font-orbitron)" }}>
              <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="text-text-muted text-[9px] sm:text-[10px] uppercase tracking-widest mt-1 sm:mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   PRICING SECTION (with Carousel Setup)
   ============================================ */


export function PricingSection({ onOpenAuth, user }: { onOpenAuth: (tab: "login" | "register") => void; user?: any }) {
  const { t } = useLanguage();
  const [challengeType, setChallengeType] = useState<ChallengeType>("classic_2phase");
  const [selectedTier, setSelectedTier] = useState<string | null>(routingChallenges[0].id);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getFeatures = (tierId: string) => {
    const accountSize = routingChallenges.find(c => c.id === tierId)?.accountSize.toLocaleString() || "5,000";
    if (challengeType === "express_1phase") {
      return [
        `${t("pricing.features.account")} $${accountSize}`,
        `${t("pricing.features.target")} 1 Fase: +10%`,
        `3% ${t("pricing.features.dailyDD")} / 5% ${t("pricing.features.maxDD")}`,
        `80% ${t("pricing.features.profitSplit")}`,
        tierId === "elite" || tierId === "legend" || tierId === "apex"
          ? t(tierId === "apex" ? "pricing.features.vipExtraSupport" : tierId === "legend" ? "pricing.features.vipSupport" : "pricing.features.support")
          : `2 ${t("pricing.features.minDays")}`
      ];
    }
    return [
      `${t("pricing.features.account")} $${accountSize}`,
      `${t("pricing.features.phase1")}: +8% | ${t("pricing.features.phase2")}: +5%`,
      `4% ${t("pricing.features.dailyDD")} / 10% ${t("pricing.features.maxDD")}`,
      `80% ${t("pricing.features.profitSplit")}`,
      tierId === "elite" || tierId === "legend" || tierId === "apex"
        ? t(tierId === "apex" ? "pricing.features.vipExtraSupport" : tierId === "legend" ? "pricing.features.vipSupport" : "pricing.features.support")
        : `5 ${t("pricing.features.minDays")}`
    ];
  };

  const getBasePrice = (price: number) => {
    return challengeType === "express_1phase" ? Math.round(price * 1.2) : price;
  };

  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    const card = container.children[index] as HTMLElement;
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;

      container.scrollTo({
        left: container.scrollLeft + (cardCenter - containerCenter),
        behavior: "smooth"
      });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  const handleScroll = () => {
    if (isScrollingRef.current) return;
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return; // Only on mobile

    const container = carouselRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterAbs = containerRect.left + containerRect.width / 2;
    let closestIdx = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, idx) => {
      const rect = child.getBoundingClientRect();
      const childCenterAbs = rect.left + rect.width / 2;
      const distance = Math.abs(childCenterAbs - containerCenterAbs);

      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    if (routingChallenges[closestIdx] && routingChallenges[closestIdx].id !== selectedTier) {
      setSelectedTier(routingChallenges[closestIdx].id);
    }
  };

  return (
    <section id="pricing" className="py-12 lg:py-20 px-6 overflow-hidden">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-text-muted text-xs mb-4">
            <Swords className="w-4 h-4" />
            <span className="uppercase tracking-widest">{t("pricing.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron)" }}>
            {t("pricing.title1")} <span className="text-neon-green">{t("pricing.title2")}</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm">{t("pricing.description")}</p>
        </motion.div>

        {/* ===== CHALLENGE TYPE SELECTOR ===== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 flex justify-center relative z-20 mt-4"
        >
          <div className="inline-flex p-1.5 bg-[#0D0D0D]/90 backdrop-blur-xl space-x-1 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
            {(Object.entries(CHALLENGE_TYPE_INFO) as [ChallengeType, typeof CHALLENGE_TYPE_INFO[ChallengeType]][]).map(([type, info]) => {
              const isActive = challengeType === type;
              return (
                <button
                  key={type}
                  onClick={() => { setChallengeType(type); setSelectedTier(routingChallenges[0].id); scrollToCard(0); }}
                  className={`relative px-4 py-3 sm:px-10 sm:py-4 rounded-[2rem] transition-colors duration-300 flex items-center justify-center gap-2 sm:gap-3 group outline-none min-w-[140px] sm:min-w-[220px] ${isActive ? 'text-black' : 'text-text-muted hover:text-white'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="landing-activeChallengeType"
                      className="absolute inset-0 bg-neon-green rounded-[2rem] shadow-[0_0_20px_rgba(57,255,20,0.3)] pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center relative translate-y-[1px] scale-75 sm:scale-100">
                      {info.icon}
                    </div>
                    <span className="font-bold text-[11px] sm:text-base tracking-wide uppercase font-orbitron">
                      {t(type === "classic_2phase" ? "pricing.types.classic" : "pricing.types.express")}
                    </span>
                  </div>

                  {/* Recomendado Badge inside the button so it centers perfectly */}
                  {type === "classic_2phase" && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(57,255,20,0.4)] z-30 flex items-center gap-1 transition-all duration-300 w-max ${isActive
                        ? 'bg-black text-neon-green border border-neon-green/40'
                        : 'bg-neon-green text-black border border-black/10'
                      }`}>
                      <Star className="w-2.5 h-2.5" /> {t("pricing.recommended")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ===== CAROUSEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg-primary via-bg-primary/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg-primary via-bg-primary/60 to-transparent z-10 pointer-events-none" />

          {/* Left Arrow */}
          {routingChallenges.findIndex(c => c.id === selectedTier) > 0 && (
            <button
              onClick={() => {
                const currentIdx = routingChallenges.findIndex(c => c.id === selectedTier);
                if (currentIdx > 0) {
                  setSelectedTier(routingChallenges[currentIdx - 1].id);
                  scrollToCard(currentIdx - 1);
                }
              }}
              className="flex absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 items-center justify-center text-white/70 hover:text-neon-green hover:border-neon-green/40 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {routingChallenges.findIndex(c => c.id === selectedTier) < routingChallenges.length - 1 && (
            <button
              onClick={() => {
                const currentIdx = routingChallenges.findIndex(c => c.id === selectedTier);
                if (currentIdx < routingChallenges.length - 1) {
                  setSelectedTier(routingChallenges[currentIdx + 1].id);
                  scrollToCard(currentIdx + 1);
                }
              }}
              className="flex absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 items-center justify-center text-white/70 hover:text-neon-green hover:border-neon-green/40 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-5 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory py-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingLeft: "calc(50% - 130px)",
              paddingRight: "calc(50% - 130px)",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {routingChallenges.map((challenge, idx) => {
              const Icon = challenge.icon;
              const isSelected = selectedTier === challenge.id;
              const baseColorMatch = challenge.borderColor.match(/border-([a-z]+-[0-9]+)/);
              const themeColor = baseColorMatch ? baseColorMatch[1] : "green-500";

              return (
                <div
                  key={challenge.id}
                  className={`relative glass-card p-4 sm:p-5 border cursor-pointer flex-shrink-0 w-[230px] sm:w-[260px] snap-center transition-all duration-150 ${isSelected
                      ? `border-${themeColor}/30 bg-${themeColor}/5 shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${themeColor}/10`
                      : `border-${themeColor}/10 bg-${themeColor}/[0.01]`
                    }`}
                  style={{
                    opacity: isSelected ? 1 : 0.45,
                    transition: "opacity 0.15s ease, border-color 0.15s ease, background-color 0.15s ease",
                  }}
                  onClick={() => {
                    setSelectedTier(challenge.id);
                    scrollToCard(idx);
                  }}
                >
                  {/* ★ ELEGANT CYBER-PREMIUM HUD ★ */}
                  {isSelected && (
                    <motion.div
                      layoutId="landing-targetLockHUD"
                      className="absolute -inset-[3px] z-20 pointer-events-none rounded-[24px]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 450, damping: 35, mass: 0.8 }}
                    >
                      {/* Ambient Aura */}
                      <div
                        className={`absolute -inset-6 rounded-[3rem] pointer-events-none`}
                        style={{
                          background: `radial-gradient(ellipse at center, var(--tw-shadow-color, rgba(255,255,255,0.1)) 0%, transparent 70%)`,
                          opacity: 0.25,
                          filter: 'blur(20px)',
                        }}
                      />
                      {/* Main sleek contour border */}
                      <div className={`absolute inset-[2px] rounded-[20px] border border-${themeColor}/60 shadow-[0_0_15px_rgba(255,255,255,0.05)]`} />
                      {/* Outer glass rim */}
                      <div className="absolute inset-0 rounded-[24px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent" />
                      {/* Tech Clamping Nodes */}
                      <div className={`absolute top-1/2 -translate-y-1/2 -left-[1px] w-[2px] h-12 bg-${themeColor} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${themeColor}/50`} />
                      <div className={`absolute top-1/2 -translate-y-1/2 -right-[1px] w-[2px] h-12 bg-${themeColor} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${themeColor}/50`} />
                      {/* Bottom Center Extractor Bar */}
                      <div className={`absolute left-1/2 -bottom-[1px] -translate-x-1/2 w-20 h-[2px] bg-${themeColor} shadow-[0_0_12px_var(--tw-shadow-color)] shadow-${themeColor}/70 flex justify-center`} >
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90 animate-pulse -mt-[2px]" />
                      </div>
                      {/* Top Center Diamond Lock */}
                      <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className={`w-2 h-2 rotate-45 border border-black bg-${themeColor} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${themeColor}/60`} />
                      </div>
                    </motion.div>
                  )}

                  {challenge.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-neon-cyan text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(0,255,255,0.4)] z-30 border border-white/20">
                      <Star className="w-2.5 h-2.5 fill-black" /> {t("pricing.card.popular")}
                    </div>
                  )}

                  {/* Selected check - Floating Top Right Corner */}
                  {isSelected && (
                    <motion.div
                      className={`absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#0a0a0a] border border-${challenge.color} flex items-center justify-center shadow-lg shadow-${challenge.color}/40 z-30`}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className={`w-4 h-4 text-${challenge.color} stroke-[3]`} />
                    </motion.div>
                  )}

                  {/* Header within Card: Icon + Name */}
                  <div className="flex items-center justify-between gap-1 mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${challenge.gradient} flex items-center justify-center ${challenge.borderColor} border shadow-inner flex-shrink-0`}>
                        <Icon className={`w-4 h-4 text-${challenge.color}`} />
                      </div>
                      <h3
                        className="text-md sm:text-lg font-bold text-text-primary tracking-tight uppercase flex items-center gap-2"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {challenge.name}
                      </h3>
                    </div>

                    {/* Sleek Subdued Account Size Badge */}
                    <div className={`px-2 py-1 rounded bg-${challenge.color}/10 border border-${challenge.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-[13px] font-bold text-${challenge.color} tracking-wider`} style={{ fontFamily: "var(--font-rajdhani)" }}>
                        ${challenge.accountSize.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
                    <span className={`text-[38px] font-black leading-none text-${challenge.color} tracking-tighter`}>
                      ${getBasePrice(challenge.price)}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest translate-y-[-4px]">{t("pricing.card.perChallenge")}</span>
                  </div>

                  <ul className="space-y-3 mb-6 relative z-10" style={{ fontFamily: "var(--font-rajdhani)" }}>
                    {getFeatures(challenge.id).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[12px] text-text-muted leading-snug font-medium">
                        <div className="w-4 h-4 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mt-[1px] flex-shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-neon-green" />
                        </div>
                        <span className="group-hover:text-text-secondary transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-2.5 rounded-lg border border-${challenge.color}/20 bg-${challenge.color}/5 text-${challenge.color} text-[10px] font-bold uppercase tracking-widest hover:bg-${challenge.color}/10 transition-all`}
                    style={{ fontFamily: "var(--font-orbitron)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user) {
                        window.location.href = `/checkout?tier=${challenge.id}&type=${challengeType}`;
                      } else {
                        onOpenAuth("login");
                      }
                    }}
                  >
                    {t("pricing.card.getFunded")}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Navigation UI (Dots) */}
          <div className="flex justify-center mt-4 gap-2">
            {routingChallenges.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setSelectedTier(c.id); scrollToCard(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedTier === c.id ? 'w-6 bg-neon-green' : 'bg-white/10 hover:bg-white/30'}`}
              />
            ))}
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <button
            className="px-8 py-3.5 rounded-xl bg-neon-green text-black font-bold text-sm mx-auto hover:bg-neon-green/90 transition-all shadow-lg shadow-neon-green/20 flex items-center justify-center gap-3 font-orbitron"
            onClick={() => {
              if (user) {
                window.location.href = "/checkout";
              } else {
                onOpenAuth("register");
              }
            }}
          >
            {t("navbar.register")} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PROTOCOL SECTION
   ============================================ */
export function ProtocolSection() {
  const { t } = useLanguage();
  return (
    <section id="protocol" className="py-12 lg:py-20 px-6 relative">
      <div className="absolute inset-0 bg-white/[0.015] pointer-events-none" />
      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron)" }}>
            {t("protocol.title1")} <span className="text-neon-green">{t("protocol.title2")}</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm">{t("protocol.description")}</p>
        </motion.div>

        <div className="flex flex-row justify-between items-start md:grid md:grid-cols-3 gap-2 sm:gap-8 relative w-full pt-4">
          {/* Connecting Line - Desktop Only */}
          <div className="hidden md:block absolute top-[44px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-neon-green/0 via-neon-green/30 to-neon-green/0" />

          {/* Connecting Line - Mobile Only */}
          <div className="block md:hidden absolute top-[28px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-neon-green/0 via-neon-green/30 to-neon-green/0 z-0" />

          {protocolSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex-1 text-center relative z-10 px-1 md:px-0 flex flex-col items-center"
            >
              <div
                className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-4 md:mb-8 relative flex items-center justify-center group cursor-default"
              >
                {/* Glowing Aura Hover */}
                <div className="absolute inset-0 bg-neon-green/0 group-hover:bg-neon-green/10 rounded-full blur-xl transition-all duration-500" />

                {/* Clean Hexagon / Diamond background shape */}
                <div className="absolute inset-0 rotate-45 rounded-lg md:rounded-2xl border border-neon-green/30 bg-black/60 backdrop-blur-sm group-hover:border-neon-green/70 group-hover:bg-neon-green/5 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,136,0.1)] group-hover:shadow-[0_0_25px_rgba(0,255,136,0.25)]" />

                {/* Tech Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-green/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-green/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <step.Icon className="w-5 h-5 md:w-8 md:h-8" style={{ color: step.color, filter: `drop-shadow(0 0 8px ${step.color}80)` }} />
                </div>

                {/* Step Number Badge */}
                <div
                  className="absolute -top-1.5 -right-1.5 md:-top-3 md:-right-3 w-4 h-4 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[9px] md:text-[13px] font-black text-black z-20 shadow-[0_0_10px_rgba(0,255,136,0.5)] border border-black/50"
                  style={{ backgroundColor: step.color, fontFamily: "var(--font-orbitron)" }}
                >
                  {step.num}
                </div>
              </div>

              <h3 className="text-[11px] md:text-xl font-black mb-1 md:mb-3 uppercase tracking-wider md:tracking-widest" style={{ color: step.color, fontFamily: "var(--font-orbitron)", textShadow: "0 0 15px rgba(0,255,136,0.2)" }}>
                {t(`protocol.steps.${step.num}.title`)}
              </h3>
              <p className="hidden md:block text-text-muted text-sm leading-relaxed max-w-xs mx-auto group-hover:text-text-secondary transition-colors duration-300">
                {t(`protocol.steps.${step.num}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   LEVEL UP SECTION
   ============================================ */
export function LevelUpSection() {
  const { t } = useLanguage();
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  return (
    <section id="levels" className="py-12 lg:py-20 px-6">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron)" }}>
            {t("levels.title1")} <span className="text-neon-green">{t("levels.title2")}</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm">{t("levels.description")}</p>
        </motion.div>

        <div className="space-y-4 relative">
          <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-green-500/40 via-cyan-500/40 via-purple-500/40 to-yellow-500/40 hidden md:block" />

          {levelData.map((cp, i) => (
            <motion.div
              layout
              key={cp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.15 }}
              onClick={() => setActiveLevel(activeLevel === i ? null : i)}
              className={`flex flex-col p-4 sm:p-5 glass-card border rounded-xl hover:border-white/10 transition-colors cursor-pointer group ${activeLevel === i ? 'ring-1 ring-white/20' : ''}`}
              style={{ borderColor: activeLevel === i ? `${cp.color}50` : 'rgba(255,255,255,0.05)' }}
              whileHover={{ x: 8 }}
            >
              <div className="flex items-center gap-4 sm:gap-5 w-full">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  style={{ backgroundColor: `${cp.color}15`, border: `1px solid ${cp.color}40` }}
                  animate={activeLevel === i ? { rotate: 12, scale: 1.1 } : { rotate: 0, scale: 1 }}
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <cp.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: cp.color }} />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-orbitron)" }}>
                      {t(`leaderboard.ranks.${cp.id === 'novato' ? 'Rookie' : cp.id.charAt(0).toUpperCase() + cp.id.slice(1)}`)}
                    </p>
                  </div>
                  <p className="text-text-muted text-[11px] sm:text-xs mt-0.5 leading-relaxed font-medium" style={{ fontFamily: "var(--font-rajdhani)" }}>
                    {t(`levels.data.${cp.id}.reward`)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                    style={{ backgroundColor: `${cp.color}15`, color: cp.color }}>
                    {t("levels.level")} {i + 1}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {activeLevel === i && (
                  <motion.div
                    layout
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { type: "spring", stiffness: 450, damping: 40, restDelta: 0.001 },
                      opacity: { duration: 0.1 }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
                          {t('levels.target_label')}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>

                      <div className="grid gap-2">
                        {t(`levels.data.${cp.id}.target`).split(/ o |, | y /i).map((req, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + (idx * 0.05) }}
                            className="group/req flex items-center p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cp.color }} />
                              <p className="text-[11px] font-bold uppercase tracking-[1px] text-white/80" style={{ fontFamily: "var(--font-rajdhani)" }}>
                                {req.trim()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FINAL CTA
   ============================================ */
export function FinalCTA({ onOpenAuth, user }: { onOpenAuth: (tab: "login" | "register") => void; user?: any }) {
  const { t } = useLanguage();
  return (
    <section className="py-16 lg:py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_60%)] pointer-events-none" />
      <FloatingParticles />

      <div className="max-w-[700px] mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black mb-4 leading-tight"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          {t("cta.title1")}
          <br />
          <span className="text-neon-green">{t("cta.title2")}</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-base mb-10"
        >
          {t("cta.description")}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => {
            if (user) {
              window.location.href = "/checkout";
            } else {
              onOpenAuth("register");
            }
          }}
          className="px-8 py-4 rounded-xl mx-auto bg-neon-green text-black font-bold text-sm flex items-center justify-center gap-3"
          style={{ fontFamily: "var(--font-orbitron)", boxShadow: "0 0 20px rgba(0,255,136,0.15)" }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,255,136,0.35)" }}
          whileTap={{ scale: 0.95 }}
        >
          {t("cta.button")} <ArrowRight className="w-5 h-5 inline ml-2" />
        </motion.button>
        <p className="mt-5 text-text-muted text-[10px] uppercase tracking-wider">
          {t("cta.footer")}
        </p>
      </div>
    </section>
  );
}

/* ============================================
   FLOATING SUPPORT BUTTON
   ============================================ */
export function SupportFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 right-6 z-[999] w-[320px] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-neon-green/5 border-b border-neon-green/10 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                <Gem className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {t("support.title")}
                </h3>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Funded Spread</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-text-secondary leading-relaxed" style={{ fontFamily: "var(--font-rajdhani)" }}>
                {t("support.description")}
              </p>

              <a
                href="mailto:fundedspread@gmail.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/5 border border-neon-green/20 hover:bg-neon-green/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
                  <Globe className="w-4 h-4 text-neon-green" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                    fundedspread@gmail.com
                  </p>
                  <p className="text-[10px] text-text-muted">{t("support.clickToSend")}</p>
                </div>
              </a>

              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                <p>{t("support.responseTime")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full bg-neon-green text-black flex items-center justify-center shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Contact support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Globe className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

/* ============================================
   FOOTER
   ============================================ */
/* ============================================
   RULES MODAL — Accordion Item
   ============================================ */
function RulesAccordionItem({
  title, iconColor, children, defaultOpen = false
}: {
  title: string; iconColor: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <h4 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wide"
          style={{ fontFamily: "var(--font-orbitron)" }}>
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: iconColor }} />
          {title}
        </h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-text-muted rotate-90" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: "spring", stiffness: 400, damping: 40 }, opacity: { duration: 0.15 } }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 text-xs text-text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================
   RULES MODAL — Rule Pill
   ============================================ */
function RulePill({ label, severity = "info" }: { label: string; severity?: "info" | "warning" | "critical" }) {
  const c = severity === "critical"
    ? "bg-red-500/5 border-red-500/20 text-red-200/80"
    : severity === "warning"
    ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-200/80"
    : "bg-neon-green/5 border-neon-green/20 text-emerald-200/80";
  return (
    <div className={`p-3 rounded-lg border ${c} text-xs leading-relaxed`}>
      {label}
    </div>
  );
}

/* ============================================
   RULES MODAL COMPONENT
   ============================================ */
function RulesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-bg-primary/95 backdrop-blur-xl shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-xl border-b border-white/[0.06] px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-neon-green" />
                  <span className="text-[9px] font-bold text-neon-green uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-rajdhani)" }}>Funded Spread</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight"
                  style={{ fontFamily: "var(--font-orbitron)" }}>
                  REGLAS DEL <span className="text-neon-green">CHALLENGE</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-3">
              {/* 1. TRADING RULES */}
              <RulesAccordionItem title="Reglas de Trading" iconColor="#39ff14">
                <RulePill label="⚠ Máximo 5 posiciones abiertas simultáneamente — Previene sobreexposición al mercado." severity="warning" />
                <RulePill label="⚠ Máximo 20 operaciones por día — Previene overtrading y estrategias de alto riesgo." severity="warning" />
                <RulePill label="✅ Uso de Expert Advisors (Bots) permitido — Siempre que respeten las reglas de trading (no martingale, no grid agresivo)." severity="info" />
                <RulePill label="🔴 Drawdown Diario — 2 Fases: 4% | 1 Fase: 3%. Si tu equity cae a este nivel, todas las posiciones se cierran automáticamente." severity="critical" />
                <RulePill label="🔴 Drawdown Máximo — 2 Fases: 10% | 1 Fase: 5%. Si se alcanza, la cuenta se suspende permanentemente." severity="critical" />
                <RulePill label="✅ Días Mínimos — 2 Fases: 5 días | 1 Fase: 2 días. Un día de trading cuenta si abres al menos una operación con ±0.3% de variación y debe durar abierta al menos 5 minutos como mínimo." severity="info" />
              </RulesAccordionItem>

              {/* 2. OBJECTIVES */}
              <RulesAccordionItem title="Objetivos del Challenge" iconColor="#00c3ff">
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-2 text-text-muted uppercase tracking-wider text-[9px] font-bold">Métrica</th>
                        <th className="text-center py-2 px-2 text-yellow-400 uppercase tracking-wider text-[9px] font-bold">1 Fase</th>
                        <th className="text-center py-2 px-2 text-neon-green uppercase tracking-wider text-[9px] font-bold">2F — Fase 1</th>
                        <th className="text-center py-2 px-2 text-cyan-400 uppercase tracking-wider text-[9px] font-bold">2F — Fase 2</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      {[
                        ["Objetivo de Profit", "10%", "8%", "5%"],
                        ["Drawdown Diario", "3%", "4%", "4%"],
                        ["Drawdown Máximo", "5%", "10%", "10%"],
                        ["Días Mínimos", "2", "5", "5"],
                        ["Tiempo Límite", "30 días", "30 días", "60 días"],
                        ["Profit Split", "80%", "—", "80%"],
                      ].map(([label, e, p1, p2], i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 px-2 font-medium text-text-primary">{label}</td>
                          <td className="py-2 px-2 text-center font-mono">{e}</td>
                          <td className="py-2 px-2 text-center font-mono">{p1}</td>
                          <td className="py-2 px-2 text-center font-mono">{p2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-200/70">
                  <strong>1 Fase:</strong> Apruebas → Cuenta fondeada directamente.<br />
                  <strong>2 Fases:</strong> Fase 1 → Nueva cuenta Fase 2 → Cuenta fondeada.
                </div>
              </RulesAccordionItem>

              {/* 3. WITHDRAWALS */}
              <RulesAccordionItem title="Sistema de Retiros" iconColor="#a855f7">
                <RulePill label="📅 Primer retiro: 14 días después de recibir la cuenta fondeada. Siguientes retiros cada 14 días (o 7 días con add-on Payouts Semanales)." severity="info" />
                <RulePill label="💰 Profit Split base: 80%. Escalable a 90% (+15% precio) o 100% (+30% precio) con add-ons. Escalamiento orgánico: +5% cada 3 retiros consecutivos hasta 90%." severity="info" />
                <RulePill label="🔗 Retiros en USDT vía redes TRC20 y BEP20. Procesamiento en 24-48 horas tras aprobación." severity="info" />
              </RulesAccordionItem>

              {/* 4. CONDUCT */}
              <RulesAccordionItem title="Conducta y Fair Play" iconColor="#f59e0b">
                <RulePill label="🚫 Prohibido: Martingale puro, grid agresivo, arbitraje de latencia, spike trading, copy trading entre cuentas de Funded Spread." severity="critical" />
                <RulePill label="⚠ Una persona, una cuenta activa por tipo de challenge. No se permite cubrir riesgo entre múltiples cuentas fondeadas." severity="warning" />
                <RulePill label="⚠ Operativa responsable: Patrones de apuestas, acumulación sin gestión de riesgo o overtrading pueden resultar en revisión o suspensión." severity="warning" />
              </RulesAccordionItem>

              {/* 5. VIOLATIONS */}
              <RulesAccordionItem title="Consecuencias de Violación" iconColor="#ef4444">
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 space-y-1.5">
                  <p className="font-bold text-red-400 text-[11px] uppercase tracking-wider mb-2">Acción Inmediata:</p>
                  <p className="text-red-200/60 text-[11px]">1. Cierre automático de todas las posiciones abiertas.</p>
                  <p className="text-red-200/60 text-[11px]">2. Suspensión inmediata de la cuenta (status: Failed).</p>
                  <p className="text-red-200/60 text-[11px]">3. Desactivación del Expert Advisor de monitoreo.</p>
                  <p className="text-red-200/60 text-[11px]">4. Registro de la violación en el dashboard.</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-yellow-200/70 text-[11px]">
                    <strong>¿Puedo volver a intentarlo?</strong> Sí. La suspensión aplica solo a la cuenta afectada. Puedes comprar un nuevo challenge sin bloqueo permanente.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                  <p className="text-emerald-200/70 text-[11px]">
                    <strong>¿Dudas?</strong> Contáctanos en <a href="mailto:fundedspread@gmail.com" className="text-neon-green hover:underline font-bold">fundedspread@gmail.com</a>. Revisamos cada caso individualmente.
                  </p>
                </div>
              </RulesAccordionItem>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-bg-primary/95 backdrop-blur-xl border-t border-white/[0.06] px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <p className="text-text-muted text-[10px] text-center">
                Al adquirir un challenge, confirmas que has leído y aceptado estas reglas.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   FOOTER
   ============================================ */
export function Footer() {
  const { t } = useLanguage();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <>
      <footer className="py-8 px-6 border-t border-border-subtle/30">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Logo — left on desktop, centered on mobile */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <FundedSpreadLogo className="w-5 h-5 text-neon-green drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
            <span className="text-base font-bold tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>FUNDED SPREAD</span>
          </div>
          {/* Links — always centered */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[10px] text-text-muted uppercase tracking-wider">
            <button onClick={() => setRulesOpen(true)} className="hover:text-neon-green transition-colors cursor-pointer">
              {t("footer.rules")}
            </button>
            <span className="text-white/10">|</span>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-neon-green transition-colors">
              {t("footer.termsAndConditions")}
            </a>
          </div>
          {/* Copyright — right on desktop, centered on mobile */}
          <p className="text-text-muted text-[10px] uppercase tracking-wider text-center md:text-right">
            © {new Date().getFullYear()} Funded Spread. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Rules Modal */}
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  );
}

