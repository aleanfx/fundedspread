"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Shield,
    Crown,
    Flame,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Bitcoin,
    Wallet,
    Star,
    TrendingUp,
    Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/* ============================================
   CHALLENGE TYPE DEFINITIONS
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

const CHALLENGE_TYPE_INFO: Record<ChallengeType, { labelKey: string; descKey: string; icon: React.ReactNode }> = {
    express_1phase: {
        labelKey: "checkout.types.express.label",
        descKey: "checkout.types.express.desc",
        icon: <ExpressIcon />,
    },
    classic_2phase: {
        labelKey: "checkout.types.classic.label",
        descKey: "checkout.types.classic.desc",
        icon: <ClassicIcon />,
    },
};

/* ============================================
   CHALLENGE TIERS (features depend on type)
   ============================================ */
const FEATURES_CLASSIC: Record<string, string[]> = {
    micro: ["accountOf|$5,000", "phase1_8_phase2_5", "dd4_10", "profitSplit80", "minDays5"],
    starter: ["accountOf|$10,000", "phase1_8_phase2_5", "dd4_10", "profitSplit80", "minDays5"],
    pro: ["accountOf|$25,000", "phase1_8_phase2_5", "dd4_10", "profitSplit80", "minDays5"],
    elite: ["accountOf|$50,000", "phase1_8_phase2_5", "dd4_10", "profitSplit80", "supportPriority"],
    legend: ["accountOf|$100,000", "phase1_8_phase2_5", "dd4_10", "profitSplit80", "supportVIP"],
    apex: ["accountOf|$200,000", "phase1_8_phase2_5", "dd4_10", "profitSplit80", "supportVIPExtra"],
};

const FEATURES_EXPRESS: Record<string, string[]> = {
    micro: ["accountOf|$5,000", "target1Phase_10", "dd3_5", "profitSplit80", "minDays2"],
    starter: ["accountOf|$10,000", "target1Phase_10", "dd3_5", "profitSplit80", "minDays2"],
    pro: ["accountOf|$25,000", "target1Phase_10", "dd3_5", "profitSplit80", "minDays2"],
    elite: ["accountOf|$50,000", "target1Phase_10", "dd3_5", "profitSplit80", "supportPriority"],
    legend: ["accountOf|$100,000", "target1Phase_10", "dd3_5", "profitSplit80", "supportVIP"],
    apex: ["accountOf|$200,000", "target1Phase_10", "dd3_5", "profitSplit80", "supportVIPExtra"],
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
        price: 56,
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
        price: 135,
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
        price: 225,
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
        price: 389,
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
        price: 789,
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
   SAFELIST FOR TAILWIND DYNAMIC CLASSES
   border-zinc-400 bg-zinc-400 border-zinc-400/20 bg-zinc-400/10 text-zinc-400 shadow-zinc-400/40
   border-neon-green bg-neon-green border-neon-green/20 bg-neon-green/10 text-neon-green shadow-neon-green/40
   border-neon-cyan bg-neon-cyan border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan/40
   border-neon-purple bg-neon-purple border-neon-purple/20 bg-neon-purple/10 text-neon-purple shadow-neon-purple/40
   border-yellow-400 bg-yellow-400 border-yellow-400/20 bg-yellow-400/10 text-yellow-400 shadow-yellow-400/40
   border-rose-500 bg-rose-500 border-rose-500/20 bg-rose-500/10 text-rose-500 shadow-rose-500/40
   ============================================ */

/* ============================================
   CHECKOUT PAGE
   ============================================ */
export default function CheckoutPage() {
    const { t } = useLanguage();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [selectedTier, setSelectedTier] = useState<string>(challenges[0].id);
    const [challengeType, setChallengeType] = useState<ChallengeType>("classic_2phase");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"select" | "confirm" | "processing" | "success" | "error">("select");
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Initialize state from URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTier = params.get("tier");
        const urlType = params.get("type");

        if (urlType === "express_1phase" || urlType === "classic_2phase") {
            setChallengeType(urlType);
        }
        if (urlTier && challenges.some(c => c.id === urlTier)) {
            setSelectedTier(urlTier);
        }
    }, []);

    // Add-on states
    const [addons, setAddons] = useState({
        rawSpread: false,
        zeroCommission: false,
        weeklyPayouts: false,
        scalingX2: false,
        split90: false,
        split100: false,
    });

    const handleAddonToggle = (key: keyof typeof addons) => {
        setAddons(prev => {
            if (key === 'split90') return { ...prev, split90: !prev.split90, split100: false };
            if (key === 'split100') return { ...prev, split90: false, split100: !prev.split100 };
            return { ...prev, [key]: !prev[key] };
        });
    };

    // Carousel ref
    const carouselRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // Dynamic features based on challenge type
    const getFeatures = (tierId: string) => {
        if (challengeType === "express_1phase") return FEATURES_EXPRESS[tierId];
        return FEATURES_CLASSIC[tierId];
    };

    const getBasePrice = (tierId: string, defaultPrice: number) => {
        if (challengeType === "express_1phase") {
            const expressPrices: Record<string, number> = {
                micro: 57,
                starter: 98,
                pro: 215,
                elite: 315,
                legend: 549,
                apex: 1089
            };
            return expressPrices[tierId] || defaultPrice;
        }
        return defaultPrice;
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

        const closestChallengeId = challenges[closestIdx]?.id;
        if (closestChallengeId && closestChallengeId !== selectedTier) {
            setSelectedTier(closestChallengeId);
        }
    };

    useEffect(() => {
        const supabaseClient = createClient();
        const getUser = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
            setUser(session?.user ?? null);
        });

        // Check for return status from NOWPayments
        const params = new URLSearchParams(window.location.search);
        if (params.get("status") === "success") {
            setStep("success");
        }

        return () => subscription.unsubscribe();
    }, []);

    const selectedChallenge = challenges.find(c => c.id === selectedTier);

    const handlePurchase = async () => {
        if (!selectedTier) return;

        if (!user) {
            setErrorMsg(t("checkout.messages.loginRequired"));
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
                    addonRawSpread: addons.rawSpread,
                    addonZeroCommission: addons.zeroCommission,
                    addonWeeklyPayouts: addons.weeklyPayouts,
                    addonScalingX2: addons.scalingX2,
                    addonSplit90: addons.split90,
                    addonSplit100: addons.split100,
                }),
            });

            const data = await res.json();

            if (data.success && data.invoice_url) {
                setInvoiceUrl(data.invoice_url);
                // Redirect to NOWPayments
                window.location.href = data.invoice_url;
            } else {
                setErrorMsg(data.error || t("checkout.messages.invoiceError"));
                setStep("error");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(t("checkout.messages.networkError"));
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
                        className="text-3xl sm:text-4xl font-bold text-text-primary mb-3"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                        {t("checkout.title")} <span className="text-neon-green">{t("checkout.titleHighlight")}</span>
                    </h1>
                    <p className="text-text-muted text-xs sm:text-sm max-w-lg mx-auto px-4">
                        {t("checkout.subtitle")}
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
                                <div className="inline-flex p-1 bg-[#0D0D0D]/90 backdrop-blur-xl space-x-1 rounded-[2.5rem] border border-white/5 shadow-2xl relative w-[95%] sm:w-auto mx-auto max-w-[400px] sm:max-w-none">
                                    {(Object.entries(CHALLENGE_TYPE_INFO) as [ChallengeType, typeof CHALLENGE_TYPE_INFO[ChallengeType]][]).map(([type, info]) => {
                                        const isActive = challengeType === type;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => { setChallengeType(type); setSelectedTier(challenges[0].id); scrollToCard(0); }}
                                                className={`relative px-2 py-3 sm:px-10 sm:py-4 rounded-[2rem] transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-3 group outline-none w-1/2 sm:w-auto sm:min-w-[220px] ${isActive ? 'text-black' : 'text-text-muted hover:text-white'}`}
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
                                                <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-3">
                                                    <div className="flex items-center justify-center relative translate-y-[1px] scale-75 sm:scale-100">
                                                        {info.icon}
                                                    </div>
                                                    <span className="font-bold text-[10px] sm:text-base tracking-wide uppercase font-orbitron whitespace-nowrap">{t(info.labelKey)}</span>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Recommended Badge - Dynamic Contrast */}
                                    <div className={`absolute -top-3 right-8 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(57,255,20,0.4)] z-30 flex items-center gap-1 transition-all duration-300 ${challengeType === 'classic_2phase'
                                        ? 'bg-black text-neon-green border border-neon-green/40'
                                        : 'bg-neon-green text-black border border-black/10'
                                        }`}>
                                        <Star className="w-2.5 h-2.5" /> {t("checkout.badges.recommended")}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Tiers Grid -> Carousel */}
                            <motion.div variants={cardVariants} className="mb-12 relative overflow-visible">

                                {/* Left Arrow */}
                                {challenges.findIndex(c => c.id === selectedTier) > 0 && (
                                    <button
                                        onClick={() => {
                                            const currentIdx = challenges.findIndex(c => c.id === selectedTier);
                                            if (currentIdx > 0) {
                                                setSelectedTier(challenges[currentIdx - 1].id);
                                                scrollToCard(currentIdx - 1);
                                            }
                                        }}
                                        className="flex absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 items-center justify-center text-white/70 hover:text-neon-green hover:border-neon-green/40 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all duration-300 hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Right Arrow */}
                                {challenges.findIndex(c => c.id === selectedTier) < challenges.length - 1 && (
                                    <button
                                        onClick={() => {
                                            const currentIdx = challenges.findIndex(c => c.id === selectedTier);
                                            if (currentIdx < challenges.length - 1) {
                                                setSelectedTier(challenges[currentIdx + 1].id);
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
                                    className="flex gap-4 md:gap-5 overflow-x-auto overflow-y-hidden py-8 px-[calc(50vw-120px)] md:px-6 snap-x snap-mandatory"
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
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
                                                className={`relative glass-card p-4 sm:p-5 border cursor-pointer flex-shrink-0 w-[240px] sm:w-[260px] snap-center transition-all duration-150 ${isSelected
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
                                                        <Star className="w-2.5 h-2.5 fill-black" /> {t("checkout.badges.mostPopular")}
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

                                                {/* Price: Integrated Style */}
                                                <div className="flex items-baseline gap-1.5 mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
                                                    <span className={`text-[38px] font-black leading-none text-${challenge.color} tracking-tighter`}>
                                                        ${getBasePrice(challenge.id, challenge.price)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest translate-y-[-4px]">{t("checkout.perChallenge")}</span>
                                                </div>

                                                {/* Features: Readable Font (Rajdhani) with Green Checkmarks */}
                                                <ul className="space-y-3 mb-6 relative z-10" style={{ fontFamily: "var(--font-rajdhani)" }}>
                                                    {getFeatures(challenge.id).map((feature, i) => {
                                                        const isAccountOf = feature.startsWith("accountOf|");
                                                        const translatedFeature = isAccountOf
                                                            ? `${t("checkout.features.accountOf")} ${feature.split("|")[1]}`
                                                            : t(`checkout.features.${feature}`);
                                                        return (
                                                            <li key={i} className="flex items-start gap-2.5 text-[12px] text-text-muted leading-snug font-medium">
                                                                <div className="w-4 h-4 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mt-[1px] flex-shrink-0">
                                                                    <CheckCircle2 className="w-2.5 h-2.5 text-neon-green" />
                                                                </div>
                                                                <span className="group-hover:text-text-secondary transition-colors">{translatedFeature}</span>
                                                            </li>
                                                        );
                                                    })}
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
                                                    {t("checkout.chooseBtn")} {challenge.name}
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {/* Right spacer to prevent last card from being clipped */}
                                    <div className="flex-shrink-0 w-8" aria-hidden="true" />
                                </div>
                                {/* Navigation UI (Dots) */}
                                <div className="flex justify-center mt-4 gap-2">
                                    {challenges.map((c, i) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedTier(c.id); scrollToCard(i); }}
                                            className={`w-2 h-2 rounded-full transition-all duration-150 ${selectedTier === c.id ? 'w-6 bg-neon-green/90 shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'bg-white/10 hover:bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div variants={cardVariants} className="mt-8 text-center px-4 sm:px-0">
                                <motion.button
                                    className={`w-full sm:w-auto px-10 py-4 rounded-xl text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 sm:gap-3 mx-auto transition-all ${selectedTier
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
                                            {t("checkout.continueToPayment")} <ChevronRight className="w-5 h-5" />
                                        </>
                                    ) : (
                                        t("checkout.selectAChallenge")
                                    )}
                                </motion.button>
                            </motion.div>

                            {/* Trust badges */}
                            <motion.div variants={cardVariants} className="mt-6 sm:mt-8 flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-6 text-text-muted text-[9px] sm:text-[10px] uppercase tracking-wider px-2">
                                <span className="flex items-center gap-1.5 whitespace-nowrap"><Shield className="w-3.5 h-3.5" /> {t("checkout.trust.securePayments")}</span>
                                <span className="flex items-center gap-1.5 whitespace-nowrap"><Bitcoin className="w-3.5 h-3.5" /> {t("checkout.trust.cryptoOptions")}</span>
                                <span className="flex items-center gap-1.5 w-full justify-center sm:w-auto mt-1 sm:mt-0 whitespace-nowrap"><TrendingUp className="w-3.5 h-3.5" /> {t("checkout.trust.instantActivation")}</span>
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
                            <div className={`glass-card p-5 sm:p-8 border ${selectedChallenge.borderColor} mx-4 sm:mx-0`}>
                                <h2
                                    className="text-lg sm:text-xl font-bold text-text-primary text-center mb-6"
                                    style={{ fontFamily: "var(--font-orbitron)" }}
                                >
                                    {t("checkout.confirm.title")}
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">{t("checkout.confirm.type")}</span>
                                        <span className="text-neon-green text-sm font-bold flex items-center gap-1.5">
                                            {CHALLENGE_TYPE_INFO[challengeType].icon} {t(CHALLENGE_TYPE_INFO[challengeType].labelKey)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">{t("checkout.confirm.challenge")}</span>
                                        <span className="text-text-primary font-bold" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            {selectedChallenge.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">{t("checkout.confirm.accountSize")}</span>
                                        <span className="text-text-primary font-bold font-mono">
                                            ${selectedChallenge.accountSize.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">{t("checkout.confirm.payment")}</span>
                                        <span className="text-text-primary font-bold flex items-center gap-1.5">
                                            <Wallet className="w-4 h-4 text-yellow-400" /> USDT / Cryptos (todas)
                                        </span>
                                    </div>

                                    {/* ─── POTENCIA TU CUENTA ─── */}
                                    <div className="border-t border-border-subtle pt-5">
                                        <p className="text-[11px] text-text-muted uppercase tracking-[0.2em] font-semibold mb-3" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("checkout.confirm.boostAccount")}</p>

                                        <div className="space-y-1.5">
                                            {/* Raw Spread */}
                                            <label className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 ${addons.rawSpread ? 'bg-neon-green/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">⚡</span>
                                                    <div>
                                                        <span className={`text-[13px] font-semibold block transition-colors ${addons.rawSpread ? 'text-white' : 'text-text-primary/90'}`}>{t("checkout.confirm.addons.rawSpread.title")}</span>
                                                        <span className="text-[11px] text-text-muted/60 block leading-tight mt-0.5">{t("checkout.confirm.addons.rawSpread.desc")}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${addons.rawSpread ? 'text-neon-green bg-neon-green/15' : 'text-text-muted/50 bg-white/5'}`}>+10%</span>
                                                    <input type="checkbox" className="hidden" checked={addons.rawSpread} onChange={() => handleAddonToggle('rawSpread')} />
                                                    <div className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${addons.rawSpread ? 'bg-neon-green shadow-[0_0_12px_rgba(57,255,20,0.3)]' : 'bg-white/10'}`}>
                                                        <div className={`w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${addons.rawSpread ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white/40'}`} />
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Zero Commission */}
                                            <label className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 ${addons.zeroCommission ? 'bg-neon-green/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">💎</span>
                                                    <div>
                                                        <span className={`text-[13px] font-semibold block transition-colors ${addons.zeroCommission ? 'text-white' : 'text-text-primary/90'}`}>{t("checkout.confirm.addons.zeroCommission.title")}</span>
                                                        <span className="text-[11px] text-text-muted/60 block leading-tight mt-0.5">{t("checkout.confirm.addons.zeroCommission.desc")}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${addons.zeroCommission ? 'text-neon-green bg-neon-green/15' : 'text-text-muted/50 bg-white/5'}`}>+10%</span>
                                                    <input type="checkbox" className="hidden" checked={addons.zeroCommission} onChange={() => handleAddonToggle('zeroCommission')} />
                                                    <div className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${addons.zeroCommission ? 'bg-neon-green shadow-[0_0_12px_rgba(57,255,20,0.3)]' : 'bg-white/10'}`}>
                                                        <div className={`w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${addons.zeroCommission ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white/40'}`} />
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Weekly Payouts */}
                                            <label className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 ${addons.weeklyPayouts ? 'bg-neon-green/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">🚀</span>
                                                    <div>
                                                        <span className={`text-[13px] font-semibold block transition-colors ${addons.weeklyPayouts ? 'text-white' : 'text-text-primary/90'}`}>{t("checkout.confirm.addons.weeklyPayouts.title")}</span>
                                                        <span className="text-[11px] text-text-muted/60 block leading-tight mt-0.5">{t("checkout.confirm.addons.weeklyPayouts.desc")}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${addons.weeklyPayouts ? 'text-neon-green bg-neon-green/15' : 'text-text-muted/50 bg-white/5'}`}>+15%</span>
                                                    <input type="checkbox" className="hidden" checked={addons.weeklyPayouts} onChange={() => handleAddonToggle('weeklyPayouts')} />
                                                    <div className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${addons.weeklyPayouts ? 'bg-neon-green shadow-[0_0_12px_rgba(57,255,20,0.3)]' : 'bg-white/10'}`}>
                                                        <div className={`w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${addons.weeklyPayouts ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white/40'}`} />
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Scaling X2 */}
                                            <label className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 ${addons.scalingX2 ? 'bg-yellow-400/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">🔥</span>
                                                    <div>
                                                        <span className={`text-[13px] font-semibold block transition-colors ${addons.scalingX2 ? 'text-white' : 'text-text-primary/90'}`}>{t("checkout.confirm.addons.scalingX2.title")}</span>
                                                        <span className="text-[11px] text-text-muted/60 block leading-tight mt-0.5">{t("checkout.confirm.addons.scalingX2.desc")}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${addons.scalingX2 ? 'text-yellow-400 bg-yellow-400/15' : 'text-text-muted/50 bg-white/5'}`}>+25%</span>
                                                    <input type="checkbox" className="hidden" checked={addons.scalingX2} onChange={() => handleAddonToggle('scalingX2')} />
                                                    <div className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${addons.scalingX2 ? 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.3)]' : 'bg-white/10'}`}>
                                                        <div className={`w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${addons.scalingX2 ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white/40'}`} />
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* ─── PROFIT SPLIT ─── */}
                                    <div className="border-t border-border-subtle pt-5">
                                        <p className="text-[11px] text-text-muted uppercase tracking-[0.2em] font-semibold mb-3" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("checkout.confirm.profitSplit.title")}</p>

                                        <div className="grid grid-cols-3 gap-2">
                                            {/* 80% */}
                                            <div
                                                onClick={() => setAddons(prev => ({ ...prev, split90: false, split100: false }))}
                                                className={`relative cursor-pointer rounded-xl p-3 text-center transition-all duration-300 border ${!addons.split90 && !addons.split100 ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06]'}`}
                                            >
                                                <div className={`text-2xl sm:text-3xl font-black font-orbitron transition-colors leading-none ${!addons.split90 && !addons.split100 ? 'text-white' : 'text-text-muted/40'}`}>80<span className="text-base sm:text-lg">%</span></div>
                                                <div className={`text-[9px] uppercase tracking-widest font-bold mt-1.5 transition-colors ${!addons.split90 && !addons.split100 ? 'text-white/70' : 'text-text-muted/30'}`}>{t("checkout.confirm.profitSplit.base")}</div>
                                                <div className={`text-[10px] mt-2 font-semibold px-2 py-0.5 rounded-full inline-block transition-colors ${!addons.split90 && !addons.split100 ? 'bg-white/20 text-white' : 'bg-white/5 text-text-muted/40'}`}>{t("checkout.confirm.profitSplit.included")}</div>
                                            </div>

                                            {/* 85% */}
                                            <div
                                                onClick={() => handleAddonToggle('split90')}
                                                className={`relative cursor-pointer rounded-xl p-3 text-center transition-all duration-300 border ${addons.split90 ? 'bg-neon-green/10 border-neon-green/50 shadow-[0_0_20px_rgba(57,255,20,0.15)]' : 'bg-white/[0.03] border-white/[0.06] hover:border-neon-green/20 hover:bg-white/[0.06]'}`}
                                            >
                                                <div className={`text-2xl sm:text-3xl font-black font-orbitron transition-colors leading-none ${addons.split90 ? 'text-neon-green' : 'text-text-muted/40'}`}>85<span className="text-base sm:text-lg">%</span></div>
                                                <div className={`text-[9px] uppercase tracking-widest font-bold mt-1.5 transition-colors ${addons.split90 ? 'text-neon-green/70' : 'text-text-muted/30'}`}>{t("checkout.confirm.profitSplit.premium")}</div>
                                                <div className={`text-[10px] mt-2 font-semibold px-2 py-0.5 rounded-full inline-block transition-colors ${addons.split90 ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-text-muted/40'}`}>+10%</div>
                                            </div>

                                            {/* 90% */}
                                            <div
                                                onClick={() => handleAddonToggle('split100')}
                                                className={`relative cursor-pointer rounded-xl p-3 text-center transition-all duration-300 border ${addons.split100 ? 'bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : 'bg-white/[0.03] border-white/[0.06] hover:border-yellow-400/20 hover:bg-white/[0.06]'} group`}
                                            >
                                                {/* Popular badge */}
                                                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap transition-all ${addons.split100 ? 'bg-yellow-400 text-black shadow-[0_2px_10px_rgba(250,204,21,0.4)]' : 'bg-white/10 text-text-muted/50'}`}>
                                                    {t("checkout.confirm.profitSplit.elite")}
                                                </div>
                                                <div className={`text-2xl sm:text-3xl font-black font-orbitron transition-colors leading-none ${addons.split100 ? 'text-yellow-400' : 'text-text-muted/40 group-hover:text-yellow-400/50'}`}>90<span className="text-base sm:text-lg">%</span></div>
                                                <div className={`text-[9px] uppercase tracking-widest font-bold mt-1.5 transition-colors ${addons.split100 ? 'text-yellow-400/70' : 'text-text-muted/30'}`}>{t("checkout.confirm.profitSplit.max")}</div>
                                                <div className={`text-[10px] mt-2 font-semibold px-2 py-0.5 rounded-full inline-block transition-colors ${addons.split100 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-text-muted/40'}`}>+20%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border-subtle pt-4 flex justify-between items-center px-1 mt-4">
                                        <span className="text-text-muted font-bold text-[10px] sm:text-xs uppercase tracking-widest font-rajdhani">{t("checkout.confirm.total")}</span>
                                        <span
                                            className={`text-2xl sm:text-3xl font-black text-neon-green shadow-neon-green/20 drop-shadow-sm`}
                                            style={{ fontFamily: "var(--font-orbitron)" }}
                                        >
                                            ${(getBasePrice(selectedChallenge.id, selectedChallenge.price) * (1 + (addons.rawSpread ? 0.10 : 0) + (addons.zeroCommission ? 0.10 : 0) + (addons.weeklyPayouts ? 0.15 : 0) + (addons.scalingX2 ? 0.25 : 0) + (addons.split90 ? 0.10 : 0) + (addons.split100 ? 0.20 : 0))).toFixed(2)}
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
                                    <Bitcoin className="w-5 h-5" /> {t("checkout.confirm.payWithCrypto")}
                                </motion.button>

                                <button
                                    className="w-full mt-3 py-3 text-text-muted text-xs hover:text-text-primary transition-colors"
                                    onClick={() => {
                                        setStep("select");
                                        setAddons({ rawSpread: false, zeroCommission: false, weeklyPayouts: false, scalingX2: false, split90: false, split100: false });
                                    }}
                                >
                                    {t("checkout.confirm.goBack")}
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
                                {t("checkout.processing.title")}
                            </h2>
                            <p className="text-text-muted text-sm">{t("checkout.processing.desc")}</p>
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
                                {t("checkout.success.title")}
                            </h2>
                            <p className="text-text-muted text-sm mb-8 max-w-md mx-auto">
                                {t("checkout.success.desc")}
                            </p>
                            <motion.button
                                className="px-8 py-3 rounded-xl bg-neon-green text-black font-bold text-sm"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                                onClick={() => window.location.href = "/dashboard"}
                                whileHover={{ scale: 1.05 }}
                            >
                                {t("checkout.success.goToDashboard")}
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
                                {t("checkout.error.title")}
                            </h2>
                            <p className="text-text-muted text-sm mb-6">{errorMsg}</p>
                            <button
                                className="px-8 py-3 rounded-xl bg-white/10 text-text-primary font-bold text-sm border border-border-subtle hover:bg-white/20 transition-all"
                                onClick={() => {
                                    setStep("select");
                                    setErrorMsg("");
                                    setAddons({ rawSpread: false, zeroCommission: false, weeklyPayouts: false, scalingX2: false, split90: false, split100: false });
                                }}
                            >
                                {t("checkout.error.tryAgain")}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
