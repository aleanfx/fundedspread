"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    Target,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
} from "lucide-react";
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
   MOCK DATA
   ============================================ */
const radarAttributes = [
    { label: "Disciplina", value: 82 },
    { label: "Gest. Riesgo", value: 91 },
    { label: "Consistencia", value: 68 },
    { label: "Timing", value: 75 },
    { label: "Psicología", value: 59 },
];

const equityData = [
    { week: "Sem 1", value: 25000 },
    { week: "Sem 2", value: 28400 },
    { week: "Sem 3", value: 26800 },
    { week: "Sem 4", value: 31200 },
    { week: "Sem 5", value: 34100 },
    { week: "Sem 6", value: 32500 },
    { week: "Actual", value: 38750 },
];

const winLossData = [
    { day: "Lun", wins: 8, losses: 3 },
    { day: "Mar", wins: 5, losses: 4 },
    { day: "Mié", wins: 9, losses: 2 },
    { day: "Jue", wins: 6, losses: 5 },
    { day: "Vie", wins: 7, losses: 3 },
];

const recentSessions = [
    { date: "2024-10-25", pairs: "EURUSD", pnl: 1250, winRate: 80, notes: "Scalp de Noticias" },
    { date: "2024-10-24", pairs: "GBPUSD", pnl: -450, winRate: 40, notes: "Mercado agitado" },
    { date: "2024-10-23", pairs: "XAUUSD", pnl: 5200, winRate: 92, notes: "Siguiendo Tendencia" },
    { date: "2024-10-22", pairs: "NAS100", pnl: -800, winRate: 37, notes: "Rango apertura" },
    { date: "2024-10-21", pairs: "USDJPY", pnl: 1890, winRate: 75, notes: "Ruptura" },
];

/* ============================================
   RADAR CHART (SVG)
   ============================================ */
function RadarChart({ attributes }: { attributes: typeof radarAttributes }) {
    const cx = 120, cy = 120, r = 85;
    const sides = attributes.length;
    const angleStep = (2 * Math.PI) / sides;

    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const dist = (value / 100) * r;
        return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };

    // Grid rings
    const rings = [0.25, 0.5, 0.75, 1];

    // Data polygon
    const dataPoints = attributes.map((a, i) => getPoint(i, a.value));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    return (
        <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
            {/* Grid rings */}
            {rings.map((scale) => {
                const pts = Array.from({ length: sides }, (_, i) => getPoint(i, scale * 100));
                const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={scale} d={path} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />;
            })}

            {/* Axis lines */}
            {attributes.map((_, i) => {
                const p = getPoint(i, 100);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />;
            })}

            {/* Data fill */}
            <motion.path
                d={dataPath}
                fill="rgba(168,85,247,0.2)"
                stroke="#a855f7"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Data dots */}
            {dataPoints.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#a855f7"
                    stroke="#050a14"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                />
            ))}

            {/* Labels */}
            {attributes.map((a, i) => {
                const p = getPoint(i, 120);
                return (
                    <text
                        key={i}
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-text-muted text-[9px]"
                        style={{ fontFamily: "var(--font-rajdhani)" }}
                    >
                        {a.label}
                    </text>
                );
            })}
        </svg>
    );
}

/* ============================================
   EQUITY CURVE (SVG)
   ============================================ */
function EquityCurve({ data }: { data: typeof equityData }) {
    const w = 500, h = 180, pad = 30;
    const minV = Math.min(...data.map((d) => d.value)) * 0.95;
    const maxV = Math.max(...data.map((d) => d.value)) * 1.02;

    const points = data.map((d, i) => ({
        x: pad + (i / (data.length - 1)) * (w - pad * 2),
        y: h - pad - ((d.value - minV) / (maxV - minV)) * (h - pad * 2),
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = linePath + ` L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((frac) => {
                const y = h - pad - frac * (h - pad * 2);
                return (
                    <line key={frac} x1={pad} y1={y} x2={w - pad} y2={y} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
                );
            })}

            {/* Area fill */}
            <motion.path
                d={areaPath}
                fill="url(#equityGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
            />

            {/* Line */}
            <motion.path
                d={linePath}
                fill="none"
                stroke="#39ff14"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(57,255,20,0.4))" }}
            />

            {/* Dots */}
            {points.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#39ff14"
                    stroke="#050a14"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                />
            ))}

            {/* Week labels */}
            {data.map((d, i) => (
                <text
                    key={i}
                    x={points[i].x}
                    y={h - 8}
                    textAnchor="middle"
                    className="fill-text-muted text-[9px]"
                >
                    {d.week.replace("Sem ", "S")}
                </text>
            ))}

            <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(57,255,20,0.15)" />
                    <stop offset="100%" stopColor="rgba(57,255,20,0)" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ============================================
   MAIN ANALYTICS PAGE
   ============================================ */
export default function AnalyticsPage() {
    const { t } = useLanguage();
    const totalEquity = equityData[equityData.length - 1].value;

    return (
        <motion.div
            className="p-6 max-w-[1400px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6 flex items-center justify-between">
                <div>
                    <h1
                        className="text-3xl font-bold text-text-primary"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                        {t("analytics.summaryTitle")}
                    </h1>
                    <p className="text-text-muted text-sm mt-1" style={{ fontFamily: "var(--font-rajdhani)" }}>
                        Sesión ID: <span className="text-neon-green">WSS-X24</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 border border-border-subtle text-text-secondary hover:bg-white/10 transition-all">
                        {t("analytics.last30Days")}
                    </button>
                    <button className="px-4 py-2 rounded-lg text-xs font-medium bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 transition-all flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {t("analytics.exportData")}
                    </button>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Win Rate */}
                <div className="glass-card p-5 border border-border-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-text-muted text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("analytics.winRate")}</p>
                        <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-neon-green" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>68.5%</p>
                    <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-neon-green" />
                        <span className="text-neon-green text-xs">+2.4% vs semana pasada</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-neon-green"
                            initial={{ width: 0 }}
                            animate={{ width: "68.5%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>

                {/* Profit Factor */}
                <div className="glass-card p-5 border border-border-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-text-muted text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("analytics.profitFactor")}</p>
                        <div className="w-8 h-8 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-neon-blue" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>2.14</p>
                    <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-neon-green" />
                        <span className="text-neon-green text-xs">+0.12 mejora</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-neon-blue"
                            initial={{ width: 0 }}
                            animate={{ width: "71%" }}
                            transition={{ duration: 1, delay: 0.6 }}
                        />
                    </div>
                </div>

                {/* Avg RRR */}
                <div className="glass-card p-5 border border-border-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-text-muted text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("analytics.avgRrr")}</p>
                        <div className="w-8 h-8 rounded-lg bg-neon-purple/10 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-neon-purple" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>1:1.8</p>
                    <p className="text-xs text-neon-green mt-2">Rango Óptimo</p>
                    <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full w-3/5 bg-gradient-to-r from-red-500 via-yellow-400 to-neon-green" />
                    </div>
                </div>

                {/* Total Trades */}
                <div className="glass-card p-5 border border-border-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-text-muted text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("analytics.totalTrades")}</p>
                        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-neon-cyan" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>347</p>
                    <p className="text-xs text-text-muted mt-2">
                        <span className="text-neon-green">236 G</span> / <span className="text-red-400">111 P</span>
                    </p>
                    <div className="mt-3 h-1.5 rounded-full bg-red-500/20 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-neon-green"
                            initial={{ width: 0 }}
                            animate={{ width: "68%" }}
                            transition={{ duration: 1, delay: 0.8 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Equity Curve */}
                <div className="lg:col-span-2 glass-card p-5 border border-border-subtle">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
                                {t("analytics.equityCurve")}
                            </h3>
                            <p className="text-xl font-bold text-neon-green mt-1" style={{ fontFamily: "var(--font-orbitron)" }}>
                                ${totalEquity.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            {["1M", "6M", "YTD"].map((f, i) => (
                                <button
                                    key={f}
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${i === 0
                                        ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                                        : "text-text-muted hover:text-text-secondary"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <EquityCurve data={equityData} />
                </div>

                {/* Trader DNA Radar */}
                <div className="glass-card p-5 border border-border-subtle">
                    <h3 className="text-sm font-bold text-text-primary mb-1" style={{ fontFamily: "var(--font-orbitron)" }}>
                        {t("analytics.traderDna")}
                    </h3>
                    <p className="text-[10px] text-neon-purple uppercase tracking-wider mb-3">Top 8% Rendimiento</p>
                    <RadarChart attributes={radarAttributes} />
                    <div className="mt-3 space-y-1.5">
                        {radarAttributes.map((a) => (
                            <div key={a.label} className="flex items-center justify-between text-xs">
                                <span className="text-text-muted">{a.label}</span>
                                <span className={`font-bold ${a.value >= 80 ? "text-neon-green" : a.value >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                    {a.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Bottom Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Win/Loss Distribution */}
                <div className="glass-card p-5 border border-border-subtle">
                    <h3 className="text-sm font-bold text-text-primary mb-4" style={{ fontFamily: "var(--font-orbitron)" }}>
                        {t("analytics.winLossDist")}
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-[140px]">
                        {winLossData.map((d, i) => {
                            const maxVal = Math.max(...winLossData.map((x) => Math.max(x.wins, x.losses)));
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex gap-0.5 items-end" style={{ height: "110px" }}>
                                        <motion.div
                                            className="flex-1 rounded-t bg-neon-green/70"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(d.wins / maxVal) * 100}%` }}
                                            transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                                        />
                                        <motion.div
                                            className="flex-1 rounded-t bg-red-500/70"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(d.losses / maxVal) * 100}%` }}
                                            transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-text-muted">{d.day}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-4 mt-3 justify-center">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-neon-green/70" />
                            <span className="text-[10px] text-text-muted">Ganadas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/70" />
                            <span className="text-[10px] text-text-muted">Perdidas</span>
                        </div>
                    </div>
                </div>

                {/* Recent Trading Sessions */}
                <div className="lg:col-span-2 glass-card p-5 border border-border-subtle">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
                            {t("analytics.recentSessions")}
                        </h3>
                        <button className="text-neon-green text-[10px] font-bold uppercase tracking-wider hover:text-neon-green/80 transition-colors">
                            Ver Todas
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-text-muted text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>
                                    <th className="text-left pb-3 font-medium">Fecha</th>
                                    <th className="text-left pb-3 font-medium">Pares</th>
                                    <th className="text-right pb-3 font-medium">P&L</th>
                                    <th className="text-right pb-3 font-medium">Tasa Éxito</th>
                                    <th className="text-right pb-3 font-medium">Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSessions.map((s, i) => (
                                    <motion.tr
                                        key={i}
                                        className="border-t border-border-subtle/50 hover:bg-white/[0.02] transition-colors"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <td className="py-3 text-text-secondary font-mono text-xs">{s.date}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                                {s.pairs}
                                            </span>
                                        </td>
                                        <td className={`py-3 text-right font-bold font-mono text-sm ${s.pnl >= 0 ? "text-neon-green" : "text-red-400"}`}>
                                            {s.pnl >= 0 ? "+" : ""}${Math.abs(s.pnl).toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${s.winRate >= 60 ? "bg-neon-green" : "bg-red-400"}`}
                                                        style={{ width: `${s.winRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-text-secondary text-xs">{s.winRate}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-text-muted text-xs">{s.notes}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
