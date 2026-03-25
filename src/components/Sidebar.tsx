"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Wallet,
    Trophy,
    LogOut,
} from "lucide-react";
import { FundedSpreadLogo } from "@/components/FundedSpreadLogo";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/checkout", label: "Retos", icon: Wallet },
    { href: "/leaderboard", label: "Clasificación", icon: Trophy },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [signingOut, setSigningOut] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        setSigningOut(true);
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const displayName = user?.user_metadata?.full_name
        || user?.email?.split("@")[0]
        || "Trader";
    const displayEmail = user?.email || "";
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <aside className="w-[240px] min-h-screen bg-bg-sidebar border-r border-border-subtle flex flex-col sticky top-0">
            {/* Logo */}
            <div className="p-6 pb-4">
                <Link href="/dashboard" className="flex items-center gap-3 group">
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
                </Link>
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
            <div className="px-3 pb-2">
                <p className="px-4 py-2 text-[10px] uppercase tracking-[2px] text-text-muted">
                    Sistema
                </p>

                {/* Logout */}
                <motion.button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                    whileHover={{ x: 4 }}
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    <span style={{ fontFamily: "var(--font-rajdhani)" }}>
                        {signingOut ? "Cerrando..." : "Cerrar Sesión"}
                    </span>
                </motion.button>
            </div>

            {/* User profile */}
            <Link href="/profile" className="block p-4 border-t border-border-subtle hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neon-green/20 border border-neon-green/40 flex items-center justify-center overflow-hidden">
                        {user?.user_metadata?.avatar_url && !avatarError ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <span className="text-sm font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>{initials}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
                            {displayName}
                        </p>
                        <p className="text-[11px] text-text-muted truncate">
                            {displayEmail}
                        </p>
                    </div>
                </div>
            </Link>
        </aside>
    );
}
