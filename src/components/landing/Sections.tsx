"use client";

import { motion } from "framer-motion";
import {
  Zap, Target, TrendingUp, Shield, ChevronRight, Star, Bitcoin,
  Trophy, ArrowRight, CheckCircle2, DollarSign, BarChart3, Eye,
  Lock, Crosshair, Flame, Swords, Play,
} from "lucide-react";
import { FundedSpreadLogo } from "@/components/FundedSpreadLogo";
import { AnimatedCounter, FloatingParticles, EquityChart3D, SocialProofTicker } from "./InteractiveElements";

import { Crown } from "lucide-react";

/* ============================================
   DATA CONSTANTS
   ============================================ */
type ChallengeType = "express_1phase" | "classic_2phase";

const ExpressIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#expressGradient)" stroke="#EAB308" strokeWidth="1" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="expressGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF08A"/>
                <stop offset="0.5" stopColor="#FACC15"/>
                <stop offset="1" stopColor="#CA8A04"/>
            </linearGradient>
        </defs>
    </svg>
);

const ClassicIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
        <path d="M7 4H17M4 4H7V8C7 9.65685 8.34315 11 10 11H14C15.6569 11 17 9.65685 17 8V4H20M4 4V8C4 9.65685 5.34315 11 7 11V11M20 4V8C20 9.65685 18.6569 11 17 11V11M8 20H16M12 11V20" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 4H17V8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8V4Z" fill="url(#classicGradient)"/>
        <path d="M4 4H7V8C7 10.65 5.5 12 4 12V4Z" fill="url(#classicGradient)"/>
        <path d="M20 4H17V8C17 10.65 18.5 12 20 12V4Z" fill="url(#classicGradient)"/>
        <path d="M12 13V20M8 20H16" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="classicGradient" x1="12" y1="4" x2="12" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A"/>
                <stop offset="0.5" stopColor="#F59E0B"/>
                <stop offset="1" stopColor="#B45309"/>
            </linearGradient>
        </defs>
    </svg>
);

const CHALLENGE_TYPE_INFO: Record<ChallengeType, { label: string; description: string; icon: React.ReactNode }> = {
    express_1phase: { label: "Express 1 Fase", description: "Target 10% → Cuenta Fondeada", icon: <ExpressIcon /> },
    classic_2phase: { label: "Clásico 2 Fases", description: "Fase 1 (+8%) → Fase 2 (+5%) → Cuenta Fondeada", icon: <ClassicIcon /> },
};

const FEATURES_CLASSIC: Record<string, string[]> = {
    micro: ["Cuenta de $5,000", "Fase 1: +8% | Fase 2: +5%", "5% DD Diario / 10% DD Máx", "80% Profit Split", "5 días mínimos"],
    starter: ["Cuenta de $10,000", "Fase 1: +8% | Fase 2: +5%", "5% DD Diario / 10% DD Máx", "80% Profit Split", "5 días mínimos"],
    pro: ["Cuenta de $25,000", "Fase 1: +8% | Fase 2: +5%", "5% DD Diario / 10% DD Máx", "85% Profit Split", "5 días mínimos"],
    elite: ["Cuenta de $50,000", "Fase 1: +8% | Fase 2: +5%", "5% DD Diario / 8% DD Máx", "85% Profit Split", "Soporte Prioritario"],
    legend: ["Cuenta de $100,000", "Fase 1: +8% | Fase 2: +5%", "5% DD Diario / 8% DD Máx", "90% Profit Split", "Soporte VIP"],
    apex: ["Cuenta de $200,000", "Fase 1: +8% | Fase 2: +5%", "5% DD Diario / 8% DD Máx", "90% Profit Split", "Soporte VIP Extra"],
};

const FEATURES_EXPRESS: Record<string, string[]> = {
    micro: ["Cuenta de $5,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 6% DD Máx", "80% Profit Split", "2 días mínimos"],
    starter: ["Cuenta de $10,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 6% DD Máx", "80% Profit Split", "2 días mínimos"],
    pro: ["Cuenta de $25,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 6% DD Máx", "85% Profit Split", "2 días mínimos"],
    elite: ["Cuenta de $50,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 6% DD Máx", "85% Profit Split", "Soporte Prioritario"],
    legend: ["Cuenta de $100,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 6% DD Máx", "90% Profit Split", "Soporte VIP"],
    apex: ["Cuenta de $200,000", "Objetivo 1 Fase: +10%", "3% DD Diario / 6% DD Máx", "90% Profit Split", "Soporte VIP Extra"],
};

type ChallengeConfig = {
    id: string; name: string; price: number; accountSize: number; icon: any;
    color: string; gradient: string; borderColor: string; glowColor: string; popular: boolean;
};

const routingChallenges: ChallengeConfig[] = [
    { id: "micro", name: "MICRO", price: 35, accountSize: 5000, icon: TrendingUp, color: "zinc-400", gradient: "from-zinc-500/20 to-zinc-900/20", borderColor: "border-zinc-500/40", glowColor: "shadow-zinc-500/20", popular: false },
    { id: "starter", name: "STARTER", price: 49, accountSize: 10000, icon: Zap, color: "neon-green", gradient: "from-green-500/20 to-green-900/20", borderColor: "border-green-500/40", glowColor: "shadow-green-500/20", popular: false },
    { id: "pro", name: "PRO", price: 99, accountSize: 25000, icon: Shield, color: "neon-cyan", gradient: "from-cyan-500/20 to-cyan-900/20", borderColor: "border-cyan-500/40", glowColor: "shadow-cyan-500/20", popular: true },
    { id: "elite", name: "ELITE", price: 199, accountSize: 50000, icon: Crown, color: "neon-purple", gradient: "from-purple-500/20 to-purple-900/20", borderColor: "border-purple-500/40", glowColor: "shadow-purple-500/20", popular: false },
    { id: "legend", name: "LEGEND", price: 499, accountSize: 100000, icon: Flame, color: "yellow-400", gradient: "from-yellow-500/20 to-yellow-900/20", borderColor: "border-yellow-500/40", glowColor: "shadow-yellow-500/20", popular: false },
    { id: "apex", name: "APEX", price: 999, accountSize: 200000, icon: Star, color: "rose-500", gradient: "from-rose-500/20 to-rose-900/20", borderColor: "border-rose-500/40", glowColor: "shadow-rose-500/20", popular: false },
];

const protocolSteps = [
  { num: "1", title: "FONDEAR", desc: "Elige el tamaño de tu reto y obtén tu cuenta de evaluación al instante.", Icon: Bitcoin, color: "#00ff88" },
  { num: "2", title: "OPERAR", desc: "Alcanza los objetivos de ganancia respetando las reglas de drawdown.", Icon: Crosshair, color: "#00ff88" },
  { num: "3", title: "COBRAR", desc: "Consigue tu fondeo y quédate con hasta el 90% de tus ganancias. Retira cuando quieras.", Icon: DollarSign, color: "#00ff88" },
];

const levelData = [
  { level: "ROOKIE", target: "+8% Ganancia", reward: "La cuenta se mantiene activa", color: "#00ff88", icon: Target },
  { level: "WARRIOR", target: "+10% Ganancia", reward: "El tamaño de cuenta se duplica", color: "#06b6d4", icon: Swords },
  { level: "ELITE", target: "+10% Ganancia", reward: "Desbloquea 90% de reparto", color: "#a855f7", icon: Shield },
  { level: "LEGEND", target: "Consistente", reward: "Retiros completos habilitados", color: "#fbbf24", icon: Trophy },
];

/* ============================================
   NAVBAR
   ============================================ */
export function Navbar({ onOpenAuth }: { onOpenAuth: (tab: "login" | "register") => void }) {
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
          <a href="#pricing" className="hover:text-neon-green transition-colors duration-300">Precios</a>
          <a href="#protocol" className="hover:text-neon-green transition-colors duration-300">El Protocolo</a>
          <a href="#levels" className="hover:text-neon-green transition-colors duration-300">Niveles</a>
          <a href="#faq" className="hover:text-neon-green transition-colors duration-300">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onOpenAuth("login")} className="px-4 py-2 text-xs text-text-muted hover:text-text-primary transition-colors">
            Iniciar Sesión
          </button>
          <motion.button
            onClick={() => onOpenAuth("register")}
            className="px-5 py-2.5 rounded-lg bg-neon-green text-black text-xs font-bold uppercase tracking-wider"
            style={{ fontFamily: "var(--font-orbitron)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,255,136,0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            FONDEARSE
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ============================================
   HERO SECTION
   ============================================ */
export function HeroSection({ heroOpacity, heroY, onOpenAuth }: {
  heroOpacity: any;
  heroY: any;
  onOpenAuth: (tab: "login" | "register") => void;
}) {
  return (
    <motion.section className="relative pt-28 pb-8 px-6 min-h-[90vh] flex items-center" style={{ opacity: heroOpacity }}>
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
            <Flame className="w-3 h-3" /> Trading de Nueva Generación
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            TU VENTAJA.
            <br />
            <span className="text-neon-green">NUESTRO CAPITAL.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-text-muted text-base md:text-lg max-w-md mb-8 leading-relaxed"
          >
            Opera con hasta <span className="text-text-primary font-semibold">$100,000</span> de nuestro capital.
            Quédate con hasta el <span className="text-neon-green font-semibold">90%</span> de las ganancias.
            Paga con cripto. Cero riesgo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <motion.button
              onClick={() => onOpenAuth("register")}
              className="group px-7 py-4 rounded-xl bg-neon-green text-black font-bold text-sm flex items-center gap-3"
              style={{ fontFamily: "var(--font-orbitron)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(0,255,136,0.35)" }}
              whileTap={{ scale: 0.97 }}
            >
              INICIAR RETO $49
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
            <button className="group px-7 py-4 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-all">
              <Play className="w-4 h-4" /> VER CÓMO FUNCIONA
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-5 text-text-muted text-[10px] uppercase tracking-wider"
          >
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Pagos Seguros</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Activación Inmediata</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3" /> 12,500+ Traders</span>
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
export function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: 2400000, label: "Pagado a Traders", prefix: "$", suffix: "+" },
          { value: 12500, label: "Traders Fondeados", suffix: "+" },
          { value: 4200, label: "Recompensa Prom.", prefix: "$" },
          { value: 90, label: "Ganancia Máxima", suffix: "%" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl font-black text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
              <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="text-text-muted text-[10px] uppercase tracking-widest mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   PRICING SECTION (with Carousel Setup)
   ============================================ */
import { useState, useRef, useEffect } from "react";

export function PricingSection({ onOpenAuth }: { onOpenAuth: (tab: "login" | "register") => void }) {
    const [challengeType, setChallengeType] = useState<ChallengeType>("classic_2phase");
    const [selectedTier, setSelectedTier] = useState<string | null>(routingChallenges[0].id);
    const carouselRef = useRef<HTMLDivElement>(null);

    const getFeatures = (tierId: string) => {
        if (challengeType === "express_1phase") return FEATURES_EXPRESS[tierId];
        return FEATURES_CLASSIC[tierId];
    };

    const getBasePrice = (price: number) => {
        return challengeType === "express_1phase" ? Math.round(price * 1.2) : price;
    };

    useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;

        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                const scrollLeft = container.scrollLeft;
                const cardWidth = 260 + 20;

                let index = Math.round(scrollLeft / cardWidth);
                if (index < 0) index = 0;
                if (index >= routingChallenges.length) index = routingChallenges.length - 1;

                if (selectedTier !== routingChallenges[index].id) {
                    setSelectedTier(routingChallenges[index].id);
                }
            }, 50);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [selectedTier]);

    const scrollToCard = (index: number) => {
        if (carouselRef.current) {
            const cardWidth = 260 + 20;
            carouselRef.current.scrollTo({
                left: index * cardWidth,
                behavior: "smooth"
            });
        }
    };

    return (
        <section id="pricing" className="py-20 px-6 overflow-hidden">
            <div className="max-w-[1100px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 text-text-muted text-xs mb-4">
                        <Swords className="w-4 h-4" />
                        <span className="uppercase tracking-widest">Elige Tu Arena</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron)" }}>
                        ELIGE TU <span className="text-neon-green">RETO</span>
                    </h2>
                    <p className="text-text-muted mt-3 text-sm">Selecciona tu tipo de reto y tamaño de cuenta. Paga con cripto e inicia tu camino.</p>
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
                                    className={`relative px-6 py-3.5 sm:px-10 sm:py-4 rounded-[2rem] transition-colors duration-300 flex items-center justify-center gap-3 group outline-none min-w-[180px] sm:min-w-[220px] ${isActive ? 'text-black' : 'text-text-muted hover:text-white'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="landing-activeChallengeType"
                                            className="absolute inset-0 bg-neon-green rounded-[2rem] shadow-[0_0_20px_rgba(57,255,20,0.3)] pointer-events-none"
                                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className="flex items-center justify-center relative translate-y-[1px]">
                                            {info.icon}
                                        </div>
                                        <span className="font-bold text-sm sm:text-base tracking-wide uppercase font-orbitron">{info.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                        
                        <div className={`absolute -top-3 right-8 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(57,255,20,0.4)] z-30 flex items-center gap-1 transition-all duration-300 ${
                            challengeType === 'classic_2phase'
                                ? 'bg-black text-neon-green border border-neon-green/40'
                                : 'bg-neon-green text-black border border-black/10'
                        }`}>
                            <Star className="w-2.5 h-2.5" /> RECOMENDADO
                        </div>
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

                    <div
                        ref={carouselRef}
                        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-6"
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
                                    className={`relative glass-card p-5 border cursor-pointer flex-shrink-0 w-[260px] snap-center transition-all duration-300 ${
                                        isSelected
                                            ? `border-${themeColor}/30 bg-${themeColor}/5 shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${themeColor}/10`
                                            : `border-${themeColor}/10 bg-${themeColor}/[0.01]`
                                    }`}
                                    style={{ 
                                        opacity: isSelected ? 1 : 0.45,
                                        transition: "opacity 0.3s ease, border-color 0.3s ease, background-color 0.3s ease",
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
                                            <Star className="w-2.5 h-2.5 fill-black" /> POPULAR
                                        </div>
                                    )}

                                    {isSelected && (
                                        <motion.div 
                                            className="absolute top-3 right-3 z-30" 
                                            initial={{ scale: 0, rotate: -90 }} 
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            <CheckCircle2 className={`w-5 h-5 text-${challenge.color}`} />
                                        </motion.div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${challenge.gradient} flex items-center justify-center ${challenge.borderColor} border shadow-inner`}>
                                            <Icon className={`w-5 h-5 text-${challenge.color}`} />
                                        </div>
                                        <h3 
                                            className="text-lg font-bold text-text-primary tracking-tight uppercase"
                                            style={{ fontFamily: "var(--font-orbitron)" }}
                                        >
                                            {challenge.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-baseline gap-1.5 mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
                                        <span className={`text-[38px] font-black leading-none text-${challenge.color} tracking-tighter`}>
                                            ${getBasePrice(challenge.price)}
                                        </span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest translate-y-[-4px]">/ reto</span>
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
                                            onOpenAuth("login");
                                        }}
                                    >
                                        ELEGIR {challenge.name}
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
                        className="px-10 py-4 rounded-xl bg-neon-green text-black font-bold text-sm mx-auto hover:bg-neon-green/90 transition-all shadow-lg shadow-neon-green/20 flex items-center gap-3 font-orbitron"
                        onClick={() => onOpenAuth("login")}
                    >
                        IR AL CHECKOUT <ChevronRight className="w-5 h-5" />
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
  return (
    <section id="protocol" className="py-20 px-6 relative">
      <div className="absolute inset-0 bg-white/[0.015] pointer-events-none" />
      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron)" }}>
            EL <span className="text-neon-green">PROTOCOLO</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm">Tres simples pasos para desbloquear tu máximo potencial de trading y fondearte.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-green-500/30 via-cyan-500/30 to-yellow-500/30" />

          {protocolSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-6 relative"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 rotate-45 rounded-xl border-2" style={{ borderColor: `${step.color}60` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <step.Icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                  style={{ backgroundColor: step.color, fontFamily: "var(--font-orbitron)" }}
                >
                  {step.num}
                </div>
              </motion.div>

              <h3 className="text-lg font-black mb-2" style={{ fontFamily: "var(--font-orbitron)", color: step.color }}>
                {step.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-xs mx-auto">
                {step.desc}
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
  return (
    <section id="levels" className="py-20 px-6">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron)" }}>
            SISTEMA DE <span className="text-neon-green">NIVELES</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm">Supera checkpoints. Escala tu cuenta. Desbloquea mayores ganancias.</p>
        </motion.div>

        <div className="space-y-4 relative">
          <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-green-500/40 via-cyan-500/40 via-purple-500/40 to-yellow-500/40 hidden md:block" />

          {levelData.map((cp, i) => (
            <motion.div
              key={cp.level}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-5 p-5 glass-card border border-border-subtle rounded-xl hover:border-white/10 transition-all group"
              whileHover={{ x: 8 }}
            >
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{ backgroundColor: `${cp.color}15`, border: `1px solid ${cp.color}40` }}
                whileHover={{ rotate: 12, scale: 1.1 }}
              >
                <cp.icon className="w-6 h-6" style={{ color: cp.color }} />
              </motion.div>

              <div className="flex-1">
                <p className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {cp.level}
                  <span className="text-text-muted text-[10px] font-normal uppercase tracking-wider">{cp.target}</span>
                </p>
                <p className="text-text-muted text-xs mt-1">{cp.reward}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                  style={{ backgroundColor: `${cp.color}15`, color: cp.color }}>
                  Nivel {i + 1}
                </span>
              </div>
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
export function FinalCTA({ onOpenAuth }: { onOpenAuth: (tab: "login" | "register") => void }) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
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
          EL MERCADO
          <br />
          <span className="text-neon-green">NO ESPERA.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-base mb-10"
        >
          Tú tampoco deberías. Empieza a operar con $10,000 hoy.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => onOpenAuth("register")}
          className="px-10 py-5 rounded-xl bg-neon-green text-black font-bold text-sm"
          style={{ fontFamily: "var(--font-orbitron)", boxShadow: "0 0 20px rgba(0,255,136,0.15)" }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,255,136,0.35)" }}
          whileTap={{ scale: 0.95 }}
        >
          FONDEARSE AHORA <ArrowRight className="w-5 h-5 inline ml-2" />
        </motion.button>
        <p className="mt-5 text-text-muted text-[10px] uppercase tracking-wider">
          Sin experiencia requerida · Cancela cuando quieras · Pagos con cripto
        </p>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER
   ============================================ */
export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border-subtle/30">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FundedSpreadLogo className="w-5 h-5 text-neon-green drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
          <span className="text-base font-bold tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>FUNDED SPREAD</span>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-text-muted uppercase tracking-wider">
          <a href="#" className="hover:text-text-primary transition-colors">Términos</a>
          <a href="#" className="hover:text-text-primary transition-colors">Privacidad</a>
          <a href="#" className="hover:text-text-primary transition-colors">Soporte</a>
          <a href="#" className="hover:text-text-primary transition-colors">Contacto</a>
        </div>
        <p className="text-text-muted text-[10px] uppercase tracking-wider">
          © 2026 Funded Spread. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
