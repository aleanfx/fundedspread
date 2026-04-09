"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ArrowRight, CheckCircle, AlertCircle, Minus, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  profit: number;
  profitSplitPct: number;
  initialBalance: number;
  tradingDaysCount: number;
  hasWeeklyPayouts: boolean;

}

type Network = "BEP20" | "TRC20";
type ModalStep = "form" | "confirm" | "submitting" | "success" | "error";

export default function WithdrawModal({
  isOpen,
  onClose,
  accountId,
  profit,
  profitSplitPct,
  initialBalance,
  tradingDaysCount,
  hasWeeklyPayouts,

}: WithdrawModalProps) {
  const { t } = useLanguage();
  const [network, setNetwork] = useState<Network>("TRC20");
  const [walletAddress, setWalletAddress] = useState("");
  const [step, setStep] = useState<ModalStep>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  const minWithdrawal = 100;
  const minTradingDays = 5;
  const maxWithdrawable = profit; // Max = total profit available

  // Dynamic calculations based on user's chosen amount
  const parsedAmount = useMemo(() => {
    const val = parseFloat(withdrawAmount);
    return isNaN(val) ? 0 : val;
  }, [withdrawAmount]);

  const userAmount = useMemo(() => {
    return Number((parsedAmount * (profitSplitPct / 100)).toFixed(2));
  }, [parsedAmount, profitSplitPct]);

  const companyAmount = useMemo(() => {
    return Number((parsedAmount * ((100 - profitSplitPct) / 100)).toFixed(2));
  }, [parsedAmount, profitSplitPct]);

  const isAmountValid = parsedAmount >= minWithdrawal && parsedAmount <= maxWithdrawable;
  const canWithdraw = isAmountValid && tradingDaysCount >= minTradingDays;

  // Quick amount buttons
  const quickAmountPcts = [25, 50, 75, 100];

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    // Prevent multiple dots
    const parts = cleaned.split(".");
    const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
    setWithdrawAmount(sanitized);
    setErrorMessage("");
  };

  const setQuickAmount = (pct: number) => {
    const amount = Number((maxWithdrawable * (pct / 100)).toFixed(2));
    setWithdrawAmount(String(amount));
    setErrorMessage("");
  };

  const adjustAmount = (delta: number) => {
    const current = parsedAmount || 0;
    const newVal = Math.max(minWithdrawal, Math.min(maxWithdrawable, current + delta));
    setWithdrawAmount(String(Number(newVal.toFixed(2))));
    setErrorMessage("");
  };

  const isValidAddress = (addr: string) => {
    if (network === "TRC20") return /^T[a-zA-Z0-9]{33}$/.test(addr);
    if (network === "BEP20") return /^0x[a-fA-F0-9]{40}$/.test(addr);
    return false;
  };

  const handleSubmit = async () => {
    if (!isValidAddress(walletAddress)) {
      setErrorMessage(t("withdraw.errors.invalidAddress"));
      return;
    }
    if (!isAmountValid) {
      setErrorMessage(t("withdraw.errors.minAmount"));
      return;
    }
    if (tradingDaysCount < minTradingDays) {
      setErrorMessage(t("withdraw.errors.minDays"));
      return;
    }

    setStep("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount: parsedAmount,
          userAmount,
          network,
          walletAddress,
          profitSplitPct,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || t("withdraw.errors.generic"));
        setStep("error");
        return;
      }

      setStep("success");
    } catch {
      setErrorMessage(t("withdraw.errors.generic"));
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("form");
    setWalletAddress("");
    setWithdrawAmount("");
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1c]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(57,255,20,0.08)] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Glow effects */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-green/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-blue/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {t("withdraw.title")}
                </h2>
                <p className="text-[11px] text-text-muted">{t("withdraw.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-4">
            {step === "form" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Trading Days Warning */}
                {tradingDaysCount < minTradingDays && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-500">{t("withdraw.minDaysTitle")}</p>
                      <p className="text-[11px] text-yellow-400/70 mt-0.5">
                        {t("withdraw.minDaysDesc").replace("{current}", String(tradingDaysCount)).replace("{required}", String(minTradingDays))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Available Profit Info */}
                <div className="bg-neon-green/[0.04] border border-neon-green/20 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{t("withdraw.availableProfit") || "Ganancia Disponible"}</span>
                    <span className="text-neon-green font-black font-mono text-lg" style={{ fontFamily: "var(--font-orbitron)" }}>${profit.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-text-muted/60">{t("withdraw.availableProfitNote") || "Puedes retirar desde $100 hasta el total de tus ganancias"}</p>
                </div>

                {/* Amount Input */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">{t("withdraw.withdrawAmount") || "Monto a Retirar"}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustAmount(-50)}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-text-muted hover:text-white flex-shrink-0"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-green font-bold text-lg">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={withdrawAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder={String(minWithdrawal)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-lg text-white font-bold font-mono text-center focus:outline-none focus:border-neon-green/40 transition-colors placeholder:text-text-muted/30"
                      />
                    </div>
                    <button
                      onClick={() => adjustAmount(50)}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-text-muted hover:text-white flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick amount buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {quickAmountPcts.map((pct) => {
                      const amt = Number((maxWithdrawable * (pct / 100)).toFixed(2));
                      const isSelected = parsedAmount === amt;
                      return (
                        <button
                          key={pct}
                          onClick={() => setQuickAmount(pct)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-neon-green/15 text-neon-green border border-neon-green/40"
                              : "bg-white/5 text-text-muted border border-white/[0.06] hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {pct === 100 ? "MAX" : `${pct}%`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Amount validation message */}
                  {withdrawAmount && !isAmountValid && (
                    <p className="text-[10px] text-red-400 mt-1.5">
                      {parsedAmount < minWithdrawal
                        ? `${t("withdraw.errors.minAmount") || "Mínimo"} $${minWithdrawal}`
                        : `${t("withdraw.errors.maxAmount") || "Máximo disponible"}: $${maxWithdrawable.toFixed(2)}`}
                    </p>
                  )}
                </div>

                {/* Dynamic Profit Breakdown */}
                {parsedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3">{t("withdraw.breakdown")}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">{t("withdraw.withdrawAmount") || "Monto a Retirar"}</span>
                        <span className="text-white font-bold font-mono">${parsedAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">{t("withdraw.yourSplit")} ({profitSplitPct}%)</span>
                        <span className="text-neon-green font-bold font-mono">${userAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">{t("withdraw.companySplit")} ({100 - profitSplitPct}%)</span>
                        <span className="text-text-muted font-mono">${companyAmount.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-white/[0.08] my-1" />
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">{t("withdraw.youReceive")}</span>
                        <span className="text-neon-green font-extrabold font-mono text-base">${userAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted mt-2 italic">{t("withdraw.networkFeeNote")}</p>
                  </motion.div>
                )}

                {/* Network Selector */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">{t("withdraw.selectNetwork")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["TRC20", "BEP20"] as Network[]).map((net) => (
                      <button
                        key={net}
                        onClick={() => { setNetwork(net); setWalletAddress(""); }}
                        className={`py-3 px-4 rounded-xl border text-center transition-all duration-200 ${
                          network === net
                            ? "bg-neon-green/10 border-neon-green/50 shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                            : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"
                        }`}
                      >
                        <span
                          className={`text-sm font-black ${network === net ? "text-neon-green" : "text-text-muted"}`}
                          style={{ fontFamily: "var(--font-orbitron)" }}
                        >
                          {net}
                        </span>
                        <p className={`text-[10px] mt-0.5 ${network === net ? "text-neon-green/60" : "text-text-muted/50"}`}>
                          {net === "TRC20" ? "Tron Network" : "BNB Smart Chain"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
                    {t("withdraw.walletAddress")}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => { setWalletAddress(e.target.value); setErrorMessage(""); }}
                      placeholder={network === "TRC20" ? "T..." : "0x..."}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-neon-green/40 transition-colors font-mono"
                    />
                    {walletAddress && isValidAddress(walletAddress) && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
                    )}
                  </div>
                  {walletAddress && !isValidAddress(walletAddress) && walletAddress.length > 5 && (
                    <p className="text-[10px] text-red-400 mt-1">{t("withdraw.errors.invalidAddress")}</p>
                  )}
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  onClick={() => setStep("confirm")}
                  disabled={!canWithdraw || !isValidAddress(walletAddress)}
                  className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-1 ${
                    canWithdraw && isValidAddress(walletAddress)
                      ? "bg-neon-green text-black shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:shadow-[0_0_35px_rgba(57,255,20,0.6)]"
                      : "bg-white/5 text-text-muted/40 cursor-not-allowed border border-white/[0.06]"
                  }`}
                  style={{ fontFamily: "var(--font-orbitron)" }}
                  whileHover={canWithdraw && isValidAddress(walletAddress) ? { scale: 1.02 } : {}}
                  whileTap={canWithdraw && isValidAddress(walletAddress) ? { scale: 0.98 } : {}}
                >
                  {t("withdraw.requestBtn")}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <p className="text-xs text-text-muted uppercase tracking-widest font-bold">{t("withdraw.confirmTitle")}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t("withdraw.withdrawAmount") || "Monto Seleccionado"}</span>
                      <span className="text-white font-bold font-mono">${parsedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t("withdraw.amount")}</span>
                      <span className="text-neon-green font-bold font-mono">${userAmount.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t("withdraw.network")}</span>
                      <span className="text-white font-bold">{network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t("withdraw.address")}</span>
                      <span className="text-white font-mono text-xs truncate max-w-[180px]">{walletAddress}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-text-muted text-center">{t("withdraw.confirmNote")}</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep("form")}
                    className="py-3 rounded-xl border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/5 transition-colors"
                  >
                    {t("withdraw.goBack")}
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    className="py-3 rounded-xl bg-neon-green text-black text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("withdraw.confirmBtn")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === "submitting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 gap-4"
              >
                <motion.div
                  className="w-14 h-14 rounded-full border-2 border-neon-green border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-text-secondary" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {t("withdraw.processing")}
                </p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-neon-green/10 border-2 border-neon-green flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                >
                  <CheckCircle className="w-8 h-8 text-neon-green" />
                </motion.div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {t("withdraw.successTitle")}
                </h3>
                <p className="text-sm text-text-muted text-center max-w-sm">
                  {t("withdraw.successDesc")}
                </p>
                <p className="text-2xl font-black text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                  ${userAmount.toFixed(2)} USDT
                </p>
                <motion.button
                  onClick={handleClose}
                  className="mt-2 px-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("withdraw.close")}
                </motion.button>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-red-400" style={{ fontFamily: "var(--font-orbitron)" }}>
                  {t("withdraw.errorTitle")}
                </h3>
                <p className="text-sm text-text-muted text-center">{errorMessage}</p>
                <motion.button
                  onClick={() => setStep("form")}
                  className="mt-2 px-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary text-sm font-bold hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("withdraw.tryAgain")}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
