"use client";

import React from 'react';
import { RankId, RANK_INFO } from '@/lib/utils/rankSystem';
import { Shield, Swords, Trophy, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RankBadgeProps {
  rankId: RankId;
  showName?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function RankBadge({ rankId, showName = true, className = "", size = 'sm' }: RankBadgeProps) {
  const { language } = useLanguage();
  
  if (rankId === 'unranked') {
     return null;
  }

  const info = RANK_INFO[rankId];
  
  // Sizing mappings (Made smaller and more minimalist)
  const sizeMap = {
    xs: { container: 'px-1 py-[1px] text-[6px] gap-0.5', icon: 'w-2 h-2' },
    sm: { container: 'px-1.5 py-[1.5px] text-[7.5px] sm:text-[8px] gap-1', icon: 'w-2.5 h-2.5' },
    md: { container: 'px-1.5 py-[2px] sm:py-[3px] text-[8px] sm:text-[8px] gap-1', icon: 'w-2.5 h-2.5 sm:w-3 sm:h-3' },
    lg: { container: 'px-2 py-[3px] sm:py-[4px] text-[9px] sm:text-[10px] gap-1.5', icon: 'w-3 h-3 sm:w-3.5 sm:h-3.5' },
  };
  
  const s = sizeMap[size];

  // Specific high-end designs for each rank
  const renderIcon = () => {
    switch (rankId) {
      case 'novato':
        return <Shield className={`${s.icon} novato-twinkle`} style={{ color: info.color }} />;
      case 'warrior':
        return <Swords className={`${s.icon} drop-shadow-[0_0_3px_rgba(6,182,212,0.8)]`} style={{ color: info.color }} />;
      case 'elite':
        return <Trophy className={`${s.icon} drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]`} style={{ color: info.color }} fill={`${info.color}20`} />;
      case 'legend':
        return (
          <div className="relative flex items-center justify-center filter drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
             <Crown className={`${s.icon}`} style={{ color: info.color }} fill={`${info.color}40`} />
          </div>
        );
      default:
        return null;
    }
  };

  const legendPaddingOverride = rankId === 'legend' 
    ? (size === 'xs' ? '!py-[2px]' : size === 'sm' ? '!py-[3px]' : size === 'md' ? '!py-[4px] sm:!py-[5px]' : '!py-[5px] sm:!py-[6px]')
    : '';

  const isElite = rankId === 'elite';

  return (
    <div 
      title={info.reqDescription}
      className={`relative inline-flex items-center rounded-md font-black uppercase tracking-widest ${!isElite ? 'overflow-hidden' : 'elite-flame-border'} ${s.container} ${legendPaddingOverride} ${className}`}
      style={{ 
        backgroundColor: info.bgColor, 
        border: `1px solid ${info.borderColor}`,
        color: info.color,
        fontFamily: "var(--font-orbitron)"
      }}
    >
      {/* Premium Shine Animation for Legend (Golden reflection) */}
      {rankId === 'legend' && (
        <motion.div
           className="absolute top-0 bottom-0 z-0 w-[150%] bg-gradient-to-r from-transparent via-yellow-100/15 to-transparent skew-x-[-20deg]"
           initial={{ x: '-150%' }}
           animate={{ x: '100%' }}
           transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
        />
      )}

      {/* Subtle Cyan Aura Animation for Warrior */}
      {rankId === 'warrior' && (
        <motion.div
           className="absolute bottom-0 inset-x-0 z-0 h-full bg-gradient-to-t from-cyan-500/40 via-blue-500/10 to-transparent"
           style={{ transformOrigin: "bottom" }}
           animate={{ 
             opacity: [0.1, 0.7, 0.1],
             scaleY: [0.7, 1.2, 0.7]
           }}
           transition={{ 
             duration: 2.5, 
             repeat: Infinity, 
             ease: "easeInOut" 
           }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        {renderIcon()}
      </div>
      {showName && <span className="relative z-10">{language === 'en' ? info.nameEn || info.name : info.name}</span>}
    </div>
  );
}

