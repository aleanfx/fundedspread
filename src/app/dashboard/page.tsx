"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ShieldAlert,
  Clock,
  Bell,
  Wifi,
} from "lucide-react";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ============================================
   MOCK DATA FALLBACKS
   ============================================ */
const mockTrades = [
  { date: "Feb 28", symbol: "XAUUSD", type: "SELL", lots: 0.5, entry: 2035.5, exit: 2032.18, pnl: 340.0 },
  { date: "Feb 28", symbol: "EURUSD", type: "BUY", lots: 1.0, entry: 1.0845, exit: 1.0849, pnl: 40.0 },
  { date: "Feb 27", symbol: "GBPJPY", type: "SELL", lots: 0.3, entry: 190.45, exit: 190.72, pnl: -81.0 },
];

const mockEquityCurve = [
  20000, 20120, 20080, 20250, 20180, 20400, 20350, 20600, 20550,
  20800, 20750, 20950, 21100, 21050, 21200, 21350, 21300, 21500,
  21650, 21600, 21800, 21950, 22100, 22050, 22200, 22350, 22180,
];

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
   COMPONENTS
   ============================================ */

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color: "green" | "blue" | "purple" | "red";
  icon: React.ElementType;
}) {
  const colorMap = {
    green: { text: "text-neon-green", border: "border-neon-green/20", glow: "glow-green", bg: "bg-neon-green/5" },
    blue: { text: "text-neon-blue", border: "border-neon-blue/20", glow: "glow-blue", bg: "bg-neon-blue/5" },
    purple: { text: "text-neon-purple", border: "border-neon-purple/20", glow: "glow-purple", bg: "bg-neon-purple/5" },
    red: { text: "text-neon-red", border: "border-neon-red/20", glow: "glow-red", bg: "bg-neon-red/5" },
  };
  const c = colorMap[color];

  return (
    <motion.div
      variants={itemVariants}
      className={`glass-card p-5 ${c.border} hover:${c.glow} transition-shadow duration-300`}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-text-secondary" style={{ fontFamily: "var(--font-rajdhani)" }}>
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${c.text}`} style={{ fontFamily: "var(--font-orbitron)" }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}

function DrawdownGauge({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const isWarning = percentage > 60;
  const isDanger = percentage > 80;
  const color = isDanger ? "#ef4444" : isWarning ? "#f97316" : "#39ff14";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card p-5 border-border-subtle hover:glow-green transition-shadow duration-300"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-text-secondary" style={{ fontFamily: "var(--font-rajdhani)" }}>
          Drawdown Diario
        </span>
        <div className="w-8 h-8 rounded-lg bg-neon-green/5 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-neon-green" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2236" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-orbitron)", color }}>
              {current}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
            {current}% / {max}%
          </p>
          <p className="text-xs text-neon-green mt-1">Gestión de Riesgo Activa</p>
        </div>
      </div>
    </motion.div>
  );
}

function EquityChart({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 200;
  const width = 600;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <motion.div variants={itemVariants} className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
            CURVA DE EQUIDAD
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Métricas de rendimiento en tiempo real</p>
        </div>
        <div className="flex gap-1">
          {["1S", "1M", "3M"].map((t, i) => (
            <button
              key={t}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${i === 1
                ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                : "text-text-muted hover:text-text-secondary"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area} fill="url(#chartGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.path
          d={line} fill="none" stroke="#22d3ee" strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle
          cx={points[points.length - 1]?.x} cy={points[points.length - 1]?.y} r="4"
          fill="#22d3ee" stroke="#050a14" strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.3 }}
        />
      </svg>
    </motion.div>
  );
}

function RecentTrades({ trades }: { trades: typeof mockTrades }) {
  return (
    <motion.div variants={itemVariants} className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
          OPERACIONES RECIENTES
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-xs uppercase tracking-wider">
              <th className="text-left pb-3 font-medium">Símbolo</th>
              <th className="text-left pb-3 font-medium">Tipo</th>
              <th className="text-right pb-3 font-medium">Entrada</th>
              <th className="text-right pb-3 font-medium">Salida</th>
              <th className="text-right pb-3 font-medium">P&L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <motion.tr
                key={i}
                className="border-t border-border-subtle/50 hover:bg-white/[0.02] transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <td className="py-3 font-semibold text-text-primary">{trade.symbol}</td>
                <td className="py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.type === "BUY"
                    ? "bg-neon-green/10 text-neon-green"
                    : "bg-neon-red/10 text-neon-red"
                    }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="py-3 text-right text-text-secondary font-mono text-xs">{trade.entry.toFixed(2)}</td>
                <td className="py-3 text-right text-text-secondary font-mono text-xs">{trade.exit.toFixed(2)}</td>
                <td className={`py-3 text-right font-bold font-mono ${trade.pnl >= 0 ? "text-neon-green" : "text-neon-red"
                  }`}>
                  {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ============================================
   MAIN DASHBOARD PAGE
   ============================================ */
export default function DashboardPage() {
  const [stats, setStats] = useState({
    balance: 0,
    equity: 0,
    todayPnl: 0,
    dailyDrawdown: 0,
    maxDailyDrawdown: 5.0,
  });

  const [challengeState, setChallengeState] = useState<'loading' | 'none' | 'pending' | 'active' | 'failed'>('loading');
  const [challengeMetadata, setChallengeMetadata] = useState({
    type: 'classic_2phase',
    phase: 1,
    checkpointLevel: 1,
    profitTargetPct: 8,
    initialBalance: 10000,
    displayName: 'Trader',
    hasScalingX2: false,
    isFunded: false
  });
  const [targetBalance, setTargetBalance] = useState(0);
  const [canLevelUp, setCanLevelUp] = useState(false);
  const [violation, setViolation] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userObj, setUserObj] = useState<any>(null);
  const [payoutDate, setPayoutDate] = useState<Date | null>(null);
  const [timeToPayout, setTimeToPayout] = useState<string>("Calculando...");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Read URL parameters for error messages
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      if (errorParam === 'InvalidBalanceOrType') {
        setAlertMessage("Error: La cuenta que intentas vincular no tiene el balance correcto o no es una cuenta Demo. Por favor, crea una nueva cuenta Demo con el balance exacto y en USD.");
      } else if (errorParam === 'AccountAlreadyInUse') {
        setAlertMessage("Error: Esta cuenta de MT5 ya está vinculada a otro Challenge. Por favor, verifica tus datos de registro.");
      } else {
        setAlertMessage(`Error de vinculación: ${errorParam}`);
      }
      
      // Clean URL after reading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setChallengeState('none');
        return;
      }
      setUserId(user.id);
      setUserObj(user);

      // Fetch all accounts
      const { data: accountsData } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accountsData && accountsData.length > 0) {
        setAccounts(accountsData);
        setSelectedAccountId(accountsData[0].id);
      } else {
        setChallengeState('none');
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  useEffect(() => {
    if (!selectedAccountId || accounts.length === 0 || !userObj) return;
    
    const acc = accounts.find(a => a.id === selectedAccountId);
    if (!acc) return;

    setTargetBalance(Number(acc.initial_balance) || 10000);

    setChallengeMetadata({
      type: acc.challenge_type || 'classic_2phase',
      phase: acc.challenge_phase || 1,
      checkpointLevel: acc.checkpoint_level || 1,
      profitTargetPct: acc.profit_target_pct || (acc.challenge_type === 'express_1phase' ? 10 : 8),
      initialBalance: Number(acc.initial_balance) || 10000,
      displayName: userObj.user_metadata?.display_name || userObj.email?.split('@')[0] || 'Trader',
      hasScalingX2: acc.has_scaling_x2 || false,
      isFunded: acc.account_status === 'funded'
    });


    if (acc.account_status === 'pending_creation' || acc.account_status === 'pending_link') {
        setChallengeState('pending');
        setLoading(false);
        return;
    }

    if (acc.account_status === 'failed' || acc.is_active === false) {
        setChallengeState('failed');
        setViolation(acc.status_reason || acc.violation_type || "Cuenta terminada.");
    } else {
        setChallengeState('active');
    }

    const initial = Number(acc.initial_balance) || 10000;
    const dailyInitial = Number(acc.daily_initial_balance) || 10000;
    const currentEq = Number(acc.current_equity) || 10000;
    const currentBal = Number(acc.current_balance) || 10000;

    const drawdownValue = Math.max(0, dailyInitial - currentEq);
    const drawdownPct = (drawdownValue / dailyInitial) * 100;

    setStats({
      balance: currentBal,
      equity: currentEq,
      todayPnl: currentEq - dailyInitial,
      dailyDrawdown: Number(drawdownPct.toFixed(2)),
      maxDailyDrawdown: acc.max_drawdown_pct || 10.0
    });

    setCanLevelUp(acc.can_level_up);

    // Payout Timer Logic
    const createdAt = new Date(acc.created_at || Date.now());
    const daysToWait = acc.has_weekly_payouts ? 7 : 30;
    const nextPayout = new Date(createdAt.getTime() + daysToWait * 24 * 60 * 60 * 1000);
    setPayoutDate(nextPayout);
    
    setLoading(false);
  }, [selectedAccountId, accounts, userObj]);

  // Live countdown ticker
  useEffect(() => {
    if (!payoutDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = payoutDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeToPayout("¡LISTO PARA RETIRO!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeToPayout(`${days}d ${hours.toString().padStart(2, '0')}h`);
      } else {
        setTimeToPayout(`${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [payoutDate]);

  // Handle Level Up Action (will be triggered by real MT5 webhook in production)
  const handleLevelUp = async (scalingAction?: 'withdraw' | 'scale') => {
    if (scalingAction === 'withdraw') {
      alert("Tu solicitud de retiro ha sido registrada. El equipo de operaciones procesará tu pago.");
      return;
    }
    // Scale action — reload to reflect DB changes made by risk engine
    window.location.reload();
  };

  const xpProgress = canLevelUp ? 100 : Math.min(99, Math.max(0, ((stats.equity - 10000) / 2000) * 100));

  if (loading) return <div className="p-6 text-white text-center mt-20 font-mono animate-pulse">Cargando Dashboard...</div>;

  if (challengeState === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-orbitron)" }}>No tienes un challenge activo</h1>
        <p className="text-text-muted mb-8 max-w-md">Adquiere un challenge para comenzar tu carrera como trader fondeado y acceder a capital institucional.</p>
        <a href="/checkout" className="bg-neon-green text-black px-8 py-3 font-bold rounded-lg hover:bg-neon-green/80 transition-colors uppercase tracking-widest glow-green shadow-[0_0_15px_rgba(57,255,20,0.4)]">
          Ver planes de Fondeo
        </a>
      </div>
    );
  }

  if (challengeState === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center p-4 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="glass-card p-6 sm:p-8 max-w-xl border-neon-blue/20 shadow-[0_0_40px_rgba(0,195,255,0.05)] relative overflow-hidden z-10" style={{ borderRadius: '20px' }}>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-blue/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-green/10 blur-[80px] rounded-full pointer-events-none" />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-black/40 border border-neon-blue/30 shadow-[0_0_20px_rgba(0,195,255,0.2)]"
          >
            <Activity className="w-8 h-8 text-neon-blue animate-pulse" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2 text-white tracking-widest" style={{ fontFamily: "var(--font-orbitron)" }}>
            ¡PAGO CONFIRMADO!
          </h1>
          <p className="text-text-secondary text-base mb-6 max-w-md mx-auto">
            Tu challenge de <strong className="text-neon-green text-lg font-bold font-mono tracking-wider glow-text-green">${targetBalance.toLocaleString("en-US")}</strong> está en preparación.
          </p>
          
          <div className="bg-black/40 p-5 sm:p-6 border border-white/5 rounded-[16px] mb-6 text-left relative z-10 backdrop-blur-sm">
            <h3 className="font-bold mb-3 text-neon-blue flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-rajdhani)" }}>
              <Clock className="w-4 h-4" /> ¿Qué sigue ahora?
            </h3>
            <div className="h-px w-full bg-gradient-to-r from-neon-blue/30 to-transparent mb-3" />
            <p className="text-text-secondary leading-snug text-sm">
              Nuestro sistema automatizado está configurando tu cuenta de financiamiento en <strong>MetaTrader 5</strong> en servidores institucionales.
            </p>
            <ul className="space-y-2 mt-4 text-text-muted text-sm relative z-10">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,195,255,0.8)]" />
                <span>Tu cuenta será <strong>DEMO</strong> con el balance exacto.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5 shrink-0 shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                <span>Motor de riesgo integrado para monitoreo en vivo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                <span>Recibirás un correo con tus credenciales seguras en <strong>5 a 15 mins.</strong></span>
              </li>
            </ul>
          </div>
          
          <div className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-neon-blue/10 border border-neon-blue/30 text-neon-blue px-6 py-3 font-bold rounded-lg cursor-wait uppercase tracking-widest relative z-10 shadow-[0_0_15px_rgba(0,195,255,0.2)] text-sm">
            <span className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></span>
            Creando Servidor MT5...
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-[1400px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-rajdhani)" }}>
            Cuenta Seleccionada
          </p>
          {accounts && accounts.length > 1 ? (
            <select
              value={selectedAccountId || ""}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-black/40 border border-border-subtle text-text-primary px-3 py-1.5 rounded-lg text-sm font-bold focus:outline-none focus:border-neon-green/50 transition-colors appearance-none cursor-pointer pr-8"
              style={{
                fontFamily: "var(--font-orbitron)",
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' stroke='%2339FF14' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1em 1em'
              }}
            >
              {accounts.map(acc => {
                const typeLabel =
                  acc.challenge_type === 'express_1phase' ? 'Express X' :
                  acc.challenge_type === 'classic_2phase' ? 'Classic Pro' :
                  acc.challenge_type === 'titan_3phase' ? 'Titan Max' : 'Challenge';
                
                const statusLabel = 
                  acc.account_status === 'funded' ? 'Fondeada' :
                  acc.account_status === 'failed' ? 'Terminada' :
                  acc.challenge_phase > 1 ? `Fase ${acc.challenge_phase}` : 'Fase 1';

                return (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {typeLabel} ${Number(acc.initial_balance).toLocaleString()} ({statusLabel})
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
                {challengeMetadata?.type === 'express_1phase' ? 'Express X' :
                 challengeMetadata?.type === 'classic_2phase' ? 'Classic Pro' :
                 challengeMetadata?.type === 'titan_3phase' ? 'Titan Max' : 'Challenge'}
              </span>
              <span className="text-xs text-neon-green px-2 py-0.5 bg-neon-green/10 rounded border border-neon-green/20" style={{ fontFamily: "var(--font-orbitron)" }}>
                ${challengeMetadata?.initialBalance?.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-xs text-text-secondary hover:border-neon-green/30 transition-colors">
            <Bell className="w-3.5 h-3.5" />
            Alertas
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/5 border border-neon-green/20">
            <Wifi className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-xs font-medium text-neon-green">Mercado en Vivo</span>
          </div>
        </div>
      </motion.div>

      {/* Violation Alert */}
      {(violation || alertMessage) && (
        <motion.div variants={itemVariants} className={`mb-8 ${violation ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} p-4 rounded-lg flex items-center gap-3`} style={{ animation: violation ? "pulse 2s infinite" : "none" }}>
          <ShieldAlert className={`w-6 h-6 flex-shrink-0 ${violation ? 'text-red-500' : 'text-yellow-500'}`} />
          <div>
            <h3 className={`font-bold ${violation ? 'text-red-500' : 'text-yellow-500'}`} style={{ fontFamily: "var(--font-orbitron)" }}>
              {violation ? '⚠ CUENTA SUSPENDIDA' : '⚠ ATENCIÓN REQUERIDA'}
            </h3>
            <p className={`text-sm ${violation ? 'text-red-200' : 'text-yellow-200'}`}>
              {violation ? (
                violation.includes('daily_drawdown')
                  ? 'Tu cuenta ha sido suspendida porque se excedió el límite de Drawdown Diario del 5%. Contacta soporte para revisar tu cuenta.'
                  : violation.includes('TERMINATED')
                    ? violation.replace('daily_drawdown_5_percent', 'Drawdown Diario excedió 5%').replace(/_/g, ' ')
                    : `Tu cuenta de trading ha sido suspendida: ${violation.replace(/_/g, ' ')}`
              ) : alertMessage}
            </p>
          </div>
        </motion.div>
      )}

      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className={`glass-card p-6 mb-6 ${canLevelUp ? 'border-neon-green/50 glow-green' : 'animate-border-glow'}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs text-text-muted tracking-widest uppercase mb-1">
              Bienvenido de nuevo,
            </h2>
            <h1 className="text-3xl font-bold text-neon-green text-glow-green uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>
              {challengeMetadata.displayName}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {canLevelUp 
                ? `¡Felicidades! Has alcanzado el objetivo de +${challengeMetadata.profitTargetPct}%.` 
                : challengeMetadata.type === 'express_1phase'
                  ? `Fase actual: Evaluación Express (10%)`
                  : challengeMetadata.type === 'classic_2phase' 
                    ? `Fase actual: ${challengeMetadata.phase === 1 ? 'Evaluación 1 (8%)' : 'Evaluación 2 (5%)'}`
                    : `Nivel actual: Checkpoint ${challengeMetadata.checkpointLevel} (+20% para escalar)`
              }
            </p>
          </div>
          <div className="lg:text-right">
            <div className="flex items-center gap-2 mb-2 lg:justify-end">
              <span className="text-xs bg-neon-green/10 text-neon-green px-2 py-0.5 rounded font-bold tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                {challengeMetadata.type === 'express_1phase'
                   ? `CHALLENGE EXPRESS — 1 FASE`
                   : `CHALLENGE CLÁSICO — FASE ${challengeMetadata.phase}`
                }
              </span>
              {challengeMetadata.hasScalingX2 && (
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded font-bold tracking-wider ml-1" style={{ fontFamily: "var(--font-orbitron)" }}>
                  + ESCALAMIENTO X2
                </span>
              )}

            </div>

            {canLevelUp ? (
              <div className="flex flex-col gap-3 w-full lg:w-[320px]">
                {challengeMetadata.hasScalingX2 && challengeMetadata.phase > (challengeMetadata.type === 'express_1phase' ? 1 : 2) && stats.balance > challengeMetadata.initialBalance ? (
                  <>
                    <motion.button
                      onClick={() => handleLevelUp('withdraw')}
                      className="w-full py-2.5 bg-neon-blue/10 text-neon-blue font-bold rounded-lg border border-neon-blue/40 uppercase tracking-widest text-[11px]"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                      whileHover={{ backgroundColor: "rgba(34, 211, 238, 0.2)", scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Retirar Profit (80/20)
                    </motion.button>
                    <motion.button
                      onClick={() => handleLevelUp('scale')}
                      className="w-full py-2.5 bg-yellow-500 text-black font-extrabold rounded-lg border border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.7)] uppercase tracking-widest text-[11px]"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(234,179,8,1)" }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Invertir y Escalar x2
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => handleLevelUp()}
                    className="w-full lg:w-[300px] py-2 bg-yellow-500 text-black font-extrabold rounded-lg border border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.7)] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(234,179,8,1)" }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    SUBIR DE NIVEL
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                {/* XP Progress Bar */}
                <div className="w-full lg:w-[300px] h-4 bg-white/5 rounded-full border border-border-subtle overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{ background: "linear-gradient(90deg, #39ff14, #22d3ee)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </motion.div>
                </div>
                <p className="text-[11px] text-text-muted mt-1">{Math.round(xpProgress)}% hacia el siguiente checkpoint</p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Balance Total"
          value={`$${stats.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={challengeMetadata.type === 'express_1phase'
            ? `Objetivo Fase Única: +10%`
            : challengeMetadata.type === 'classic_2phase' 
              ? `Objetivo Fase ${challengeMetadata.phase}: +${challengeMetadata.profitTargetPct}%`
              : `Objetivo Checkpoint: +20% -> $${(challengeMetadata.initialBalance * 1.2).toLocaleString("en-US")}`
          }
          color="green"
          icon={DollarSign}
        />
        <StatCard
          title="Equidad Actual"
          value={`$${stats.equity.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          color={stats.equity >= stats.balance ? "blue" : "red"}
          icon={Activity}
        />
        <StatCard
          title="P&L de Hoy"
          value={`${stats.todayPnl >= 0 ? '+' : ''}$${stats.todayPnl.toFixed(2)}`}
          subtitle={challengeMetadata.type === 'classic_2phase' ? "Límite Diario: 5%" : "Checkpoint Progress"}
          color={stats.todayPnl >= 0 ? "green" : "red"}
          icon={stats.todayPnl >= 0 ? TrendingUp : TrendingDown}
        />
        <DrawdownGauge current={stats.dailyDrawdown} max={stats.maxDailyDrawdown} />
      </div>

      {/* Middle Section: Chart */}
      <div className="mb-6">
        <EquityChart data={mockEquityCurve} />
      </div>

      {/* Recent Trades */}
      <RecentTrades trades={mockTrades} />

      {/* Floating Payout Timer (Only visible when funded AND in profit) */}
      {challengeMetadata.isFunded && stats.equity > challengeMetadata.initialBalance && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="fixed bottom-6 right-6 glass-card px-5 py-3 border-neon-green/40 glow-green z-50"
        >
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neon-green font-semibold">Próximo Pago</p>
              <p className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
                {timeToPayout}
              </p>
            </div>
            <motion.div
              className="w-9 h-9 rounded-full bg-neon-green/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Clock className="w-4 h-4 text-neon-green" />
            </motion.div>
          </div>
        </motion.div>
      )}


    </motion.div>
  );
}
