"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface DailyPnL {
  day: number;
  date: string;
  pnlPct: number;
  cumPnlPct: number;
  balance: number;
}

interface PnLChartProps {
  dailyData: DailyPnL[];
  initialBalance: number;
  profitTargetPct: number;
  maxDrawdownPct: number;
}

// Catmull-Rom to Bezier conversion for smooth curves
function catmullRomToBezier(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  const tension = 0.3;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export default function PnLChart({ dailyData, initialBalance, profitTargetPct, maxDrawdownPct }: PnLChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const w = 740;
  const h = 380;
  const pt = 45, pb = 45, pl = 60, pr = 30;
  const cw = w - pl - pr;
  const ch = h - pt - pb;

  const { points, zeroY, targetY, ddY, linePath, areaPath, rangeMin, rangeMax } = useMemo(() => {
    if (dailyData.length === 0) return { points: [], zeroY: h / 2, targetY: 0, ddY: h, linePath: "", areaPath: "", rangeMin: -10, rangeMax: 10 };

    const cumVals = dailyData.map(d => d.cumPnlPct);
    const dMin = Math.min(...cumVals, 0);
    const dMax = Math.max(...cumVals, 0);
    const rMin = Math.min(dMin, -maxDrawdownPct) - 2;
    const rMax = Math.max(dMax, profitTargetPct) + 2;
    const range = rMax - rMin || 1;

    const pts = dailyData.map((d, i) => ({
      x: pl + (i / Math.max(1, dailyData.length - 1)) * cw,
      y: pt + ch - ((d.cumPnlPct - rMin) / range) * ch,
      ...d,
    }));

    const zy = pt + ch - ((0 - rMin) / range) * ch;
    const ty = pt + ch - ((profitTargetPct - rMin) / range) * ch;
    const dy = pt + ch - ((-maxDrawdownPct - rMin) / range) * ch;

    const smoothPath = catmullRomToBezier(pts);
    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const area = `${smoothPath} L ${lastPt.x} ${zy} L ${firstPt.x} ${zy} Z`;

    return { points: pts, zeroY: zy, targetY: ty, ddY: dy, linePath: smoothPath, areaPath: area, rangeMin: rMin, rangeMax: rMax };
  }, [dailyData, profitTargetPct, maxDrawdownPct, cw, ch]);

  const isPositive = points.length > 0 && points[points.length - 1].cumPnlPct >= 0;
  const hp = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#0d1424]/80 border border-white/[0.06] rounded-2xl p-5 overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className={`absolute -top-20 right-10 w-60 h-60 ${isPositive ? "bg-emerald-500/[0.03]" : "bg-red-500/[0.03]"} blur-[100px] rounded-full pointer-events-none`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div>
          <h3 className="text-[10px] md:text-sm lg:text-base font-bold text-white/60 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-rajdhani)" }}>
            Curva de Rendimiento
          </h3>
          <p className="text-[9px] md:text-xs text-white/25 mt-0.5">Profit & Loss acumulado por día</p>
        </div>
        {hp ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-right">
            <p className="text-[10px] text-white/30 font-mono">{hp.date} · Día {hp.day}</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] text-white/30">Día:</span>
              <span className={`text-xs font-bold font-mono ${hp.pnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {hp.pnlPct >= 0 ? "+" : ""}{hp.pnlPct.toFixed(2)}%
              </span>
              <span className="text-white/10">|</span>
              <span className="text-[10px] text-white/30">Total:</span>
              <span className={`text-sm font-black font-mono ${hp.cumPnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {hp.cumPnlPct >= 0 ? "+" : ""}{hp.cumPnlPct.toFixed(2)}%
              </span>
            </div>
          </motion.div>
        ) : points.length > 0 ? (
          <div className="text-right">
            <span className={`text-lg font-black font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "var(--font-orbitron)" }}>
              {points[points.length - 1].cumPnlPct >= 0 ? "+" : ""}{points[points.length - 1].cumPnlPct.toFixed(2)}%
            </span>
          </div>
        ) : null}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto mt-4" onMouseLeave={() => setHoveredIdx(null)}>
        <defs>
          <linearGradient id="pnlGradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pnlGradRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#f87171" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid */}
        {[0.2, 0.4, 0.6, 0.8].map(f => (
          <line key={f} x1={pl} y1={pt + ch * f} x2={w - pr} y2={pt + ch * f}
            stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        ))}

        {/* Zero baseline */}
        <line x1={pl} y1={zeroY} x2={w - pr} y2={zeroY}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <text x={pl - 8} y={zeroY + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">0%</text>

        {/* Profit target zone */}
        <rect x={pl} y={targetY} width={cw} height={Math.max(0, zeroY - targetY)}
          fill="rgba(52,211,153,0.015)" />
        <line x1={pl} y1={targetY} x2={w - pr} y2={targetY}
          stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="6 4" />
        <text x={pl - 8} y={targetY + 4} textAnchor="end" fill="#34d399" fontSize="9" fontFamily="monospace" opacity="0.5">+{profitTargetPct}%</text>

        {/* Max drawdown zone */}
        <rect x={pl} y={zeroY} width={cw} height={Math.max(0, ddY - zeroY)}
          fill="rgba(248,113,113,0.01)" />
        <line x1={pl} y1={ddY} x2={w - pr} y2={ddY}
          stroke="rgba(248,113,113,0.2)" strokeWidth="1" strokeDasharray="6 4" />
        <text x={pl - 8} y={ddY + 4} textAnchor="end" fill="#f87171" fontSize="9" fontFamily="monospace" opacity="0.5">-{maxDrawdownPct}%</text>

        {/* Area fill */}
        {areaPath && (
          <motion.path d={areaPath} fill={`url(#${isPositive ? "pnlGradGreen" : "pnlGradRed"})`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.8 }} />
        )}

        {/* Glow line (behind) */}
        {linePath && (
          <motion.path d={linePath} fill="none"
            stroke={isPositive ? "#34d399" : "#f87171"} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            opacity="0.15" filter="url(#glow)"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }} />
        )}

        {/* Main line */}
        {linePath && (
          <motion.path d={linePath} fill="none"
            stroke={isPositive ? "url(#lineGradGreen)" : "#f87171"}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }} />
        )}

        {/* Data points and hover areas */}
        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - cw / points.length / 2} y={pt} width={cw / points.length} height={ch}
              fill="transparent" onMouseEnter={() => setHoveredIdx(i)} />

            {/* Hover vertical line */}
            {hoveredIdx === i && (
              <line x1={p.x} y1={pt} x2={p.x} y2={pt + ch}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
            )}

            {/* Dot */}
            {/* Dot */}
            <motion.circle
              cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3}
              fill={p.cumPnlPct >= 0 ? "#34d399" : "#f87171"}
              stroke="#0d1424" strokeWidth="2"
              initial={{ opacity: 0, scale: 0, r: 3 }}
              animate={{ opacity: hoveredIdx === i ? 1 : 0.7, scale: 1, r: hoveredIdx === i ? 5 : 3 }}
              transition={{ delay: 0.5 + i * 0.04 }}
            />

            {/* Hover value label */}
            {hoveredIdx === i && (
              <text x={p.x} y={p.y - 12} textAnchor="middle"
                fill={p.cumPnlPct >= 0 ? "#34d399" : "#f87171"}
                fontSize="10" fontWeight="bold" fontFamily="monospace">
                {p.cumPnlPct >= 0 ? "+" : ""}{p.cumPnlPct.toFixed(1)}%
              </text>
            )}
          </g>
        ))}

        {/* Endpoint pulse */}
        {points.length > 0 && (
          <>
            <motion.circle
              cx={points[points.length - 1].x} cy={points[points.length - 1].y}
              fill="none" stroke={isPositive ? "#34d399" : "#f87171"} strokeWidth="1"
              initial={{ opacity: 0, r: 8 }}
              animate={{ r: [6, 12, 6], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }} />
          </>
        )}

        {/* X-axis day labels */}
        {points.map((p, i) => {
          const showLabel = points.length <= 10 || i % Math.max(1, Math.floor(points.length / 8)) === 0 || i === points.length - 1;
          return showLabel ? (
            <text key={`label-${i}`} x={p.x} y={h - 8} textAnchor="middle"
              fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">
              D{p.day}
            </text>
          ) : null;
        })}
      </svg>
    </motion.div>
  );
}

