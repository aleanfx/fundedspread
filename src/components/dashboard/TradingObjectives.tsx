"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Shield, Target, CalendarCheck, TrendingDown } from "lucide-react";

interface TradingObjectivesProps {
  dailyDrawdownPct: number;
  maxDrawdownPct: number;
  currentDailyDD: number;
  currentMaxDD: number;
  currentDailyLoss: number;
  maxDailyLossLimit: number;
  currentMaxLoss: number;
  maxLossLimit: number;
  tradingDaysCount: number;
  minTradingDays: number;
  profitTargetPct: number;
  currentProfitPct: number;
  currentProfit: number;
  profitTarget: number;
  isFunded: boolean;
}

function ObjectiveCard({
  icon: Icon,
  title,
  status,
  progressPct,
  rows,
  accentColor,
}: {
  icon: React.ElementType;
  title: string;
  status: "passed" | "ongoing" | "failed";
  progressPct: number;
  rows: { label: string; value: string; highlight?: boolean }[];
  accentColor: string;
}) {
  const statusMap = {
    passed: { label: "Completado", dotColor: "bg-emerald-400", textColor: "text-emerald-400", glowColor: "shadow-[0_0_8px_rgba(52,211,153,0.4)]" },
    ongoing: { label: "En Curso", dotColor: "bg-blue-400", textColor: "text-blue-400", glowColor: "shadow-[0_0_8px_rgba(96,165,250,0.4)]" },
    failed: { label: "Violación", dotColor: "bg-red-400", textColor: "text-red-400", glowColor: "shadow-[0_0_8px_rgba(248,113,113,0.4)]" },
  };
  const s = statusMap[status];
  const clampedPct = Math.max(0, Math.min(100, progressPct));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-[#0d1424]/80 border border-white/[0.06] rounded-2xl p-5 overflow-hidden group hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Subtle top glow based on status */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full ${status === "passed" ? "bg-emerald-400/60" : status === "failed" ? "bg-red-400/60" : "bg-blue-400/40"}`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}
               style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <span className="text-[13px] font-semibold text-white/90">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${s.dotColor} ${s.glowColor}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${s.textColor}`}>{s.label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.04] rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: status === "passed" ? "#34d399" : status === "failed" ? "#f87171" : `linear-gradient(90deg, ${accentColor}80, ${accentColor})` }}
          initial={{ width: "0%" }}
          animate={{ width: `${clampedPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </div>

      {/* Data rows */}
      <div className="space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-[12px] text-white/40">{row.label}</span>
            <span className={`text-[13px] font-mono font-semibold ${row.highlight ? s.textColor : "text-white/80"}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function TradingObjectives({
  dailyDrawdownPct,
  maxDrawdownPct,
  currentDailyDD,
  currentMaxDD,
  currentDailyLoss,
  maxDailyLossLimit,
  currentMaxLoss,
  maxLossLimit,
  tradingDaysCount,
  minTradingDays,
  profitTargetPct,
  currentProfitPct,
  currentProfit,
  profitTarget,
  isFunded,
}: TradingObjectivesProps) {
  const dailyDDStatus = currentDailyDD >= dailyDrawdownPct ? "failed" : "ongoing";
  const maxDDStatus = currentMaxDD >= maxDrawdownPct ? "failed" : "ongoing";
  const daysStatus = tradingDaysCount >= minTradingDays ? "passed" : "ongoing";
  const profitStatus = currentProfitPct >= profitTargetPct ? "passed" : "ongoing";

  const dailyProgress = (currentDailyDD / dailyDrawdownPct) * 100;
  const maxProgress = (currentMaxDD / maxDrawdownPct) * 100;
  const daysProgress = (tradingDaysCount / minTradingDays) * 100;
  const profitProgress = (currentProfitPct / profitTargetPct) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <Shield className="w-4 h-4 md:w-5 md:h-5 text-neon-blue" />
        <h3 className="text-[10px] md:text-sm lg:text-base font-bold text-white/60 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-rajdhani)" }}>
          Objetivos de Trading
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFunded ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-3`}>
        <ObjectiveCard
          icon={AlertTriangle}
          title="Límite Pérdida Diaria"
          status={dailyDDStatus}
          progressPct={dailyProgress}
          accentColor="#f59e0b"
          rows={[
            { label: "Límite Máximo Diario", value: `$${maxDailyLossLimit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: "Pérdida Hoy", value: `$${currentDailyLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
          ]}
        />
        <ObjectiveCard
          icon={TrendingDown}
          title="Límite Pérdida Máxima"
          status={maxDDStatus}
          progressPct={maxProgress}
          accentColor="#ef4444"
          rows={[
            { label: "Límite Máximo", value: `$${maxLossLimit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: "Pérdida Acumulada", value: `$${currentMaxLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
          ]}
        />
        <ObjectiveCard
          icon={CalendarCheck}
          title="Días Mínimos de Trading"
          status={daysStatus}
          progressPct={daysProgress}
          accentColor="#22d3ee"
          rows={[
            { label: "Mínimo Requerido", value: `${minTradingDays} Días` },
            { label: "Resultado Actual", value: `${tradingDaysCount}`, highlight: true },
          ]}
        />
        {!isFunded && (
          <ObjectiveCard
            icon={Target}
            title="Objetivo de Ganancia"
            status={profitStatus}
            progressPct={profitProgress}
            accentColor="#39ff14"
            rows={[
              { label: "Objetivo Mínimo", value: `$${profitTarget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: "Resultado Actual", value: `$${currentProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
            ]}
          />
        )}
      </div>
    </motion.div>
  );
}
