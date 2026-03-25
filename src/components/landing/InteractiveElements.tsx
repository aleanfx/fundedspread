"use client";

import { useState, useEffect, useRef } from "react";
import { useInView, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ============================================
   ANIMATED COUNTER
   ============================================ */
export function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ============================================
   INTERACTIVE FLOATING PARTICLES
   ============================================ */
const PARTICLE_COUNT = 40;

export function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const particlesRef = useRef(
    Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: (i * 137) % 100,
      y: (i * 93) % 100,
      vx: (((i * 17) % 100) / 100 - 0.5) * 0.05,
      vy: (((i * 23) % 100) / 100 * -0.05) - 0.02,
      baseSize: 1 + (((i * 31) % 100) / 100) * 1.5,
    }))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      mouseRef.current = {
        x: (e.touches[0].clientX / window.innerWidth) * 100,
        y: (e.touches[0].clientY / window.innerHeight) * 100,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    const lerpFactor = 0.05;

    const animate = () => {
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerpFactor;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerpFactor;

      const particles = particlesRef.current;
      const container = containerRef.current;

      if (container) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -5) p.x = 105;
          if (p.x > 105) p.x = -5;
          if (p.y < -5) p.y = 105;
          if (p.y > 105) p.y = -5;

          const node = container.children[p.id] as HTMLElement;
          if (node) {
            node.style.transform = `translate3d(${p.x}vw, ${p.y}vh, 0px)`;

            const dx = p.x - smoothMouseRef.current.x;
            const dy = p.y - smoothMouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const proximity = Math.max(0, 1 - dist / 15);
            const glow = 0.15 + proximity * 0.85;
            const scale = 1 + proximity * 1.5;

            node.style.opacity = glow.toString();
            node.style.width = `${p.baseSize * scale * 2}px`;
            node.style.height = `${p.baseSize * scale * 2}px`;
            node.style.boxShadow = proximity > 0 ? `0 0 ${12 * proximity}px rgba(0,255,136,${0.8 * proximity})` : "none";
          }
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particlesRef.current.map((pos) => (
        <div
          key={pos.id}
          className="absolute top-0 left-0 rounded-full bg-neon-green will-change-transform"
          style={{
            transform: `translate3d(${pos.x}vw, ${pos.y}vh, 0px)`,
            width: `${pos.baseSize * 2}px`,
            height: `${pos.baseSize * 2}px`,
            opacity: 0.2,
            transition: "width 0.1s linear, height 0.1s linear, box-shadow 0.1s linear, opacity 0.1s linear",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   3D INTERACTIVE EQUITY CHART CARD
   ============================================ */
export function EquityChart3D() {
  const points = [20, 25, 22, 35, 30, 45, 40, 55, 50, 65, 60, 75, 70, 82, 78, 90, 85, 95];
  const width = 400;
  const height = 200;
  const stepX = width / (points.length - 1);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const mouseRotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const mouseRotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const flipProgress = useSpring(0, { stiffness: 60, damping: 15 });

  useEffect(() => {
    flipProgress.set(isFlipped ? 180 : 0);
  }, [isFlipped, flipProgress]);

  const rotateX = useTransform(
    [mouseRotateX, flipProgress],
    ([mRx, f]) => {
      const safeMRx = typeof mRx === 'number' ? mRx : 0;
      const safeF = typeof f === 'number' ? f : 0;
      const isFlippedPerspective = safeF > 90 ? -1 : 1;
      return safeMRx * isFlippedPerspective;
    }
  );

  const rotateY = useTransform(
    [mouseRotateY, flipProgress],
    ([mRy, f]) => {
      const safeMRy = typeof mRy === 'number' ? mRy : 0;
      const safeF = typeof f === 'number' ? f : 0;
      const isFlippedPerspective = safeF > 90 ? -1 : 1;
      return safeF + (safeMRy * isFlippedPerspective);
    }
  );

  const pathData = points.map((p, i) => {
    const px = i * stepX;
    const py = height - (p / 100) * height;
    return `${i === 0 ? "M" : "L"} ${px} ${py}`;
  }).join(" ");

  const areaData = pathData + ` L ${width} ${height} L 0 ${height} Z`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={cardRef}
      className="relative cursor-pointer"
      style={{ perspective: "1500px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {/* FRONT FACE */}
        <div
          className="glass-card border border-neon-green/20 rounded-2xl p-6 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent pointer-events-none rounded-2xl" />
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at calc(50% + ${x.get() * 50}%) calc(50% + ${y.get() * 50}%), rgba(255,255,255,0.06) 0%, transparent 60%)`,
              transition: "background 0.1s ease",
            }}
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <p className="text-text-muted text-[10px] uppercase tracking-wider">Valor del Portafolio</p>
              <p className="text-2xl font-black text-neon-green" style={{ fontFamily: "var(--font-orbitron)" }}>
                $24,891.40
              </p>
            </div>
            <div className="text-right">
              <p className="text-neon-green text-sm font-bold">+148.9%</p>
              <p className="text-text-muted text-[10px]">Total</p>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 relative z-10">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,255,136,0.3)" />
                <stop offset="100%" stopColor="rgba(0,255,136,0)" />
              </linearGradient>
            </defs>
            <motion.path d={areaData} fill="url(#chartGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} />
            <motion.path d={pathData} fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }} />
            <motion.circle cx={width} cy={height - (points[points.length - 1] / 100) * height} r="5" fill="#00ff88" initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ delay: 2.3, duration: 1.5, repeat: Infinity }} />
          </svg>

          <div className="flex items-center gap-6 mt-3 relative z-10">
            <div>
              <p className="text-text-muted text-[9px] uppercase">Tasa de Éxito</p>
              <p className="text-text-primary text-xs font-bold">72.4%</p>
            </div>
            <div>
              <p className="text-text-muted text-[9px] uppercase">Factor de Ganancia</p>
              <p className="text-text-primary text-xs font-bold">2.8</p>
            </div>
            <div>
              <p className="text-text-muted text-[9px] uppercase">Checkpoint</p>
              <p className="text-neon-green text-xs font-bold">2 / 3</p>
            </div>
          </div>

          <div className="absolute bottom-2 right-3 text-text-muted/40 text-[9px] flex items-center gap-1 z-10">
            <span>Clic para voltear</span>
            <span>↻</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          className="glass-card border border-neon-green/30 rounded-2xl p-6 overflow-hidden absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-neon-blue/5 pointer-events-none rounded-2xl" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-neon-green text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "var(--font-orbitron)" }}>
                ¿POR QUÉ FUNDED SPREAD?
              </p>
              <h3 className="text-text-primary text-lg font-bold mt-2 leading-tight">
                Capital real. Ganancias reales. Sin riesgo personal.
              </h3>
            </div>

            <div className="space-y-2.5 my-4">
              {[
                { text: "Cuentas fondeadas desde", highlight: "$10K hasta $100K", color: "text-neon-green" },
                { text: "Hasta", highlight: "90% de split", color: "text-neon-green" },
                { text: "Pagos con", highlight: "cripto o transferencia", color: "text-neon-green" },
                { text: "Sin", highlight: "límite de tiempo", color: "text-neon-green" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-neon-green text-xs">✓</span>
                  </div>
                  <p className="text-text-secondary text-xs">{item.text} <span className={`${item.color} font-bold`}>{item.highlight}</span></p>
                </div>
              ))}
            </div>

            <div className="border-t border-neon-green/20 pt-3">
              <p className="text-text-muted text-[10px] italic">&quot;En 3 meses pasé de $49 a una cuenta fondeada de $50K.&quot;</p>
              <p className="text-neon-green text-[10px] font-bold mt-1">— @CryptoPhantom, Trader Legend</p>
            </div>

            <div className="absolute bottom-2 right-3 text-text-muted/40 text-[9px] flex items-center gap-1">
              <span>Clic para volver</span>
              <span>↻</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================
   SOCIAL PROOF TICKER
   ============================================ */
const tickerItems = [
  { icon: "💰", text: "@TradeMaster42 retiró $4,200" },
  { icon: "🏆", text: "@AlphaFX superó el Checkpoint 2" },
  { icon: "🚀", text: "@NeonKing desbloqueó cuenta de $50K" },
  { icon: "💎", text: "@CryptoWolf ganó $8,750 este mes" },
  { icon: "⚡", text: "@DayTrader_Pro alcanzó 90% de ganancias" },
  { icon: "🔥", text: "@FXMaster completó el reto Legend" },
  { icon: "💰", text: "@SwingTrader retiró $12,400" },
  { icon: "🏆", text: "@NeonElite superó todos los Checkpoints" },
];

export function SocialProofTicker() {
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative overflow-hidden py-8 border-y border-border-subtle/30 bg-bg-secondary/40 mt-12">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-6 whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {duplicatedItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all cursor-default group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
            <span className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold group-hover:text-text-primary transition-colors duration-300">
              {item.text}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
