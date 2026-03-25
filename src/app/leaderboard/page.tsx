"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Share2,
    ChevronUp,
    Trophy,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ============================================
   TYPES
   ============================================ */
interface Trader {
    id: string;
    username: string;
    checkpoint_level: number;
    total_profit: number;
    win_rate: number;
    risk_reward: number;
    account_size: number;
    trades_count: number;
    rank_title: string;
}

// Translation map for rank titles from database
const rankTranslations: Record<string, string> = {
    "Beginner": "Principiante",
    "Novice": "Novato",
    "Expert": "Experto",
    "Master": "Maestro",
    "Grandmaster": "Gran Maestro",
    "Legend": "Leyenda",
    "Champion": "Campeón",
    "Elite": "Élite",
    "Pro": "Pro",
};
const translateRank = (title: string) => rankTranslations[title] || title;

// Country symbols for flags (ISO 3166-1 alpha-2, lowercase)
const traderFlags: Record<string, string> = {
    "CryptoPhantom": "ar",
    "NeonSniper": "mx",
    "ShadowTraderX": "co",
    "ToxicPips": "br",
    "ZenScalper": "cl",
    "VoidRunner": "pe",
    "ByteTrader": "ec",
    "PixelPips": "do",
    "GlitchFX": "uy",
};

/* ============================================
   VERIFIED BADGE (same pattern as profile)
   ============================================ */
const VerifiedBadge = ({ className = "w-5 h-5", checkColor = "#000000", badgeColor = "var(--neon-green)" }: { className?: string; checkColor?: string; badgeColor?: string }) => (
    <div title="Usuario KYC Verificado" className="inline-flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} overflow-visible`}>
        <path 
            d="M12 2L14.8 4.6L18.5 4.3L19.5 7.8L22.6 9.8L21.1 13.2L22.6 16.6L19.5 18.6L18.5 22.1L14.8 21.8L12 24.4L9.2 21.8L5.5 22.1L4.5 18.6L1.4 16.6L2.9 13.2L1.4 9.8L4.5 7.8L5.5 4.3L9.2 4.6L12 2Z" 
            fill={badgeColor}
        />
        <path 
            d="M7.5 13.5L10.5 16.5L16.5 9.5" 
            stroke={checkColor} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
    </div>
);

/* ============================================
   ANIMATION VARIANTS
   ============================================ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ============================================
   PODIUM COMPONENT
   ============================================ */
function PodiumCard({
    trader,
    position,
}: {
    trader: Trader;
    position: 1 | 2 | 3;
}) {
    const config = {
        1: {
            border: "border-yellow-400/50",
            glow: "shadow-[0_0_40px_rgba(250,204,21,0.2)]",
            bgIcon: "bg-yellow-400/20",
            iconColor: "text-yellow-400",
            label: "LEYENDA",
            labelColor: "text-yellow-400",
            width: "w-[220px]",
            zIndex: "z-20",
        },
        2: {
            border: "border-slate-400/40",
            glow: "shadow-[0_0_25px_rgba(148,163,184,0.15)]",
            bgIcon: "bg-slate-400/20",
            iconColor: "text-slate-300",
            label: "GRAN MAESTRO",
            labelColor: "text-slate-300",
            width: "w-[200px]",
            zIndex: "z-10",
        },
        3: {
            border: "border-amber-600/40",
            glow: "shadow-[0_0_25px_rgba(217,119,6,0.15)]",
            bgIcon: "bg-amber-600/20",
            iconColor: "text-amber-500",
            label: "MAESTRO",
            labelColor: "text-amber-500",
            width: "w-[200px]",
            zIndex: "z-10",
        },
    };

    const c = config[position];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: position === 1 ? 0.2 : position === 2 ? 0.4 : 0.6 }}
            className={`${c.width} ${c.zIndex} glass-card p-5 border ${c.border} ${c.glow} text-center ${position === 1 ? "lg:-translate-y-4" : ""
                }`}
            whileHover={{ y: position === 1 ? -12 : -8, transition: { duration: 0.3 } }}
        >
            {/* Rank Badge */}
            <div className="flex justify-center mb-3">
                <div
                    className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${c.bgIcon} ${c.labelColor} border border-current/20`}
                    style={{ fontFamily: "var(--font-orbitron)" }}
                >
                    TOP #{position}
                </div>
            </div>

            {/* Avatar */}
            <div className="relative mx-auto mb-3 w-16 h-16">
                <div
                    className={`w-16 h-16 rounded-full ${c.bgIcon} border-2 ${c.border} flex items-center justify-center overflow-hidden`}
                >
                    {/* Podium avatars */}
                    {({
                        "CryptoPhantom": "https://randomuser.me/api/portraits/men/32.jpg",
                        "NeonSniper": "https://randomuser.me/api/portraits/men/75.jpg",
                        "ShadowTraderX": "https://randomuser.me/api/portraits/women/44.jpg",
                    } as Record<string, string>)[trader.username] ? (
                        <img
                            src={({
                                "CryptoPhantom": "https://randomuser.me/api/portraits/men/32.jpg",
                                "NeonSniper": "https://randomuser.me/api/portraits/men/75.jpg",
                                "ShadowTraderX": "https://randomuser.me/api/portraits/women/44.jpg",
                            } as Record<string, string>)[trader.username]}
                            alt={trader.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className={`text-xl font-bold ${c.iconColor}`}>
                            {trader.username.charAt(0)}
                        </span>
                    )}
                </div>
                {/* Country Flag Badge */}
                {traderFlags[trader.username] && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0B0C10] bg-[#1a1c23] flex items-center justify-center overflow-hidden z-10 shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                        <img 
                            src={`https://flagcdn.com/w40/${traderFlags[trader.username]}.png`} 
                            alt={traderFlags[trader.username]} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}

                {position === 1 && (
                    <motion.div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
                        initial={{ opacity: 0, y: -10, scale: 0 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                    >
                        <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FFD700" />
                                    <stop offset="50%" stopColor="#FFC107" />
                                    <stop offset="100%" stopColor="#FF8F00" />
                                </linearGradient>
                                <linearGradient id="crownHighlight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FFF9C4" />
                                    <stop offset="100%" stopColor="#FFD700" />
                                </linearGradient>
                                <filter id="crownGlow">
                                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <g filter="url(#crownGlow)">
                                {/* Crown body */}
                                <path d="M3 17L1 6L7.5 10L14 3L20.5 10L27 6L25 17H3Z" fill="url(#crownGold)" stroke="#B8860B" strokeWidth="0.5" />
                                {/* Crown band */}
                                <rect x="3" y="17" width="22" height="3" rx="0.5" fill="url(#crownHighlight)" stroke="#B8860B" strokeWidth="0.5" />
                                {/* Center gem */}
                                <circle cx="14" cy="10" r="1.8" fill="#39FF14" stroke="#2E7D32" strokeWidth="0.5" />
                                {/* Side gems */}
                                <circle cx="8" cy="13" r="1.2" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="0.4" />
                                <circle cx="20" cy="13" r="1.2" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="0.4" />
                                {/* Crown tips */}
                                <circle cx="14" cy="3.5" r="1" fill="url(#crownHighlight)" />
                                <circle cx="7.5" cy="9.5" r="0.8" fill="url(#crownHighlight)" />
                                <circle cx="20.5" cy="9.5" r="0.8" fill="url(#crownHighlight)" />
                            </g>
                        </svg>
                    </motion.div>
                )}

            </div>

            {/* Name & Title */}
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <h3
                    className="text-sm font-bold text-text-primary"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                >
                    {trader.username}
                </h3>
                <VerifiedBadge className="w-3.5 h-3.5" />
            </div>
            <p className={`text-[10px] uppercase tracking-wider ${c.labelColor} mb-3`}>
                {trader.rank_title}
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-4">
                <div>
                    <p className="text-xs text-text-muted">Retiró</p>
                    <p className="text-sm font-bold text-neon-green">
                        +${trader.total_profit.toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-text-muted">Tasa Éxito</p>
                    <p className="text-sm font-bold text-text-primary">
                        {trader.win_rate}%
                    </p>
                </div>
            </div>

            {/* Premium Green Border on Hover */}
            <motion.div
                className="absolute inset-0 rounded-[20px] pointer-events-none"
                initial={{ opacity: 0, boxShadow: "inset 0 0 0 0px var(--neon-green)" }}
                whileHover={{ 
                    opacity: 1, 
                    boxShadow: "inset 0 0 0 1.5px var(--neon-green), 0 0 15px rgba(57, 255, 20, 0.2)",
                    transition: { duration: 0.3 }
                }}
            />
        </motion.div>
    );
}

/* ============================================
   MAIN LEADERBOARD PAGE
   ============================================ */
export default function LeaderboardPage() {
    const [traders, setTraders] = useState<Trader[]>([]);
    const [loading, setLoading] = useState(true);
    const authClient = createClient();
    const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    
    // Countdown state for Prize Pool
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
    const [isPrizeDelivered, setIsPrizeDelivered] = useState(false);

    useEffect(() => {
        // Calculate the end of the current month
        const updateCountdown = () => {
            const now = new Date();
            
            // Si es el primer día del mes, mostramos el mensaje de premios entregados por 24h
            if (now.getDate() === 1) {
                setIsPrizeDelivered(true);
                return;
            } else {
                setIsPrizeDelivered(false);
            }

            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            const diff = endOfMonth.getTime() - now.getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                setTimeLeft({ days, hours, minutes });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // 1-minute updates
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch current user first
        const { data: { user } } = await authClient.auth.getUser();
        setCurrentUser(user);

        // Determine if admin (must check before fetching traders to set limit)
        const adminEmail = user?.email === "gutierrezalejandro551@gmail.com";
        
        // Fetch traders — admin takes one spot, so fetch 9 instead of 10
        setLoading(true);
        const limit = adminEmail ? 9 : 10;
        const { data, error } = await supabase
            .from("leaderboard_traders")
            .select("*")
            .order("total_profit", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching traders:", error);
        } else {
            setTraders(data || []);
        }
        setLoading(false);
    };

    const top3 = traders.slice(0, 3);

    // Current user display info
    const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "Trader";
    const initials = displayName.charAt(0).toUpperCase();
    const isAdmin = currentUser?.email === "gutierrezalejandro551@gmail.com";
    const isVerified = isAdmin;

    // Admin mock stats — coherent with #8 position
    // Profit: between #7 ($15,300) and #9 ($8,900)
    // Stats are independent of rank (sorted by withdrawals only)
    const adminRankPosition = 8;
    const isInTopTen = isAdmin;
    const userProfit = isAdmin ? 12500 : 0;
    const userWinRate = isAdmin ? 62.9 : 0;
    const userRR = isAdmin ? 2.3 : 0;

    // Build combined row list: insert current user at their rank position
    type RowItem = { type: "trader"; trader: Trader; displayRank: number } | { type: "currentUser"; displayRank: number };

    const buildRows = (): RowItem[] => {
        if (!isInTopTen) {
            return traders.map((t, i) => ({ type: "trader" as const, trader: t, displayRank: i + 1 }));
        }
        const rows: RowItem[] = [];
        let traderIdx = 0;
        const totalRows = traders.length + 1; // 9 traders + 1 admin = 10
        for (let rank = 1; rank <= totalRows; rank++) {
            if (rank === adminRankPosition) {
                rows.push({ type: "currentUser", displayRank: rank });
            } else if (traderIdx < traders.length) {
                rows.push({ type: "trader", trader: traders[traderIdx], displayRank: rank });
                traderIdx++;
            }
        }
        return rows;
    };

    const tableRows = buildRows();

    // Avatar map: assign fake profile photos to SOME traders (not all)
    const traderAvatars: Record<string, string> = {
        "CryptoPhantom": "https://randomuser.me/api/portraits/men/32.jpg",
        "NeonSniper": "https://randomuser.me/api/portraits/men/75.jpg",
        "ShadowTraderX": "https://randomuser.me/api/portraits/women/44.jpg",
        "ZenScalper": "https://randomuser.me/api/portraits/men/22.jpg",
        "PixelPips": "https://randomuser.me/api/portraits/women/68.jpg",
    };

    // Helper: render a normal trader row
    const renderTraderRow = (trader: Trader, rank: number, animDelay: number) => (
        <motion.tr
            key={trader.id}
            className="border-t border-border-subtle/50 hover:bg-white/[0.02] transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animDelay }}
        >
            <td className="py-3.5">
                <span 
                    className={`font-mono text-xs font-bold ${
                        rank === 1 ? 'text-yellow-400' :
                        rank === 2 ? 'text-slate-300' :
                        rank === 3 ? 'text-amber-500' :
                        'text-text-muted'
                    }`}
                    style={{ fontFamily: "var(--font-orbitron)" }}
                >
                    #{rank}
                </span>
            </td>
            <td className="py-3.5">
                <div className="flex items-center gap-3">
                    {/* Avatar with optional photo + verified badge */}
                    <div className="relative flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
                            rank === 1 ? 'bg-yellow-400/15 border border-yellow-400/30' :
                            rank === 2 ? 'bg-slate-400/15 border border-slate-400/30' :
                            rank === 3 ? 'bg-amber-600/15 border border-amber-600/30' :
                            'bg-neon-green/10 border border-neon-green/20'
                        }`}>
                            {traderAvatars[trader.username] ? (
                                <img src={traderAvatars[trader.username]} alt={trader.username} className="w-full h-full object-cover" />
                            ) : (
                                <span className={`text-xs font-bold ${
                                    rank === 1 ? 'text-yellow-400' :
                                    rank === 2 ? 'text-slate-300' :
                                    rank === 3 ? 'text-amber-500' :
                                    'text-neon-green'
                                }`}>
                                    {trader.username.charAt(0)}
                                </span>
                            )}
                        </div>

                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-text-primary text-sm">{trader.username}</p>
                            <VerifiedBadge className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[10px] text-text-muted">{translateRank(trader.rank_title)}</p>
                    </div>
                </div>
            </td>
            <td className="py-3.5 text-center">
                {traderFlags[trader.username] ? (
                    <img 
                        src={`https://flagcdn.com/w40/${traderFlags[trader.username]}.png`} 
                        alt={traderFlags[trader.username]} 
                        className="w-6 mx-auto rounded-sm shadow-sm" 
                    />
                ) : (
                    <span className="text-text-muted text-xs">—</span>
                )}
            </td>
            <td className="py-3.5 text-center">
                <span className="font-bold text-neon-green font-mono text-sm">+${trader.total_profit.toLocaleString()}</span>
            </td>
            <td className="py-3.5 text-center text-text-secondary">{trader.win_rate}%</td>
            <td className="py-3.5 text-center text-text-secondary">1:{trader.risk_reward}</td>
        </motion.tr>
    );

    // Helper: render the current user's PREMIUM CARD row (colSpan=5 card inside table)
    const renderCurrentUserRow = (rank: number, animDelay: number) => (
        <motion.tr
            key="current-user-row"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animDelay }}
        >
            <td colSpan={6} className="p-0">
                <div className="my-2 mx-1 rounded-xl border border-neon-green/30 bg-gradient-to-r from-neon-green/[0.06] via-neon-green/[0.03] to-transparent p-4 relative overflow-hidden">
                    {/* Decorative glow line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-neon-green/60 via-neon-green/20 to-transparent" />
                    
                    <div className="flex items-center justify-between">
                        {/* Left: Rank + Avatar + Name */}
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <span 
                                className={`text-lg font-black ${
                                    rank === 1 ? 'text-yellow-400' :
                                    rank === 2 ? 'text-slate-300' :
                                    rank === 3 ? 'text-amber-500' :
                                    'text-neon-green'
                                } min-w-[50px]`}
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                #{rank}
                            </span>

                            {/* Avatar with Verified Badge */}
                            <div className="relative flex-shrink-0">
                                <div 
                                    className="w-11 h-11 rounded-full bg-neon-green/20 border-2 border-neon-green/50 flex items-center justify-center overflow-hidden"
                                    style={{ boxShadow: "0 0 12px rgba(57,255,20,0.25)" }}
                                >
                                    {currentUser?.user_metadata?.avatar_url && !avatarError ? (
                                        <img 
                                            src={currentUser.user_metadata.avatar_url} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarError(true)}
                                        />
                                    ) : (
                                        <span 
                                            className="text-lg font-bold text-neon-green"
                                            style={{ fontFamily: "var(--font-orbitron)" }}
                                        >
                                            {initials}
                                        </span>
                                    )}
                                </div>
                                {isVerified && (
                                    <div className="absolute -bottom-0.5 -right-0.5 z-10">
                                        <VerifiedBadge className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Name + Title */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <p 
                                        className="font-bold text-neon-green text-sm uppercase"
                                        style={{ fontFamily: "var(--font-orbitron)" }}
                                    >
                                        {displayName}
                                    </p>
                                    <span className="text-[8px] font-bold text-neon-green/70 border border-neon-green/30 bg-neon-green/10 rounded px-1.5 py-0.5 uppercase tracking-widest">
                                        Tú
                                    </span>

                                </div>
                                <p className="text-[10px] text-text-muted mt-0.5">Élite</p>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex items-center gap-6">
                            <div className="text-center w-[60px] flex justify-center">
                                <img 
                                    src="https://flagcdn.com/w40/ve.png" 
                                    alt="Venezuela" 
                                    className="w-6 rounded-sm shadow-[0_0_8px_rgba(57,255,20,0.3)]" 
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider">Retiró</p>
                                <p className="font-bold text-neon-green font-mono text-sm">+${userProfit.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider">Win Rate</p>
                                <p className="font-bold text-text-primary text-sm">{userWinRate}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider">R:R</p>
                                <p className="font-bold text-text-primary text-sm">1:{userRR}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </motion.tr>
    );

    return (
        <motion.div
            className="p-6 max-w-[1400px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Grid layout: Main + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content (3 cols) */}
                <div className="lg:col-span-3">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h1
                            className="text-4xl font-bold text-text-primary"
                            style={{ fontFamily: "var(--font-orbitron)" }}
                        >
                            CLASIFICACIÓN
                        </h1>
                        <h2
                            className="text-4xl font-bold text-neon-green text-glow-green"
                            style={{ fontFamily: "var(--font-orbitron)" }}
                        >
                            GLOBAL
                        </h2>
                        <p className="text-text-secondary mt-2" style={{ fontFamily: "var(--font-rajdhani)" }}>
                            Compite contra la élite. Alcanza el estatus de Leyenda.
                        </p>
                    </motion.div>

                    {/* Top 3 Podium */}
                    {!loading && top3.length >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col lg:flex-row items-end justify-center gap-4 mb-10"
                        >
                            <PodiumCard trader={top3[1]} position={2} />
                            <PodiumCard trader={top3[0]} position={1} />
                            <PodiumCard trader={top3[2]} position={3} />
                        </motion.div>
                    )}

                    {/* Rankings Table */}
                    <motion.div variants={itemVariants} className="glass-card p-5 mb-6">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <span className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm table-fixed">
                                    <thead>
                                        <tr className="text-text-muted text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>
                                            <th className="text-left pb-4 font-medium w-[60px]">#</th>
                                            <th className="text-left pb-4 font-medium">Trader</th>
                                            <th className="text-center pb-4 font-medium w-[60px]">País</th>
                                            <th className="text-center pb-4 font-medium w-[140px]">Retiró</th>
                                            <th className="text-center pb-4 font-medium w-[100px]">Win Rate</th>
                                            <th className="text-center pb-4 font-medium w-[100px]">R:R</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableRows.map((row, i) => {
                                            const animDelay = 0.6 + i * 0.07;
                                            if (row.type === "currentUser") {
                                                return renderCurrentUserRow(row.displayRank, animDelay);
                                            }
                                            return renderTraderRow(row.trader, row.displayRank, animDelay);
                                        })}
                                    </tbody>
                                </table>

                                {/* Floating card ONLY for users outside top 10 */}
                                {!isInTopTen && (
                                    <motion.div 
                                        className="mt-4 rounded-xl border border-neon-green/30 bg-gradient-to-r from-neon-green/[0.06] via-neon-green/[0.03] to-transparent p-4 relative overflow-hidden"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2 }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-neon-green/60 via-neon-green/20 to-transparent" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-black text-neon-green/50 min-w-[50px]" style={{ fontFamily: "var(--font-orbitron)" }}>
                                                    #+999
                                                </span>
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-11 h-11 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center overflow-hidden">
                                                        {currentUser?.user_metadata?.avatar_url && !avatarError ? (
                                                            <img src={currentUser.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                                                        ) : (
                                                            <span className="text-lg font-bold text-neon-green/60" style={{ fontFamily: "var(--font-orbitron)" }}>{initials}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-text-secondary text-sm">{displayName}</p>
                                                        <span className="text-[8px] font-bold text-neon-green/70 border border-neon-green/30 bg-neon-green/10 rounded px-1.5 py-0.5 uppercase tracking-widest">Tú</span>
                                                    </div>
                                                    <p className="text-[10px] text-text-muted mt-0.5">Aún sin retiros — ¡opera para subir!</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">Retiró</p>
                                                    <p className="text-text-muted text-xs">—</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">Win Rate</p>
                                                    <p className="text-text-muted text-xs">—</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">R:R</p>
                                                    <p className="text-text-muted text-xs">—</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar (1 col) */}
                <div className="space-y-5">
                    {/* Prize Pool */}
                    <motion.div
                        variants={itemVariants}
                        className="glass-card p-6 border-2 border-yellow-400/50 relative overflow-hidden group"
                        style={{ boxShadow: "0 0 30px rgba(250,204,21,0.15)" }}
                    >
                        {/* Background glow effect */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/30 transition-colors" />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p
                                        className="text-[10px] uppercase tracking-widest text-yellow-400/80 mb-1 font-semibold"
                                        style={{ fontFamily: "var(--font-rajdhani)" }}
                                    >
                                        PREMIOS (Abril)
                                    </p>
                                    <p
                                        className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                                        style={{ fontFamily: "var(--font-orbitron)" }}
                                    >
                                        $10,000
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                </div>
                            </div>

                            <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                                Compite por una parte de los $10,000 en premios en efectivo depositados directamente a tu cuenta.
                            </p>

                            <div className="space-y-3 mb-6">
                                {traders.slice(0, 3).map((trader, idx) => {
                                    const rank = idx + 1;
                                    const prize = rank === 1 ? "$5,000" : rank === 2 ? "$3,000" : "$2,000";
                                    const medals = ["🥇", "🥈", "🥉"];
                                    const medalShadows = [
                                        "drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]",
                                        "drop-shadow-[0_0_5px_rgba(192,192,192,0.8)]",
                                        "drop-shadow-[0_0_5px_rgba(205,127,50,0.8)]"
                                    ];
                                    const nameColors = [
                                        "text-yellow-400",
                                        "text-slate-300",
                                        "text-amber-500"
                                    ];
                                    const borderColors = [
                                        "border-yellow-400/30",
                                        "border-slate-300/30",
                                        "border-amber-500/30"
                                    ];
                                    const hoverBgs = [
                                        "hover:bg-yellow-400/5 hover:border-yellow-400/30",
                                        "hover:bg-slate-300/5 hover:border-slate-300/30",
                                        "hover:bg-amber-500/5 hover:border-amber-500/30"
                                    ];

                                    return (
                                        <div key={trader.id} className={`flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 ${hoverBgs[idx]} transition-colors`}>
                                            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                                <span className={`text-xl flex-shrink-0 ${medalShadows[idx]}`}>{medals[idx]}</span>
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden bg-black/50 border ${borderColors[idx]}`}>
                                                        {traderAvatars[trader.username] ? (
                                                            <img src={traderAvatars[trader.username]} alt={trader.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className={`text-[10px] font-bold ${nameColors[idx]}`}>
                                                                {trader.username.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-white leading-none mb-1 truncate">{trader.username}</span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${nameColors[idx]} leading-none truncate`}>
                                                            {rank} Lugar
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`text-base font-black ${nameColors[idx]} font-mono flex-shrink-0`}>{prize}</span>
                                        </div>
                                    );
                                })}

                                {/* Fallback if no traders yet */}
                                {traders.length === 0 && (
                                    <div className="text-center py-4 text-xs text-text-muted">Cargando clasificados...</div>
                                )}
                            </div>

                            {/* Countdown Timer */}
                            <div className="pt-4 border-t border-yellow-400/20">
                                {isPrizeDelivered ? (
                                    <div className="flex flex-col items-center justify-center py-2 animate-pulse">
                                        <p className="text-sm font-black text-yellow-400 tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            ¡Premios Entregados!
                                        </p>
                                        <p className="text-[10px] text-text-secondary text-center">
                                            Una nueva temporada comienza pronto...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider text-center flex items-center justify-center gap-1.5 mb-3">
                                            <Clock className="w-3.5 h-3.5" /> Termina en:
                                        </p>
                                        <div className="flex justify-center gap-2 text-center" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            <div className="bg-black/40 border border-yellow-400/30 rounded px-2 py-1.5 min-w-[50px] shadow-[inset_0_0_10px_rgba(250,204,21,0.05)]">
                                                <p className="text-lg font-bold text-yellow-400 leading-tight">
                                                    {timeLeft.days.toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-[8px] text-text-muted uppercase">Días</p>
                                            </div>
                                            <span className="text-yellow-400/50 font-bold self-start mt-2 animate-pulse">:</span>
                                            <div className="bg-black/40 border border-yellow-400/30 rounded px-2 py-1.5 min-w-[50px] shadow-[inset_0_0_10px_rgba(250,204,21,0.05)]">
                                                <p className="text-lg font-bold text-yellow-400 leading-tight">
                                                    {timeLeft.hours.toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-[8px] text-text-muted uppercase">Hrs</p>
                                            </div>
                                            <span className="text-yellow-400/50 font-bold self-start mt-2 animate-pulse">:</span>
                                            <div className="bg-black/40 border border-yellow-400/30 rounded px-2 py-1.5 min-w-[50px] shadow-[inset_0_0_10px_rgba(250,204,21,0.05)]">
                                                <p className="text-lg font-bold text-yellow-400 leading-tight">
                                                    {timeLeft.minutes.toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-[8px] text-text-muted uppercase">Min</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Share Rank */}
                    <motion.div variants={itemVariants} className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Share2 className="w-4 h-4 text-neon-green" />
                            <h3 className="text-sm font-bold text-text-primary">
                                Comparte tu Rango
                            </h3>
                        </div>
                        <p className="text-xs text-text-muted mb-4">
                            Presume tus habilidades de trading. Invita amigos a competir en
                            el próximo torneo.
                        </p>
                        <motion.button
                            className="w-full py-2.5 rounded-lg bg-neon-green text-bg-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-neon-green/80 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Compartir Perfil <ChevronUp className="w-4 h-4 rotate-90" />
                        </motion.button>
                    </motion.div>


                </div>
            </div>
        </motion.div>
    );
}
