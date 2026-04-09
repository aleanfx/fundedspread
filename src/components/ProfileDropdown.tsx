"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SpainFlag, USAFlag } from "@/components/Flags";

export function ProfileDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group block focus:outline-none"
      >
        <div className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all duration-300 ${isOpen ? "border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.6)]" : "border-neon-green/60 shadow-[0_0_12px_rgba(57,255,20,0.3)] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]"}`}>
          {user.user_metadata?.avatar_url && !avatarError ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Perfil"
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-full h-full bg-neon-green/20 flex items-center justify-center">
              <span className="text-sm font-bold text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                {initials}
              </span>
            </div>
          )}
        </div>
        {/* Indicador de Conectado Constante */}
        <div title={t("profileDropdown.online") || "Conectado"} className="absolute -bottom-0.5 -right-0.5 z-10 bg-bg-primary rounded-full p-[2px]">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.8)]"></div>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-56 rounded-xl bg-[#0D0D0D]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
                {displayName}
              </p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>

            <div className="p-1.5 flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/profile");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t("profileDropdown.profile")}</span>
              </button>

              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span>{t("profileDropdown.language")}</span>
                </div>
                <div className="flex gap-1 bg-black/50 rounded p-1 border border-white/10">
                  <div className={`p-1 rounded transition-colors ${language === "es" ? "bg-white/10" : ""}`}>
                    <SpainFlag className={`w-[18px] h-3 transition-all duration-300 ${language === "es" ? "opacity-100 grayscale-0" : "opacity-40 grayscale-[80%]"}`} />
                  </div>
                  <div className={`p-1 rounded transition-colors ${language === "en" ? "bg-white/10" : ""}`}>
                    <USAFlag className={`w-[18px] h-3 transition-all duration-300 ${language === "en" ? "opacity-100 grayscale-0" : "opacity-40 grayscale-[80%]"}`} />
                  </div>
                </div>
              </button>
            </div>

            <div className="p-1.5 border-t border-white/5">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{signingOut ? t("profileDropdown.signingOut") : t("profileDropdown.logout")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
