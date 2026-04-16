"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Shield, ChevronDown, FileText, Scale, Ban, Gavel,
  BookOpen, AlertTriangle, Users, DollarSign, Lock,
  Eye, Globe, ArrowLeft, Mail, CheckCircle2, XCircle,
  Target, Clock, TrendingUp, Wallet, Layers, Bot
} from "lucide-react";
import Link from "next/link";

/* ============================================
   SECTION ACCORDION
   ============================================ */
function TermsSection({
  title, icon: Icon, iconColor, children, sectionNumber, id
}: {
  title: string; icon: React.ElementType; iconColor: string;
  children: React.ReactNode; sectionNumber: number; id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.1] transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
            style={{ backgroundColor: `${iconColor}10`, borderColor: `${iconColor}30` }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase"
              style={{ fontFamily: "var(--font-orbitron)" }}>
              §{sectionNumber}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-wide uppercase"
              style={{ fontFamily: "var(--font-orbitron)" }}>
              {title}
            </h3>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
        </motion.div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-5 sm:px-6 pb-6"
        >
          <div className="border-t border-white/[0.06] pt-5 space-y-4 text-text-secondary text-sm leading-relaxed">
            {children}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ============================================
   QUICK NAV
   ============================================ */
const sections = [
  { id: "preambulo", label: "Preámbulo", icon: BookOpen },
  { id: "proveedor", label: "Proveedor", icon: Globe },
  { id: "definiciones", label: "Definiciones", icon: FileText },
  { id: "naturaleza", label: "Naturaleza", icon: Target },
  { id: "elegibilidad", label: "Elegibilidad", icon: Users },
  { id: "registro", label: "Registro", icon: Lock },
  { id: "pagos", label: "Pagos", icon: DollarSign },
  { id: "entorno", label: "Entorno Simulado", icon: Layers },
  { id: "conducta", label: "Conducta", icon: Ban },
  { id: "fondeada", label: "Etapa Fondeada", icon: TrendingUp },
  { id: "cumplimiento", label: "Cumplimiento", icon: Eye },
  { id: "recompensas", label: "Recompensas", icon: Wallet },
  { id: "propiedad", label: "Propiedad Intelectual", icon: Shield },
  { id: "responsabilidad", label: "Responsabilidad", icon: Scale },
  { id: "contacto", label: "Contacto", icon: Mail },
];

/* ============================================
   MAIN PAGE
   ============================================ */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* ---- HEADER ---- */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/[0.03] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-green/[0.02] rounded-full blur-[120px]" />

        <div className="relative max-w-[900px] mx-auto px-4 sm:px-6 pt-8 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-muted hover:text-neon-green transition-colors text-xs uppercase tracking-widest mb-8"
            style={{ fontFamily: "var(--font-rajdhani)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-green/20 bg-neon-green/[0.05] mb-6">
              <Gavel className="w-3.5 h-3.5 text-neon-green" />
              <span className="text-[10px] font-bold text-neon-green tracking-widest uppercase"
                style={{ fontFamily: "var(--font-rajdhani)" }}>
                Documento Legal
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
              style={{ fontFamily: "var(--font-orbitron)" }}>
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Términos y{" "}
              </span>
              <span className="bg-gradient-to-r from-neon-green to-emerald-400 bg-clip-text text-transparent">
                Condiciones
              </span>
            </h1>

            <p className="text-text-muted text-sm max-w-[500px] mx-auto leading-relaxed">
              Al utilizar los servicios de Funded Spread, aceptas los siguientes términos que regulan
              tu acceso, uso de la plataforma y participación en nuestros programas de evaluación.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[10px] text-text-muted uppercase tracking-widest">
              <span>Última actualización: Abril 2026</span>
              <span className="text-white/10">|</span>
              <span>Versión 1.0</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ---- QUICK NAV ---- */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02]
                         text-[9px] text-text-muted uppercase tracking-widest hover:border-neon-green/30 hover:text-neon-green hover:bg-neon-green/[0.03]
                         transition-all duration-200"
              style={{ fontFamily: "var(--font-rajdhani)" }}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
            </a>
          ))}
        </motion.div>
      </div>

      {/* ---- CONTENT ---- */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-20 space-y-4">

        {/* §1 PREÁMBULO */}
        <TermsSection id="preambulo" sectionNumber={1} title="Preámbulo y Aceptación" icon={BookOpen} iconColor="#00ff88">
          <p><strong className="text-white">1.1.</strong> Estos Términos y Condiciones de Uso y Prestación de Servicios (&ldquo;Términos&rdquo;) regulan el acceso, navegación y uso del sitio web <span className="text-neon-green">fundedspread.com</span> y cualquier subdominio, panel e interfaz relacionada (el &ldquo;Sitio Web&rdquo;), así como la adquisición y uso de cualquier producto, cuenta, plan, programa de evaluación, contenido y servicio disponible bajo la marca <strong className="text-white">Funded Spread</strong> (los &ldquo;Servicios&rdquo;).</p>
          <p><strong className="text-white">1.2.</strong> Al realizar cualquiera de los siguientes actos, el Usuario declara que ha leído, entendido y acepta plenamente estos Términos: (a) acceder o navegar por el Sitio Web; (b) crear una Cuenta; (c) comprar cualquier producto o Challenge; (d) iniciar, ejecutar o simular operaciones en cualquier plataforma disponible; (e) enviar datos, documentos o información; o (f) utilizar los Servicios de cualquier manera.</p>
          <p><strong className="text-white">1.3.</strong> Estos Términos deben leerse junto con todas las reglas de trading, políticas de privacidad y documentos incorporados por referencia aplicables al producto o Cuenta del Usuario. El cumplimiento de estos Términos es una condición esencial para el acceso, mantenimiento de la Cuenta y elegibilidad para cualquier beneficio, migración de fase o Recompensa por Rendimiento.</p>
          <p><strong className="text-white">1.4.</strong> Si el Usuario no está de acuerdo con estos Términos, debe cesar inmediatamente el uso del Sitio Web y los Servicios.</p>
          <div className="p-4 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-200/80">
                En caso de conflicto entre estos Términos y cualquier material informativo, FAQ o comunicación de soporte,
                el texto de estos Términos prevalecerá.
              </p>
            </div>
          </div>
        </TermsSection>

        {/* §2 PROVEEDOR */}
        <TermsSection id="proveedor" sectionNumber={2} title="Identificación del Proveedor" icon={Globe} iconColor="#3b82f6">
          <p><strong className="text-white">2.1.</strong> Los servicios disponibles bajo la marca <strong className="text-white">Funded Spread</strong> son ofrecidos y operados por su(s) entidad(es) propietaria(s) (el &ldquo;Proveedor&rdquo;). El Proveedor es la única parte contratante responsable de la oferta, administración y gestión de los Servicios frente al Usuario.</p>
          <p><strong className="text-white">2.2.</strong> Ciertos pagos, cargos y operaciones financieras pueden ser procesados a través de proveedores de servicios de pago designados por el Proveedor (el &ldquo;Procesador de Pagos&rdquo;), incluyendo plataformas de pago en criptomonedas. El Procesador de Pagos actúa como intermediario técnico y no proporciona los Servicios.</p>
          <p><strong className="text-white">2.3.</strong> El Proveedor puede utilizar empresas afiliadas, subcontratistas y proveedores de servicios especializados, incluyendo proveedores de tecnología, plataformas de trading simulado (MetaTrader 5), procesadores de pagos y proveedores de seguridad de la información.</p>
          <p><strong className="text-white">2.4.</strong> Para comunicación oficial con el Proveedor, el Usuario deberá utilizar los canales establecidos en la Sección 15 de estos Términos.</p>
        </TermsSection>

        {/* §3 DEFINICIONES */}
        <TermsSection id="definiciones" sectionNumber={3} title="Definiciones" icon={FileText} iconColor="#a855f7">
          <div className="space-y-3">
            {[
              { term: "Usuario", def: "Cualquier persona que acceda al Sitio Web y/o utilice los Servicios, incluyendo visitantes, usuarios registrados, compradores y participantes en programas de evaluación." },
              { term: "Cuenta", def: "Cualquier producto, plan o programa contratado por el Usuario, incluyendo cuentas de evaluación (\"Challenge 2 Fases\", \"Challenge 1 Fase\"), cuentas simuladas fondeadas y cualquier variación de estos productos." },
              { term: "Plataforma", def: "MetaTrader 5 (MT5) y cualquier otro sistema, interfaz o entorno electrónico autorizado por el Proveedor para el acceso a los Servicios." },
              { term: "Trading Simulado", def: "La ejecución de operaciones en un entorno estrictamente simulado, utilizando fondos virtuales, exclusivamente con el propósito de evaluar y medir el rendimiento del Usuario. No constituye corretaje, intermediación financiera ni ejecución de órdenes reales en el mercado." },
              { term: "Recompensa por Rendimiento", def: "Cualquier cantidad que el Proveedor puede poner a disposición del Usuario como resultado del rendimiento alcanzado en el entorno de Trading Simulado. No constituye remuneración garantizada, salario ni derecho adquirido." },
              { term: "Reglas de Trading", def: "El conjunto de parámetros técnicos, objetivos, límites de riesgo, restricciones operativas y criterios aplicables a cada Cuenta o producto específico (drawdown diario, drawdown máximo, objetivo de profit, días mínimos, etc.)." },
              { term: "Challenge", def: "Etapa de evaluación en el entorno de Trading Simulado, adquirida tras el pago de una tarifa, en la que el Usuario busca demostrar rendimiento según las Reglas de Trading." },
              { term: "Etapa Fondeada", def: "Etapa posterior a la aprobación del Challenge, donde se concede al Usuario acceso a una cuenta simulada con parámetros definidos, destinada a Trading Simulado con posibilidad de Recompensa por Rendimiento." },
            ].map(({ term, def }) => (
              <div key={term} className="flex gap-3">
                <span className="text-neon-green font-bold text-xs whitespace-nowrap mt-0.5">{term}:</span>
                <p className="text-text-secondary text-xs leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        </TermsSection>

        {/* §4 NATURALEZA */}
        <TermsSection id="naturaleza" sectionNumber={4} title="Objeto y Naturaleza de los Servicios" icon={Target} iconColor="#f59e0b">
          <p><strong className="text-white">4.1.</strong> Los Servicios están destinados exclusivamente a proporcionar programas estructurados para la evaluación de habilidades de trading, formación y desarrollo de estrategias en un entorno controlado, y medición del rendimiento en Trading Simulado.</p>

          <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20 space-y-2">
            <p className="text-xs text-red-200/80 font-bold">Los Servicios NO constituyen:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {["Servicios de inversión", "Gestión de carteras", "Corretaje o intermediación", "Ejecución de órdenes reales", "Asesoramiento financiero", "Custodia de fondos"].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="text-[11px] text-red-200/60">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p><strong className="text-white">4.2.</strong> El Proveedor no es un corredor, institución financiera, firma de inversión ni proveedor de servicios financieros regulados. Todas las actividades se realizan en un entorno simulado. Los montos pagados constituyen tarifas por un servicio de evaluación y no son depósitos, inversiones ni cuentas de trading reales.</p>
          <p><strong className="text-white">4.3.</strong> El Usuario participa en los programas por su propia iniciativa, riesgo y responsabilidad. Ningún resultado previo o rendimiento histórico constituye una garantía de resultados futuros.</p>
        </TermsSection>

        {/* §5 ELEGIBILIDAD */}
        <TermsSection id="elegibilidad" sectionNumber={5} title="Elegibilidad" icon={Users} iconColor="#06b6d4">
          <p><strong className="text-white">5.1.</strong> Los Servicios están disponibles exclusivamente para personas que (i) tengan al menos 18 años de edad; (ii) tengan plena capacidad legal; (iii) no estén sujetas a restricciones de sanciones internacionales.</p>
          <p><strong className="text-white">5.2.</strong> El Usuario declara y garantiza que no se encuentra en ningún país o territorio donde los Servicios estén prohibidos o restringidos.</p>
          <p><strong className="text-white">5.3.</strong> El Usuario no debe utilizar VPN, proxies ni cualquier medio para eludir controles geográficos o de verificación.</p>
          <p><strong className="text-white">5.4.</strong> El Proveedor puede, en cualquier momento, requerir verificación de identidad (KYC), documentos adicionales y controles antifraude como condición para el acceso, mantenimiento o pago de Recompensas.</p>
        </TermsSection>

        {/* §6 REGISTRO */}
        <TermsSection id="registro" sectionNumber={6} title="Registro, Cuenta y Seguridad" icon={Lock} iconColor="#8b5cf6">
          <p><strong className="text-white">6.1.</strong> Para acceder a los Servicios, el Usuario debe crear una Cuenta personal y única, proporcionando información completa, precisa y actualizada.</p>
          <p><strong className="text-white">6.2.</strong> La Cuenta es <strong className="text-white">personal, individual y no transferible</strong>. El Usuario no puede vender, ceder, compartir ni permitir que terceros utilicen la Cuenta.</p>
          <p><strong className="text-white">6.3.</strong> El Usuario es completamente responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas a través de su Cuenta.</p>
          <p><strong className="text-white">6.4.</strong> Está prohibido permitir que terceros operen la Cuenta, utilizar servicios de gestión de cuentas, o emplear bots o scripts no autorizados.</p>
        </TermsSection>

        {/* §7 PAGOS */}
        <TermsSection id="pagos" sectionNumber={7} title="Compra de Challenges, Tarifas y Pagos" icon={DollarSign} iconColor="#10b981">
          <p><strong className="text-white">7.1.</strong> Para adquirir un Challenge (2 Fases o 1 Fase), el Usuario debe pagar la tarifa de registro aplicable. Los precios y condiciones se muestran antes de la confirmación.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-white/[0.08] rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="text-left p-3 text-neon-green font-bold uppercase tracking-wider text-[10px]">Tier</th>
                  <th className="text-center p-3 text-neon-green font-bold uppercase tracking-wider text-[10px]">Capital</th>
                  <th className="text-center p-3 text-neon-green font-bold uppercase tracking-wider text-[10px]">2 Fases</th>
                  <th className="text-center p-3 text-neon-green font-bold uppercase tracking-wider text-[10px]">1 Fase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["Micro", "$5,000", "$35", "$42"],
                  ["Starter", "$10,000", "$49", "$59"],
                  ["Pro", "$25,000", "$99", "$119"],
                  ["Elite", "$50,000", "$199", "$239"],
                  ["Legend", "$100,000", "$499", "$599"],
                  ["Apex", "$200,000", "$999", "$1,199"],
                ].map(([name, cap, two, one]) => (
                  <tr key={name} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{name}</td>
                    <td className="p-3 text-center text-text-secondary">{cap}</td>
                    <td className="p-3 text-center text-text-secondary">{two}</td>
                    <td className="p-3 text-center text-text-secondary">{one}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p><strong className="text-white">7.2.</strong> Los pagos se realizan mediante criptomonedas (BTC, USDT y otros métodos disponibles) a través del Procesador de Pagos autorizado.</p>
          <p><strong className="text-white">7.3.</strong> Las tarifas constituyen contraprestación por el acceso a los Servicios de evaluación, y <strong className="text-white">no son depósitos, inversiones ni fondos protegidos</strong>.</p>
          <p><strong className="text-white">7.4.</strong> El Usuario puede solicitar un reembolso dentro de los 7 días a partir de la fecha de compra, siempre que no haya ejecutado ninguna operación en la Cuenta correspondiente. Una vez abierta cualquier operación, no procederá reembolso.</p>
          <p><strong className="text-white">7.5.</strong> Cualquier impuesto aplicable será responsabilidad exclusiva del Usuario.</p>
        </TermsSection>

        {/* §8 ENTORNO SIMULADO */}
        <TermsSection id="entorno" sectionNumber={8} title="Entorno de Trading Simulado y Reglas" icon={Layers} iconColor="#f97316">
          <p><strong className="text-white">8.1.</strong> Funded Spread proporciona programas de evaluación mediante cuentas Demo de MetaTrader 5 con fondos virtuales. Cada tipo de Challenge tiene parámetros específicos:</p>

          {/* 2 Fases Table */}
          <div>
            <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Challenge 2 Fases
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-white/[0.08] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-500/[0.06]">
                    <th className="text-left p-3 text-blue-400 font-bold uppercase tracking-wider text-[10px]">Métrica</th>
                    <th className="text-center p-3 text-blue-400 font-bold uppercase tracking-wider text-[10px]">Fase 1</th>
                    <th className="text-center p-3 text-blue-400 font-bold uppercase tracking-wider text-[10px]">Fase 2</th>
                    <th className="text-center p-3 text-blue-400 font-bold uppercase tracking-wider text-[10px]">Fondeada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Objetivo de Profit", "8%", "5%", "Sin límite"],
                    ["Drawdown Diario", "4%", "4%", "4%"],
                    ["Drawdown Máximo", "10%", "10%", "10%"],
                    ["Días Mínimos", "5", "5", "5"],
                    ["Tiempo Límite", "30 días", "60 días", "Ilimitado"],
                    ["Profit Split", "—", "—", "80% base"],
                  ].map(([metric, f1, f2, funded]) => (
                    <tr key={metric} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-medium text-white">{metric}</td>
                      <td className="p-3 text-center text-text-secondary">{f1}</td>
                      <td className="p-3 text-center text-text-secondary">{f2}</td>
                      <td className="p-3 text-center text-text-secondary">{funded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1 Fase Table */}
          <div>
            <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Challenge 1 Fase
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-white/[0.08] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-amber-500/[0.06]">
                    <th className="text-left p-3 text-amber-400 font-bold uppercase tracking-wider text-[10px]">Métrica</th>
                    <th className="text-center p-3 text-amber-400 font-bold uppercase tracking-wider text-[10px]">Evaluación</th>
                    <th className="text-center p-3 text-amber-400 font-bold uppercase tracking-wider text-[10px]">Fondeada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Objetivo de Profit", "10%", "Sin límite"],
                    ["Drawdown Diario", "3%", "3%"],
                    ["Drawdown Máximo", "5%", "5%"],
                    ["Días Mínimos", "2", "2"],
                    ["Tiempo Límite", "30 días", "Ilimitado"],
                    ["Profit Split", "—", "80% base"],
                  ].map(([metric, eval_, funded]) => (
                    <tr key={metric} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-medium text-white">{metric}</td>
                      <td className="p-3 text-center text-text-secondary">{eval_}</td>
                      <td className="p-3 text-center text-text-secondary">{funded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p><strong className="text-white">8.2.</strong> Las Reglas de Trading constituyen una parte integral de estos Términos. La violación de cualquier regla puede resultar en la falla de la evaluación, terminación de la Cuenta o cancelación de resultados.</p>

          <div className="p-4 rounded-xl bg-neon-green/[0.05] border border-neon-green/20">
            <h4 className="text-neon-green text-xs font-bold mb-2">Requisito de Operación Válida</h4>
            <p className="text-xs text-emerald-200/70">
              Para que un día de trading sea contado como válido, las operaciones ejecutadas deben cumplir
              con los requisitos mínimos de volumen y duración establecidos por el Proveedor. Operaciones
              que no generen al menos un ±0.3% de variación sobre el balance no serán contabilizadas como
              días de trading activos.
            </p>
          </div>
        </TermsSection>

        {/* §9 CONDUCTA PROHIBIDA */}
        <TermsSection id="conducta" sectionNumber={9} title="Conducta Prohibida" icon={Ban} iconColor="#ef4444">
          <p><strong className="text-white">9.1.</strong> Se prohíbe expresamente al Usuario participar en cualquiera de las siguientes conductas:</p>

          <div className="grid gap-2">
            {[
              { icon: Bot, label: "Explotación de errores, latencia o fallos del sistema", color: "#ef4444" },
              { icon: Layers, label: "Arbitraje de cualquier forma (latencia, estadístico, triangular)", color: "#ef4444" },
              { icon: Users, label: "Trading coordinado, colusión o cobertura entre cuentas", color: "#ef4444" },
              { icon: Lock, label: "Gestión de cuentas por terceros o compartición de credenciales", color: "#ef4444" },
              { icon: Bot, label: "Uso de Expert Advisors (EAs) o bots no autorizados", color: "#ef4444" },
              { icon: Globe, label: "Uso de VPN/proxy para eludir restricciones geográficas", color: "#ef4444" },
              { icon: Users, label: "Cuentas múltiples abusivas o evasión de límites", color: "#ef4444" },
              { icon: FileText, label: "Falsificación de identidad, documentos o información", color: "#ef4444" },
              { icon: TrendingUp, label: "Trading de brechas o explotación de condiciones fuera de mercado", color: "#ef4444" },
              { icon: DollarSign, label: "Fraude, manipulación de resultados o lavado de dinero", color: "#ef4444" },
            ].map(({ icon: I, label, color }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/[0.03] border border-red-500/10">
                <I className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-200/70">{label}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
            <h4 className="text-red-400 text-xs font-bold mb-2">Reglas Anti-Trampas Monitoreadas en Tiempo Real</h4>
            <div className="space-y-1.5">
              {[
                "Máximo 5 posiciones abiertas simultáneamente",
                "Máximo 20 operaciones diarias",
                "Prohibición de Expert Advisors (EAs) / Bots externos",
                "Detección automática de trading no manual (Magic Number > 0)",
              ].map(rule => (
                <div key={rule} className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="text-[11px] text-red-200/60">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <p><strong className="text-white">9.2.</strong> Si se identifica una violación, el Proveedor puede: suspender o terminar la Cuenta, restablecer resultados, negar Recompensas por Rendimiento, bloquear acceso, y tomar acciones legales apropiadas.</p>
        </TermsSection>

        {/* §10 ETAPA FONDEADA */}
        <TermsSection id="fondeada" sectionNumber={10} title="Etapa Fondeada" icon={TrendingUp} iconColor="#22c55e">
          <p><strong className="text-white">10.1.</strong> La Etapa Fondeada <strong className="text-white">no constituye</strong> una cuenta de trading real. Es un entorno de Trading Simulado con beneficio contractual condicional.</p>
          <p><strong className="text-white">10.2.</strong> El acceso a la Etapa Fondeada requiere: cumplimiento de todos los objetivos del Challenge, ausencia de violaciones, aprobación en la revisión de cumplimiento por parte del Proveedor.</p>
          <p><strong className="text-white">10.3.</strong> El acceso a la Etapa Fondeada constituye un beneficio contractual revocable. La aprobación en el Challenge no crea derechos adquiridos ni garantía de pagos futuros.</p>
          <p><strong className="text-white">10.4.</strong> El Proveedor puede monitorear y auditar la actividad del Usuario en todo momento para preservar la integridad del programa.</p>

          <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
            <h4 className="text-emerald-400 text-xs font-bold mb-2">Sistema de Escalamiento</h4>
            <p className="text-xs text-emerald-200/70">
              Al alcanzar +20% de profit acumulado, el trader puede escalar su capital x2 o solicitar retiro de ganancias.
              Si rompe reglas de drawdown durante un nivel avanzado, desciende al nivel anterior en lugar de perder todo.
              El profit split base es del 80%, escalable hasta 100% mediante add-ons o rendimiento consistente.
            </p>
          </div>
        </TermsSection>

        {/* §11 CUMPLIMIENTO */}
        <TermsSection id="cumplimiento" sectionNumber={11} title="Controles de Cumplimiento (KYC/AML)" icon={Eye} iconColor="#06b6d4">
          <p><strong className="text-white">11.1.</strong> El Proveedor adopta procedimientos de verificación de identidad (KYC) y prevención de lavado de dinero (AML). Para el pago de Recompensas por Rendimiento, el Usuario deberá proporcionar documentación válida.</p>
          <p><strong className="text-white">11.2.</strong> La documentación requerida puede incluir: documento oficial de identificación con fotografía, comprobante de residencia reciente, y cualquier otro documento razonablemente requerido.</p>
          <p><strong className="text-white">11.3.</strong> La falta de cooperación del Usuario con los procedimientos de verificación puede resultar en suspensión de la Cuenta y/o inelegibilidad para Recompensas.</p>
          <p><strong className="text-white">11.4.</strong> Antes de cualquier aprobación de Recompensas por Rendimiento, el Proveedor puede llevar a cabo una verificación integral, incluyendo revisión de actividad de trading, análisis de patrones, verificación de dispositivos e IP, y detección de fraudes.</p>
        </TermsSection>

        {/* §12 RECOMPENSAS */}
        <TermsSection id="recompensas" sectionNumber={12} title="Recompensas por Rendimiento (Retiros)" icon={Wallet} iconColor="#f59e0b">
          <p><strong className="text-white">12.1.</strong> Las Recompensas por Rendimiento no constituyen ganancias de mercado real, ingresos por inversión ni salario. Corresponden exclusivamente a un beneficio contractual basado en el rendimiento simulado.</p>
          <p><strong className="text-white">12.2.</strong> La elegibilidad depende del cumplimiento total de las Reglas de Trading, estos Términos, verificación KYC/AML satisfactoria, ausencia de conducta prohibida, y aprobación final del Proveedor.</p>

          <div className="p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/20">
            <h4 className="text-amber-400 text-xs font-bold mb-3">Estructura de Profit Split</h4>
            <div className="space-y-2">
              {[
                { level: "Base (incluido)", split: "80%", desc: "Incluido en todos los Challenges" },
                { level: "Premium (Add-on)", split: "90%", desc: "+15% sobre el precio del Challenge" },
                { level: "Élite (Add-on)", split: "100%", desc: "+30% sobre el precio del Challenge" },
              ].map(({ level, split, desc }) => (
                <div key={level} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <div>
                    <span className="text-xs text-white font-bold">{level}</span>
                    <p className="text-[10px] text-text-muted">{desc}</p>
                  </div>
                  <span className="text-neon-green font-bold text-sm">{split}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-amber-200/50 mt-2">
              Escalamiento orgánico: cada 3 retiros consecutivos sube +5% hasta un máximo de 90%.
            </p>
          </div>

          <p><strong className="text-white">12.3.</strong> El Proveedor puede compensar las Recompensas contra cualquier suma adeudada por el Usuario, incluyendo honorarios pendientes o daños por incumplimiento.</p>
          <p><strong className="text-white">12.4.</strong> Cualquier impuesto aplicable a las Recompensas será responsabilidad exclusiva del Usuario.</p>
        </TermsSection>

        {/* §13 PROPIEDAD INTELECTUAL */}
        <TermsSection id="propiedad" sectionNumber={13} title="Propiedad Intelectual" icon={Shield} iconColor="#8b5cf6">
          <p><strong className="text-white">13.1.</strong> Todo el contenido, infraestructura y materiales del Sitio Web y los Servicios, incluyendo marcas, logotipos, diseño, software, códigos y algoritmos, son propiedad exclusiva del Proveedor y están protegidos por leyes de propiedad intelectual.</p>
          <p><strong className="text-white">13.2.</strong> Se otorga al Usuario una licencia limitada, personal, revocable y no transferible para acceder y utilizar los Servicios exclusivamente para fines legítimos durante el plazo contractual.</p>
          <p><strong className="text-white">13.3.</strong> Queda prohibido copiar, modificar, distribuir, realizar ingeniería inversa del software, hacer scraping, o utilizar los materiales para desarrollar productos competidores.</p>
        </TermsSection>

        {/* §14 RESPONSABILIDAD */}
        <TermsSection id="responsabilidad" sectionNumber={14} title="Responsabilidad y Limitaciones" icon={Scale} iconColor="#6366f1">
          <p><strong className="text-white">14.1.</strong> Los Servicios se proporcionan &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;, sin garantías de ningún tipo. El Proveedor no garantiza acceso ininterrumpido, latencia mínima ni estabilidad permanente del servidor.</p>
          <p><strong className="text-white">14.2.</strong> El Proveedor no será responsable por daños indirectos, incidentales, pérdida de ganancias ni oportunidades, incluso si ha sido informado de su posibilidad.</p>
          <p><strong className="text-white">14.3.</strong> El entorno simulado puede incluir condiciones que difieren de las condiciones reales del mercado (liquidez, spreads, latencia, deslizamiento). El Proveedor no garantiza que el entorno simulado replique con precisión las condiciones reales.</p>
          <p><strong className="text-white">14.4.</strong> La responsabilidad total del Proveedor se limitará al monto pagado por el Usuario por el Servicio específico que originó la reclamación.</p>
          <p><strong className="text-white">14.5.</strong> El Proveedor puede modificar estos Términos en cualquier momento. El uso continuado del Sitio Web tras las modificaciones constituirá aceptación de la versión actualizada.</p>
          <p><strong className="text-white">14.6.</strong> Cualquier reclamación debe iniciarse dentro de los 6 meses siguientes al evento desencadenante.</p>
        </TermsSection>

        {/* §15 CONTACTO */}
        <TermsSection id="contacto" sectionNumber={15} title="Contacto y Comunicaciones" icon={Mail} iconColor="#00ff88">
          <p><strong className="text-white">15.1.</strong> Para cualquier consulta, soporte, notificación formal o comunicación legal, el Usuario puede contactar al Proveedor a través del siguiente canal oficial:</p>
          <a
            href="mailto:fundedspread@gmail.com"
            className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-neon-green/[0.08] border border-neon-green/20
                       hover:bg-neon-green/[0.15] hover:border-neon-green/40 transition-all duration-300 group"
          >
            <Mail className="w-5 h-5 text-neon-green group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-sm font-bold text-neon-green">fundedspread@gmail.com</span>
              <p className="text-[10px] text-text-muted">Canal oficial de soporte y comunicaciones</p>
            </div>
          </a>
          <p><strong className="text-white">15.2.</strong> Las comunicaciones electrónicas del Proveedor tendrán el mismo efecto legal que las comunicaciones escritas. Es responsabilidad del Usuario mantener sus datos de contacto actualizados.</p>
          <p><strong className="text-white">15.3.</strong> El Proveedor acusará recibo de quejas y buscará resolverlas dentro de los 30 días calendarios.</p>
        </TermsSection>

        {/* ---- DISCLAIMER FINAL ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-text-muted" />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                AVISO LEGAL
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Funded Spread proporciona acceso a programas de trading simulado diseñados únicamente para la evaluación
                de competencias de trading y habilidades de gestión de riesgo. Todo el trading se realiza en un entorno
                de demostración utilizando capital virtual. Funded Spread no es un corredor,  asesor de inversiones ni
                acepta depósitos de clientes. Los participantes no operan con activos reales. Las recompensas se basan en
                el rendimiento y se derivan exclusivamente de los resultados de la evaluación simulada.
              </p>
              <p className="text-[10px] text-text-muted/60">
                © {new Date().getFullYear()} Funded Spread. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
