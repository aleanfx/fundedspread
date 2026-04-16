"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import {
    LayoutDashboard,
    Wallet,
    Trophy,
    LogOut,
    Menu,
    X,
    Home,
    ScrollText,
} from "lucide-react";
import { FundedSpreadLogo } from "@/components/FundedSpreadLogo";
import { createClient, getSafeSession, hasImpersonationCookie } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { RankBadge } from "@/components/RankBadge";
import { calculateRank, UserRankStats } from "@/lib/utils/rankSystem";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { t, language, setLanguage } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [userStats, setUserStats] = useState<UserRankStats | null>(null);
    const [signingOut, setSigningOut] = useState(false);
    const isLoggingOut = useRef(false);
    const [avatarError, setAvatarError] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Easter Egg: 5 rapid clicks on logo → admin panel
    const clickTimestamps = useRef<number[]>([]);
    const CLICKS_REQUIRED = 5;
    const TIME_WINDOW_MS = 3000;

    const handleLogoClick = useCallback((e: React.MouseEvent) => {
        const isAdmin = userStats?.isAdmin || user?.email === ADMIN_EMAIL;

        if (!isAdmin) {
            router.push("/");
            return;
        }

        const now = Date.now();
        clickTimestamps.current = [
            ...clickTimestamps.current.filter(ts => now - ts < TIME_WINDOW_MS),
            now,
        ];

        if (clickTimestamps.current.length >= CLICKS_REQUIRED) {
            e.preventDefault();
            clickTimestamps.current = [];
            router.push("/admin");
        }
    }, [user, userStats, router]);

    const navItems = [
        { href: "/", label: t("navbar.home") || "Inicio", icon: Home },
        { href: "/dashboard", label: t("navbar.panel") || "Panel", icon: LayoutDashboard },
        { href: "/checkout", label: t("navbar.challenges") || "Retos", icon: Wallet },
        { href: "/leaderboard", label: t("navbar.leaderboard") || "Clasificación", icon: Trophy },
        { href: "/rules", label: t("navbar.rules") || "Reglas", icon: ScrollText },
    ];

    // Close mobile menu when pathname changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const fetchUser = async (force = false) => {
            if (!force && user && userStats) return; // Skip if already loaded
            try {
                // Priority 1: Check for impersonation — only if admin cookie exists
                if (hasImpersonationCookie()) {
                    try {
                        const impRes = await fetch("/api/admin/impersonate/data");
                        if (impRes.ok) {
                            const data = await impRes.json();
                            if (data.userData && data.user) {
                                console.log("Sidebar: Found impersonation session");
                                const profile = data.userData;
                                const authUser = data.user;
                                const accs = data.accountsData;

                                setUser({
                                    id: profile.id,
                                    email: profile.email,
                                    user_metadata: {
                                        username: profile.username || authUser?.user_metadata?.username,
                                        full_name: profile.username || authUser?.user_metadata?.full_name || profile.full_name,
                                        avatar_url: profile.avatar_url || authUser?.user_metadata?.avatar_url
                                    }
                                } as any);

                                setUserStats({
                                    isFunded: (profile.is_funded === true) || accs?.[0]?.account_status === 'funded',
                                    phasesCompleted: profile.phases_passed || 0,
                                    totalWithdrawals: profile.total_withdrawals || 0,
                                    topThreeFinishes: profile.top_three_finishes || 0,
                                    topTenFinishes: profile.top_ten_finishes || 0,
                                    isAdmin: false,
                                    isVerified: profile.is_verified,
                                    highestRank: profile.highest_rank,
                                    isRankLocked: profile.is_rank_locked
                                });
                                return true;
                            }
                        }
                    } catch (e) {
                        console.error("Sidebar: impersonation check failed", e);
                    }
                }

                // Priority 2: Normal Auth User
                const { data: { session } } = await getSafeSession();
                const authUser = session?.user;

                if (authUser) {
                    setUser(authUser);

                    // Parallelize record fetching for speed
                    const [userDbRes, accountsDbRes] = await Promise.all([
                        supabase.from('users').select('full_name, username, avatar_url, email, total_withdrawals, top_three_finishes, top_ten_finishes, is_admin, is_verified, highest_rank, is_rank_locked, phases_passed, is_funded').eq('id', authUser.id).single(),
                        supabase.from('mt5_accounts').select('account_status').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(1)
                    ]);

                    const ud = userDbRes.data;
                    const accs = accountsDbRes.data;

                    if (ud) {
                        // Enrich user object with DB data so displayName works even if user_metadata is sparse
                        const enrichedUser = {
                            ...authUser,
                            email: authUser.email || ud.email,
                            user_metadata: {
                                ...authUser.user_metadata,
                                full_name: authUser.user_metadata?.full_name || ud.full_name || ud.username,
                                username: authUser.user_metadata?.username || ud.username || ud.full_name,
                                avatar_url: authUser.user_metadata?.avatar_url || ud.avatar_url,
                            }
                        };
                        setUser(enrichedUser as any);

                        setUserStats({
                            isFunded: (ud.is_funded === true) || accs?.some((a: any) => a.account_status === 'funded') || false,
                            phasesCompleted: ud.phases_passed || 0,
                            totalWithdrawals: ud.total_withdrawals || 0,
                            topThreeFinishes: ud.top_three_finishes || 0,
                            topTenFinishes: ud.top_ten_finishes || 0,
                            isAdmin: ud.is_admin || false,
                            isVerified: ud.is_verified || false,
                            highestRank: ud.highest_rank as any || 'unranked',
                            isRankLocked: ud.is_rank_locked === true
                        });
                    }
                } else {
                    setUser(null);
                    setUserStats(null);
                }
            } catch (err) {
                console.error("Sidebar: Critical error in fetchUser", err);
            }
            return false;
        };


        fetchUser();

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            if (isLoggingOut.current) return;
            await fetchUser(true); // Force refresh on auth change
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase]); // Only run on mount — auth changes handled by onAuthStateChange

    const handleSignOut = async () => {
        if (isLoggingOut.current) return;

        isLoggingOut.current = true;
        setSigningOut(true);

        // Immediate cookie cleanup on client side for robustness
        try {
            document.cookie = "impersonate_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "impersonate_target_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } catch (e) { /* ignore */ }

        // Start all cleanup tasks IN PARALLEL
        const cleanupTasks = [
            fetch("/api/admin/impersonate", {
                method: "POST",
                body: JSON.stringify({ action: "stop" })
            }).catch(() => { }),
            supabase.auth.signOut().catch(() => { })
        ];

        // Safety net: Force redirect in 800ms even if network tasks are slow
        const safetyTimeout = setTimeout(() => {
            window.location.href = "/";
        }, 800);

        try {
            // Wait for both, but the timeout will win if they take too long
            await Promise.all(cleanupTasks);
            clearTimeout(safetyTimeout);
            window.location.href = "/";
        } catch (err) {
            console.error("Sign out process error:", err);
            clearTimeout(safetyTimeout);
            window.location.href = "/";
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split("@")[0] || "Trader";
    const displayEmail = user?.email || "";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#0D0D0D]/90 backdrop-blur-xl border border-white/10 text-white shadow-lg shadow-black/50"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`fixed md:sticky top-0 left-0 h-[100dvh] w-[240px] bg-bg-sidebar border-r border-border-subtle flex flex-col z-[100] transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Logo — Easter Egg target */}
                <div className="p-6 pb-4">
                    <div
                        onClick={handleLogoClick}
                        className="flex items-center gap-3 group cursor-pointer select-none"
                    >
                        <motion.div
                            className="flex items-center justify-center mr-1.5"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FundedSpreadLogo className="w-8 h-8 text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]" />
                        </motion.div>
                        <div>
                            <h1
                                className="text-xl font-bold tracking-wider text-text-primary"
                                style={{ fontFamily: "var(--font-rajdhani)" }}
                            >
                                FUNDED SPREAD
                            </h1>
                            <p className="text-[10px] uppercase tracking-[3px] text-text-muted">
                                Prop Firm
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                                        ? "bg-neon-green/10 text-neon-green shadow-[inset_4px_0_0_rgba(57,255,20,1)]"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                        }`}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-neon-green rounded-r-full shadow-[0_0_8px_rgba(57,255,20,0.8)]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    <Icon className="w-[18px] h-[18px]" />
                                    <span style={{ fontFamily: "var(--font-rajdhani)" }}>
                                        {item.label}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sistema */}
                <div className="px-3 pb-2 space-y-1">
                    <p className="px-4 py-2 text-[10px] uppercase tracking-[2px] text-text-muted">
                        {t("sidebar.system") || "Sistema"}
                    </p>

                    {/* Idioma */}
                    <button
                        onClick={() => setLanguage(language === "es" ? "en" : "es")}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span style={{ fontFamily: "var(--font-rajdhani)" }}>
                                {t("profileDropdown.language")}
                            </span>
                        </div>
                        <div className="flex bg-black/50 rounded p-0.5 border border-white/10">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === "es" ? "bg-neon-green text-black" : "text-text-muted"}`}>ES</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === "en" ? "bg-neon-green text-black" : "text-text-muted"}`}>EN</span>
                        </div>
                    </button>

                    {/* Logout */}
                    <motion.button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                        whileHover={{ x: 4 }}
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        <span style={{ fontFamily: "var(--font-rajdhani)" }}>
                            {signingOut ? t("profileDropdown.signingOut") : t("profileDropdown.logout")}
                        </span>
                    </motion.button>
                </div>

                {/* User profile */}
                <Link href="/profile" className="block p-4 border-t border-border-subtle hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 w-9 h-9">
                            <div className="w-full h-full rounded-full bg-neon-green/20 border border-neon-green/40 flex items-center justify-center overflow-hidden">
                                {user?.user_metadata?.avatar_url && !avatarError ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                        crossOrigin="anonymous"
                                        loading="eager"
                                        onError={() => setAvatarError(true)}
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>{initials}</span>
                                )}
                            </div>
                            {(userStats?.isVerified || userStats?.isAdmin || user?.email === ADMIN_EMAIL) && (
                                <div title={t("leaderboard.verified") || "Verificado"} className="absolute -bottom-[1px] -right-[1px] z-10 inline-flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] drop-shadow-[0_2px_4px_rgba(57,255,20,0.3)]">
                                        <path
                                            d="M12 2L14.8 4.6L18.5 4.3L19.5 7.8L22.6 9.8L21.1 13.2L22.6 16.6L19.5 18.6L18.5 22.1L14.8 21.8L12 24.4L9.2 21.8L5.5 22.1L4.5 18.6L1.4 16.6L2.9 13.2L1.4 9.8L4.5 7.8L5.5 4.3L9.2 4.6L12 2Z"
                                            fill="var(--neon-green)"
                                        />
                                        <path
                                            d="M7.5 13.5L10.5 16.5L16.5 9.5"
                                            stroke="#000000"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3
                                className="text-sm font-bold text-text-primary truncate uppercase flex items-center gap-2"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                {displayName}
                                {userStats?.isRankLocked && userStats?.highestRank && userStats.highestRank !== 'unranked' && (
                                    <RankBadge rankId={userStats.highestRank} size="xs" showName={false} className="mb-0.5" />
                                )}
                            </h3>
                            <p className="text-[11px] text-text-muted truncate">
                                {displayEmail}
                            </p>
                        </div>
                    </div>
                </Link>
            </aside>
        </>
    );
}
