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
    Camera
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
    const supabase = createClient();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [account, setAccount] = useState<MT5Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [debugLoading, setDebugLoading] = useState(false);
    const [debugSuccess, setDebugSuccess] = useState(false);

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
                const { data } = await supabase
                    .from("mt5_accounts")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (data) setAccount(data);
            }
            setLoading(false);
        };
        loadData();
    }, [supabase]);

    const handleDebugLink = async () => {
        if (!user) return alert("¡Debes iniciar sesión!");
        setDebugLoading(true);
        try {
            const { error } = await supabase.from("mt5_accounts").insert({
                user_id: user.id,
                mt5_login: "12345678",
                mt5_password: "mock_password_123",
                mt5_server: "FundedSpread-Server",
                initial_balance: 10000,
                current_balance: 10000,
                current_equity: 10000,
                daily_initial_balance: 10000,
                account_status: "active",
                challenge_tier: "starter",
                can_level_up: false,
                is_demo: true,
                max_drawdown_pct: 10,
                daily_drawdown_pct: 5
            });
            if (error) {
                console.error("Debug link error:", error);
                alert("Error: " + error.message);
            } else {
                setDebugSuccess(true);
                alert("✅ ¡Cuenta de prueba MT5 vinculada! Balance: $10,000. Ve al Panel para usar el Panel de Simulación.");
            }
        } catch (err) {
            console.error(err);
            alert("Error inesperado");
        }
        setDebugLoading(false);
    };

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
            
            setUser(data.user);
            setIsEditing(false);
        } catch (err: any) {
            console.error("Error updating profile:", err);
            alert("Error al actualizar: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Trader";
    const initials = displayName.charAt(0).toUpperCase();
    const displayId = user?.id?.slice(0, 8) || "—";
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long" }) : "—";

    // Faking KYC verification status for admin as requested
    const isVerified = user?.email === 'gutierrezalejandro551@gmail.com';

    const challengeTypeLabel = (type: string) => {
        switch (type) {
            case "express_1phase": return "Express 1 Fase";
            case "classic_2phase": return "Clásico 2 Fases";
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
                        <div>
                            <h1
                                className="text-2xl font-bold text-text-primary uppercase flex items-center gap-2"
                                style={{ fontFamily: "var(--font-orbitron)" }}
                            >
                                {displayName}
                                {isVerified && <VerifiedBadge className="w-6 h-6 mt-0.5" />}
                            </h1>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-text-muted text-xs">ID: #{displayId}</span>
                                <span className="text-text-muted text-xs">·</span>
                                <span className="text-text-muted text-xs">Miembro desde {memberSince}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleOpenEdit}
                        className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white/5 border border-border-subtle text-text-secondary hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <Pencil className="w-3.5 h-3.5" /> Editar Perfil
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
                                        <Shield className={`w-4 h-4 ${isVerified ? 'text-neon-green' : isEligibleForKYC ? 'text-neon-cyan' : 'text-text-muted'}`} /> Verificación de Identidad
                                    </h3>
                                    {isVerified ? (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neon-green/10 text-neon-green border border-neon-green/30">
                                            <VerifiedBadge className="w-3 h-3" /> Verificado
                                        </span>
                                    ) : !isEligibleForKYC ? (
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                                            Bloqueado
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 pulse-glow">
                                            Requerido
                                        </span>
                                    )}
                                </div>

                                {isVerified ? (
                                    <p className="text-neon-green/80 text-xs">
                                        Tu identidad ha sido verificada exitosamente. Estás habilitado para procesar retiros en tus cuentas fondeadas.
                                    </p>
                                ) : !isEligibleForKYC ? (
                                    <p className="text-text-muted text-xs">
                                        La verificación KYC se habilitará automáticamente cuando tengas una cuenta real (Fondeada) en positivo, lista para procesar tu primer retiro.
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-text-muted text-xs mb-4">
                                            ¡Felicidades! Eres elegible para retirar. Por favor completa tu verificación de identidad para procesar tu pago.
                                        </p>
                                        <button className="w-full py-2 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 text-xs font-bold uppercase tracking-wider hover:bg-neon-cyan hover:text-bg-primary transition-all">
                                            Iniciar Verificación KYC
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
                                <Bitcoin className="w-4 h-4 text-yellow-400" /> Historial de Retiros
                            </h3>
                        </div>

                        <div className="py-8 text-center">
                            <Bitcoin className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-30" />
                            <p className="text-text-muted text-sm">Sin retiros aún</p>
                            <p className="text-text-muted text-xs mt-1">Los retiros aparecerán aquí una vez que tu cuenta esté fondeada.</p>
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
                            Editar Perfil
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
                                    <Upload className="w-3.5 h-3.5" /> Cambiar Foto
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
                                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neon-green/50 focus:outline-none transition-colors"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Teléfono</label>
                                <input 
                                    type="text" 
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neon-green/50 focus:outline-none transition-colors"
                                    placeholder="Ej. +34 600..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">País</label>
                                <select 
                                    value={editForm.country}
                                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neon-green/50 focus:outline-none transition-colors appearance-none"
                                >
                                    <option value="" disabled>Selecciona tu país</option>
                                    {COUNTRY_LIST.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="Otro">Otro</option>
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

