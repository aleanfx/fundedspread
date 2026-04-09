"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  AlertCircle,
  Users,
  DollarSign,
  Activity,
  ShoppingCart,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  CreditCard,
  UserX,
  Package,
  RefreshCw,
  Edit3,
  Trophy,
  Mail,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { emailTemplates } from "@/lib/emails/templates";
import { RankBadge } from "@/components/RankBadge";
import { calculateRank, UserRankStats, RankId, RANK_INFO } from "@/lib/utils/rankSystem";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

/* ============================================
   TYPES
   ============================================ */
interface WithdrawalRequest {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  user_amount: number;
  network: string;
  wallet_address: string;
  status: string;
  admin_notes: string | null;
  tx_hash: string | null;
  profit_split_pct: number;
  created_at: string;
  processed_at: string | null;
  completed_at: string | null;
  user_email?: string;
  user_name?: string;
  challenge_tier?: string;
  initial_balance?: number;
}

interface AccountInfo {
  id: string;
  user_id: string;
  mt5_login: string;
  initial_balance: number;
  current_balance: number;
  current_equity: number;
  challenge_tier: string;
  challenge_type: string;
  account_status: string;
  profit_split_pct: number;
  trading_days_count: number;
  has_weekly_payouts: boolean;
  has_raw_spread: boolean;
  has_zero_commission: boolean;
  has_scaling_x2: boolean;
  addon_split_90: boolean;
  addon_split_100: boolean;
}

interface ChallengeTransaction {
  id: string;
  user_id: string;
  user_email: string;
  challenge_tier: string;
  challenge_type: string;
  account_size: number;
  price: number;
  status: string;
  payment_method: string;
  nowpayments_invoice_id: string;
  has_raw_spread: boolean;
  has_zero_commission: boolean;
  has_weekly_payouts: boolean;
  has_scaling_x2: boolean;
  addon_split_90: boolean;
  addon_split_100: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  account_balance: number;
  total_withdrawals: number;
  top_three_finishes: number;
  top_ten_finishes: number;
  highest_rank: string;
  is_rank_locked: boolean;
  xp: number;
  is_admin: boolean;
  created_at: string;
  phases_passed: number;
  is_funded: boolean;
}

type MainTab = "retiros" | "compras" | "usuarios" | "cuentas" | "emails";
type WithdrawalFilter = "pending" | "approved" | "completed" | "rejected" | "all";
type TransactionFilter = "pending" | "paid" | "active" | "all";

/* ============================================
   COPY BUTTON COMPONENT
   ============================================ */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-white/10 transition-colors ml-1 flex-shrink-0" title="Copiar">
      {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3 text-text-muted/50 hover:text-white" />}
    </button>
  );
}

/* ============================================
   ADDON BADGES
   ============================================ */
function AddonBadges({ tx }: { tx: ChallengeTransaction }) {
  const addons = [];
  if (tx.has_raw_spread) addons.push("Raw Spread");
  if (tx.has_zero_commission) addons.push("Comisión Cero");
  if (tx.has_weekly_payouts) addons.push("Pagos Semanales");
  if (tx.has_scaling_x2) addons.push("Escalamiento x2");
  if (tx.addon_split_90) addons.push("Split 90%");
  if (tx.addon_split_100) addons.push("Split 100%");

  if (addons.length === 0) return <span className="text-text-muted/40 text-[10px]">Sin extras</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {addons.map((a) => (
        <span key={a} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">
          {a}
        </span>
      ))}
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [transactions, setTransactions] = useState<ChallengeTransaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leaderboardTraders, setLeaderboardTraders] = useState<any[]>([]);

  // Tabs
  const [mainTab, setMainTab] = useState<MainTab>("compras");
  const [withdrawalTab, setWithdrawalTab] = useState<WithdrawalFilter>("pending");
  const [transactionTab, setTransactionTab] = useState<TransactionFilter>("all");

  // Modals & processing
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [txHashInput, setTxHashInput] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<string | null>(null);

  // MT5 Activation
  const [showActivateModal, setShowActivateModal] = useState<string | null>(null);
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Server, setMt5Server] = useState("FundedSpread-Server");

  // Leaderboard management
  const [showEditProfitModal, setShowEditProfitModal] = useState<string | null>(null);
  const [editProfitValue, setEditProfitValue] = useState("");
  const [editRankValue, setEditRankValue] = useState<RankId>("unranked");
  const [editRankLocked, setEditRankLocked] = useState(false);
  const [showResetTableModal, setShowResetTableModal] = useState(false);
  const [resettingTable, setResettingTable] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Profile editor
  const [showProfileEditor, setShowProfileEditor] = useState<string | null>(null);
  const [profileEdits, setProfileEdits] = useState<Record<string, any>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Manual account creation
  const [showManualAccountModal, setShowManualAccountModal] = useState<string | null>(null);
  const [manualAccount, setManualAccount] = useState({
    challengeTier: "starter",
    challengeType: "classic_2phase",
    challengePhase: 1,
    accountSize: 10000,
    price: 0,
    mt5Login: "",
    mt5Password: "",
    mt5Server: "FundedSpread-Server",
  });
  const [creatingManualAccount, setCreatingManualAccount] = useState(false);

  const TIER_SIZES: Record<string, number> = {
    micro: 5000, starter: 10000, pro: 25000,
    elite: 50000, legend: 100000, apex: 200000,
  };

  const handleCreateManualAccount = async () => {
    if (!showManualAccountModal || !manualAccount.mt5Login || !manualAccount.mt5Password) return;
    setCreatingManualAccount(true);
    try {
      const targetUser = users.find(u => u.id === showManualAccountModal);
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "manual",
          action: "manual_create_account",
          userId: showManualAccountModal,
          userEmail: targetUser?.email || "",
          challengeTier: manualAccount.challengeTier,
          challengeType: manualAccount.challengeType,
          challengePhase: Number(manualAccount.challengePhase),
          accountSize: manualAccount.accountSize,
          price: manualAccount.price,
          mt5Login: manualAccount.mt5Login,
          mt5Password: manualAccount.mt5Password,
          mt5Server: manualAccount.mt5Server,
        }),
      });
      if (res.ok) {
        await fetchData();
        setShowManualAccountModal(null);
        setManualAccount({ challengeTier: "starter", challengeType: "classic_2phase", challengePhase: 1, accountSize: 10000, price: 0, mt5Login: "", mt5Password: "", mt5Server: "FundedSpread-Server" });
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error de red al crear cuenta");
    }
    setCreatingManualAccount(false);
  };


  const handleImpersonate = async (userId: string) => {
    try {
      setImpersonatingId(userId);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        body: JSON.stringify({ action: "start", userId })
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const err = await res.json();
        alert("Error al iniciar monitoreo: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setImpersonatingId(null);
    }
  };

  // Auth check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/dashboard");
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const isDbAdmin = userData?.is_admin === true;
      const isEnvAdmin = user.email === ADMIN_EMAIL;

      if (!isDbAdmin && !isEnvAdmin) {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };
    checkAdmin();
  }, [supabase, router]);

  // Fetch data
  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) return;
      const data = await res.json();

      const { withdrawals, accounts: accs, profiles, transactions: txns, leaderboardTraders: lbTraders } = data;

      // Enrich withdrawals
      if (withdrawals) {
        const enriched = withdrawals.map((w: any) => {
          const profile = profiles?.find((p: any) => p.id === w.user_id);
          const account = accs?.find((a: any) => a.id === w.account_id);
          return {
            ...w,
            user_email: profile?.email || "Unknown",
            user_name: profile?.username || profile?.email?.split("@")[0] || "Trader",
            challenge_tier: account?.challenge_tier || "N/A",
            initial_balance: account?.initial_balance || 0,
          };
        });
        setRequests(enriched);
      }

      if (accs) setAccounts(accs);
      if (profiles) setUsers(profiles);
      if (txns) setTransactions(txns);
      if (lbTraders) setLeaderboardTraders(lbTraders);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  /* ---- Withdrawal actions ---- */
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const res = await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "approve" }),
    });
    if (res.ok) { await fetchData(); setShowApproveModal(null); }
    setProcessingId(null);
  };

  const handleComplete = async (id: string) => {
    if (!txHashInput.trim()) return;
    setProcessingId(id);
    const res = await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "complete", txHash: txHashInput }),
    });
    if (res.ok) { await fetchData(); setTxHashInput(""); setShowApproveModal(null); }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const res = await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "reject", notes: rejectNotes }),
    });
    if (res.ok) { await fetchData(); setRejectNotes(""); setShowRejectModal(null); }
    setProcessingId(null);
  };

  /* ---- Transaction actions ---- */
  const handleUpdateTransactionStatus = async (id: string) => {
    if (!newStatus) return;
    setProcessingId(id);
    const res = await fetch("/api/admin/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "update_status", newStatus }),
    });
    if (res.ok) { await fetchData(); setNewStatus(""); setShowStatusModal(null); }
    setProcessingId(null);
  };

  const handleActivateWithCredentials = async () => {
    if (!showActivateModal || !mt5Login || !mt5Password) return;
    setProcessingId(showActivateModal);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: showActivateModal,
          action: "activate_with_credentials",
          mt5Login,
          mt5Password,
          mt5Server,
        }),
      });
      if (res.ok) {
        setShowActivateModal(null);
        setMt5Login("");
        setMt5Password("");
        setMt5Server("FundedSpread-Server");
        await fetchData();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Error activating:", err);
      alert("Error de conexión");
    }
    setProcessingId(null);
  };

  /* ---- User actions ---- */
  const handleDeleteUser = async (userId: string) => {
    setProcessingId(userId);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "delete_user" }),
    });
    if (res.ok) { await fetchData(); setShowDeleteUserModal(null); }
    setProcessingId(null);
  };

  const openProfileEditor = (user: UserProfile) => {
    setShowProfileEditor(user.id);
    setProfileEdits({
      username: user.username || "",
      phases_passed: user.phases_passed || 0,
      is_funded: user.is_funded || false,
      total_withdrawals: user.total_withdrawals || 0,
      top_three_finishes: user.top_three_finishes || 0,
      top_ten_finishes: user.top_ten_finishes || 0,
      highest_rank: user.highest_rank || "unranked",
      is_rank_locked: user.is_rank_locked || false,
      is_admin: user.is_admin || false,
      account_balance: user.account_balance || 0,
    });
  };

  const handleSaveProfile = async () => {
    if (!showProfileEditor) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: showProfileEditor,
          action: "update_profile",
          updates: profileEdits,
        }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === showProfileEditor ? { ...u, ...profileEdits } : u));
        setShowProfileEditor(null);
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error de conexión");
    }
    setSavingProfile(false);
  };

  /* ---- Computed values ---- */
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;
  const totalPaidOut = requests
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + Number(r.user_amount), 0);

  const paidTransactions = transactions.filter((t) => ["paid", "active", "completed"].includes(t.status));
  const totalRevenue = paidTransactions.reduce((sum, t) => sum + Number(t.price), 0);

  const filteredRequests = withdrawalTab === "all"
    ? requests
    : requests.filter((r) => r.status === withdrawalTab);

  const filteredTransactions = transactionTab === "all"
    ? transactions.filter((t) => t.status !== "pending")
    : transactions.filter((t) => t.status === transactionTab);

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    approved: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    processing: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    completed: "text-neon-green bg-neon-green/10 border-neon-green/30",
    rejected: "text-red-400 bg-red-500/10 border-red-500/30",
    paid: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    active: "text-neon-green bg-neon-green/10 border-neon-green/30",
    failed: "text-red-400 bg-red-500/10 border-red-500/30",
    pending_creation: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    processing: "Procesando",
    completed: "Completado",
    rejected: "Rechazado",
    paid: "Pagado",
    active: "Activo",
    failed: "Fallido",
    pending_creation: "Pendiente Creación",
    funded: "Fondeada",
    pending_link: "Pendiente Link",
  };

  const challengeTypeLabels: Record<string, string> = {
    classic_2phase: "Clásico 2-Fases",
    express_1phase: "Express 1-Fase",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const mainTabs: { id: MainTab; label: string; icon: any; count?: number }[] = [
    { id: "compras", label: "COMPRAS", icon: ShoppingCart, count: paidTransactions.length },
    { id: "retiros", label: "RETIROS", icon: Wallet, count: pendingCount > 0 ? pendingCount : undefined },
    { id: "usuarios", label: "USUARIOS", icon: Users, count: users.length },
    { id: "cuentas", label: "CUENTAS", icon: Package, count: accounts.filter(a => a.account_status === "funded" || a.account_status === "pending_creation").length },
    { id: "emails", label: "CORREOS (BETA)", icon: Mail },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
              PANEL ADMINISTRADOR
            </h1>
            <p className="text-sm text-text-muted">Centro de control — Funded Spread</p>
          </div>
        </div>
        <button
          onClick={() => setShowResetTableModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors text-sm font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          Reiniciar Tabla
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Usuarios</p>
              <p className="text-xl font-black text-blue-400" style={{ fontFamily: "var(--font-orbitron)" }}>{users.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Compras</p>
              <p className="text-xl font-black text-purple-400" style={{ fontFamily: "var(--font-orbitron)" }}>{paidTransactions.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-neon-green" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Ingresos</p>
              <p className="text-xl font-black text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>${totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Retiros Pend.</p>
              <p className="text-xl font-black text-yellow-400" style={{ fontFamily: "var(--font-orbitron)" }}>{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-neon-green" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Total Pagado</p>
              <p className="text-xl font-black text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>${totalPaidOut.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
              mainTab === tab.id
                ? "bg-neon-green/10 text-neon-green border border-neon-green/40"
                : "bg-white/5 text-text-muted border border-white/[0.06] hover:bg-white/10"
            }`}
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                mainTab === tab.id ? "bg-neon-green/20 text-neon-green" : "bg-white/10 text-text-muted"
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================
         TAB: COMPRAS DE CHALLENGES
         ============================================ */}
      {mainTab === "compras" && (
        <div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(["all", "paid", "active"] as TransactionFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTransactionTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  transactionTab === tab
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    : "bg-white/5 text-text-muted border border-white/[0.06] hover:bg-white/10"
                }`}
              >
                {tab === "all" ? "Todos" : statusLabels[tab]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                <p className="text-text-muted text-sm">No hay transacciones en esta categoría</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const userProfile = users.find(u => u.id === tx.user_id);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 hover:border-white/15 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Status + Date */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase ${statusColors[tx.status]}`}>
                            {statusLabels[tx.status] || tx.status}
                          </span>
                          <span className="text-xs text-text-muted font-mono">
                            {new Date(tx.created_at).toLocaleDateString("es-ES", {
                              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-text-muted">Trader:</span>
                          <span className="text-white font-semibold">{userProfile?.username || tx.user_email?.split("@")[0] || "—"}</span>
                          <span className="text-text-muted/60 text-xs">({tx.user_email})</span>
                          <CopyBtn text={tx.user_email} />
                        </div>

                        {/* Details grid */}
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                          <div>
                            <span className="text-text-muted">Tipo: </span>
                            <span className="text-white font-bold">{challengeTypeLabels[tx.challenge_type] || tx.challenge_type}</span>
                          </div>
                          <div>
                            <span className="text-text-muted">Tier: </span>
                            <span className="text-white uppercase font-bold">{tx.challenge_tier}</span>
                          </div>
                          <div>
                            <span className="text-text-muted">Cuenta: </span>
                            <span className="text-white font-mono">${Number(tx.account_size).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-text-muted">Precio: </span>
                            <span className="text-neon-green font-bold font-mono">${tx.price} USD</span>
                          </div>
                          <div>
                            <span className="text-text-muted">Invoice: </span>
                            <span className="text-text-muted/60 font-mono text-xs">{tx.nowpayments_invoice_id || "—"}</span>
                          </div>
                        </div>

                        {/* Add-ons */}
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted text-xs">Extras:</span>
                          <AddonBadges tx={tx} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {tx.status === "paid" && (
                          <button
                            onClick={() => { setShowActivateModal(tx.id); setMt5Login(""); setMt5Password(""); }}
                            className="px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold hover:bg-neon-green/20 transition-colors flex items-center gap-1.5 animate-pulse"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Activar Cuenta
                          </button>
                        )}
                        <button
                          onClick={() => { setShowStatusModal(tx.id); setNewStatus(tx.status); }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5"
                        >
                          <ChevronDown className="w-3 h-3" />
                          Cambiar Estado
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================
         TAB: RETIROS
         ============================================ */}
      {mainTab === "retiros" && (
        <div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(["pending", "approved", "completed", "rejected", "all"] as WithdrawalFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setWithdrawalTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  withdrawalTab === tab
                    ? "bg-neon-green/10 text-neon-green border border-neon-green/40"
                    : "bg-white/5 text-text-muted border border-white/[0.06] hover:bg-white/10"
                }`}
              >
                {tab === "all" ? "Todos" : statusLabels[tab]}
                {tab === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-yellow-500 text-black text-[9px] px-1 py-0.5 rounded-full font-black">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Wallet className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                <p className="text-text-muted text-sm">No hay solicitudes en esta categoría</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 hover:border-white/15 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase ${statusColors[req.status]}`}>
                          {statusLabels[req.status] || req.status}
                        </span>
                        <span className="text-xs text-text-muted font-mono">
                          {new Date(req.created_at).toLocaleDateString("es-ES", {
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-text-muted">Trader:</span>
                        <span className="text-white font-semibold">{req.user_name}</span>
                        <span className="text-text-muted/60 text-xs">({req.user_email})</span>
                        <CopyBtn text={req.user_email || ""} />
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        <div>
                          <span className="text-text-muted">Monto: </span>
                          <span className="text-neon-green font-bold font-mono">${req.user_amount} USDT</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Red: </span>
                          <span className="text-white font-bold">{req.network}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Split: </span>
                          <span className="text-white">{req.profit_split_pct}%</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Cuenta: </span>
                          <span className="text-white">{req.challenge_tier?.toUpperCase()} (${req.initial_balance?.toLocaleString()})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-text-muted">Dirección:</span>
                        <span className="text-white font-mono text-xs break-all">{req.wallet_address}</span>
                        <CopyBtn text={req.wallet_address} />
                      </div>
                      {req.tx_hash && (
                        <div className="text-sm">
                          <span className="text-text-muted">TX Hash: </span>
                          <span className="text-neon-green font-mono text-xs break-all">{req.tx_hash}</span>
                          <CopyBtn text={req.tx_hash} />
                        </div>
                      )}
                      {req.admin_notes && (
                        <div className="text-sm">
                          <span className="text-text-muted">Notas: </span>
                          <span className="text-yellow-400 text-xs">{req.admin_notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === "pending" && (
                        <>
                          <motion.button
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold hover:bg-neon-green/20 transition-colors flex items-center gap-1.5"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Aprobar
                          </motion.button>
                          <motion.button
                            onClick={() => setShowRejectModal(req.id)}
                            disabled={processingId === req.id}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </motion.button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <motion.button
                          onClick={() => setShowApproveModal(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-neon-green text-black text-xs font-extrabold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all flex items-center gap-1.5"
                          style={{ fontFamily: "var(--font-orbitron)" }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Marcar Pagado
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================
         TAB: USUARIOS
         ============================================ */}
      {mainTab === "usuarios" && (
        <div>
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                <p className="text-text-muted text-sm">No hay usuarios registrados</p>
              </div>
            ) : (
              users.map((u) => {
                const userTxCount = transactions.filter(t => t.user_id === u.id).length;
                const userAccounts = accounts.filter(a => a.user_id === u.id);
                const lbEntry = leaderboardTraders.find(t => t.user_id === u.id);
                const lbPosition = lbEntry ? leaderboardTraders.indexOf(lbEntry) + 1 : null;
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 hover:border-white/15 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-sm">{(u.username || u.email)?.[0]?.toUpperCase()}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-white font-semibold text-sm">{u.username || "Sin nombre"}</span>
                            <span className="text-text-muted/60 text-xs">({u.email})</span>
                            <CopyBtn text={u.email} />
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                            <div>
                              <span className="text-text-muted">Registro: </span>
                              <span className="text-white">{new Date(u.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>
                            <div>
                              <span className="text-text-muted">Compras: </span>
                              <span className={`font-bold ${userTxCount > 0 ? "text-purple-400" : "text-text-muted/40"}`}>{userTxCount}</span>
                            </div>
                            <div>
                              <span className="text-text-muted">Cuentas: </span>
                              <span className={`font-bold ${userAccounts.length > 0 ? "text-neon-green" : "text-text-muted/40"}`}>{userAccounts.length}</span>
                            </div>
                            <div>
                              <span className="text-text-muted">Retirado: </span>
                              <span className="text-white font-mono">${Number(u.total_withdrawals || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-text-muted">Posición: </span>
                              {lbPosition ? (
                                <span className={`font-bold ${lbPosition <= 3 ? "text-yellow-400" : lbPosition <= 10 ? "text-neon-green" : "text-white"}`}>#{lbPosition}</span>
                              ) : (
                                <span className="text-text-muted/40">Sin ranking</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-text-muted">Rango: </span>
                              <div className="flex items-center gap-1.5">
                                <RankBadge 
                                  rankId={(u.highest_rank as RankId) || "unranked"} 
                                  size="sm" 
                                />
                                {u.is_rank_locked && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-text-muted">Profit: </span>
                              <span className="text-neon-green font-bold font-mono">${lbEntry ? Number(lbEntry.total_profit).toLocaleString() : 0}</span>
                              <button
                                onClick={() => { setShowEditProfitModal(u.id); setEditProfitValue(String(lbEntry?.total_profit || 0)); }}
                                className="ml-1 p-0.5 rounded hover:bg-white/10 text-text-muted hover:text-neon-green transition-colors"
                                title="Editar profit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleImpersonate(u.id)}
                          disabled={impersonatingId === u.id}
                          className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-colors flex items-center gap-1.5"
                        >
                          {impersonatingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                          Monitorear
                        </button>
                        <button
                          onClick={async () => {
                            const newLock = !u.is_rank_locked;
                            const { error } = await supabase.from('users').update({ is_rank_locked: newLock }).eq('id', u.id);
                            if (!error) {
                              setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, is_rank_locked: newLock } : usr));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1.5 ${u.is_rank_locked ? "bg-neon-green/10 border-neon-green/20 text-neon-green" : "bg-white/5 border-white/10 text-text-muted hover:bg-white/10"}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {u.is_rank_locked ? "Rango Bloqueado" : "Bloquear Rango"}
                        </button>
                        <button
                          onClick={() => { 
                            setShowEditProfitModal(u.id); 
                            setEditProfitValue(String(lbEntry?.total_profit || 0));
                            setEditRankValue((u.highest_rank as RankId) || "unranked");
                            setEditRankLocked(u.is_rank_locked);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green/70 text-xs font-bold hover:bg-neon-green/20 hover:text-neon-green transition-colors flex items-center gap-1.5"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          Editar Profit
                        </button>
                        <button
                          onClick={() => openProfileEditor(u)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400/70 text-xs font-bold hover:bg-blue-500/20 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar Perfil
                        </button>
                        <button
                          onClick={() => setShowManualAccountModal(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400/70 text-xs font-bold hover:bg-purple-500/20 hover:text-purple-400 transition-colors flex items-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Agregar Cuenta
                        </button>
                        <button
                          onClick={() => setShowDeleteUserModal(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/70 text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-1.5"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================
         TAB: CUENTAS
         ============================================ */}
      {mainTab === "cuentas" && (
        <div>
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Package className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                <p className="text-text-muted text-sm">No hay cuentas creadas</p>
              </div>
            ) : (
              accounts.map((acc) => {
                const userProfile = users.find(u => u.id === acc.user_id);
                return (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 hover:border-white/15 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase ${statusColors[acc.account_status] || "text-text-muted bg-white/5 border-white/10"}`}>
                          {statusLabels[acc.account_status] || acc.account_status}
                        </span>
                        {userProfile && (
                          <span className="text-sm text-white font-semibold">{userProfile.username || userProfile.email}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        <div>
                          <span className="text-text-muted">MT5: </span>
                          <span className="text-white font-mono font-bold">{acc.mt5_login || "—"}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Tier: </span>
                          <span className="text-white uppercase font-bold">{acc.challenge_tier}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Tipo: </span>
                          <span className="text-white">{challengeTypeLabels[acc.challenge_type] || acc.challenge_type}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Balance: </span>
                          <span className="text-white font-mono">${Number(acc.initial_balance).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Equity: </span>
                          <span className={`font-mono font-bold ${Number(acc.current_equity) >= Number(acc.initial_balance) ? "text-neon-green" : "text-red-400"}`}>
                            ${Number(acc.current_equity).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted">Split: </span>
                          <span className="text-white">{acc.profit_split_pct}%</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Días Op.: </span>
                          <span className={`font-bold ${(acc.trading_days_count || 0) >= 5 ? "text-neon-green" : "text-yellow-400"}`}>
                            {acc.trading_days_count || 0}/5
                          </span>
                        </div>
                      </div>
                      {/* Add-on flags */}
                      <div className="flex flex-wrap gap-1">
                        {acc.has_raw_spread && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">Raw Spread</span>}
                        {acc.has_zero_commission && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">Zero Comm</span>}
                        {acc.has_weekly_payouts && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">Weekly Pay</span>}
                        {acc.has_scaling_x2 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">Scaling x2</span>}
                        {acc.addon_split_90 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">Split 90%</span>}
                      </div>
                      {/* Actions */}
                      <div className="flex justify-end pt-2 border-t border-white/5 mx-[-8px]">
                        <button
                          onClick={() => handleImpersonate(acc.user_id)}
                          disabled={impersonatingId === acc.user_id}
                          className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-colors flex items-center gap-1.5"
                        >
                          {impersonatingId === acc.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                          Monitorear Trader
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================
         TAB: EMAILS HTML
         ============================================ */}
      {mainTab === "emails" && (
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/10">
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>COPIAR PLANTILLAS HTML</h3>
            <p className="text-sm text-text-secondary mb-6">
              Estas plantillas están listas para ser pegadas en tu gestor de correos usando la función "Insertar HTML". Contienen CSS inline para compatibilidad máxima.
              Las variables como <code className="bg-white/10 px-1 rounded">{"{{TRADER_NAME}}"}</code> pueden ser reemplazadas dinámicamente o escritas a mano.
            </p>
            <div className="grid grid-cols-1 gap-6">
              {/* Fase 1 */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h4 className="text-emerald-500 font-bold uppercase text-sm flex items-center gap-2">
                       Fase 1 Superada
                    </h4>
                    <p className="text-xs text-text-muted mt-1">
                      Variables sugeridas: <code className="text-emerald-500/80">{"{{TRADER_NAME}}"}</code>, <code className="text-emerald-500/80">{"{{CERTIFICATE_URL}}"}</code>
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(emailTemplates.phase1()); alert("HTML Copiado"); }}
                    className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                  >
                    Copiar HTML
                  </button>
                </div>
              </div>

              {/* Funded */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h4 className="text-purple-400 font-bold uppercase text-sm flex items-center gap-2">
                       Fondeo Oficial (Fase 2 Superada)
                    </h4>
                    <p className="text-xs text-text-muted mt-1">
                      Variables sugeridas: <code className="text-purple-400/80">{"{{TRADER_NAME}}"}</code>, <code className="text-purple-400/80">{"{{ACCOUNT_SIZE}}"}</code>, <code className="text-purple-400/80">{"{{CERTIFICATE_URL}}"}</code>
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(emailTemplates.funded()); alert("HTML Copiado"); }}
                    className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/20 transition-colors whitespace-nowrap"
                  >
                    Copiar HTML
                  </button>
                </div>
              </div>

              {/* Payout */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h4 className="text-neon-green font-bold uppercase text-sm flex items-center gap-2">
                       Retiro Procesado
                    </h4>
                    <p className="text-xs text-text-muted mt-1">
                      Variables sugeridas: <code className="text-neon-green/80">{"{{TRADER_NAME}}"}</code>, <code className="text-neon-green/80">{"{{AMOUNT}}"}</code>, <code className="text-neon-green/80">{"{{CERTIFICATE_URL}}"}</code>
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(emailTemplates.payout()); alert("HTML Copiado"); }}
                    className="px-4 py-2 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 text-xs font-bold hover:bg-neon-green/20 transition-colors whitespace-nowrap"
                  >
                    Copiar HTML
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
         MODALS
         ============================================ */}

      {/* Reject Withdrawal Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowRejectModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-card p-6 border-red-500/30"
          >
            <h3 className="text-lg font-bold text-red-400 mb-4" style={{ fontFamily: "var(--font-orbitron)" }}>
              RECHAZAR RETIRO
            </h3>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Razón del rechazo (opcional)..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-red-500/40 transition-colors resize-none h-24"
            />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(null)}
                className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {processingId === showRejectModal ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rechazar"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Complete Withdrawal (Mark as Paid) Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowApproveModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-card p-6 border-neon-green/30"
          >
            <h3 className="text-lg font-bold text-neon-green mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
              CONFIRMAR PAGO
            </h3>
            <p className="text-sm text-text-muted mb-4">Pega el hash de la transacción de blockchain después de enviar el USDT.</p>
            <input
              type="text"
              value={txHashInput}
              onChange={(e) => setTxHashInput(e.target.value)}
              placeholder="0x... o T..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-neon-green/40 transition-colors font-mono"
            />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setShowApproveModal(null)}
                className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                onClick={() => handleComplete(showApproveModal)}
                disabled={processingId === showApproveModal || !txHashInput.trim()}
                className={`py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 ${
                  txHashInput.trim()
                    ? "bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                    : "bg-white/5 text-text-muted cursor-not-allowed"
                }`}
                style={{ fontFamily: "var(--font-orbitron)" }}
                whileHover={txHashInput.trim() ? { scale: 1.02 } : {}}
                whileTap={txHashInput.trim() ? { scale: 0.98 } : {}}
              >
                {processingId === showApproveModal ? <Loader2 className="w-4 h-4 animate-spin" /> : "CONFIRMAR"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Transaction Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowStatusModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm glass-card p-6 border-purple-500/30"
          >
            <h3 className="text-lg font-bold text-purple-400 mb-4" style={{ fontFamily: "var(--font-orbitron)" }}>
              CAMBIAR ESTADO
            </h3>
            <div className="space-y-2 mb-4">
              {["pending", "paid", "active", "completed", "failed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold uppercase border transition-all ${
                    newStatus === s
                      ? statusColors[s]
                      : "bg-white/[0.03] border-white/[0.06] text-text-muted hover:bg-white/5"
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowStatusModal(null)}
                className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                onClick={() => handleUpdateTransactionStatus(showStatusModal)}
                disabled={processingId === showStatusModal}
                className="py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {processingId === showStatusModal ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowDeleteUserModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm glass-card p-6 border-red-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-400" style={{ fontFamily: "var(--font-orbitron)" }}>
                  ELIMINAR USUARIO
                </h3>
                <p className="text-xs text-text-muted">Esta acción es irreversible</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-1">
              Se eliminará el usuario <strong className="text-white">{users.find(u => u.id === showDeleteUserModal)?.username || users.find(u => u.id === showDeleteUserModal)?.email}</strong> y todos sus datos:
            </p>
            <ul className="text-xs text-text-muted space-y-1 mb-4 pl-4 list-disc">
              <li>Cuentas MT5 y snapshots</li>
              <li>Transacciones de challenges</li>
              <li>Solicitudes de retiro</li>
              <li>Perfil y autenticación</li>
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteUserModal(null)}
                className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                onClick={() => handleDeleteUser(showDeleteUserModal)}
                disabled={processingId === showDeleteUserModal}
                className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {processingId === showDeleteUserModal ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Profit Modal */}
      {showEditProfitModal && (() => {
        const targetUser = users.find(u => u.id === showEditProfitModal);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowEditProfitModal(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm glass-card p-6 border-neon-green/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                    EDITAR PROFIT
                  </h3>
                  <p className="text-xs text-text-muted">{targetUser?.username || targetUser?.email}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-3">
                 Establece el monto total de retiros de este usuario en el leaderboard. Esto afecta su posición y rango.
              </p>
              <div className="mb-4">
                <label className="text-xs text-text-muted block mb-1">Nuevo Profit ($)</label>
                <input
                  type="number"
                  value={editProfitValue}
                  onChange={(e) => setEditProfitValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-neon-green/50 focus:outline-none"
                  placeholder="ej: 2500"
                  min="0"
                  step="1"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 3000, 5000].map(v => (
                    <button
                      key={v}
                      onClick={() => setEditProfitValue(String(v))}
                      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-text-muted text-[10px] hover:bg-white/10 hover:text-white transition-colors"
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Rango Manual</label>
                  <select
                    value={editRankValue}
                    onChange={(e) => setEditRankValue(e.target.value as RankId)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-neon-green/50 focus:outline-none"
                  >
                    <option value="unranked" className="bg-black">Unranked</option>
                    <option value="novato" className="bg-black">Novato</option>
                    <option value="warrior" className="bg-black">Warrior</option>
                    <option value="elite" className="bg-black">Elite</option>
                    <option value="legend" className="bg-black">Legend</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer group py-2">
                    <input
                      type="checkbox"
                      checked={editRankLocked}
                      onChange={(e) => setEditRankLocked(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${editRankLocked ? "bg-neon-green border-neon-green" : "border-white/20 group-hover:border-white/40"}`}>
                      {editRankLocked && <Check className="w-3 h-3 text-black font-bold" />}
                    </div>
                    <span className={`text-[10px] font-bold ${editRankLocked ? "text-neon-green" : "text-text-muted"}`}>
                      FORZAR RANGO
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowEditProfitModal(null)}
                  className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={async () => {
                    setProcessingId(showEditProfitModal);
                    try {
                      const res = await fetch("/api/admin/leaderboard", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "edit_user_profit",
                          userId: showEditProfitModal,
                          newProfit: Number(editProfitValue),
                          newRank: editRankValue !== "unranked" ? editRankValue : null,
                          isLocked: editRankLocked
                        }),
                      });
                      if (res.ok) {
                        setShowEditProfitModal(null);
                        setUsers(prev => prev.map(u => u.id === showEditProfitModal ? { 
                          ...u, 
                          highest_rank: editRankValue !== "unranked" ? editRankValue : u.highest_rank,
                          is_rank_locked: editRankLocked
                        } : u));
                        fetchData();
                      }
                    } catch (err) {
                      console.error("Error editing profit:", err);
                    }
                    setProcessingId(null);
                  }}
                  disabled={processingId === showEditProfitModal}
                  className="py-2.5 rounded-xl bg-neon-green text-black text-sm font-extrabold flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {processingId === showEditProfitModal ? <Loader2 className="w-4 h-4 animate-spin" /> : "GUARDAR"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Reset Table Confirmation Modal */}
      {showResetTableModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !resettingTable && setShowResetTableModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm glass-card p-6 border-orange-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: "var(--font-orbitron)" }}>
                  REINICIAR TABLA
                </h3>
                <p className="text-xs text-text-muted">Reset mensual del leaderboard</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-1">
              Esto ejecutará el reset mensual del leaderboard:
            </p>
            <ul className="text-xs text-text-muted space-y-1 mb-4 pl-4 list-disc">
              <li>Se eliminan todos los bots actuales</li>
              <li>Se generan ~80 nuevos bots para el mes</li>
              <li>Los Top 10 se llevan al nuevo mes</li>
              <li>La posición de usuarios reales se reinicia a $0</li>
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetTableModal(false)}
                disabled={resettingTable}
                className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                onClick={async () => {
                  setResettingTable(true);
                  try {
                    const res = await fetch("/api/leaderboard/reset", { method: "POST" });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`✅ Reset completado!\n${data.botsGenerated} bots generados\n${data.carryOvers} carry-overs\n${data.realUsersReset} usuarios reseteados`);
                      setShowResetTableModal(false);
                      fetchData();
                    } else {
                      alert("❌ Error: " + (data.error || "Error desconocido"));
                    }
                  } catch (err) {
                    console.error("Error resetting table:", err);
                    alert("❌ Error de conexión");
                  }
                  setResettingTable(false);
                }}
                disabled={resettingTable}
                className="py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {resettingTable ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Reiniciar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================
         MODAL: EDITAR PERFIL
         ============================================ */}
      {showProfileEditor && (() => {
        const editingUser = users.find(u => u.id === showProfileEditor);
        if (!editingUser) return null;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !savingProfile && setShowProfileEditor(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg glass-card p-6 border-blue-500/30 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: "var(--font-orbitron)" }}>
                    EDITAR PERFIL
                  </h3>
                  <p className="text-xs text-text-muted">{editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Nombre de Usuario</label>
                  <input
                    type="text"
                    value={profileEdits.username || ""}
                    onChange={(e) => setProfileEdits(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                  />
                </div>

                {/* Phases Passed + Is Funded + Balance */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Fases Completadas</label>
                    <input
                      type="number"
                      value={profileEdits.phases_passed || 0}
                      onChange={(e) => setProfileEdits(prev => ({ ...prev, phases_passed: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Balance Cuenta ($)</label>
                    <input
                      type="number"
                      value={profileEdits.account_balance || 0}
                      onChange={(e) => setProfileEdits(prev => ({ ...prev, account_balance: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={profileEdits.is_funded || false}
                        onChange={(e) => setProfileEdits(prev => ({ ...prev, is_funded: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-neon-green focus:ring-neon-green/30"
                      />
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Fondeado</span>
                    </label>
                  </div>
                </div>

                {/* Total Withdrawals */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Total Retirado ($)</label>
                  <input
                    type="number"
                    value={profileEdits.total_withdrawals || 0}
                    onChange={(e) => setProfileEdits(prev => ({ ...prev, total_withdrawals: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                    min="0"
                  />
                </div>

                {/* Top Finishes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Top 3 Finishes</label>
                    <input
                      type="number"
                      value={profileEdits.top_three_finishes || 0}
                      onChange={(e) => setProfileEdits(prev => ({ ...prev, top_three_finishes: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Top 10 Finishes</label>
                    <input
                      type="number"
                      value={profileEdits.top_ten_finishes || 0}
                      onChange={(e) => setProfileEdits(prev => ({ ...prev, top_ten_finishes: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                      min="0"
                    />
                  </div>
                </div>

                {/* Rank + Lock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Rango</label>
                    <select
                      value={profileEdits.highest_rank || "unranked"}
                      onChange={(e) => setProfileEdits(prev => ({ ...prev, highest_rank: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-400/50 focus:outline-none"
                    >
                      <option value="unranked" className="bg-black">Unranked</option>
                      <option value="novato" className="bg-black">Novato</option>
                      <option value="warrior" className="bg-black">Warrior</option>
                      <option value="elite" className="bg-black">Elite</option>
                      <option value="legend" className="bg-black">Legend</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group py-2">
                      <input
                        type="checkbox"
                        checked={profileEdits.is_rank_locked || false}
                        onChange={(e) => setProfileEdits(prev => ({ ...prev, is_rank_locked: e.target.checked }))}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${profileEdits.is_rank_locked ? "bg-neon-green border-neon-green" : "border-white/20 group-hover:border-white/40"}`}>
                        {profileEdits.is_rank_locked && <Check className="w-3 h-3 text-black font-bold" />}
                      </div>
                      <span className={`text-[10px] font-bold ${profileEdits.is_rank_locked ? "text-neon-green" : "text-text-muted"}`}>
                        FORZAR RANGO
                      </span>
                    </label>
                  </div>
                </div>

                {/* Admin Toggle */}
                <div className="border-t border-white/[0.06] pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={profileEdits.is_admin || false}
                      onChange={(e) => setProfileEdits(prev => ({ ...prev, is_admin: e.target.checked }))}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${profileEdits.is_admin ? "bg-purple-500 border-purple-500" : "border-white/20 group-hover:border-white/40"}`}>
                      {profileEdits.is_admin && <Check className="w-3 h-3 text-white font-bold" />}
                    </div>
                    <div>
                      <span className={`text-xs font-bold ${profileEdits.is_admin ? "text-purple-400" : "text-text-muted"}`}>
                        ADMINISTRADOR
                      </span>
                      <p className="text-[10px] text-text-muted/60">Otorga acceso al panel de administración</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setShowProfileEditor(null)}
                  disabled={savingProfile}
                  className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="py-2.5 rounded-xl bg-blue-500 text-white text-sm font-extrabold flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "GUARDAR"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        );
      })()}
      {showActivateModal && (() => {
        const activatingTx = transactions.find(t => t.id === showActivateModal);
        const activatingUser = activatingTx ? users.find(u => u.id === activatingTx.user_id) : null;
        if (!activatingTx) return null;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowActivateModal(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md glass-card p-6 border-neon-green/30"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                    ACTIVAR CUENTA
                  </h3>
                  <p className="text-xs text-text-muted">
                    {activatingUser?.username || activatingTx.user_email} — {activatingTx.challenge_tier?.toUpperCase()} ${Number(activatingTx.account_size).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Login MT5</label>
                  <input
                    type="text"
                    value={mt5Login}
                    onChange={(e) => setMt5Login(e.target.value)}
                    placeholder="ej: 50012345"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-neon-green/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Password MT5</label>
                  <input
                    type="text"
                    value={mt5Password}
                    onChange={(e) => setMt5Password(e.target.value)}
                    placeholder="ej: Abc123!@#"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-neon-green/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Servidor MT5</label>
                  <input
                    type="text"
                    value={mt5Server}
                    onChange={(e) => setMt5Server(e.target.value)}
                    placeholder="FundedSpread-Server"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-neon-green/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setShowActivateModal(null)}
                  className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleActivateWithCredentials}
                  disabled={processingId === showActivateModal || !mt5Login.trim() || !mt5Password.trim()}
                  className={`py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 ${
                    mt5Login.trim() && mt5Password.trim()
                      ? "bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                      : "bg-white/5 text-text-muted cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-orbitron)" }}
                  whileHover={mt5Login.trim() && mt5Password.trim() ? { scale: 1.02 } : {}}
                  whileTap={mt5Login.trim() && mt5Password.trim() ? { scale: 0.98 } : {}}
                >
                  {processingId === showActivateModal ? <Loader2 className="w-4 h-4 animate-spin" /> : "ACTIVAR"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ============================================
         MANUAL ACCOUNT CREATION MODAL
         ============================================ */}
      {showManualAccountModal && (() => {
        const targetUser = users.find(u => u.id === showManualAccountModal);
        return (
          <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowManualAccountModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                  <Package className="w-5 h-5 text-purple-400" />
                  Agregar Cuenta Manual
                </h3>
                <button
                  onClick={() => setShowManualAccountModal(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-text-muted mb-5">
                Para: <span className="text-white font-semibold">{targetUser?.username || targetUser?.email}</span>
              </p>

              <div className="space-y-4">
                {/* Challenge Tier */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Tier del Challenge</label>
                  <select
                    value={manualAccount.challengeTier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      setManualAccount(prev => ({ ...prev, challengeTier: tier, accountSize: TIER_SIZES[tier] || 10000 }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-purple-400/50 focus:outline-none"
                  >
                    <option value="micro" className="bg-bg-secondary">Micro — $5,000</option>
                    <option value="starter" className="bg-bg-secondary">Starter — $10,000</option>
                    <option value="pro" className="bg-bg-secondary">Pro — $25,000</option>
                    <option value="elite" className="bg-bg-secondary">Elite — $50,000</option>
                    <option value="legend" className="bg-bg-secondary">Legend — $100,000</option>
                    <option value="apex" className="bg-bg-secondary">Apex — $200,000</option>
                  </select>
                </div>

                {/* Challenge Type */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Tipo de Challenge</label>
                  <select
                    value={manualAccount.challengeType}
                    onChange={(e) => setManualAccount(prev => ({ ...prev, challengeType: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-purple-400/50 focus:outline-none"
                  >
                    <option value="classic_2phase" className="bg-bg-secondary">Clásico (2 Fases)</option>
                    <option value="express_1phase" className="bg-bg-secondary">Express (1 Fase)</option>
                  </select>
                </div>

                {/* Challenge Phase */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Fase Asignada</label>
                  <select
                    value={manualAccount.challengePhase}
                    onChange={(e) => setManualAccount(prev => ({ ...prev, challengePhase: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-purple-400/50 focus:outline-none"
                  >
                    <option value={1} className="bg-bg-secondary">Fase 1 (Evaluación)</option>
                    {manualAccount.challengeType === "classic_2phase" && <option value={2} className="bg-bg-secondary">Fase 2 (Validación)</option>}
                    <option value={3} className="bg-bg-secondary">Fondeada Oficial (Fase 3)</option>
                  </select>
                </div>

                {/* Price paid */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Precio Pagado ($)</label>
                  <input
                    type="number"
                    value={manualAccount.price}
                    onChange={(e) => setManualAccount(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-purple-400/50 focus:outline-none"
                    min="0"
                    placeholder="Ej: 56"
                  />
                </div>

                {/* MT5 Credentials */}
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3">Credenciales MT5</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Login</label>
                      <input
                        type="text"
                        value={manualAccount.mt5Login}
                        onChange={(e) => setManualAccount(prev => ({ ...prev, mt5Login: e.target.value }))}
                        placeholder="Ej: 500123"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-purple-400/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Password</label>
                      <input
                        type="text"
                        value={manualAccount.mt5Password}
                        onChange={(e) => setManualAccount(prev => ({ ...prev, mt5Password: e.target.value }))}
                        placeholder="Ej: abc123"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-purple-400/50 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">Servidor</label>
                    <input
                      type="text"
                      value={manualAccount.mt5Server}
                      onChange={(e) => setManualAccount(prev => ({ ...prev, mt5Server: e.target.value }))}
                      placeholder="FundedSpread-Server"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-purple-400/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2">Resumen</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-text-muted">Tier:</span>
                    <span className="text-white font-bold uppercase">{manualAccount.challengeTier}</span>
                    <span className="text-text-muted">Tamaño:</span>
                    <span className="text-white font-bold font-mono">${manualAccount.accountSize.toLocaleString()}</span>
                    <span className="text-text-muted">Tipo:</span>
                    <span className="text-white font-bold">{manualAccount.challengeType === "classic_2phase" ? "Clásico 2F" : "Express 1F"}</span>
                    <span className="text-text-muted">MT5:</span>
                    <span className="text-white font-bold font-mono">{manualAccount.mt5Login || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setShowManualAccountModal(null)}
                  className="py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleCreateManualAccount}
                  disabled={creatingManualAccount || !manualAccount.mt5Login.trim() || !manualAccount.mt5Password.trim()}
                  className={`py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 ${
                    manualAccount.mt5Login.trim() && manualAccount.mt5Password.trim()
                      ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-400"
                      : "bg-white/5 text-text-muted cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-orbitron)" }}
                  whileHover={manualAccount.mt5Login.trim() && manualAccount.mt5Password.trim() ? { scale: 1.02 } : {}}
                  whileTap={manualAccount.mt5Login.trim() && manualAccount.mt5Password.trim() ? { scale: 0.98 } : {}}
                >
                  {creatingManualAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "CREAR CUENTA"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </div>
  );
}
