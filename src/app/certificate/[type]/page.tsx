"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Download,
  ShieldCheck,
  Trophy,
  WalletCards,
  Award,
  CheckCircle,
  Home,
} from "lucide-react";
import * as htmlToImage from 'html-to-image';
import QRCode from "react-qr-code";
import { FundedSpreadLogo } from "@/components/FundedSpreadLogo";
// We decode the ?data= query param which should be base64 JSON
// Format expected: { n: string, d: string, a?: number }
// n = name, d = date, a = amount (for funded or payout)

export default function CertificatePage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const type = params?.type as string; // nextjs 15 safe params
  const certRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setIsClient(true);
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        const decodedStr = atob(dataParam);
        const parsed = JSON.parse(decodedStr);
        setData(parsed);
      } catch (e) {
        console.error("Failed to parse certificate data", e);
        setData({ n: "Trader", d: new Date().toISOString().split("T")[0], a: 0 }); // Fallback
      }
    } else {
      // Demo data
      if (type === "phase1") {
        setData({ n: "Alejandro", d: new Date().toISOString().split("T")[0] });
      } else if (type === "funded") {
        setData({ n: "Alejandro", d: new Date().toISOString().split("T")[0], a: 100000 });
      } else {
        setData({ n: "Alejandro", d: new Date().toISOString().split("T")[0], a: 3500 });
      }
    }
  }, [searchParams, type]);

  // Update scale dynamically based on wrapper width
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const newScale = wrapperRef.current.clientWidth / 1280;
        setScale(newScale);
      }
    };

    // Initial scale config
    if (isClient) {
      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }
  }, [isClient]);

  if (!isClient || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c10]">
        <div className="w-8 h-8 rounded-full border-b-2 border-neon-green animate-spin"></div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      // Need a bit of delay to ensure fonts are loaded, but standard sans-serif should be fine
      const dataUrl = await htmlToImage.toPng(certRef.current, {
        quality: 1,
        pixelRatio: 2, // High-res retina download
        style: {
          transform: "scale(1)", // Reset any framer motion scaling just in case
          margin: "0",
        }
      });
      const link = document.createElement("a");
      link.download = `Certificado_${type}_${data.n}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image", error);
      alert("Hubo un error al generar la imagen. Inténtalo de nuevo.");
    }
    setDownloading(false);
  };

  const isPhase1 = type === "phase1";
  const isFunded = type === "funded";
  const isPayout = type === "payout";

  const themeConfig = {
    color: isPhase1 ? "#00E676" : isFunded ? "#A855F7" : "#39FF14",
    title: isPhase1 ? "FASE 1 COMPLETADA" : isFunded ? "TRADER ÉLITE FONDEADO" : "RETIRO APROBADO",
    icon: isPhase1 ? CheckCircle : isFunded ? Trophy : WalletCards,
    bgGlow: isPhase1 ? "rgba(0, 230, 118, 0.15)" : isFunded ? "rgba(168, 85, 247, 0.15)" : "rgba(57, 255, 20, 0.25)",
    border: isPhase1 ? "border-emerald-500/30" : isFunded ? "border-purple-500/30" : "border-neon-green/50 shadow-[0_0_15px_rgba(57,255,20,0.3)]",
  };

  const Icon = themeConfig.icon;

  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center relative overflow-hidden py-12 px-4">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-30" style={{ backgroundColor: themeConfig.bgGlow }}></div>
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 relative flex flex-col items-center w-full max-w-[900px]"
      >
        {/* Certificate Preview Wrapper */}
        <div
          ref={wrapperRef}
          className="w-full bg-[#12141d] rounded-xl shadow-2xl relative overflow-hidden ring-1 ring-white/10"
          style={{
            aspectRatio: '16/9'
          }}
        >
          {/* This wrapper visually scales the 1280x720 certificate to fit the parent exactly calculation */}
          <div
            className="absolute top-0 left-0 origin-top-left flex-shrink-0"
            style={{
              width: '1280px',
              height: '720px',
              transform: `scale(${scale})`
            }}
          >
            {/* The actual certificate that gets captured. It remains exactly 1280x720 in its own layout space */}
            <div
              ref={certRef}
              className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center text-center bg-[#12141d]"
            >
              {/* Cert Background Image/Pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(${themeConfig.color} 1px, transparent 1px), linear-gradient(90deg, ${themeConfig.color} 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              ></div>

              {/* Corner Accents */}
              <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 rounded-tl-3xl opacity-80" style={{ borderColor: themeConfig.color }}></div>
              <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 rounded-tr-3xl opacity-80" style={{ borderColor: themeConfig.color }}></div>
              <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 rounded-bl-3xl opacity-80" style={{ borderColor: themeConfig.color }}></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 rounded-br-3xl opacity-80" style={{ borderColor: themeConfig.color }}></div>

              {/* Content Layer */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 px-16">

                {/* Header */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-4">
                    <FundedSpreadLogo className="w-12 h-12 text-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]" />
                    <span className="text-4xl font-bold tracking-wider text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>FUNDED <span className="text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">SPREAD</span></span>
                  </div>
                  <div className="inline-flex items-center justify-center space-x-2 px-6 py-2 rounded-full border bg-white/5 backdrop-blur-sm mb-2" style={{ borderColor: `${themeConfig.color}40` }}>
                    <Icon className="w-5 h-5" style={{ color: themeConfig.color }} />
                    <span className="font-bold tracking-widest text-sm uppercase" style={{ color: themeConfig.color }}>CERTIFICADO OFICIAL</span>
                  </div>
                </div>

                {/* Middle Section */}
                <div className="flex flex-col items-center my-auto pt-2 space-y-2">
                  <h1 className="text-5xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-orbitron)", textShadow: `0 0 40px ${themeConfig.color}60` }}>
                    {themeConfig.title}
                  </h1>

                  <p className="text-lg md:text-xl text-text-muted mt-1 font-light tracking-wide uppercase">Otorga el presente reconocimiento a:</p>

                  <div className="relative inline-block mt-2 mb-3">
                    <h2 className="text-5xl md:text-6xl font-bold text-white uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {data.n}
                    </h2>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full" style={{ backgroundColor: themeConfig.color }}></div>
                  </div>

                  <p className="text-base md:text-lg text-text-muted max-w-3xl mx-auto leading-relaxed px-4 text-center mt-1">
                    {isPhase1 && "Por demostrar excepcional disciplina, gestión de riesgo estricta y rentabilidad consistente al superar con éxito la Fase 1 de nuestro desafío de evaluación para traders profesionales."}
                    {isFunded && "Por conquistar nuestra rigurosa evaluación y alcanzar el estatus más alto en la firma. Este certificado acredita su capacidad técnica y psicológica para gestionar capital real."}
                    {isPayout && "Por su extraordinario desempeño al asegurar un retiro del mercado de capitales reales. La rentabilidad consistente es la prueba definitiva del profesionalismo en el trading."}
                  </p>

                  {/* Amount / Value Display */}
                  {data.a !== undefined && data.a > 0 && (
                    <div className="mt-2 flex flex-col items-center pb-2">
                      <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-text-muted mb-1">
                        {isFunded ? "Tamaño de Cuenta" : "Monto Retirado"}
                      </span>
                      <span className="text-4xl md:text-5xl font-mono font-black py-1 px-8 rounded-lg bg-black/40 border-2" style={{ color: themeConfig.color, borderColor: `${themeConfig.color}30` }}>
                        ${Number(data.a).toLocaleString("es-ES")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer / Signatures with QR Code */}
                <div className="w-full grid grid-cols-3 gap-4 items-end px-8 mt-2 pb-2">
                  {/* Left: Signatures & Date */}
                  <div className="flex flex-col items-start justify-end gap-5">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-32 border-b-2 border-white/50 mb-2 relative flex items-end justify-center">
                        <span className="absolute bottom-2 text-white/40 font-signature text-2xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>F.S. CEO</span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Firma Autorizada</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-32 border-b border-white/20 mb-1 flex items-end justify-center pb-1">
                        <span className="text-white font-mono text-sm tracking-widest">
                          {data.d.includes('T') 
                            ? new Date(data.d).toLocaleDateString('es-ES', { timeZone: 'UTC' }) 
                            : new Date(data.d + 'T12:00:00').toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <span className="text-[8px] md:text-[10px] text-text-muted uppercase tracking-wider">Fecha de Emisión</span>
                    </div>
                  </div>

                  {/* Middle: Verified Badge */}
                  <div className="flex flex-col items-center justify-end pb-8 opacity-80">
                    <Award className="w-16 h-16 mb-2 drop-shadow-lg" style={{ color: themeConfig.color }} />
                    <span className="text-[10px] md:text-xs text-text-muted uppercase tracking-[0.2em] font-bold">Verificado Oficial</span>
                  </div>

                  {/* Right: QR Code Verify */}
                  <div className="flex justify-end">
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-white/10" style={{ borderColor: `${themeConfig.color}40` }}>
                        <QRCode
                          value={typeof window !== 'undefined' ? window.location.href : 'https://www.funded-spread.com'}
                          size={85}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="Q"
                        />
                      </div>
                      <span className="text-[9px] md:text-[10px] font-bold text-text-muted uppercase tracking-wider mt-3 text-center">
                        Escanea para<br />Verificar Autenticidad
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <motion.button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all ${downloading ? "opacity-70 cursor-not-allowed bg-white/10 text-white" : "bg-white text-black hover:bg-gray-200"
              }`}
            whileHover={!downloading ? { scale: 1.05 } : {}}
            whileTap={!downloading ? { scale: 0.95 } : {}}
          >
            {downloading ? (
              <div className="w-5 h-5 border-2 border-black border-r-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-5 h-5" />
            )}
            {downloading ? "Generando Imagen..." : "Descargar Certificado"}
          </motion.button>

          <Link href="/">
            <motion.button
              className="px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 backdrop-blur-sm transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
