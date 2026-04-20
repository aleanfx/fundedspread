"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Shield, AlertTriangle, ChevronDown, Target, Clock, DollarSign,
  Scale, Ban, Zap, BookOpen, FileText, CheckCircle2, XCircle,
  TrendingUp, BarChart3, Wallet, Users, Gavel, Mail, ArrowLeft,
  Bot, Layers, Timer, Crosshair
} from "lucide-react";
import Link from "next/link";

/* ============================================
   ACCORDION COMPONENT
   ============================================ */
function RuleAccordion({ 
  title, icon: Icon, iconColor, children, defaultOpen = false, id 
}: { 
  title: string; icon: React.ElementType; iconColor: string; children: React.ReactNode; defaultOpen?: boolean; id: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border`}
            style={{ backgroundColor: `${iconColor}10`, borderColor: `${iconColor}30` }}>
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-wide uppercase"
            style={{ fontFamily: "var(--font-orbitron)" }}>
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: "spring", stiffness: 400, damping: 40 }, opacity: { duration: 0.15 } }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-0 space-y-4 text-sm text-text-secondary leading-relaxed"
              style={{ fontFamily: "var(--font-rajdhani)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================
   RULE ITEM COMPONENT
   ============================================ */
function RuleItem({ icon: Icon, title, description, severity = "info" }: {
  icon: React.ElementType; title: string; description: string; severity?: "info" | "warning" | "critical";
}) {
  const colors = {
    info: { bg: "bg-neon-green/5", border: "border-neon-green/20", icon: "text-neon-green" },
    warning: { bg: "bg-yellow-500/5", border: "border-yellow-500/20", icon: "text-yellow-400" },
    critical: { bg: "bg-red-500/5", border: "border-red-500/20", icon: "text-red-400" },
  };
  const c = colors[severity];
  
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl ${c.bg} border ${c.border}`}>
      <div className={`mt-0.5 flex-shrink-0 ${c.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="font-bold text-text-primary text-sm mb-0.5" style={{ fontFamily: "var(--font-rajdhani)" }}>{title}</p>
        <p className="text-text-muted text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ============================================
   COMPARISON TABLE
   ============================================ */
function ChallengeTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-2 text-text-muted uppercase tracking-wider text-[10px] font-bold" style={{ fontFamily: "var(--font-rajdhani)" }}>Métrica</th>
            <th className="text-center py-3 px-2" style={{ fontFamily: "var(--font-rajdhani)" }}>
              <span className="text-yellow-400 uppercase tracking-wider text-[10px] font-bold">1 Fase</span>
            </th>
            <th className="text-center py-3 px-2" style={{ fontFamily: "var(--font-rajdhani)" }}>
              <span className="text-neon-green uppercase tracking-wider text-[10px] font-bold">2 Fases — Fase 1</span>
            </th>
            <th className="text-center py-3 px-2" style={{ fontFamily: "var(--font-rajdhani)" }}>
              <span className="text-neon-blue uppercase tracking-wider text-[10px] font-bold">2 Fases — Fase 2</span>
            </th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {[
            ["Objetivo de Profit", "10%", "8%", "5%"],
            ["Drawdown Diario", "3%", "4%", "4%"],
            ["Drawdown Máximo", "5%", "10%", "10%"],
            ["Días Mínimos", "2", "5", "5"],
            ["Tiempo Límite", "30 días", "30 días", "60 días"],
            ["Profit Split", "80%", "—", "80%"],
          ].map(([label, express, p1, p2], i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-2.5 px-2 font-medium text-text-primary">{label}</td>
              <td className="py-2.5 px-2 text-center font-mono">{express}</td>
              <td className="py-2.5 px-2 text-center font-mono">{p1}</td>
              <td className="py-2.5 px-2 text-center font-mono">{p2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================
   MAIN RULES PAGE
   ============================================ */
export default function RulesPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.06)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-8 pb-10">
          <Link href="/"
            className="inline-flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider hover:text-neon-green transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-[10px] font-bold uppercase tracking-widest mb-6">
              <BookOpen className="w-3 h-3" /> Reglas & Términos
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
              style={{ fontFamily: "var(--font-orbitron)" }}>
              REGLAS DEL{" "}
              <span className="text-neon-green">CHALLENGE</span>
            </h1>
            
            <p className="text-text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Conoce las reglas, objetivos y condiciones que aplican a todas las cuentas de evaluación y cuentas fondeadas de Funded Spread.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "Trading", href: "#trading-rules", icon: Target },
            { label: "Objetivos", href: "#objectives", icon: TrendingUp },
            { label: "Retiros", href: "#withdrawals", icon: Wallet },
            { label: "Conducta", href: "#conduct", icon: Users },
            { label: "Violaciones", href: "#violations", icon: AlertTriangle },
            { label: "Términos", href: "#terms", icon: FileText },
          ].map((nav) => (
            <a key={nav.href} href={nav.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-[10px] uppercase tracking-wider font-bold hover:bg-neon-green/5 hover:border-neon-green/20 hover:text-neon-green transition-all"
            >
              <nav.icon className="w-3 h-3" />
              {nav.label}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-20 space-y-4">
        
        {/* 1. TRADING RULES */}
        <RuleAccordion
          id="trading-rules"
          title="Reglas de Trading"
          icon={Target}
          iconColor="#39ff14"
          defaultOpen={true}
        >
          <p className="text-text-muted mb-4">
            Las siguientes reglas aplican a <strong className="text-text-primary">todas las cuentas</strong> (evaluación y fondeadas). Están diseñadas para promover una operativa disciplinada y profesional.
          </p>
          
          <div className="space-y-3">
            <RuleItem
              icon={Layers}
              title="Máximo 5 posiciones abiertas simultáneamente"
              description="No puedes tener más de 5 operaciones abiertas al mismo tiempo. Esto previene la sobreexposición al mercado y promueve una gestión de riesgo responsable."
              severity="warning"
            />
            <RuleItem
              icon={BarChart3}
              title="Máximo 20 operaciones por día"
              description="No puedes abrir más de 20 operaciones en un solo día calendario. Este límite previene estrategias de alto riesgo como el martingale o el overtrading excesivo que ponen en peligro el capital."
              severity="warning"
            />
            <RuleItem
              icon={Bot}
              title="Uso de Expert Advisors (Bots)"
              description="Se permite el uso de bots y Expert Advisors, siempre y cuando se respeten las demás reglas de trading (máximo de posiciones, operaciones diarias y límites de drawdown). No se tolerará el uso de bots que ejecuten estrategias de alto riesgo como martingale, grid trading agresivo o apertura masiva de operaciones."
              severity="info"
            />
            <RuleItem
              icon={Shield}
              title="Drawdown Diario"
              description="Tu equity no puede caer más del porcentaje permitido respecto al balance de inicio del día. 2 Fases: 4% | 1 Fase: 3%. Si tu equity alcanza este nivel, todas las posiciones se cierran automáticamente."
              severity="critical"
            />
            <RuleItem
              icon={AlertTriangle}
              title="Drawdown Máximo"
              description="Tu equity no puede caer más del porcentaje permitido respecto al balance inicial de la cuenta. 2 Fases: 10% | 1 Fase: 5%. Si se alcanza, la cuenta se suspende permanentemente."
              severity="critical"
            />
            <RuleItem
              icon={Timer}
              title="Días Mínimos de Trading"
              description="Debes operar un mínimo de días antes de ser elegible para completar el challenge. 2 Fases: 5 días | 1 Fase: 2 días. Un 'día de trading' cuenta cuando abres al menos una operación con ±0.3% de variación y debe durar abierta al menos 5 minutos como mínimo."
              severity="info"
            />
          </div>
        </RuleAccordion>

        {/* 2. CHALLENGE OBJECTIVES */}
        <RuleAccordion
          id="objectives"
          title="Objetivos del Challenge"
          icon={TrendingUp}
          iconColor="#00c3ff"
        >
          <p className="text-text-muted mb-4">
            Funded Spread ofrece dos modalidades de challenge. Cada una tiene sus propios objetivos y niveles de exigencia.
          </p>
          
          <ChallengeTable />

          <div className="mt-4 p-4 rounded-xl bg-neon-blue/5 border border-neon-blue/20">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-neon-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-text-primary text-sm mb-1">¿Qué pasa al completar el challenge?</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  <strong>1 Fase:</strong> Apruebas la evaluación → Recibes tu cuenta fondeada directamente.<br />
                  <strong>2 Fases:</strong> Apruebas Fase 1 → Se te asigna una nueva cuenta para Fase 2 → Apruebas Fase 2 → Cuenta fondeada.
                </p>
              </div>
            </div>
          </div>
        </RuleAccordion>

        {/* 3. WITHDRAWALS */}
        <RuleAccordion
          id="withdrawals"
          title="Sistema de Retiros"
          icon={Wallet}
          iconColor="#a855f7"
        >
          <div className="space-y-3">
            <RuleItem
              icon={Clock}
              title="Periodo de Payout"
              description="Puedes solicitar tu primer retiro 14 días después de recibir tu cuenta fondeada. Los siguientes retiros pueden solicitarse cada 14 días. Con el add-on de Payouts Semanales, este periodo se reduce a 7 días."
              severity="info"
            />
            <RuleItem
              icon={DollarSign}
              title="Profit Split"
              description="El porcentaje base de ganancias es del 80%. Puedes incrementarlo al 90% o 100% mediante add-ons al momento de la compra. También puedes escalar orgánicamente: cada 3 retiros consecutivos sube +5% hasta un máximo de 90%."
              severity="info"
            />
            <RuleItem
              icon={Wallet}
              title="Redes Soportadas"
              description="Los retiros se procesan en USDT a través de las redes TRC20 y BEP20. Asegúrate de proporcionar una dirección de wallet válida y compatible con la red seleccionada."
              severity="info"
            />
            <RuleItem
              icon={CheckCircle2}
              title="Proceso de Aprobación"
              description="Cada solicitud de retiro es revisada por nuestro equipo. Una vez aprobada, el pago se procesa en un plazo de 24-48 horas. Recibirás el hash de transacción como comprobante."
              severity="info"
            />
          </div>
        </RuleAccordion>

        {/* 4. CONDUCT */}
        <RuleAccordion
          id="conduct"
          title="Conducta y Fair Play"
          icon={Scale}
          iconColor="#f59e0b"
        >
          <p className="text-text-muted mb-4">
            Funded Spread se reserva el derecho de suspender cualquier cuenta que demuestre comportamiento que comprometa la integridad del programa de fondeo.
          </p>
          
          <div className="space-y-3">
            <RuleItem
              icon={Ban}
              title="Estrategias Prohibidas"
              description="Martingale puro, grid trading agresivo, arbitraje de latencia, abuso de noticias (spike trading), copy trading entre cuentas de Funded Spread, y cualquier estrategia diseñada para explotar las condiciones de la plataforma en lugar de operar legítimamente en el mercado."
              severity="critical"
            />
            <RuleItem
              icon={Users}
              title="Una Persona, Una Cuenta Activa"
              description="Cada trader puede tener una cuenta activa por tipo de challenge. No se permite operar múltiples cuentas fondeadas simultáneamente para cubrir riesgo entre ellas."
              severity="warning"
            />
            <RuleItem
              icon={Crosshair}
              title="Operativa Responsable"
              description="Se espera que los traders demuestren control y disciplina. El uso excesivo de operaciones en poco tiempo, la acumulación de posiciones sin gestión de riesgo, o patrones que sugieran apuestas en lugar de trading estructurado, pueden resultar en revisión o suspensión de la cuenta."
              severity="warning"
            />
          </div>
        </RuleAccordion>

        {/* 5. VIOLATIONS */}
        <RuleAccordion
          id="violations"
          title="Consecuencias de Violación"
          icon={AlertTriangle}
          iconColor="#ef4444"
        >
          <p className="text-text-muted mb-4">
            Cuando se detecta una infracción, el sistema actúa de forma automática e inmediata:
          </p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <h4 className="font-bold text-red-400 text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                <XCircle className="w-4 h-4" /> Acción Inmediata
              </h4>
              <ol className="text-text-muted text-xs space-y-2 list-decimal list-inside leading-relaxed">
                <li><strong className="text-text-primary">Cierre automático de todas las posiciones abiertas</strong> — Se ejecuta al precio de mercado vigente.</li>
                <li><strong className="text-text-primary">Suspensión inmediata de la cuenta</strong> — El estado cambia a &quot;Failed&quot; y no se permiten nuevas operaciones.</li>
                <li><strong className="text-text-primary">Desactivación del Expert Advisor</strong> — El bot de monitoreo se auto-elimina del gráfico para evitar conflictos.</li>
                <li><strong className="text-text-primary">Registro de la violación</strong> — El motivo queda registrado en tu dashboard para tu referencia.</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <h4 className="font-bold text-yellow-400 text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                <AlertTriangle className="w-4 h-4" /> ¿Puedo volver a intentarlo?
              </h4>
              <p className="text-text-muted text-xs leading-relaxed">
                Sí. La suspensión aplica únicamente a la cuenta donde ocurrió la infracción. Puedes adquirir un nuevo challenge y empezar de nuevo, aplicando las lecciones aprendidas. No hay bloqueo permanente de tu usuario.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neon-green/5 border border-neon-green/20">
              <h4 className="font-bold text-neon-green text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-orbitron)" }}>
                <Mail className="w-4 h-4" /> ¿Tienes dudas?
              </h4>
              <p className="text-text-muted text-xs leading-relaxed">
                Si consideras que hubo un error o necesitas aclaración, puedes contactarnos en{" "}
                <a href="mailto:fundedspread@gmail.com" className="text-neon-green hover:underline font-bold">fundedspread@gmail.com</a>.
                Revisamos cada caso individualmente.
              </p>
            </div>
          </div>
        </RuleAccordion>

        {/* 6. TERMS & CONDITIONS */}
        <RuleAccordion
          id="terms"
          title="Términos y Condiciones"
          icon={Gavel}
          iconColor="#94a3b8"
        >
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">1. Naturaleza del Servicio</h4>
              <p>Funded Spread opera un programa de evaluación para traders. Las cuentas de evaluación y las cuentas fondeadas son cuentas de demostración (Demo) en MetaTrader 5. Los retiros de ganancias son reales y se procesan en USDT a la wallet del trader.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">2. Pagos y Reembolsos</h4>
              <p>El pago del challenge es un cargo único no reembolsable. Al realizar la compra, el trader acepta que entiende las reglas del challenge y las condiciones del servicio. Los pagos se procesan exclusivamente en criptomonedas.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">3. Propiedad Intelectual</h4>
              <p>Todo el contenido, diseños, logotipos y marcas de Funded Spread son propiedad exclusiva de la empresa. Queda prohibida su reproducción o uso sin autorización expresa.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">4. Modificación de Reglas</h4>
              <p>Funded Spread se reserva el derecho de modificar las reglas de trading, precios y condiciones. Los cambios se comunicarán a través de la plataforma y aplicarán a las cuentas nuevas. Las cuentas activas mantendrán las reglas vigentes al momento de su compra.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">5. Limitación de Responsabilidad</h4>
              <p>Funded Spread no garantiza ganancias. El trading de divisas y derivados conlleva riesgos significativos. El trader es el único responsable de sus decisiones de trading. La empresa no se hace responsable por pérdidas derivadas de la actividad del trader.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">6. Suspensión de Cuentas</h4>
              <p>Funded Spread puede suspender o cancelar cualquier cuenta que viole las reglas establecidas, muestre patrones de abuso, o comprometa la integridad del programa. En caso de disputa, la decisión de Funded Spread es definitiva.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-2">7. Contacto</h4>
              <p>Para cualquier consulta, soporte o disputa, puedes contactarnos en{" "}
                <a href="mailto:fundedspread@gmail.com" className="text-neon-green hover:underline font-bold">fundedspread@gmail.com</a>.
              </p>
            </div>
          </div>
        </RuleAccordion>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center pt-8"
        >
          <p className="text-text-muted text-xs mb-4">
            Al adquirir un challenge, confirmas que has leído y aceptado estas reglas y condiciones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/checkout"
              className="px-6 py-3 rounded-xl bg-neon-green text-black font-bold text-sm uppercase tracking-wider hover:bg-neon-green/90 transition-all shadow-lg shadow-neon-green/20"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              Comenzar Challenge
            </Link>
            <a href="mailto:fundedspread@gmail.com"
              className="px-6 py-3 rounded-xl border border-white/10 text-text-secondary text-sm uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2"
              style={{ fontFamily: "var(--font-rajdhani)" }}
            >
              <Mail className="w-4 h-4" /> Contactar Soporte
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
