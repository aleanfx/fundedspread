"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Share2,
    ChevronUp,
    Trophy,
    Clock,
    Download,
    X,
    Star,
    TrendingUp
} from "lucide-react";
import { supabase, getSafeSession, hasImpersonationCookie } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { RankBadge } from "@/components/RankBadge";
import { RankId, mapRankTitleToId, RANK_INFO } from "@/lib/utils/rankSystem";
import { toPng } from "html-to-image";
import { calculateBotDayProfit } from "@/lib/utils/botSchedule";

/* ============================================
   RANK ID HELPER FOR LEADERBOARD
   ============================================ */
const RANK_WEIGHT = {
    legend: 4,
    elite: 3,
    warrior: 2,
    novato: 1,
    unranked: 0
};

const getLeaderboardRankId = (trader: Trader, rank: number, overrideStats?: UserRankStats | null): RankId => {
    let currentCalculated: RankId = "novato";
    
    // Top 3 always shown as Legend in the leaderboard tournament view
    if (rank > 0 && rank <= 3) {
        currentCalculated = "legend";
    } else if (trader.total_profit >= 3000) {
        currentCalculated = "elite";
    } else if (trader.total_profit >= 1000) {
        currentCalculated = "warrior";
    }

    // Compare with the rank stored in the DB (historic highest or manually set)
    const dbRank = mapRankTitleToId(trader.rank_title);
    
    // IF we have overrideStats (from current user profile), calculate their REAL global rank
    let profileRank: RankId = "unranked";
    if (overrideStats) {
        profileRank = calculateRank(overrideStats).id;
    }

    const dbWeight = RANK_WEIGHT[dbRank] || 0;
    const calcWeight = RANK_WEIGHT[currentCalculated] || 0;
    const profileWeight = RANK_WEIGHT[profileRank] || 0;
    
    // Return the highest between current month performance, historic leaderboard DB rank, AND global profile rank
    const highestWeight = Math.max(dbWeight, calcWeight, profileWeight);
    
    if (highestWeight === profileWeight && profileWeight > 0) return profileRank;
    if (highestWeight === dbWeight && dbWeight > 0) return dbRank;
    return currentCalculated;
};

/* ============================================
   TYPES
   ============================================ */
import { UserRankStats, calculateRank } from "@/lib/utils/rankSystem";

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
    avatar_url?: string | null;
    is_fake?: boolean;
    country_code?: string | null;
    user_id?: string | null;
    base_profit?: number;
    generation_month?: string;
    created_at?: string;
}

// rank translations are now handled by i18n via t("leaderboard.ranks.xxx")

// Map country names (Spanish) to ISO 3166-1 alpha-2 codes for user profile flag
const countryNameToISO: Record<string, string> = {
    "Argentina": "ar", "México": "mx", "Colombia": "co", "Brasil": "br", "Chile": "cl",
    "Perú": "pe", "Ecuador": "ec", "República Dominicana": "do", "Uruguay": "uy",
    "Panamá": "pa", "Costa Rica": "cr", "Guatemala": "gt", "Honduras": "hn",
    "El Salvador": "sv", "Paraguay": "py", "Venezuela": "ve", "Bolivia": "bo",
    "Cuba": "cu", "Nicaragua": "ni", "España": "es", "Estados Unidos": "us",
    "Canadá": "ca", "Francia": "fr", "Alemania": "de", "Italia": "it",
    "Reino Unido": "gb", "Portugal": "pt", "Japón": "jp", "China": "cn",
    "India": "in", "Australia": "au", "Rusia": "ru", "Turquía": "tr",
    "Países Bajos": "nl", "Suiza": "ch", "Suecia": "se", "Noruega": "no",
    "Filipinas": "ph", "Tailandia": "th", "Sudáfrica": "za", "Nigeria": "ng",
    "Corea del Sur": "kr", "Indonesia": "id", "Malasia": "my", "Vietnam": "vn",
    "Trinidad y Tobago": "tt", "Jamaica": "jm", "Haití": "ht",
};

// Helper: get current month as "YYYY-MM"
function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function calculateDisplayProfit(trader: Trader): number {
    // Bots show gradually increasing profit based on day of month
    if (trader.is_fake) {
        return Math.floor(calculateBotDayProfit(trader.id, trader.total_profit));
    }
    // Real users show their actual total_profit (no decimals)
    return Math.floor(trader.total_profit);
}

/* ============================================
   VERIFIED BADGE (same pattern as profile)
   ============================================ */
const VerifiedBadge = ({ className = "w-5 h-5", checkColor = "#000000", badgeColor = "var(--neon-green)", title }: { className?: string; checkColor?: string; badgeColor?: string; title?: string }) => (
    <div title={title} className="inline-flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} overflow-visible drop-shadow-[0_2px_4px_rgba(57,255,20,0.3)]`}>
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
   PODIUM COMPONENT (Desktop)
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
            labelColor: "text-yellow-400",
            width: "w-[220px]",
            zIndex: "z-20",
        },
        2: {
            border: "border-slate-400/40",
            glow: "shadow-[0_0_25px_rgba(148,163,184,0.15)]",
            bgIcon: "bg-slate-400/20",
            iconColor: "text-slate-300",
            labelColor: "text-slate-300",
            width: "w-[200px]",
            zIndex: "z-10",
        },
        3: {
            border: "border-amber-600/40",
            glow: "shadow-[0_0_25px_rgba(217,119,6,0.15)]",
            bgIcon: "bg-amber-600/20",
            iconColor: "text-amber-500",
            labelColor: "text-amber-500",
            width: "w-[200px]",
            zIndex: "z-10",
        },
    };

    const c = config[position];
    const { t } = useLanguage();

    const podiumAvatars: Record<string, string> = {
        "CryptoPhantom": "https://randomuser.me/api/portraits/men/32.jpg",
        "NeonSniper": "https://randomuser.me/api/portraits/men/75.jpg",
        "ShadowTraderX": "https://randomuser.me/api/portraits/women/44.jpg",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: position === 1 ? 0.2 : position === 2 ? 0.4 : 0.6 }}
            className={`${c.width} ${c.zIndex} glass-card p-5 border ${c.border} ${c.glow} text-center flex flex-col items-center`}
            whileHover={{ y: position === 1 ? -12 : -8, transition: { duration: 0.3 } }}
        >
            {/* Rank Badge */}
            <div className="flex justify-center mb-3">
                <div
                    className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${c.bgIcon} ${c.labelColor} border border-current/20 uppercase`}
                    style={{ fontFamily: "var(--font-orbitron)" }}
                >
                    {calculateDisplayProfit(trader) > 0 ? `${t("leaderboard.top")}${position}` : "#999+"}
                </div>
            </div>

            {/* Avatar */}
            <div className="relative mx-auto mb-3 w-16 h-16">
                <div className={`w-16 h-16 rounded-full ${c.bgIcon} border-2 ${c.border} flex items-center justify-center overflow-hidden`}>
                    {trader.avatar_url ? (
                        <img src={trader.avatar_url} alt={trader.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : podiumAvatars[trader.username] ? (
                        <img src={podiumAvatars[trader.username]} alt={trader.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className={`text-xl font-bold ${c.iconColor}`}>{trader.username.charAt(0)}</span>
                    )}
                </div>
                {trader.country_code && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0B0C10] bg-[#1a1c23] flex items-center justify-center overflow-hidden z-10 shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                        <img src={`https://flagcdn.com/w40/${trader.country_code}.png`} alt={trader.country_code} className="w-full h-full object-cover" />
                    </div>
                )}
                {position === 1 && (
                    <motion.div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20" initial={{ opacity: 0, y: -10, scale: 0 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.8, type: "spring" }}>
                        <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD700" /><stop offset="50%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FF8F00" /></linearGradient>
                                <linearGradient id="crownHighlight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF9C4" /><stop offset="100%" stopColor="#FFD700" /></linearGradient>
                                <filter id="crownGlow"><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                            </defs>
                            <g filter="url(#crownGlow)">
                                <path d="M3 17L1 6L7.5 10L14 3L20.5 10L27 6L25 17H3Z" fill="url(#crownGold)" stroke="#B8860B" strokeWidth="0.5" />
                                <rect x="3" y="17" width="22" height="3" rx="0.5" fill="url(#crownHighlight)" stroke="#B8860B" strokeWidth="0.5" />
                                <circle cx="14" cy="10" r="1.8" fill="#39FF14" stroke="#2E7D32" strokeWidth="0.5" />
                                <circle cx="8" cy="13" r="1.2" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="0.4" />
                                <circle cx="20" cy="13" r="1.2" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="0.4" />
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
                <h3 className="text-sm font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>{trader.username}</h3>
                {trader.is_fake && <VerifiedBadge className="w-3.5 h-3.5" title="Verified" />}
            </div>
            <div className="mb-3"><RankBadge rankId={getLeaderboardRankId(trader, position)} size="md" /></div>

            {/* Stats */}
            <div className="flex justify-center gap-4">
                <div>
                    <p className="text-xs text-text-muted uppercase">{t("leaderboard.withdrew")}</p>
                    <p className="text-sm font-bold text-neon-green">+${calculateDisplayProfit(trader).toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-text-muted uppercase">{t("leaderboard.winRate")}</p>
                    <p className="text-sm font-bold text-text-primary">{trader.win_rate}%</p>
                </div>
            </div>

            {/* Premium Green Border on Hover */}
            <motion.div
                className="absolute inset-0 rounded-[20px] pointer-events-none"
                initial={{ opacity: 0, boxShadow: "inset 0 0 0 0px var(--neon-green)" }}
                whileHover={{ opacity: 1, boxShadow: "inset 0 0 0 1.5px var(--neon-green), 0 0 15px rgba(57, 255, 20, 0.2)", transition: { duration: 0.3 } }}
            />
        </motion.div>
    );
}

/* ============================================
   MOBILE PODIUM (Compact horizontal cards)
   ============================================ */
/* ============================================
   MOBILE PODIUM CARD (Compact vertical cards)
   ============================================ */
function MobilePodiumCard({
    trader,
    position,
}: {
    trader: Trader;
    position: 1 | 2 | 3;
}) {
    const config = {
        1: {
            border: "border-yellow-400/60",
            glow: "shadow-[0_0_20px_rgba(250,204,21,0.25)]",
            bgIcon: "bg-yellow-400/20",
            iconColor: "text-yellow-400",
            labelColor: "text-yellow-400",
            width: "w-[126px] sm:w-[150px]",
            zIndex: "z-20",
        },
        2: {
            border: "border-slate-400/40",
            glow: "shadow-[0_0_15px_rgba(148,163,184,0.15)]",
            bgIcon: "bg-slate-400/20",
            iconColor: "text-slate-300",
            labelColor: "text-slate-300",
            width: "w-[110px] sm:w-[130px]",
            zIndex: "z-10",
        },
        3: {
            border: "border-amber-600/40",
            glow: "shadow-[0_0_15px_rgba(217,119,6,0.15)]",
            bgIcon: "bg-amber-600/20",
            iconColor: "text-amber-500",
            labelColor: "text-amber-500",
            width: "w-[110px] sm:w-[130px]",
            zIndex: "z-10",
        },
    };

    const c = config[position];
    const { t } = useLanguage();

    const podiumAvatars: Record<string, string> = {
        "CryptoPhantom": "https://randomuser.me/api/portraits/men/32.jpg",
        "NeonSniper": "https://randomuser.me/api/portraits/men/75.jpg",
        "ShadowTraderX": "https://randomuser.me/api/portraits/women/44.jpg",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: position === 1 ? 0.2 : position === 2 ? 0.4 : 0.6 }}
            className={`${c.width} ${c.zIndex} glass-card px-2 py-1.5 border ${c.border} ${c.glow} text-center flex flex-col items-center relative`}
        >
            {/* Rank Badge */}
            <div className={`flex justify-center ${position === 1 ? 'mb-2.5' : 'mb-1'}`}>
                <div
                    className={`text-[9px] font-bold tracking-wider px-2 py-[1px] rounded-full ${c.bgIcon} ${c.labelColor} border border-current/20 uppercase leading-none`}
                    style={{ fontFamily: "var(--font-orbitron)" }}
                >
                    {calculateDisplayProfit(trader) > 0 ? `${t("leaderboard.top")}${position}` : "#999+"}
                </div>
            </div>

            {/* Avatar */}
            <div className={`relative mx-auto mb-1 ${position === 1 ? 'w-11 h-11' : 'w-8 h-8'}`}>
                <div className={`w-full h-full rounded-full ${c.bgIcon} border-2 ${c.border} flex items-center justify-center overflow-hidden`}>
                    {trader.avatar_url ? (
                        <img src={trader.avatar_url} alt={trader.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : podiumAvatars[trader.username] ? (
                        <img src={podiumAvatars[trader.username]} alt={trader.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className={`text-base font-bold ${c.iconColor}`}>{trader.username.charAt(0)}</span>
                    )}
                </div>
                {trader.country_code && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-[#0B0C10] bg-[#1a1c23] flex items-center justify-center overflow-hidden z-10">
                        <img src={`https://flagcdn.com/w20/${trader.country_code}.png`} alt={trader.country_code} className="w-full h-full object-cover" />
                    </div>
                )}
                {position === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <svg width="20" height="16" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="mCrownGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD700" /><stop offset="50%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FF8F00" /></linearGradient>
                            </defs>
                            <g>
                                <path d="M3 17L1 6L7.5 10L14 3L20.5 10L27 6L25 17H3Z" fill="url(#mCrownGold)" stroke="#B8860B" strokeWidth="0.5" />
                                <rect x="3" y="17" width="22" height="3" rx="0.5" fill="#FFF9C4" stroke="#B8860B" strokeWidth="0.5" />
                                <circle cx="14" cy="10" r="1.8" fill="#39FF14" stroke="#2E7D32" strokeWidth="0.5" />
                            </g>
                        </svg>
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="flex items-center justify-center gap-1 mb-0 w-full px-1">
                <h3 className="text-[10px] font-bold text-text-primary truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
                    {trader.username}
                </h3>
                {trader.is_fake && <VerifiedBadge className="w-2.5 h-2.5 flex-shrink-0" title="Verified" />}
            </div>

            <div className="mb-0.5 scale-[0.65] origin-center -mt-1">
                <RankBadge rankId={getLeaderboardRankId(trader, position)} size="md" />
            </div>

            {/* Stats */}
            <div className="flex flex-col items-center w-full">
                <p className="text-[7.5px] text-text-muted uppercase leading-none mb-0.5">{t("leaderboard.withdrew")}</p>
                <p className="text-[11px] font-bold text-neon-green font-mono leading-none">+${calculateDisplayProfit(trader).toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

/* ============================================
   MAIN LEADERBOARD PAGE
   ============================================ */
export default function LeaderboardPage() {
    const { t, language } = useLanguage();
    const [traders, setTraders] = useState<Trader[]>([]);
    const [loading, setLoading] = useState(true);
    const authClient = supabase;
    const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
    const [currentUserStats, setCurrentUserStats] = useState<UserRankStats | null>(null);
    const [avatarError, setAvatarError] = useState(false);

    // Countdown state for Prize Pool
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
    const [isPrizeDelivered, setIsPrizeDelivered] = useState(false);
    const [isShareCardOpen, setIsShareCardOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    // Impersonation states
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedUserEmail, setImpersonatedUserEmail] = useState<string | null>(null);
    const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
    const [impersonatedUserData, setImpersonatedUserData] = useState<any>(null);


    useEffect(() => {
        // Impersonation check is now handled in loadData for better synchronization

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

    const loadData = async () => {
        try {
            setLoading(true);
            console.log("Leaderboard: Starting data load...");

            const currentMonth = getCurrentMonth();

            // Only check impersonation if admin cookie exists (saves a network call for 99.9% of users)
            const impPromise = hasImpersonationCookie()
                ? fetch('/api/admin/impersonate/data').catch(() => null)
                : Promise.resolve(null);

            const [sessionResponse, impResponse, leaderboardResponse] = await Promise.all([
                getSafeSession(),
                impPromise,
                supabase
                    .from("leaderboard_traders")
                    .select("*")
                    .or(`generation_month.eq.${currentMonth},is_fake.eq.false`)
                    .order("total_profit", { ascending: false })
            ]);

            const authUser = sessionResponse.data.session?.user ?? null;
            setCurrentUser(authUser);

            let targetUserId = authUser?.id;
            let targetUserEmail = authUser?.email;

            // Handle impersonation data
            if (impResponse && impResponse.ok) {
                const impData = await impResponse.json();
                if (impData.userData) {
                    setIsImpersonating(true);
                    setImpersonatedUserEmail(impData.userData.email);
                    setImpersonatedUserId(impData.userData.id);
                    setImpersonatedUserData({
                        ...impData.userData,
                        full_name: impData.userData.full_name || impData.user?.user_metadata?.full_name,
                        avatar_url: impData.userData.avatar_url || impData.user?.user_metadata?.avatar_url
                    });
                    
                    targetUserId = impData.userData.id;
                    targetUserEmail = impData.userData.email;
                    console.log("Leaderboard: Impersonation active for", targetUserEmail);
                }
            }

            // Fetch specific user stats if logged in or impersonated
            const userStatsResponse = targetUserId ? await supabase
                .from("users")
                .select("total_withdrawals, top_ten_finishes, top_three_finishes, highest_rank, is_rank_locked, phases_passed, is_funded")
                .eq("id", targetUserId)
                .single() : { data: null };


            // Process Personal Stats
            if (userStatsResponse.data) {
                const userData = userStatsResponse.data;
                const baseStats: UserRankStats = {
                    phasesCompleted: userData.phases_passed || 0,
                    isFunded: userData.is_funded === true,
                    totalWithdrawals: Number(userData.total_withdrawals) || 0,
                    topTenFinishes: userData.top_ten_finishes || 0,
                    topThreeFinishes: userData.top_three_finishes || 0,
                    highestRank: userData.highest_rank as RankId || "unranked",
                    isRankLocked: userData.is_rank_locked === true
                };

                setCurrentUserStats(baseStats);
            }

            // Process Leaderboard Data
            if (leaderboardResponse.error) {
                console.error("Leaderboard: Error fetching traders", leaderboardResponse.error);
            } else {
                const lbData = leaderboardResponse.data || [];
                const sorted = [...lbData].sort((a: Trader, b: Trader) => {
                    const profitA = calculateDisplayProfit(a);
                    const profitB = calculateDisplayProfit(b);
                    if (profitB !== profitA) return profitB - profitA;
                    if (b.total_profit !== a.total_profit) return b.total_profit - a.total_profit;
                    return a.username.localeCompare(b.username);
                });
                setTraders(sorted);
                console.log("Leaderboard: Successfully loaded", sorted.length, "traders");
            }

        } catch (err) {
            console.error("Leaderboard: Critical error in loadData", err);
        } finally {
            setLoading(false);
            console.log("Leaderboard: Load sequence finished");
        }
    };


    useEffect(() => {
        loadData();
    }, []);

    // Find if the current user is in the leaderboard
    // When impersonating, the "current user" is the target user
    const effectiveUserId = isImpersonating ? impersonatedUserId : currentUser?.id;
    const currentUserEntry = effectiveUserId ? traders.find(tr => tr.user_id === effectiveUserId) : null;
    const currentUserRank = currentUserEntry ? traders.indexOf(currentUserEntry) + 1 : -1;
    const isInTopTen = currentUserRank >= 1 && currentUserRank <= 10;

    // Top 10 for display
    const displayTraders = traders.slice(0, 10);
    const top3 = displayTraders.slice(0, 3);
    const isInDisplayList = currentUserRank >= 1 && currentUserRank <= 10;

    // Current user display info
    // When impersonating, use the target user's metadata
    const effectiveMetadata = isImpersonating ? impersonatedUserData : currentUser?.user_metadata;
    const effectiveEmail = isImpersonating ? impersonatedUserEmail : currentUser?.email;

    let displayName = currentUserEntry?.username || effectiveMetadata?.full_name || effectiveEmail?.split("@")[0] || "Trader";
    let userCountryCode = currentUserEntry?.country_code || (effectiveMetadata?.country ? countryNameToISO[effectiveMetadata.country] : "") || "";



    const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

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
                    className={`font-mono text-xs font-bold ${rank === 1 ? 'text-yellow-400' :
                        rank === 2 ? 'text-slate-300' :
                            rank === 3 ? 'text-amber-500' :
                                'text-text-muted'
                        }`}
                    style={{ fontFamily: "var(--font-orbitron)" }}
                >
                    {calculateDisplayProfit(trader) > 0 ? `#${rank}` : "#999+"}
                </span>
            </td>
            <td className="py-3.5">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10">
                        <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${rank === 1 ? 'bg-yellow-400/15 border border-yellow-400/30' :
                            rank === 2 ? 'bg-slate-400/15 border border-slate-400/30' :
                                rank === 3 ? 'bg-amber-600/15 border border-amber-600/30' :
                                    'bg-neon-green/10 border border-neon-green/20'
                            }`}>
                            {trader.avatar_url ? (
                                <img src={trader.avatar_url} alt={trader.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className={`text-xs font-bold ${rank === 1 ? 'text-yellow-400' :
                                    rank === 2 ? 'text-slate-300' :
                                        rank === 3 ? 'text-amber-500' :
                                            'text-neon-green'
                                    }`}>
                                    {trader.username.charAt(0)}
                                </span>
                            )}
                        </div>
                        {trader.is_fake && <VerifiedBadge className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] absolute -bottom-[2px] -right-[2px] z-10" title={t("leaderboard.verified")} />}
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5">
                            {trader.country_code && (
                                <img src={`https://flagcdn.com/w20/${trader.country_code}.png`} className="w-4 h-3 rounded-sm" alt={trader.country_code} />
                            )}
                            <p className="font-semibold text-text-primary text-[11px] sm:text-sm truncate max-w-[100px] sm:max-w-none">{trader.username}</p>
                        </div>
                        <div className="mt-1">
                            <RankBadge rankId={getLeaderboardRankId(trader, rank)} size="sm" />
                        </div>
                    </div>
                </div>
            </td>
            <td className="hidden sm:table-cell py-3.5 text-center">
                {trader.country_code ? (
                    <img
                        src={`https://flagcdn.com/w40/${trader.country_code}.png`}
                        alt={trader.country_code}
                        className="w-6 mx-auto rounded-sm shadow-sm"
                    />
                ) : (
                    <span className="text-text-muted text-xs">—</span>
                )}
            </td>
            <td className="py-3.5 text-center">
                <span className="font-bold text-neon-green font-mono text-[13px] sm:text-sm">+${calculateDisplayProfit(trader).toLocaleString()}</span>
            </td>
            <td className="hidden sm:table-cell py-3.5 text-center text-text-secondary">{trader.win_rate}%</td>
            <td className="hidden md:table-cell py-3.5 text-center text-text-secondary">1:{trader.risk_reward}</td>
        </motion.tr >
    );

    // Helper: render the current user's highlighted row
    const renderCurrentUserRow = (rank: number, animDelay: number) => {
        return (
            <motion.tr
                key="current-user-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: animDelay }}
                className={`
                    group transition-all duration-300
                    border-b border-neon-green/30 bg-neon-green/[0.05] hover:bg-neon-green/[0.1]
                `}
            >
                <td className="py-3.5 pl-2 border-l-2 sm:border-l-4 border-l-neon-green">
                    <span
                        className="font-mono text-xs font-bold text-neon-green"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                        {(currentUserEntry && calculateDisplayProfit(currentUserEntry) > 0) ? `#${rank}` : "#999+"}
                    </span>
                </td>
                <td className="py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10">
                            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-neon-green/20 border border-neon-green/40 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                                {effectiveMetadata?.avatar_url && !avatarError ? (
                                    <img src={effectiveMetadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
                                ) : (
                                    <span className="text-xs font-bold text-neon-green">{initials}</span>
                                )}
                            </div>
                            {/* Real users don't show verified badge here */}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                {userCountryCode && (
                                    <img src={`https://flagcdn.com/w20/${userCountryCode}.png`} className="w-4 h-3 rounded-sm" alt={userCountryCode} />
                                )}
                                <p className="font-semibold text-neon-green text-[11px] sm:text-sm truncate max-w-[100px] sm:max-w-none">{displayName}</p>
                                <span className="text-[8px] font-bold text-neon-green/70 border border-neon-green/30 bg-neon-green/10 rounded px-1.5 py-0.5 uppercase tracking-widest hidden sm:inline-block ml-1">
                                    {t("leaderboard.table.you")}
                                </span>
                            </div>
                            <div className="mt-1">
                                <RankBadge rankId={currentUserEntry ? getLeaderboardRankId(currentUserEntry, currentUserRank, currentUserStats) : (currentUserStats ? calculateRank(currentUserStats).id : "unranked")} size="sm" />
                            </div>
                        </div>
                    </div>
                </td>
                <td className="hidden sm:table-cell py-3.5 text-center">
                    {userCountryCode ? (
                        <img src={`https://flagcdn.com/w40/${userCountryCode}.png`} alt={userCountryCode} className="w-6 mx-auto rounded-sm shadow-sm" />
                    ) : (
                        <span className="text-text-muted text-xs">—</span>
                    )}
                </td>
                <td className="py-3.5 text-center">
                    <span className="font-bold text-neon-green font-mono text-[13px] sm:text-sm">+${currentUserEntry ? calculateDisplayProfit(currentUserEntry).toLocaleString() : '0'}</span>
                </td>
                <td className="hidden sm:table-cell py-3.5 text-center text-text-primary">{currentUserEntry?.win_rate || 0}%</td>
                <td className="hidden md:table-cell py-3.5 text-center text-text-primary">1:{currentUserEntry?.risk_reward || 0}</td>
            </motion.tr>
        );
    };


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
                            {t("leaderboard.title")}
                        </h1>
                        <h2
                            className="text-4xl font-bold text-neon-green text-glow-green"
                            style={{ fontFamily: "var(--font-orbitron)" }}
                        >
                            {t("leaderboard.titleHighlight")}
                        </h2>
                        <p className="text-text-secondary mt-2" style={{ fontFamily: "var(--font-rajdhani)" }}>
                            {t("leaderboard.subtitle")}
                        </p>
                    </motion.div>

                    {/* Top 3 Podium — Responsive Split Layout */}
                    {!loading && top3.length >= 3 && (
                        <>
                            {/* Desktop Podium */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="hidden lg:flex flex-row items-end justify-center gap-6 mb-10 mt-8"
                            >
                                <div className="z-10 flex justify-center"><PodiumCard trader={top3[1]} position={2} /></div>
                                <div className="z-20 flex justify-center -translate-y-8"><PodiumCard trader={top3[0]} position={1} /></div>
                                <div className="z-10 flex justify-center"><PodiumCard trader={top3[2]} position={3} /></div>
                            </motion.div>

                            {/* Mobile Podium */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex lg:hidden flex-row items-end justify-center gap-2 sm:gap-4 mb-10 mt-6"
                            >
                                <div className="z-10 flex justify-center"><MobilePodiumCard trader={top3[1]} position={2} /></div>
                                <div className="z-20 flex justify-center -translate-y-6"><MobilePodiumCard trader={top3[0]} position={1} /></div>
                                <div className="z-10 flex justify-center"><MobilePodiumCard trader={top3[2]} position={3} /></div>
                            </motion.div>
                        </>
                    )}

                    {/* Rankings Table */}
                    <motion.div variants={itemVariants} className="glass-card p-5 mb-6">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <span className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="w-full relative">
                                    <table className="w-full text-sm table-fixed">
                                        <thead>
                                            <tr className="text-text-muted text-[10px] sm:text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>
                                                <th className="text-left pb-4 font-medium w-[40px] sm:w-[60px]">#</th>
                                                <th className="text-left pb-4 font-medium">Trader</th>
                                                <th className="hidden sm:table-cell text-center pb-4 font-medium w-[60px]">{t("leaderboard.table.country")}</th>
                                                <th className="text-center pb-4 font-medium w-[90px] sm:w-[140px]">{t("leaderboard.withdrew")}</th>
                                                <th className="hidden sm:table-cell text-center pb-4 font-medium w-[100px]">{t("leaderboard.winRateEn")}</th>
                                                <th className="hidden md:table-cell text-center pb-4 font-medium w-[100px]">{t("leaderboard.rr")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayTraders.map((trader: Trader, i: number) => {
                                                const animDelay = 0.6 + i * 0.07;
                                                const rank = i + 1;
                                                // If this trader is the current user, render premium row
                                                if (currentUser && trader.user_id === currentUser.id) {
                                                    return renderCurrentUserRow(rank, animDelay);
                                                }
                                                return renderTraderRow(trader, rank, animDelay);
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Floating bar ONLY for users outside display list */}
                                {(!isInDisplayList && currentUser) && (
                                    <motion.div
                                        className="mt-4 rounded-[40px] border border-neon-green/40 shadow-[0_0_20px_rgba(57,255,20,0.15)] bg-gradient-to-r from-neon-green/[0.1] via-neon-green/[0.03] to-bg-secondary p-3 sm:p-4 px-4 sm:px-6 relative overflow-visible"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 sm:gap-4">
                                                <span
                                                    className={`text-lg sm:text-2xl font-black text-neon-green min-w-[30px] sm:min-w-[50px]`}
                                                    style={{ fontFamily: "var(--font-orbitron)" }}
                                                >
                                                    {(currentUserRank > 0 && currentUserEntry && calculateDisplayProfit(currentUserEntry) > 0) ? `#${currentUserRank}` : ((currentUserRank > 0 && (!currentUserEntry || calculateDisplayProfit(currentUserEntry) === 0)) ? "#999+" : "-")}
                                                </span>

                                                <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
                                                    <div
                                                        className="w-full h-full rounded-full bg-neon-green/20 border-2 border-neon-green/50 flex items-center justify-center overflow-hidden"
                                                    >
                                                        {effectiveMetadata?.avatar_url && !avatarError ? (
                                                            <img
                                                                src={effectiveMetadata.avatar_url}
                                                                alt="Avatar"
                                                                className="w-full h-full object-cover"
                                                                referrerPolicy="no-referrer"
                                                                onError={() => setAvatarError(true)}
                                                            />
                                                        ) : (
                                                            <span className="text-xl font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>{initials}</span>
                                                        )}
                                                    </div>
                                                    {/* Real users don't show verified badge here */}
                                                </div>

                                                <div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                                        <div className="flex items-center gap-1.5">
                                                            {userCountryCode && (
                                                                <img src={`https://flagcdn.com/w20/${userCountryCode}.png`} alt={userCountryCode} className="w-4 h-3 rounded-sm shrink-0" />
                                                            )}
                                                            <p
                                                                className="font-bold text-neon-green text-[12px] sm:text-[15px] uppercase leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-none"
                                                                style={{ fontFamily: "var(--font-orbitron)" }}
                                                            >
                                                                {displayName}
                                                            </p>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-neon-green border border-neon-green bg-neon-green/20 rounded-full px-2 py-0.5 uppercase tracking-widest hidden sm:inline-block">
                                                            {t("leaderboard.table.you")}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1">
                                                        {currentUserEntry ? (
                                                            <RankBadge rankId={getLeaderboardRankId(currentUserEntry, currentUserRank, currentUserStats)} size="sm" />
                                                        ) : currentUserStats ? (
                                                            <RankBadge rankId={calculateRank(currentUserStats).id} size="sm" />
                                                        ) : (
                                                            <span className="text-[9px] sm:text-[11px] text-text-muted">{t("leaderboard.table.noWithdrawalsFallback")}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-8">
                                                <div className="text-center shrink-0">
                                                    <p className="font-bold text-neon-green font-mono text-[14px] sm:text-lg leading-tight sm:leading-normal">+${currentUserEntry ? calculateDisplayProfit(currentUserEntry).toLocaleString() : '0'}</p>
                                                </div>
                                                <div className="hidden sm:block text-center shrink-0">
                                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">{t("leaderboard.winRateEn")}</p>
                                                    <p className="font-bold text-text-primary text-[15px]">{currentUserEntry?.win_rate || 0}%</p>
                                                </div>
                                                <div className="hidden md:block text-center shrink-0">
                                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">{t("leaderboard.rr")}</p>
                                                    <p className="font-bold text-text-primary text-[15px]">1:{currentUserEntry?.risk_reward || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Share Action Button */}
                                {currentUser && (
                                    <div className="mt-6 flex justify-center">
                                        <motion.button
                                            className="px-6 py-2.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green text-sm font-bold flex items-center justify-center gap-2 hover:bg-neon-green hover:text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all duration-300 group"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsShareCardOpen(true)}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Compartir Rango
                                        </motion.button>
                                    </div>
                                )}
                            </>
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
                                        {t("leaderboard.prizePool.title")}
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
                                {t("leaderboard.prizePool.desc")}
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
                                                        {trader.avatar_url ? (
                                                            <img src={trader.avatar_url} alt={trader.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                        ) : (
                                                            <span className={`text-[10px] font-bold ${nameColors[idx]}`}>
                                                                {trader.username.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-white leading-none mb-1 truncate">{trader.username}</span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${nameColors[idx]} leading-none truncate`}>
                                                            {rank} {t("leaderboard.prizePool.place")}
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
                                    <div className="text-center py-4 text-xs text-text-muted">{t("leaderboard.table.loading")}</div>
                                )}
                            </div>

                            {/* Countdown Timer */}
                            <div className="pt-4 border-t border-yellow-400/20">
                                {isPrizeDelivered ? (
                                    <div className="flex flex-col items-center justify-center py-2 animate-pulse">
                                        <p className="text-sm font-black text-yellow-400 tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            {t("leaderboard.countdown.deliveredTitle")}
                                        </p>
                                        <p className="text-[10px] text-text-secondary text-center">
                                            {t("leaderboard.countdown.deliveredDesc")}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider text-center flex items-center justify-center gap-1.5 mb-3">
                                            <Clock className="w-3.5 h-3.5" /> {t("leaderboard.countdown.endsIn")}
                                        </p>
                                        <div className="flex justify-center gap-2 text-center" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            <div className="bg-black/40 border border-yellow-400/30 rounded px-2 py-1.5 min-w-[50px] shadow-[inset_0_0_10px_rgba(250,204,21,0.05)]">
                                                <p className="text-lg font-bold text-yellow-400 leading-tight">
                                                    {timeLeft.days.toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-[8px] text-text-muted uppercase">{t("leaderboard.countdown.days")}</p>
                                            </div>
                                            <span className="text-yellow-400/50 font-bold self-start mt-2 animate-pulse">:</span>
                                            <div className="bg-black/40 border border-yellow-400/30 rounded px-2 py-1.5 min-w-[50px] shadow-[inset_0_0_10px_rgba(250,204,21,0.05)]">
                                                <p className="text-lg font-bold text-yellow-400 leading-tight">
                                                    {timeLeft.hours.toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-[8px] text-text-muted uppercase">{t("leaderboard.countdown.hours")}</p>
                                            </div>
                                            <span className="text-yellow-400/50 font-bold self-start mt-2 animate-pulse">:</span>
                                            <div className="bg-black/40 border border-yellow-400/30 rounded px-2 py-1.5 min-w-[50px] shadow-[inset_0_0_10px_rgba(250,204,21,0.05)]">
                                                <p className="text-lg font-bold text-yellow-400 leading-tight">
                                                    {timeLeft.minutes.toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-[8px] text-text-muted uppercase">{t("leaderboard.countdown.mins")}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* ===== SHARE CARD OVERLAY ===== */}
                    <AnimatePresence>
                        {isShareCardOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                    onClick={() => setIsShareCardOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-lg bg-[#0B0C10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                                >
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest" style={{ fontFamily: "var(--font-orbitron)" }}>
                                            Presumir Perfil
                                        </h2>
                                        <button onClick={() => setIsShareCardOpen(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors text-text-muted">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        {/* === THE DOWNLOADABLE CARD === */}
                                        <div className="relative mb-6">
                                            <div
                                                ref={shareCardRef}
                                                className="relative w-full overflow-hidden rounded-xl border border-neon-green/30 bg-[#0B0C10]"
                                                style={{ aspectRatio: '1.91 / 1', boxShadow: '0 0 40px rgba(57,255,20,0.1)' }}
                                            >
                                                {/* Background effects */}
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, background: 'radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)' }} />
                                                <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)' }} />

                                                {/* HUD corners */}
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTop: '2px solid rgba(57,255,20,0.3)', borderLeft: '2px solid rgba(57,255,20,0.3)' }} />
                                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottom: '2px solid rgba(57,255,20,0.3)', borderRight: '2px solid rgba(57,255,20,0.3)' }} />

                                                {/* Card Content */}
                                                <div className="relative h-full px-5 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-4 flex flex-col justify-between" style={{ zIndex: 10 }}>
                                                    {/* Top row: Branding + Month */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
                                                                <Trophy className="w-3.5 h-3.5 text-neon-green" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black tracking-[3px] text-neon-green uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>FUNDED SPREAD</p>
                                                                <p className="text-[7px] uppercase tracking-widest text-text-muted leading-none">Global Trading Leaderboard</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[7px] font-bold text-text-muted uppercase tracking-widest">
                                                                {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Avatar + Name + Big Rank */}
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                                                            <div className="w-full h-full rounded-full border-2 border-neon-green/50 p-0.5" style={{ background: '#0B0C10' }}>
                                                                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'rgba(57,255,20,0.1)' }}>
                                                                    {(effectiveMetadata?.avatar_url && !avatarError) ? (
                                                                        <img src={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/proxy-image?url=${encodeURIComponent(effectiveMetadata.avatar_url)}`} alt={displayName} crossOrigin="anonymous" className="w-full h-full object-cover" onError={(e) => {
                                                                            // Si el proxy falla, revertir a la URL original para que al menos se vea en la web
                                                                            if (e.currentTarget.src.includes('/api/proxy-image')) {
                                                                                e.currentTarget.src = effectiveMetadata.avatar_url;
                                                                            }
                                                                        }} />
                                                                    ) : (
                                                                        <span className="text-2xl sm:text-3xl font-black text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>{initials}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Real users don't show verified badge in share card */}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {userCountryCode && (
                                                                    <img src={`https://flagcdn.com/w40/${userCountryCode.toLowerCase()}.png`} alt={userCountryCode} crossOrigin="anonymous" className="w-5 h-3.5 rounded-sm object-cover" />
                                                                )}
                                                                <h3 className="text-xl sm:text-2xl font-black text-text-primary uppercase leading-none" style={{ fontFamily: "var(--font-orbitron)" }}>
                                                                    {displayName}
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-text-muted">
                                                                <div>
                                                                    <p className="text-[8px] uppercase tracking-tight mb-0.5 text-text-muted">Global Rank</p>
                                                                    {(currentUserRank > 0 && currentUserEntry && calculateDisplayProfit(currentUserEntry) > 0) ? (
                                                                        <p className="text-lg sm:text-xl font-black text-text-primary font-mono leading-none">#{currentUserRank}</p>
                                                                    ) : (
                                                                        <div className="mt-[-2px]">
                                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] bg-white/5 border border-white/10">#999+</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="h-6 w-px bg-white/10" />
                                                                <div>
                                                                    <p className="text-[8px] uppercase tracking-tight mb-0.5">Trader Level</p>
                                                                    <div className="mt-0.5">
                                                                        {currentUserEntry ? (
                                                                            <RankBadge rankId={getLeaderboardRankId(currentUserEntry, currentUserRank, currentUserStats)} size="md" />
                                                                        ) : currentUserStats ? (
                                                                            <RankBadge rankId={calculateRank(currentUserStats).id} size="md" />
                                                                        ) : (
                                                                            <RankBadge rankId="novato" size="md" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom: Stats bar */}
                                                    <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-white/5 bg-black/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6">
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-[7px] uppercase tracking-widest text-text-muted mb-0.5">Profit Total</p>
                                                            <p className="text-xs sm:text-sm font-black text-neon-green font-mono leading-none">+${currentUserEntry ? currentUserEntry.total_profit.toLocaleString() : '0'}</p>
                                                        </div>
                                                        <div className="flex flex-col items-center border-x border-white/5">
                                                            <p className="text-[7px] uppercase tracking-widest text-text-muted mb-0.5">Win Rate</p>
                                                            <p className="text-xs sm:text-sm font-black text-text-primary font-mono leading-none">{currentUserEntry?.win_rate || 0}%</p>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-[7px] uppercase tracking-widest text-text-muted mb-0.5">
                                                                FUNDED‑SPREAD.COM
                                                            </p>
                                                            <p className="text-[8px] font-bold text-neon-green uppercase tracking-widest">Únete Ya</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <button
                                                onClick={async () => {
                                                    if (!shareCardRef.current || isDownloading) return;
                                                    setIsDownloading(true);
                                                    try {
                                                        const dataUrl = await toPng(shareCardRef.current, { quality: 1, pixelRatio: 3, backgroundColor: '#0B0C10', cacheBust: true, imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' });
                                                        const link = document.createElement('a');
                                                        link.download = `funded-spread-${displayName.toLowerCase().replace(/\s+/g, '-')}-rank.png`;
                                                        link.href = dataUrl;
                                                        link.click();
                                                    } catch (err) {
                                                        console.error('Error generating share image:', err);
                                                    }
                                                    setIsDownloading(false);
                                                }}
                                                disabled={isDownloading}
                                                className="w-full bg-neon-green hover:bg-neon-green/80 disabled:opacity-50 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[11px] tracking-widest"
                                                style={{ fontFamily: "var(--font-orbitron)" }}
                                            >
                                                <Download className="w-4 h-4" />
                                                {isDownloading ? 'Generando...' : 'Descargar Imagen'}
                                            </button>

                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </motion.div>
    );
}
