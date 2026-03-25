"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Shield,
    Crown,
    Flame,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Bitcoin,
    Wallet,
    Star,
    TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/* ============================================
   CHALLENGE TYPE DEFINITIONS
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
    express_1phase: {
        label: "Express 1 Fase",
        description: "Target 10% → Cuenta Fondeada",
        icon: <ExpressIcon />,
    },
    classic_2phase: {
        label: "Clásico 2 Fases",
        description: "Fase 1 (+8%) → Fase 2 (+5%) → Cuenta Fondeada",
        icon: <ClassicIcon />,
    },
};

/* ============================================
   CHALLENGE TIERS (features depend on type)
   ============================================ */
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

// Tailwind Safelist for dynamic classes used in the challenges array:
// bg-zinc-500/15 bg-green-500/15 bg-cyan-500/15 bg-purple-500/15 bg-yellow-500/15 bg-rose-500/15
// border-zinc-500/60 border-green-500/60 border-cyan-500/60 border-purple-500/60 border-yellow-500/60 border-rose-500/60
// bg-zinc-500 bg-green-500 bg-cyan-500 bg-purple-500 bg-yellow-500 bg-rose-500
// shadow-zinc-500/50 shadow-green-500/50 shadow-cyan-500/50 shadow-purple-500/50 shadow-yellow-500/50 shadow-rose-500/50
// shadow-zinc-500/70 shadow-green-500/70 shadow-cyan-500/70 shadow-purple-500/70 shadow-yellow-500/70 shadow-rose-500/70
// shadow-zinc-500/60 shadow-green-500/60 shadow-cyan-500/60 shadow-purple-500/60 shadow-yellow-500/60 shadow-rose-500/60
// border-zinc-500/30 border-green-500/30 border-cyan-500/30 border-purple-500/30 border-yellow-500/30 border-rose-500/30
// border-zinc-500/10 border-green-500/10 border-cyan-500/10 border-purple-500/10 border-yellow-500/10 border-rose-500/10
// bg-zinc-500/5 bg-green-500/5 bg-cyan-500/5 bg-purple-500/5 bg-yellow-500/5 bg-rose-500/5
// bg-zinc-500/[0.01] bg-green-500/[0.01] bg-cyan-500/[0.01] bg-purple-500/[0.01] bg-yellow-500/[0.01] bg-rose-500/[0.01]
// text-zinc-400 text-neon-green text-neon-cyan text-neon-purple text-yellow-400 text-rose-500

type Challenge = {
    id: string;
    name: string;
    price: number;
    accountSize: number;
    icon: any; // React.ComponentType<any>;
    color: string;
    gradient: string;
    borderColor: string;
    glowColor: string;
    popular: boolean;
};

const challenges: Challenge[] = [
    {
        id: "micro",
        name: "MICRO",
        price: 35,
        accountSize: 5000,
        icon: TrendingUp,
        color: "zinc-400",
        gradient: "from-zinc-500/20 to-zinc-900/20",
        borderColor: "border-zinc-500/40",
        glowColor: "shadow-zinc-500/20",
        popular: false
    },
    {
        id: "starter",
        name: "STARTER",
        price: 49,
        accountSize: 10000,
        icon: Zap,
        color: "neon-green",
        gradient: "from-green-500/20 to-green-900/20",
        borderColor: "border-green-500/40",
        glowColor: "shadow-green-500/20",
        popular: false
    },
    {
        id: "pro",
        name: "PRO",
        price: 99,
        accountSize: 25000,
        icon: Shield,
        color: "neon-cyan",
        gradient: "from-cyan-500/20 to-cyan-900/20",
        borderColor: "border-cyan-500/40",
        glowColor: "shadow-cyan-500/20",
        popular: true,
    },
    {
        id: "elite",
        name: "ELITE",
        price: 199,
        accountSize: 50000,
        icon: Crown,
        color: "neon-purple",
        gradient: "from-purple-500/20 to-purple-900/20",
        borderColor: "border-purple-500/40",
        glowColor: "shadow-purple-500/20",
        popular: false
    },
    {
        id: "legend",
        name: "LEGEND",
        price: 499,
        accountSize: 100000,
        icon: Flame,
        color: "yellow-400",
        gradient: "from-yellow-500/20 to-yellow-900/20",
        borderColor: "border-yellow-500/40",
        glowColor: "shadow-yellow-500/20",
        popular: false
    },
    {
        id: "apex",
        name: "APEX",
        price: 999,
        accountSize: 200000,
        icon: Star,
        color: "rose-500",
        gradient: "from-rose-500/20 to-rose-900/20",
        borderColor: "border-rose-500/40",
        glowColor: "shadow-rose-500/20",
        popular: false
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

/* ============================================
   CHECKOUT PAGE
   ============================================ */
export default function CheckoutPage() {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [selectedTier, setSelectedTier] = useState<string | null>(challenges[0].id);
    const [challengeType, setChallengeType] = useState<ChallengeType>("classic_2phase");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"select" | "confirm" | "processing" | "success" | "error">("select");
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Add-on states
    const [hasRawSpread, setHasRawSpread] = useState(false);
    const [hasZeroCommission, setHasZeroCommission] = useState(false);
    const [hasWeeklyPayouts, setHasWeeklyPayouts] = useState(false);
    const [hasScalingX2, setHasScalingX2] = useState(false); // BOOST

    // Carousel ref
    const carouselRef = useRef<HTMLDivElement>(null);

    // Dynamic features based on challenge type
    const getFeatures = (tierId: string) => {
        if (challengeType === "express_1phase") return FEATURES_EXPRESS[tierId];
        return FEATURES_CLASSIC[tierId];
    };

    const getBasePrice = (price: number) => {
        return challengeType === "express_1phase" ? Math.round(price * 1.2) : price;
    };

    // Auto-select on scroll
    useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;

        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                const scrollLeft = container.scrollLeft;
                const cardWidth = 260 + 20; // 260px w + 20px gap

                // Determine index
                let index = Math.round(scrollLeft / cardWidth);
                if (index < 0) index = 0;
                if (index >= challenges.length) index = challenges.length - 1;

                if (selectedTier !== challenges[index].id) {
                    setSelectedTier(challenges[index].id);
                }
            }, 50); // debounce 50ms
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [selectedTier]);

    const scrollToCard = (index: number) => {
        if (carouselRef.current) {
            const cardWidth = 260 + 20; // width + gap
            carouselRef.current.scrollTo({
                left: index * cardWidth,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Check for return status from NOWPayments
        const params = new URLSearchParams(window.location.search);
        if (params.get("status") === "success") {
            setStep("success");
        }
    }, [supabase.auth]);

    const selectedChallenge = challenges.find(c => c.id === selectedTier);

    const handlePurchase = async () => {
        if (!selectedTier) return;

        if (!user) {
            setErrorMsg("Debes iniciar sesión o registrarte para comprar un reto.");
            setStep("error");
            return;
        }

        setLoading(true);
        setStep("processing");

        try {
            const res = await fetch("/api/payments/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    challengeTier: selectedTier,
                    challengeType,
                    userId: user.id,
                    userEmail: user.email,
                    hasRawSpread,
                    hasZeroCommission,
                    hasWeeklyPayouts,
                    hasScalingX2, // Passed to backend
                }),
            });

            const data = await res.json();

            if (data.success && data.invoice_url) {
                setInvoiceUrl(data.invoice_url);
                // Redirect to NOWPayments
                window.location.href = data.invoice_url;
            } else {
                setErrorMsg(data.error || "Error al crear la factura");
                setStep("error");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Error de red. Por favor, inténtalo de nuevo.");
            setStep("error");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-bg-primary p-6">
            <motion.div
                className="max-w-[1100px] mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={cardVariants} className="text-center mb-10">

                    <h1
                        className="text-4xl font-bold text-text-primary mb-3"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                        ELIGE TU <span className="text-neon-green">RETO</span>
                    </h1>
                    <p className="text-text-muted text-sm max-w-lg mx-auto">
                        Selecciona tu tipo de reto y tamaño de cuenta. Paga con cripto e inicia tu camino.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Select Challenge */}
                    {step === "select" && (
                        <motion.div
                            key="select"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* ===== CHALLENGE TYPE SELECTOR (PREMIUM, iOS STYLE) ===== */}
                            <motion.div variants={cardVariants} className="mb-14 flex justify-center relative z-20 mt-4">
                                <div className="inline-flex p-1.5 bg-[#0D0D0D]/90 backdrop-blur-xl space-x-1 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                                    {(Object.entries(CHALLENGE_TYPE_INFO) as [ChallengeType, typeof CHALLENGE_TYPE_INFO[ChallengeType]][]).map(([type, info]) => {
                                        const isActive = challengeType === type;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => { setChallengeType(type); setSelectedTier(challenges[0].id); scrollToCard(0); }}
                                                className={`relative px-6 py-3.5 sm:px-10 sm:py-4 rounded-[2rem] transition-colors duration-300 flex items-center justify-center gap-3 group outline-none min-w-[180px] sm:min-w-[220px] ${isActive ? 'text-black' : 'text-text-muted hover:text-white'}`}
                                            >
                                                {/* Sliding Neon Block (iOS Switch Style) */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeChallengeType"
                                                        className="absolute inset-0 bg-neon-green rounded-[2rem] shadow-[0_0_20px_rgba(57,255,20,0.3)] pointer-events-none"
                                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                                    />
                                                )}

                                                {/* Button Content */}
                                                <div className="relative z-10 flex items-center gap-3">
                                                <div className="flex items-center justify-center relative translate-y-[1px]">
                                                    {info.icon}
                                                </div>
                                                    <span className="font-bold text-sm sm:text-base tracking-wide uppercase font-orbitron">{info.label}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    
                                    {/* Recommended Badge - Dynamic Contrast */}
                                    <div className={`absolute -top-3 right-8 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(57,255,20,0.4)] z-30 flex items-center gap-1 transition-all duration-300 ${
                                        challengeType === 'classic_2phase'
                                            ? 'bg-black text-neon-green border border-neon-green/40'
                                            : 'bg-neon-green text-black border border-black/10'
                                    }`}>
                                        <Star className="w-2.5 h-2.5" /> RECOMENDADO
                                    </div>
                                </div>
                            </motion.div>

                            {/* Tiers Grid -> Carousel */}
                            <motion.div variants={cardVariants} className="mb-12 relative">
                                
                                {/* Fade edges */}
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
                                    {challenges.map((challenge, idx) => {
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
                                                        layoutId="targetLockHUD"
                                                        className="absolute -inset-[3px] z-20 pointer-events-none rounded-[24px]"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 450, damping: 35, mass: 0.8 }}
                                                    >
                                                        {/* Ambient Aura: radial gradient for SOFT diffused edges */}
                                                        <div 
                                                            className={`absolute -inset-6 rounded-[3rem] pointer-events-none`}
                                                            style={{
                                                                background: `radial-gradient(ellipse at center, var(--tw-shadow-color, rgba(255,255,255,0.1)) 0%, transparent 70%)`,
                                                                opacity: 0.25,
                                                                filter: 'blur(20px)',
                                                            }}
                                                        />

                                                        {/* Main sleek contour border: continuous 1px line */}
                                                        <div className={`absolute inset-[2px] rounded-[20px] border border-${themeColor}/60 shadow-[0_0_15px_rgba(255,255,255,0.05)]`} />
                                                        
                                                        {/* Outer glass rim to give it physical depth */}
                                                        <div className="absolute inset-0 rounded-[24px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent" />

                                                        {/* Tech Clamping Nodes (Left and Right edges) */}
                                                        <div className={`absolute top-1/2 -translate-y-1/2 -left-[1px] w-[2px] h-12 bg-${themeColor} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${themeColor}/50`} />
                                                        <div className={`absolute top-1/2 -translate-y-1/2 -right-[1px] w-[2px] h-12 bg-${themeColor} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${themeColor}/50`} />

                                                        {/* Bottom Center Extractor Bar */}
                                                        <div className={`absolute left-1/2 -bottom-[1px] -translate-x-1/2 w-20 h-[2px] bg-${themeColor} shadow-[0_0_12px_var(--tw-shadow-color)] shadow-${themeColor}/70 flex justify-center`} >
                                                            {/* Micro Pulse */}
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90 animate-pulse -mt-[2px]" />
                                                        </div>

                                                        {/* Top Center Diamond Lock */}
                                                        <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 flex items-center justify-center">
                                                            <div className={`w-2 h-2 rotate-45 border border-black bg-${themeColor} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${themeColor}/60`} />
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Popular badge */}
                                                {challenge.popular && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-neon-cyan text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(0,255,255,0.4)] z-30 border border-white/20">
                                                        <Star className="w-2.5 h-2.5 fill-black" /> MÁS POPULAR
                                                    </div>
                                                )}

                                                {/* Selected check */}
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

                                                {/* Header within Card: Icon + Name */}
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

                                                {/* Price: Integrated Style */}
                                                <div className="flex items-baseline gap-1.5 mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
                                                    <span className={`text-[38px] font-black leading-none text-${challenge.color} tracking-tighter`}>
                                                        ${getBasePrice(challenge.price)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest translate-y-[-4px]">/ reto</span>
                                                </div>

                                                {/* Features: Readable Font (Rajdhani) with Green Checkmarks */}
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

                                                {/* Subtle Button (Mock-up style from screen) */}
                                                <button 
                                                    className={`w-full py-2.5 rounded-lg border border-${challenge.color}/20 bg-${challenge.color}/5 text-${challenge.color} text-[10px] font-bold uppercase tracking-widest hover:bg-${challenge.color}/10 transition-all`}
                                                    style={{ fontFamily: "var(--font-orbitron)" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTier(challenge.id);
                                                        setStep("confirm");
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
                                    {challenges.map((c, i) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedTier(c.id); scrollToCard(i); }}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedTier === c.id ? 'w-6 bg-neon-green' : 'bg-white/10 hover:bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div variants={cardVariants} className="mt-8 text-center">
                                <motion.button
                                    className={`px-10 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 mx-auto transition-all ${selectedTier
                                        ? "bg-neon-green text-black hover:bg-neon-green/90 shadow-lg shadow-neon-green/20"
                                        : "bg-white/10 text-text-muted cursor-not-allowed"
                                        }`}
                                    style={{ fontFamily: "var(--font-orbitron)" }}
                                    onClick={() => selectedTier && setStep("confirm")}
                                    disabled={!selectedTier}
                                    whileHover={selectedTier ? { scale: 1.03 } : {}}
                                    whileTap={selectedTier ? { scale: 0.97 } : {}}
                                >
                                    {selectedTier ? (
                                        <>
                                            CONTINUAR AL PAGO <ChevronRight className="w-5 h-5" />
                                        </>
                                    ) : (
                                        "SELECCIONA UN RETO"
                                    )}
                                </motion.button>
                            </motion.div>

                            {/* Trust badges */}
                            <motion.div variants={cardVariants} className="mt-8 flex items-center justify-center gap-6 text-text-muted text-[10px] uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Pagos Seguros</span>
                                <span className="flex items-center gap-1.5"><Bitcoin className="w-3.5 h-3.5" /> BTC y USDT Aceptados</span>
                                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Activación Inmediata</span>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* STEP 2: Confirm */}
                    {step === "confirm" && selectedChallenge && (
                        <motion.div
                            key="confirm"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="max-w-md mx-auto"
                        >
                            <div className={`glass-card p-8 border ${selectedChallenge.borderColor}`}>
                                <h2
                                    className="text-xl font-bold text-text-primary text-center mb-6"
                                    style={{ fontFamily: "var(--font-orbitron)" }}
                                >
                                    CONFIRMAR TU PEDIDO
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Tipo:</span>
                                        <span className="text-neon-green text-sm font-bold flex items-center gap-1.5">
                                            {CHALLENGE_TYPE_INFO[challengeType].icon} {CHALLENGE_TYPE_INFO[challengeType].label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Reto:</span>
                                        <span className="text-text-primary font-bold" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            {selectedChallenge.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Tamaño de Cuenta:</span>
                                        <span className="text-text-primary font-bold font-mono">
                                            ${selectedChallenge.accountSize.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Pago:</span>
                                        <span className="text-text-primary font-bold flex items-center gap-1.5">
                                            <Wallet className="w-4 h-4 text-yellow-400" /> Crypto (USDT / BTC)
                                        </span>
                                    </div>

                                    {/* Add-ons Section */}
                                    <div className="border-t border-border-subtle pt-4 space-y-3">
                                        <p className="text-xs text-text-muted uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-rajdhani)" }}>Mejora tu Cuenta (Add-ons)</p>
                                        <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white/5 transition border border-transparent hover:border-white/10">
                                            <span className="text-sm text-text-primary">Raw Spreads (0.0 pips) <span className="text-xs text-neon-green ml-1">+10%</span></span>
                                            <input type="checkbox" checked={hasRawSpread} onChange={(e) => setHasRawSpread(e.target.checked)} className="accent-neon-green w-4 h-4" />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white/5 transition border border-transparent hover:border-white/10 group">
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm text-text-primary group-hover:text-neon-cyan transition-colors font-semibold">Premium Scaling x2 Boost <span className="text-xs text-neon-cyan ml-1">+20%</span></span>
                                                <span className="text-[10px] text-text-muted leading-tight">Capacidad de escalar x2 tu capital al fondeado</span>
                                            </div>
                                            <input type="checkbox" checked={hasScalingX2} onChange={(e) => setHasScalingX2(e.target.checked)} className="accent-neon-cyan w-4 h-4 shadow-[0_0_10px_rgba(0,255,255,0.2)]" />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white/5 transition border border-transparent hover:border-white/10 group">
                                            <span className="text-sm text-text-primary group-hover:text-neon-green transition-colors">Retiros cada 7 días <span className="text-xs text-neon-green ml-1">+20%</span></span>
                                            <input type="checkbox" checked={hasWeeklyPayouts} onChange={(e) => setHasWeeklyPayouts(e.target.checked)} className="accent-neon-green w-4 h-4" />
                                        </label>
                                    </div>

                                    <div className="border-t border-border-subtle pt-4 flex justify-between items-center px-1">
                                        <span className="text-text-muted font-bold text-xs uppercase tracking-widest font-rajdhani">Total a Pagar:</span>
                                        <span
                                            className={`text-3xl font-black text-neon-green shadow-neon-green/20 drop-shadow-sm`}
                                            style={{ fontFamily: "var(--font-orbitron)" }}
                                        >
                                            ${(getBasePrice(selectedChallenge.price) * (1 + (hasRawSpread ? 0.1 : 0) + (hasZeroCommission ? 0.15 : 0) + (hasWeeklyPayouts ? 0.2 : 0) + (hasScalingX2 ? 0.2 : 0))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <motion.button
                                    className="w-full py-4 rounded-xl bg-neon-green text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neon-green/90 transition-all shadow-lg shadow-neon-green/20"
                                    style={{ fontFamily: "var(--font-orbitron)" }}
                                    onClick={handlePurchase}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                >
                                    <Bitcoin className="w-5 h-5" /> PAGAR CON CRIPTO
                                </motion.button>

                                <button
                                    className="w-full mt-3 py-3 text-text-muted text-xs hover:text-text-primary transition-colors"
                                    onClick={() => {
                                        setStep("select");
                                        setHasRawSpread(false);
                                        setHasZeroCommission(false);
                                        setHasWeeklyPayouts(false);
                                        setHasScalingX2(false);
                                    }}
                                >
                                    ← Volver atrás
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Processing */}
                    {step === "processing" && (
                        <motion.div
                            key="processing"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-center py-20"
                        >
                            <Loader2 className="w-12 h-12 text-neon-green mx-auto animate-spin mb-6" />
                            <h2
                                className="text-xl font-bold text-text-primary mb-2"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                CREANDO TU FACTURA...
                            </h2>
                            <p className="text-text-muted text-sm">Conectando con la pasarela de pagos. Serás redirigido en breve.</p>
                        </motion.div>
                    )}

                    {/* STEP 4: Success */}
                    {step === "success" && (
                        <motion.div
                            key="success"
                            variants={successVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <CheckCircle2 className="w-20 h-20 text-neon-green mx-auto mb-6" />
                            </motion.div>
                            <h2
                                className="text-2xl font-bold text-neon-green mb-3"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                ¡PAGO RECIBIDO!
                            </h2>
                            <p className="text-text-muted text-sm mb-8 max-w-md mx-auto">
                                Tu reto está siendo activado. Lo verás en tu Panel en unos minutos.
                            </p>
                            <motion.button
                                className="px-8 py-3 rounded-xl bg-neon-green text-black font-bold text-sm"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                                onClick={() => window.location.href = "/dashboard"}
                                whileHover={{ scale: 1.05 }}
                            >
                                IR AL PANEL
                            </motion.button>
                        </motion.div>
                    )}

                    {/* STEP 5: Error */}
                    {step === "error" && (
                        <motion.div
                            key="error"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                                <span className="text-3xl">⚠</span>
                            </div>
                            <h2
                                className="text-xl font-bold text-red-400 mb-3"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                ERROR DE PAGO
                            </h2>
                            <p className="text-text-muted text-sm mb-6">{errorMsg}</p>
                            <button
                                className="px-8 py-3 rounded-xl bg-white/10 text-text-primary font-bold text-sm border border-border-subtle hover:bg-white/20 transition-all"
                                onClick={() => {
                                    setStep("select");
                                    setErrorMsg("");
                                    setHasRawSpread(false);
                                    setHasZeroCommission(false);
                                    setHasWeeklyPayouts(false);
                                }}
                            >
                                Intentar de Nuevo
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
