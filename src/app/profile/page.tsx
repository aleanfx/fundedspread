"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Clock,
    CheckCircle2,
    CreditCard,
    Bitcoin,
    Pencil,
    Zap,
    Bug,
    User,
    AlertCircle,
    X,
    Upload,
    Camera,
    Award,
    Trophy,
    CheckCircle,
    Download,
    WalletCards
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/* ============================================
   ANIMATION VARIANTS
   ============================================ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ============================================
   TYPES
   ============================================ */
interface MT5Account {
    id: string;
    mt5_login: string;
    mt5_server: string;
    initial_balance: number;
    current_balance: number;
    account_status: string;
    challenge_tier: string;
    challenge_type: string;
    max_drawdown_pct: number;
    daily_drawdown_pct: number;
    profit_split_pct: number;
    created_at: string;
}

const COUNTRY_LIST = [
    "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea", "Guinea ecuatorial", "Guinea-Bisáu", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"
];

/* ============================================
   COMPONENTS
   ============================================ */
const TetherIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 339.43 295.27" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M62.15,1.45l-61.89,130a2.52,2.52,0,0,0,.54,2.94L167.95,294.56a2.55,2.55,0,0,0,3.53,0L338.63,134.4a2.52,2.52,0,0,0,.54-2.94l-61.89-130A2.5,2.5,0,0,0,275,0H64.45a2.5,2.5,0,0,0-2.3,1.45h0Z" style={{ fill: "#50af95", fillRule: "evenodd" }} />
        <path d="M191.19,144.8v0c-1.2.09-7.4,0.46-21.23,0.46-11,0-18.81-.33-21.55-0.46v0c-42.51-1.87-74.24-9.27-74.24-18.13s31.73-16.25,74.24-18.15v28.91c2.78,0.2,10.74.67,21.74,0.67,13.2,0,19.81-.55,21-0.66v-28.9c42.42,1.89,74.08,9.29,74.08,18.13s-31.65,16.24-74.08,18.12h0Zm0-39.25V79.68h59.2V40.23H89.21V79.68H148.4v25.86c-48.11,2.21-84.29,11.74-84.29,23.16s36.18,20.94,84.29,23.16v82.9h42.78V151.83c48-2.21,84.12-11.73,84.12-23.14s-36.09-20.93-84.12-23.15h0Zm0,0h0Z" style={{ fill: "#fff", fillRule: "evenodd" }} />
    </svg>
);

const VerifiedBadge = ({ className = "w-5 h-5", checkColor = "#000000", badgeColor = "var(--neon-green)" }) => (
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
   MAIN PROFILE PAGE
   ============================================ */
export default function ProfilePage() {
    const { t, language } = useLanguage();
    const supabase = createClient();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [account, setAccount] = useState<MT5Account | null>(null);
    const [approvedWithdrawals, setApprovedWithdrawals] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    // Edit Profile States
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: "", phone: "", country: "" });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch user data for admin/verified status
                const { data: userDb } = await supabase
                    .from("users")
                    .select("is_admin, is_verified")
                    .eq("id", user.id)
                    .single();
                
                if (userDb) setUserData(userDb);

                const { data } = await supabase
                    .from("mt5_accounts")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (data) setAccount(data);

                // Fetch approved withdrawals for stackable certificates
                const { data: withdrawalsData } = await supabase
                    .from("withdrawal_requests")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("status", "approved")
                    .order("created_at", { ascending: true });

                if (withdrawalsData && withdrawalsData.length > 0) {
                    setApprovedWithdrawals(withdrawalsData);
                }
            }
            setLoading(false);
        };
        loadData();
    }, [supabase]);


    const handleOpenEdit = () => {
        setEditForm({
            full_name: user?.user_metadata?.full_name || "",
            phone: user?.user_metadata?.phone || "",
            country: user?.user_metadata?.country || ""
        });
        setAvatarPreview(user?.user_metadata?.avatar_url || null);
        setAvatarFile(null);
        setAvatarError(false);
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        let finalAvatarUrl = user.user_metadata?.avatar_url;

        try {
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                finalAvatarUrl = publicUrl;
            }

            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    country: editForm.country,
                    avatar_url: finalAvatarUrl
                }
            });

            if (error) throw error;

            // Sync with leaderboard_traders so real users show updated info on the leaderboard
            await supabase.from('leaderboard_traders').update({
                username: editForm.full_name || user?.email?.split('@')[0],
                country_code: editForm.country?.toLowerCase(),
                avatar_url: finalAvatarUrl
            }).eq('user_id', user.id);

            setUser(data.user);
            setIsEditing(false);
        } catch (err: unknown) {
            console.error("Error updating profile:", err);
            alert("Error al actualizar: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsSaving(false);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Trader";
    const initials = displayName.charAt(0).toUpperCase();
    const displayId = user?.id?.slice(0, 8) || "—";
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString(locale, { year: "numeric", month: "long" }) : "—";

    const isVerified = userData?.is_admin || userData?.is_verified || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const hasPhase1Cert = account && (account.account_status === 'phase2_ready' || (account as any).challenge_phase === 2 || account.account_status === 'funded' || account.account_status === 'checkpoint_reached');
    const hasFundedCert = account && (account.account_status === 'funded' || account.account_status === 'checkpoint_reached');
    const hasPayoutCert = approvedWithdrawals.length > 0;
    const hasAnyCert = hasPhase1Cert || hasFundedCert || hasPayoutCert;

    const challengeTypeLabel = (type: string) => {
        switch (type) {
            case "express_1phase": return "1 Fase";
            case "classic_2phase": return "2 Fases";
            case "scaling_x2": return "Escalamiento x2";
            default: return type || "—";
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case "active": return { label: "Activa", color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/30" };
            case "funded": return { label: "Fondeada", color: "text-neon-cyan", bg: "bg-neon-cyan/10", border: "border-neon-cyan/30" };
            case "failed": return { label: "Suspendida", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" };
            case "phase2_ready": return { label: "Fase 2", color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/30" };
            default: return { label: status || "—", color: "text-text-muted", bg: "bg-white/5", border: "border-border-subtle" };
        }
    };

    return (
        <motion.div
            className="p-6 max-w-[1000px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Profile Header */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-border-subtle mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-neon-green/20 border-2 border-neon-green/50 flex items-center justify-center overflow-hidden"
                                style={{ boxShadow: "0 0 20px rgba(57,255,20,0.3)" }}>
                                {user?.user_metadata?.avatar_url && !avatarError ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={() => setAvatarError(true)}
                                    />
                                ) : (
                                    <span
                                        className="text-2xl font-bold text-neon-green"
                                        style={{ fontFamily: "var(--font-orbitron)" }}
                                    >
                                        {initials}
                                    </span>
                                )}
                            </div>
                            {/* Verify Badge on Avatar */}
                            {isVerified && (
                                <div className="absolute bottom-0 right-0 z-10">
                                    <VerifiedBadge className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 min-w-0">
                            <h1
                                className="text-base sm:text-2xl font-bold text-text-primary uppercase flex items-center gap-1.5 sm:gap-2 leading-tight sm:leading-none"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                <span className="truncate">{displayName}</span>
                                {isVerified && <VerifiedBadge className="w-4 h-4 sm:w-6 sm:h-6 shrink-0 mt-[1px]" />}
                            </h1>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-text-muted text-xs">{t("profileData.id")}: #{displayId}</span>
                                <span className="text-text-muted text-xs">·</span>
                                <span className="text-text-muted text-xs">{t("profileData.memberSince")} {memberSince}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleOpenEdit}
                        className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white/5 border border-border-subtle text-text-secondary hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <Pencil className="w-3.5 h-3.5" /> {t("profileData.editProfile")}
                    </button>
                </div>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-6">

                    {/* KYC Verification */}
                    {(() => {
                        const isEligibleForKYC = account && account.account_status === 'funded' && Number(account.current_balance || 0) > Number(account.initial_balance || 0);

                        return (
                            <motion.div variants={itemVariants} className={`glass-card p-5 border ${isVerified ? 'border-neon-green/30' : 'border-border-subtle'} ${(!isEligibleForKYC && !isVerified) ? 'opacity-60' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                                        <Shield className={`w-4 h-4 ${isVerified ? 'text-neon-green' : isEligibleForKYC ? 'text-neon-cyan' : 'text-text-muted'}`} /> {t("profileData.kycTitle")}
                                    </h3>
                                    {isVerified ? (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neon-green/10 text-neon-green border border-neon-green/30">
                                            <VerifiedBadge className="w-3 h-3" /> {t("profileData.verified")}
                                        </span>
                                    ) : !isEligibleForKYC ? (
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                                            {t("profileData.locked")}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 pulse-glow">
                                            {t("profileData.required")}
                                        </span>
                                    )}
                                </div>

                                {isVerified ? (
                                    <p className="text-neon-green/80 text-xs">
                                        {t("profileData.kycVerifiedDesc")}
                                    </p>
                                ) : !isEligibleForKYC ? (
                                    <p className="text-text-muted text-xs">
                                        {t("profileData.kycLockedDesc")}
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-text-muted text-xs mb-4">
                                            {t("profileData.kycRequiredDesc")}
                                        </p>
                                        <button className="w-full py-2 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 text-xs font-bold uppercase tracking-wider hover:bg-neon-cyan hover:text-bg-primary transition-all">
                                            {t("profileData.startKYC")}
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        );
                    })()}
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">

                    {/* Payout History (Real — Empty State) */}
                    <motion.div variants={itemVariants} className="glass-card p-5 border border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                                <TetherIcon className="w-4 h-4 text-[#50AF95]" /> {t("profileData.withdrawalHistory")}
                            </h3>
                        </div>

                        <div className="py-8 text-center">
                            <TetherIcon className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-30" />
                            <p className="text-text-muted text-sm">{t("profileData.noWithdrawals")}</p>
                            <p className="text-text-muted text-xs mt-1">{t("profileData.noWithdrawalsDesc")}</p>
                        </div>
                    </motion.div>

                    {/* Certificados Profesionales */}
                    <motion.div variants={itemVariants} className="glass-card p-5 border border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                                <Award className="w-4 h-4 text-[#FFD700]" /> Certificados Oficiales
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            {hasPhase1Cert && (
                                <a 
                                    href={`/certificate/phase1?data=${btoa(JSON.stringify({ n: displayName, d: new Date().toISOString().split('T')[0] }))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-emerald-500/30 hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>Fase 1 Superada</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1">Certificado Oficial</p>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white/5 rounded-md text-text-muted group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </a>
                            )}
                            
                            {hasFundedCert && (
                                <a 
                                    href={`/certificate/funded?data=${btoa(JSON.stringify({ n: displayName, d: new Date().toISOString().split('T')[0], a: account?.initial_balance || 10000 }))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition-all group shadow-[0_0_15px_rgba(168,85,247,0.02)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                                            <Trophy className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500 uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>Trader Fondeado</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1">Certificado Oficial</p>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white/5 rounded-md text-text-muted group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </a>
                            )}
                            
                            {/* Certificate Payouts (Stackable) */}
                            {approvedWithdrawals.map((withdrawal, idx) => {
                                const payload = { 
                                    n: displayName, 
                                    d: new Date(withdrawal.processed_at || withdrawal.created_at).toISOString().split('T')[0], 
                                    a: withdrawal.user_amount || withdrawal.amount || withdrawal.amount_usdt 
                                };
                                return (
                                <a 
                                    key={withdrawal.id || idx}
                                    href={`/certificate/payout?data=${btoa(JSON.stringify(payload))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-neon-green/30 hover:bg-white/5 transition-all group shadow-[0_0_15px_rgba(57,255,20,0.02)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-neon-green/10 flex items-center justify-center border border-neon-green/20 group-hover:bg-neon-green/20 transition-colors">
                                            <WalletCards className="w-5 h-5 text-neon-green" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>Retiro Exitoso #{idx + 1}</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1">Certificado Oficial • ${payload.a}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white/5 rounded-md text-text-muted group-hover:bg-neon-green/20 group-hover:text-neon-green transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </a>
                                );
                            })}

                            {!hasAnyCert && (
                                <div className="py-8 text-center bg-black/20 rounded-lg border border-white/5">
                                    <Award className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-30" />
                                    <p className="text-text-muted text-sm font-medium">Aún no tienes certificados</p>
                                    <p className="text-text-muted text-xs mt-1">Supera las evaluaciones para desbloquearlos.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card p-6 w-full max-w-md border border-border-subtle rounded-2xl relative"
                    >
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                            {t("profileData.editProfile")}
                        </h2>

                        <div className="space-y-4">
                            {/* Avatar File Input */}
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="relative w-24 h-24 rounded-full bg-neon-green/10 flex items-center justify-center border border-dashed border-neon-green/50 overflow-hidden">
                                    {avatarPreview && !avatarError ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarError(true)}
                                        />
                                    ) : (
                                        <span
                                            className="text-4xl font-bold text-neon-green"
                                            style={{ fontFamily: "var(--font-orbitron)" }}
                                        >
                                            {initials}
                                        </span>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs font-bold px-4 py-2 rounded-full border border-border-subtle text-text-secondary transition-all flex items-center gap-2 uppercase tracking-wide">
                                    <Upload className="w-3.5 h-3.5" /> {t("profileData.changePhoto")}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    alert("La imagen no debe superar los 2MB.");
                                                    return;
                                                }
                                                setAvatarFile(file);
                                                setAvatarPreview(URL.createObjectURL(file));
                                                setAvatarError(false);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Text Inputs */}
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">{t("profileData.fullName")}</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neon-green/50 focus:outline-none transition-colors"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">{t("profileData.phone")}</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neon-green/50 focus:outline-none transition-colors"
                                    placeholder="Ej. +34 600..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">{t("profileData.country")}</label>
                                <select
                                    value={editForm.country}
                                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neon-green/50 focus:outline-none transition-colors appearance-none"
                                >
                                    <option value="" disabled>{t("profileData.selectCountry")}</option>
                                    {COUNTRY_LIST.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="Otro">{t("profileData.other")}</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full mt-4 bg-neon-green text-black font-bold uppercase tracking-wider py-3 rounded-lg hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                            >
                                {isSaving ? (
                                    <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span> Guardando...</>
                                ) : "Guardar Cambios"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

