"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Shield, Target, CalendarCheck, TrendingDown, Sparkles } from "lucide-react";

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

interface CompletedInfo {
  subtitle: string;
  requirement: string;
}

function ObjectiveCard({
  icon: Icon,
  title,
  status,
  progressPct,
  rows,
  accentColor,
  completedInfo,
}: {
  icon: React.ElementType;
  title: string;
  status: "passed" | "ongoing" | "failed";
  progressPct: number;
  rows: { label: string; value: string; highlight?: boolean }[];
  accentColor: string;
  completedInfo?: CompletedInfo;
}) {
  const statusMap = {
    passed: { label: "Completado", dotColor: "bg-emerald-400", textColor: "text-emerald-400", glowColor: "shadow-[0_0_8px_rgba(52,211,153,0.4)]" },
    ongoing: { label: "En Curso", dotColor: "bg-blue-400", textColor: "text-blue-400", glowColor: "shadow-[0_0_8px_rgba(96,165,250,0.4)]" },
    failed: { label: "Violación", dotColor: "bg-red-400", textColor: "text-red-400", glowColor: "shadow-[0_0_8px_rgba(248,113,113,0.4)]" },
  };
  const s = statusMap[status];
  const clampedPct = Math.max(0, Math.min(100, progressPct));
  const isCompleted = status === "passed" && completedInfo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-[#0d1424]/80 border rounded-2xl p-5 overflow-hidden group transition-all duration-300 ${
        isCompleted
          ? "border-emerald-400/20 hover:border-emerald-400/30"
          : "border-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      {/* Subtle top glow based on status */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full ${status === "passed" ? "bg-emerald-400/60" : status === "failed" ? "bg-red-400/60" : "bg-blue-400/40"}`} />

      {/* Completed ambient glow */}
      {isCompleted && (
        <>
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-400/[0.06] blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-400/[0.04] blur-[40px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}
               style={{
                 background: isCompleted ? "rgba(52,211,153,0.1)" : `${accentColor}15`,
                 border: isCompleted ? "1px solid rgba(52,211,153,0.25)" : `1px solid ${accentColor}30`
               }}>
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Icon className="w-4 h-4" style={{ color: accentColor }} />
            )}
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

      {/* Data rows or completed celebration state */}
      {isCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative"
        >
          {/* Completed celebration card */}
          <div className="flex flex-col items-center gap-2.5 py-2">
            {/* Animated checkmark ring */}
            <motion.div
              className="relative w-11 h-11 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.6 }}
            >
              <div className="absolute inset-0 rounded-full bg-emerald-400/10 border border-emerald-400/20" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <Sparkles className="w-5 h-5 text-emerald-400 relative z-10" />
            </motion.div>

            {/* Requirement tag */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/35 uppercase tracking-wider font-medium">
                {completedInfo.subtitle}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/15">
                {completedInfo.requirement}
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
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
      )}
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
  const daysProgress = Math.min((tradingDaysCount / minTradingDays) * 100, 100);
  const profitProgress = Math.min((currentProfitPct / profitTargetPct) * 100, 100);

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
          completedInfo={{
            subtitle: "Requeridos",
            requirement: `${minTradingDays} Días`,
          }}
          rows={[
            { label: "Mínimo Requerido", value: `${minTradingDays} Días` },
            { label: "Días Operados", value: `${tradingDaysCount} / ${minTradingDays}`, highlight: true },
          ]}
        />
        {!isFunded && (
          <ObjectiveCard
            icon={Target}
            title="Objetivo de Ganancia"
            status={profitStatus}
            progressPct={profitProgress}
            accentColor="#39ff14"
            completedInfo={{
              subtitle: "Objetivo",
              requirement: `$${profitTarget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            }}
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
