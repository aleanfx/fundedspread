"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ShieldAlert,
  Clock,
  Bell,
  Wifi,
  Wallet,
  BarChart3,
  CalendarDays,
  Copy,
  Check,
  Eye,
  EyeOff,
  Server,
  KeyRound,
  UserCircle,
  Fingerprint,
  Layers,
  BadgeDollarSign,
} from "lucide-react";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import WithdrawModal from "@/components/WithdrawModal";
import TradingObjectives from "@/components/dashboard/TradingObjectives";
import PnLChart from "@/components/dashboard/PnLChart";

import { calculateXP, getRankProgress, UserRankStats } from "@/lib/utils/rankSystem";
import { RankBadge } from "@/components/RankBadge";

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

const VerifiedBadge = ({ className = "w-5 h-5", checkColor = "#000000", badgeColor = "var(--neon-green)" }: { className?: string, checkColor?: string, badgeColor?: string }) => (
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
      className={`glass-card p-4 ${c.border} hover:${c.glow} transition-shadow duration-300`}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-text-secondary line-clamp-1" style={{ fontFamily: "var(--font-rajdhani)" }}>
          {title}
        </span>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${c.text}`} />
        </div>
      </div>
      <p className={`text-base sm:text-xl font-bold ${c.text} truncate`} style={{ fontFamily: "var(--font-orbitron)" }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[9px] sm:text-[10px] text-text-muted mt-1 truncate">{subtitle}</p>
      )}
    </motion.div>
  );
}

function DrawdownGauge({ current, max }: { current: number; max: number }) {
  const { t } = useLanguage();
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
          {t("dashboard.gauge.dailyDrawdown")}
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
          <p className="text-xs text-neon-green mt-1">{t("dashboard.gauge.riskActive")}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* EquityChart replaced by PnLChart component */

interface Trade { date: string; symbol: string; type: string; lots: number; entry: number; exit: number; pnl: number; }

function RecentTrades({ trades }: { trades: Trade[] }) {
  const { t } = useLanguage();
  return (
    <motion.div variants={itemVariants} className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>
          {t("dashboard.recentTrades")}
        </h3>
      </div>
      {trades.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-text-muted">Las operaciones aparecerán aquí cuando el EA de MT5 envíe datos.</p>
          <p className="text-xs text-white/20 mt-1">Conecta tu Expert Advisor para ver el historial en tiempo real.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">{t("dashboard.headers.symbol")}</th>
                <th className="text-left pb-3 font-medium">{t("dashboard.headers.type")}</th>
                <th className="text-right pb-3 font-medium">{t("dashboard.headers.entry")}</th>
                <th className="text-right pb-3 font-medium">{t("dashboard.headers.exit")}</th>
                <th className="text-right pb-3 font-medium">{t("dashboard.headers.pnl")}</th>
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
      )}
    </motion.div>
  );
}

/* ============================================
   ACCOUNT CREDENTIALS CARD
   ============================================ */
function AccountCredentials({ account, challengeMetadata }: { account: any; challengeMetadata: any }) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!account) return null;

  const login = account.mt5_login || '—';
  const password = account.mt5_password || '—';
  const server = account.mt5_server || 'FundedSpread-Demo';
  const accountType = account.is_demo ? 'Demo' : 'Live';
  const leverageDisplay = account.ctrader_leverage ? `1:${account.ctrader_leverage}` : '1:100';

  const typeLabel =
    challengeMetadata.type === 'express_1phase' ? 'Express X' :
      challengeMetadata.type === 'classic_2phase' ? 'Classic Pro' :
        challengeMetadata.type === 'titan_3phase' ? 'Titan Max' : 'Challenge';

  const phaseLabel =
    challengeMetadata.isFunded ? 'Funded' :
      challengeMetadata.type === 'express_1phase' ? 'Phase 1' :
        `Phase ${challengeMetadata.phase}`;

  const statusColor =
    challengeMetadata.isFunded ? 'neon-green' :
      account.account_status === 'failed' ? 'neon-red' : 'neon-blue';

  const CredentialRow = ({ icon: Icon, label, value, fieldKey, isSensitive = false, mono = true }: {
    icon: React.ElementType; label: string; value: string; fieldKey: string; isSensitive?: boolean; mono?: boolean;
  }) => (
    <div className="group flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
          <Icon className="w-3 h-3 text-text-secondary" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-widest text-text-muted mb-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>{label}</p>
          <p className={`text-xs font-semibold text-text-primary ${mono ? 'font-mono tracking-wide' : ''}`} style={mono ? {} : { fontFamily: "var(--font-rajdhani)" }}>
            {isSensitive && !showPassword ? '•'.repeat(Math.min(value.length, 12)) : value}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isSensitive && (
          <motion.button
            onClick={() => setShowPassword(!showPassword)}
            className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-secondary hover:border-white/[0.12] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </motion.button>
        )}
        {value !== '—' && (
          <motion.button
            onClick={() => copyToClipboard(value, fieldKey)}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${copiedField === fieldKey
                ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                : 'bg-white/[0.04] border-white/[0.06] text-text-muted hover:text-text-secondary hover:border-white/[0.12]'
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {copiedField === fieldKey ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="w-3 h-3" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy className="w-3 h-3" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card p-4 relative overflow-hidden"
    >
      {/* Subtle corner glow */}
      <div className={`absolute -top-16 -right-16 w-32 h-32 bg-${statusColor}/5 blur-[60px] rounded-full pointer-events-none`} />
      <div className={`absolute -bottom-16 -left-16 w-32 h-32 bg-${statusColor}/3 blur-[60px] rounded-full pointer-events-none`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-${statusColor}/10 border border-${statusColor}/20 flex items-center justify-center`}>
            <Fingerprint className={`w-4 h-4 text-${statusColor}`} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary tracking-wide" style={{ fontFamily: "var(--font-orbitron)" }}>
              {t("dashboard.accountCredentials.title")}
            </h3>
            <p className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>
              MetaTrader 5
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-${statusColor}/10 border border-${statusColor}/20`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-${statusColor} animate-pulse`} />
          <span className={`text-[9px] font-bold text-${statusColor} uppercase tracking-wider`} style={{ fontFamily: "var(--font-orbitron)" }}>
            {phaseLabel}
          </span>
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="space-y-1.5 relative z-10">
        <CredentialRow icon={UserCircle} label={t("dashboard.accountCredentials.login")} value={login} fieldKey="login" />
        <CredentialRow icon={KeyRound} label={t("dashboard.accountCredentials.password")} value={password} fieldKey="password" isSensitive />
        <CredentialRow icon={Server} label={t("dashboard.accountCredentials.server")} value={server} fieldKey="server" />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-3" />

      {/* Account Details Mini Cards */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        <div className="py-2 px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[9px] uppercase tracking-widest text-text-muted mb-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("dashboard.accountCredentials.plan")}</p>
          <p className="text-xs font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>{typeLabel}</p>
        </div>
        <div className="py-2 px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[9px] uppercase tracking-widest text-text-muted mb-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("dashboard.accountCredentials.accountSize")}</p>
          <p className="text-xs font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>${challengeMetadata.initialBalance.toLocaleString()}</p>
        </div>
        <div className="py-2 px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[9px] uppercase tracking-widest text-text-muted mb-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("dashboard.accountCredentials.type")}</p>
          <p className="text-xs font-bold text-text-primary" style={{ fontFamily: "var(--font-rajdhani)" }}>{accountType}</p>
        </div>
        <div className="py-2 px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[9px] uppercase tracking-widest text-text-muted mb-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>{t("dashboard.accountCredentials.leverage")}</p>
          <p className="text-xs font-bold text-text-primary" style={{ fontFamily: "var(--font-orbitron)" }}>{leverageDisplay}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   MAIN DASHBOARD PAGE
   ============================================ */
export default function DashboardPage() {
  const { t } = useLanguage();
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
    profitSplitPct: 80,
    initialBalance: 10000,
    displayName: 'Trader',
    hasScalingX2: false,
    isFunded: false
  });
  const [targetBalance, setTargetBalance] = useState(0);
  const [canLevelUp, setCanLevelUp] = useState(false);
  const [violation, setViolation] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserRankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userObj, setUserObj] = useState<any>(null);
  const [payoutDate, setPayoutDate] = useState<Date | null>(null);
  const [timeToPayout, setTimeToPayout] = useState<string>("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [realPnLData, setRealPnLData] = useState<any[]>([]);
  const [realTrades, setRealTrades] = useState<any[]>([]);

  const supabase = createClient();
  const rankProgress = useMemo(() => {
    if (!userStats) return null;
    return getRankProgress(userStats);
  }, [userStats]);

  useEffect(() => {
    // Read URL parameters for error messages
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      if (errorParam === 'InvalidBalanceOrType') {
        setAlertMessage(t("dashboard.errors.invalidBalance"));
      } else if (errorParam === 'AccountAlreadyInUse') {
        setAlertMessage(t("dashboard.errors.accountInUse"));
      } else {
        setAlertMessage(`${t("dashboard.errors.linkingError")} ${errorParam}`);
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

      // Fetch user rank stats from 'users' table
      const { data: userData } = await supabase
        .from('users')
        .select('xp, total_withdrawals, top_three_finishes, top_ten_finishes, is_admin, is_verified')
        .eq('id', user.id)
        .single();

      // Fetch all accounts
      const { data: accountsData } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userData && accountsData && accountsData.length > 0) {
        setAccounts(accountsData);
        setSelectedAccountId(accountsData[0].id);

        const stats = {
          xp: userData.xp || calculateXP(accountsData[0]),
          isFunded: accountsData[0].account_status === 'funded',
          totalWithdrawals: userData.total_withdrawals || 0,
          topThreeFinishes: userData.top_three_finishes || 0,
          topTenFinishes: userData.top_ten_finishes || 0,
          isAdmin: userData.is_admin || false,
          isVerified: userData.is_verified || false
        };
        setUserStats(stats);
        
        // Sync real global rank (like Elite from $3000 withdrawals) directly to leaderboard so avatar is always accurate
        const rankProg = getRankProgress(stats);
        if (rankProg.currentRank.id !== 'unranked') {
            supabase.from('leaderboard_traders').update({ rank_title: rankProg.currentRank.id }).eq('user_id', user.id).then();
        }

      } else if (accountsData && accountsData.length > 0) {
        setChallengeState('none');
        setLoading(false);
      } else {
        // User has no accounts at all
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
      profitSplitPct: acc.profit_split_pct || 80,
      initialBalance: Number(acc.initial_balance) || 10000,
      displayName: userObj.user_metadata?.full_name || userObj.user_metadata?.name || userObj.user_metadata?.display_name || userObj.email?.split('@')[0] || 'Trader',
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

    // Fetch Real P&L Snapshots
    async function fetchPnLData() {
      const { data: snapshots, error } = await supabase
        .from('daily_snapshots')
        .select('*')
        .eq('mt5_account_id', selectedAccountId)
        .order('date', { ascending: true });

      if (snapshots && snapshots.length > 0) {
        let cumPnlPct = 0;
        const initial = Number(acc.initial_balance) || 10000;

        const transformed = snapshots.map((s, i) => {
          const currentPnlPct = ((Number(s.equity) - initial) / initial) * 100;
          // Calculate daily P&L comparison if we have a previous day
          const prevEquity = i > 0 ? Number(snapshots[i - 1].equity) : initial;
          const dailyPnlPct = ((Number(s.equity) - prevEquity) / prevEquity) * 100;

          return {
            day: i + 1,
            date: new Date(s.date).toLocaleDateString("es", { month: "short", day: "numeric" }),
            pnlPct: dailyPnlPct,
            cumPnlPct: currentPnlPct,
            balance: Number(s.balance)
          };
        });
        setRealPnLData(transformed);
      } else {
        setRealPnLData([]);
      }
    }
    fetchPnLData();

    // Fetch Real Trade History
    async function fetchTradeHistory() {
      const { data: trades, error } = await supabase
        .from('trade_history')
        .select('*')
        .eq('mt5_account_id', selectedAccountId)
        .order('closed_at', { ascending: false })
        .limit(10);

      if (trades && trades.length > 0) {
        setRealTrades(trades.map(t => ({
          date: new Date(t.closed_at).toLocaleDateString(),
          symbol: t.symbol,
          type: t.type,
          lots: Number(t.lots),
          entry: Number(t.entry_price),
          exit: Number(t.exit_price),
          pnl: Number(t.pnl)
        })));
      } else {
        setRealTrades([]);
      }
    }
    fetchTradeHistory();

    setLoading(false);
  }, [selectedAccountId, accounts, userObj]);

  // Live countdown ticker
  useEffect(() => {
    if (!payoutDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = payoutDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeToPayout(t("dashboard.readyForPayout"));
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
      alert(t("dashboard.withdrawSuccess"));
      return;
    }
    // Scale action — reload to reflect DB changes made by risk engine
    window.location.reload();
  };


  if (loading) return <div className="p-6 text-white text-center mt-20 font-mono animate-pulse">{t("dashboard.loading")}</div>;

  if (challengeState === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-orbitron)" }}>{t("dashboard.noActiveChallenge.title")}</h1>
        <p className="text-text-muted mb-8 max-w-md">{t("dashboard.noActiveChallenge.desc")}</p>
        <a href="/checkout" className="bg-neon-green text-black px-8 py-3 font-bold rounded-lg hover:bg-neon-green/80 transition-colors uppercase tracking-widest glow-green shadow-[0_0_15px_rgba(57,255,20,0.4)]">
          {t("dashboard.noActiveChallenge.button")}
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
            {t("dashboard.pending.title")}
          </h1>
          <p className="text-text-secondary text-base mb-6 max-w-md mx-auto">
            {t("dashboard.pending.desc1")} <strong className="text-neon-green text-lg font-bold font-mono tracking-wider glow-text-green">${targetBalance.toLocaleString("en-US")}</strong> {t("dashboard.pending.desc2")}
          </p>

          <div className="bg-black/40 p-5 sm:p-6 border border-white/5 rounded-[16px] mb-6 text-left relative z-10 backdrop-blur-sm">
            <h3 className="font-bold mb-3 text-neon-blue flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-rajdhani)" }}>
              <Clock className="w-4 h-4" /> {t("dashboard.pending.whatsNext")}
            </h3>
            <div className="h-px w-full bg-gradient-to-r from-neon-blue/30 to-transparent mb-3" />
            <p className="text-text-secondary leading-snug text-sm">
              {t("dashboard.pending.step1")}
            </p>
            <ul className="space-y-2 mt-4 text-text-muted text-sm relative z-10">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,195,255,0.8)]" />
                <span>{t("dashboard.pending.step2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5 shrink-0 shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                <span>{t("dashboard.pending.step3")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                <span>{t("dashboard.pending.step4")}</span>
              </li>
            </ul>
          </div>

          <div className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-neon-blue/10 border border-neon-blue/30 text-neon-blue px-6 py-3 font-bold rounded-lg cursor-wait uppercase tracking-widest relative z-10 shadow-[0_0_15px_rgba(0,195,255,0.2)] text-sm">
            <span className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></span>
            {t("dashboard.pending.creatingServer")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto pb-32 sm:pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <p className="text-xs uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-rajdhani)" }}>
            {t("dashboard.selectedAccount")}
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
        <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-xs text-text-secondary hover:border-neon-green/30 transition-colors">
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("dashboard.alertsLabel")}</span>
            <span className="sm:hidden">Alertas</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/5 border border-neon-green/20">
            <Wifi className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-xs font-medium text-neon-green whitespace-nowrap">{t("dashboard.liveMarket")}</span>
          </div>
        </div>
      </motion.div>

      {/* Violation Alert */}
      {(violation || alertMessage) && (
        <motion.div variants={itemVariants} className={`mb-8 ${violation ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} p-4 rounded-lg flex items-center gap-3`} style={{ animation: violation ? "pulse 2s infinite" : "none" }}>
          <ShieldAlert className={`w-6 h-6 flex-shrink-0 ${violation ? 'text-red-500' : 'text-yellow-500'}`} />
          <div>
            <h3 className={`font-bold ${violation ? 'text-red-500' : 'text-yellow-500'}`} style={{ fontFamily: "var(--font-orbitron)" }}>
              {violation ? t("dashboard.alerts.suspended") : t("dashboard.alerts.attention")}
            </h3>
            <p className={`text-sm ${violation ? 'text-red-200' : 'text-yellow-200'}`}>
              {violation ? (
                violation.includes('daily_drawdown')
                  ? t("dashboard.alerts.ddExceeded")
                  : violation.includes('TERMINATED')
                    ? violation.replace('daily_drawdown_5_percent', t("dashboard.alerts.ddExceededShort")).replace(/_/g, ' ')
                    : `${t("dashboard.alerts.suspendedReason")} ${violation.replace(/_/g, ' ')}`
              ) : alertMessage}
            </p>
          </div>
        </motion.div>
      )}

      {/* Top Section Layout: Credentials, Welcome & Stats */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">

        {/* Welcome Banner (Mobile: First, Desktop: Right Col First) */}
        <div className="order-1 lg:order-none lg:col-span-2 xl:col-span-3 lg:col-start-2 lg:row-start-1">
          <motion.div
            variants={itemVariants}
            className={`glass-card p-5 sm:p-6 w-full h-full flex flex-col justify-center ${canLevelUp ? 'border-neon-green/50 glow-green' : 'animate-border-glow'}`}
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
              {/* Left: Avatar + Name + Phase */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-neon-green/30 overflow-hidden flex-shrink-0 bg-neon-green/5 flex items-center justify-center">
                    {userObj?.user_metadata?.avatar_url ? (
                      <img src={userObj.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neon-green font-bold text-lg sm:text-xl uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>
                        {challengeMetadata.displayName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  {/* Verified Badge */}
                  {(userStats?.isAdmin || userStats?.isVerified || userObj?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) && (
                    <div className="absolute -bottom-1 -right-1 z-10">
                      <VerifiedBadge className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs text-text-muted tracking-widest uppercase" style={{ fontFamily: "var(--font-rajdhani)" }}>
                      {t("dashboard.welcomeBack")}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neon-green text-glow-green uppercase truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
                      {challengeMetadata.displayName}
                    </h1>
                    {rankProgress && (
                      <RankBadge 
                        rankId={rankProgress.currentRank.id} 
                        size="md"
                        className="mt-0.5" 
                      />
                    )}
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap mt-0.5">
                    {challengeMetadata.isFunded
                      ? "Cuenta Fondeada - Operativa"
                      : canLevelUp
                        ? `${t("dashboard.levelUp.congrats")} +${challengeMetadata.profitTargetPct}%.`
                        : challengeMetadata.type === 'express_1phase'
                          ? t("dashboard.levelUp.express")
                          : challengeMetadata.type === 'classic_2phase'
                            ? (challengeMetadata.phase === 1 ? t("dashboard.levelUp.phase1") : t("dashboard.levelUp.phase2"))
                            : `${t("dashboard.levelUp.checkpoint1")} ${challengeMetadata.checkpointLevel} ${t("dashboard.levelUp.checkpoint2")}`
                    }
                  </span>
                </div>
              </div>

              {/* Right: Badges + Rank/LevelUp */}
              <div className="flex flex-col items-start xl:items-end gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-neon-green/10 text-neon-green px-2.5 py-1 rounded font-bold tracking-wider whitespace-nowrap" style={{ fontFamily: "var(--font-orbitron)" }}>
                    {challengeMetadata.isFunded
                      ? "ACCOUNT FUNDED"
                      : challengeMetadata.type === 'express_1phase'
                        ? t("dashboard.badges.express")
                        : `${t("dashboard.badges.classic")} ${challengeMetadata.phase}`
                    }
                  </span>
                  <span className="text-[10px] bg-neon-blue/10 text-neon-blue px-2.5 py-1 rounded font-bold tracking-wider whitespace-nowrap" style={{ fontFamily: "var(--font-orbitron)" }}>
                    {t("dashboard.badges.split")} {challengeMetadata.profitSplitPct}%
                  </span>
                  {challengeMetadata.hasScalingX2 && (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded font-bold tracking-wider whitespace-nowrap" style={{ fontFamily: "var(--font-orbitron)" }}>
                      {t("dashboard.badges.scaling")}
                    </span>
                  )}
                </div>

                {canLevelUp ? (
                  <motion.button
                    onClick={() => handleLevelUp()}
                    className="py-2 px-6 bg-yellow-500 text-black font-extrabold rounded-lg border border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] uppercase tracking-wider text-xs whitespace-nowrap w-full xl:w-auto"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {t("dashboard.buttons.levelUp")}
                  </motion.button>
                ) : (
                  rankProgress && rankProgress.nextRank && (
                    <div className="flex flex-col items-start xl:items-end gap-1.5 w-full xl:w-[260px]">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-rajdhani)" }}>
                          XP Rank: <span className="text-neon-green">{rankProgress.xp.toLocaleString()}</span>
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted/40" style={{ fontFamily: "var(--font-orbitron)" }}>
                          SGT: {t("leaderboard.ranks." + (rankProgress.nextRank.id === 'novato' ? 'Rookie' : rankProgress.nextRank.id.charAt(0).toUpperCase() + rankProgress.nextRank.id.slice(1)))}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.04] p-[1px]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-neon-green/40 to-neon-green"
                          style={{ boxShadow: "0 0 8px rgba(57, 255, 20, 0.3)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${rankProgress.progressToNext}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-[10px] text-text-muted/60 font-medium leading-relaxed" style={{ fontFamily: "var(--font-rajdhani)" }}>
                        {rankProgress.nextRank.reqDescription}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Left Column: Account Credentials (Mobile: Second, Desktop: Left Col Span 2 Rows) */}
        <div className="order-2 lg:order-none lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 h-max">
          <AccountCredentials
            account={accounts.find(a => a.id === selectedAccountId)}
            challengeMetadata={challengeMetadata}
          />
        </div>

        {/* Stats Grid: Order 3 on Mobile, Bottom Right on Desktop */}
        <div className="order-3 lg:order-none lg:col-span-2 xl:col-span-3 lg:col-start-2 lg:row-start-2 w-full">
          {/* Stats — 2x2 grid (mobile) or 1x4 (xl) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-4 w-full">
            <StatCard
              title="Balance"
              value={`$${stats.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              color="green"
              icon={DollarSign}
            />
            {/* Profit/Loss with percentage badge */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-4 border-border-subtle hover:glow-green transition-shadow duration-300 flex flex-col justify-center"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-text-secondary" style={{ fontFamily: "var(--font-rajdhani)" }}>
                  Profit/Loss
                </span>
                {(() => {
                  const pnlPct = ((stats.equity - challengeMetadata.initialBalance) / challengeMetadata.initialBalance * 100);
                  const isProfit = pnlPct >= 0;
                  return (
                    <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isProfit ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30" : "bg-red-400/10 text-red-400 border border-red-400/30"}`}>
                      {isProfit ? "+" : ""}{pnlPct.toFixed(2)}%
                    </span>
                  );
                })()}
              </div>
              <p className={`text-base sm:text-xl font-bold truncate ${(stats.equity - challengeMetadata.initialBalance) >= 0 ? "text-neon-green" : "text-neon-red"}`} style={{ fontFamily: "var(--font-orbitron)" }}>
                {(stats.equity - challengeMetadata.initialBalance) >= 0 ? "+" : ""}${Math.abs(stats.equity - challengeMetadata.initialBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </motion.div>
            {/* Floating Loss */}
            {(() => {
              const floatingPnl = Number(accounts.find(a => a.id === selectedAccountId)?.floating_pnl) || 0;
              const hasPositions = floatingPnl !== 0;
              return (
                <StatCard
                  title="Floating Loss"
                  value={hasPositions ? `${floatingPnl >= 0 ? "+" : ""}$${Math.abs(floatingPnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0"}
                  subtitle={hasPositions ? "Posiciones abiertas" : "Sin posiciones abiertas"}
                  color={floatingPnl < 0 ? "red" : "blue"}
                  icon={Activity}
                />
              );
            })()}
            {/* Trading Days */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-4 border-border-subtle hover:glow-blue transition-shadow duration-300 flex flex-col justify-center"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-text-secondary truncate" style={{ fontFamily: "var(--font-rajdhani)" }}>
                  Trading Days
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg bg-neon-blue/5 flex items-center justify-center">
                  <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neon-blue" />
                </div>
              </div>
              <p className="text-base sm:text-xl font-bold text-neon-blue truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
                {accounts.find(a => a.id === selectedAccountId)?.trading_days_count || 0}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trading Objectives */}
      <TradingObjectives
        dailyDrawdownPct={accounts.find(a => a.id === selectedAccountId)?.daily_drawdown_pct || 4}
        maxDrawdownPct={stats.maxDailyDrawdown}
        currentDailyDD={stats.dailyDrawdown}
        currentMaxDD={Math.max(0, ((challengeMetadata.initialBalance - Math.min(stats.balance, stats.equity)) / challengeMetadata.initialBalance) * 100)}
        currentDailyLoss={Math.max(0, (accounts.find(a => a.id === selectedAccountId)?.daily_initial_balance || stats.balance) - stats.equity)}
        maxDailyLossLimit={(accounts.find(a => a.id === selectedAccountId)?.daily_drawdown_pct || 4) / 100 * (accounts.find(a => a.id === selectedAccountId)?.daily_initial_balance || stats.balance)}
        currentMaxLoss={Math.max(0, challengeMetadata.initialBalance - Math.min(stats.balance, stats.equity))}
        maxLossLimit={(stats.maxDailyDrawdown / 100) * challengeMetadata.initialBalance}
        tradingDaysCount={accounts.find(a => a.id === selectedAccountId)?.trading_days_count || 0}
        minTradingDays={5}
        profitTargetPct={challengeMetadata.profitTargetPct}
        currentProfitPct={Number(((stats.equity - challengeMetadata.initialBalance) / challengeMetadata.initialBalance * 100).toFixed(2))}
        currentProfit={Math.max(0, stats.equity - challengeMetadata.initialBalance)}
        profitTarget={challengeMetadata.initialBalance * (challengeMetadata.profitTargetPct / 100)}
        isFunded={challengeMetadata.isFunded}
      />

      {/* P&L Performance Chart */}
      <div className="mb-6">
        {realPnLData.length > 0 ? (
          <PnLChart
            dailyData={realPnLData}
            initialBalance={challengeMetadata.initialBalance}
            profitTargetPct={challengeMetadata.profitTargetPct}
            maxDrawdownPct={challengeMetadata.type === 'express_1phase' ? 6 : stats.maxDailyDrawdown}
          />
        ) : (
          <div className="relative bg-[#0d1424]/80 border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="absolute -top-20 right-10 w-60 h-60 bg-emerald-500/[0.02] blur-[100px] rounded-full pointer-events-none" />
            <BarChart3 className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30 font-medium" style={{ fontFamily: "var(--font-rajdhani)" }}>
              {t("dashboard.pnlEmpty") || "La curva de rendimiento aparecerá cuando comiences a operar"}
            </p>
            <p className="text-[11px] text-white/15 mt-1">Conecta tu EA de MT5 para comenzar</p>
          </div>
        )}
      </div>

      {/* Recent Trades — real data from database */}
      <div className="mb-6">
        <RecentTrades trades={realTrades} />
      </div>

      {/* Floating Payout / Withdraw Section (Only visible when funded AND in profit) */}
      {challengeMetadata.isFunded && stats.equity > challengeMetadata.initialBalance && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 glass-card px-5 py-3 border-neon-green/40 glow-green z-50 flex items-center justify-center sm:justify-start"
        >
          {timeToPayout === t("dashboard.readyForPayout") ? (
            <motion.button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neon-green font-semibold">{t("dashboard.readyForPayout")}</p>
                <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {t("dashboard.withdrawBtn")}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center border border-neon-green/40 group-hover:bg-neon-green/30 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                <Wallet className="w-5 h-5 text-neon-green" />
              </div>
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neon-green font-semibold">{t("dashboard.payout.nextPayout")}</p>
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
          )}
        </motion.div>
      )}

      {/* Withdraw Modal */}
      {selectedAccountId && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          accountId={selectedAccountId}
          profit={Math.max(0, stats.equity - challengeMetadata.initialBalance)}
          profitSplitPct={challengeMetadata.profitSplitPct}
          initialBalance={challengeMetadata.initialBalance}
          tradingDaysCount={accounts.find(a => a.id === selectedAccountId)?.trading_days_count || 0}
          hasWeeklyPayouts={accounts.find(a => a.id === selectedAccountId)?.has_weekly_payouts || false}
        />
      )}


    </motion.div>
  );
}
