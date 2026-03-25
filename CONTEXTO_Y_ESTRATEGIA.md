# 📌 CONTEXTO Y ESTRATEGIA — Funded Spread (Prop Firm)

> **Última actualización:** 15 Marzo 2026  
> **Objetivo:** Este archivo es la **biblia del proyecto**. Contiene el contexto completo del negocio, las decisiones estratégicas, la arquitectura técnica y las reglas de trading. Cualquier IA o desarrollador que lea este archivo debe entender el 100% del proyecto sin necesidad de leer código.

---

## 1. ¿Qué es Funded Spread?

**Funded Spread** es una empresa de fondeo propietario (Prop Firm) creada desde cero por un trader profesional de SMC/ICT con una comunidad activa en TikTok. Opera bajo el modelo **B-Book** (simulación pura):

- Los traders compran un "Challenge" (evaluación) pagando una tarifa.
- Reciben credenciales de una **cuenta Demo de MetaTrader 5**.
- Si logran cumplir los objetivos de rentabilidad sin romper las reglas de riesgo, pueden solicitar retiros reales.
- Los retiros se pagan con el fondo acumulado de las tarifas de los traders que fracasan (~90-95% de los participantes).

### Ventaja Competitiva
- **Sistema de Checkpoints (Escalamiento x2):** Al alcanzar +20% de profit, el trader puede duplicar su capital o retirar ganancias. Si rompe reglas, baja al nivel anterior (no pierde todo).
- **Challenges Clásicos de 2 Fases:** Modelo estándar de la industria (como FundedNext/FTMO) con Fase 1 (objetivo 8%) y Fase 2 (objetivo 5%).
- **Cero fricción:** El cliente paga con cripto → recibe credenciales MT5 por email → opera.
- **Comunidad orgánica:** Marketing 100% orgánico vía TikTok Lives.

---

## 2. Modelo de Negocio

### Flujo de Ingresos
```
Trader paga Challenge ($49-$499) → 90-95% fracasa → Tarifas se acumulan
                                  → 5-10% pasa → Retiros se pagan del fondo acumulado
```

### Tipos de Challenge

#### Opción A: Challenge Clásico 2 Fases (PREDETERMINADO)
Modelo estándar de la industria, inspirado en FundedNext:

| Métrica | Fase 1 | Fase 2 | Cuenta Fondeada |
|---------|--------|--------|-----------------|
| Objetivo de Profit | 8% | 5% | Sin límite |
| Drawdown Diario | 5% | 5% | 5% |
| Drawdown Máximo | 10% | 10% | 10% |
| Días Mínimos | 5 | 5 | 5 |
| Tiempo Límite | 30 días | 60 días | Ilimitado |
| Profit Split | — | — | 80-90% |

#### Opción B: Challenge de Escalamiento x2 (Checkpoints)
Sistema exclusivo de Funded Spread:

| Checkpoint | Capital | Objetivo | Recompensa |
|------------|---------|----------|------------|
| Nivel 1 | $10K-$100K | +20% profit | Escalar x2 o Retirar |
| Nivel 2 | x2 del anterior | +20% profit | Escalar x2 o Retirar |
| Nivel 3 | x2 del anterior | +20% profit | Escalar x2 o Retirar |
| Nivel 4 | x2 del anterior | +20% profit | Capital Real (A-Book) |

**Regla de Protección:** Si rompes el drawdown en Nivel 3, bajas a Nivel 2 (no pierdes todo).

### Precios (4 Tiers)
| Tier | Precio | Capital | Profit Split |
|------|--------|---------|-------------|
| Starter | $49 | $10,000 | 80% |
| Pro | $99 | $25,000 | 85% |
| Elite | $199 | $50,000 | 85% |
| Legend | $499 | $100,000 | 90% |

### Add-ons (Upselling)
| Add-on | Incremento | Descripción |
|--------|-----------|-------------|
| Raw Spreads | +10% | Spreads institucionales |
| Zero Commissions | +15% | Sin comisiones de trading |
| Retiros Semanales | +20% | Payout cada 7 días (vs 30 standard) |

---

## 3. Stack Tecnológico

| Componente | Tecnología | Razón |
|------------|-----------|-------|
| **Frontend** | Next.js 16 + React + TypeScript | SSR, App Router, rendimiento |
| **Estilos** | Tailwind CSS | Estética oscura cyberpunk |
| **Animaciones** | Framer Motion + canvas-confetti | Experiencia gaming premium |
| **Base de datos** | Supabase (PostgreSQL) | Gratuito, Auth integrada, RLS |
| **Pagos** | NOWPayments (Cripto) | BTC/USDT, sin KYC para el negocio |
| **Plataforma Trading** | MetaTrader 5 (MT5) | Estándar de la industria |
| **Risk Engine** | Expert Advisor MQL5 + Next.js API | Vigilancia cada 5 segundos |
| **Hosting VPS** | AWS EC2 t2.micro (Ubuntu) | Gratis primer año |
| **MT5 en Linux** | Wine + Xvfb (pantalla virtual) | Headless, ~40MB RAM por instancia |

### Variables de Entorno (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...
MT5_EA_SECRET=fundedspread_ea_secret_key_2026
```

---

## 4. Arquitectura del Sistema

### Flujo de Compra
```
Trader → /checkout → Selecciona Tier + Add-ons → Confirma
→ POST /api/payments/create-invoice → NOWPayments crea factura
→ Trader paga en wallet cripto → NOWPayments envía IPN (webhook)
→ /api/payments/webhook valida firma HMAC-SHA512 → Actualiza DB
→ Crea mt5_account con status "pending_creation"
→ Admin crea cuenta Demo MT5 y vincula credenciales
→ Trader opera libremente
```

### Flujo del Risk Engine (En Vivo)
```
Expert Advisor (MQL5) → Cada 5s lee Equity/Balance/Floating
→ POST /api/risk-engine/mt5-webhook (JSON + Bearer Token)
→ Backend evalúa reglas de drawdown
→ Si violación → Responde "CLOSE_ALL" + actualiza DB a "failed"
→ EA cierra todas las posiciones + ExpertRemove() (se autodestruye)
```

### Reglas Anti-Trampas (FundedNext-Compliant)
El bot MQL5 evalúa localmente antes de cada envío al servidor:

1. **Máximo 5 posiciones abiertas simultáneamente** → `PositionsTotal() > 5`
2. **Máximo 20 operaciones diarias** → Cuenta `DEAL_ENTRY_IN` en historial del día
3. **Prohibición de EAs externos** → Detecta `POSITION_MAGIC > 0` (trading no manual)
4. **Autodestrucción post-baneo** → `ExpertRemove()` evita spam al servidor

---

## 5. Estructura del Proyecto

```
mi-prop-firm/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing Page pública
│   │   ├── layout.tsx                  # Layout global (fuentes, metadata)
│   │   ├── globals.css                 # Sistema de diseño (neón/cyberpunk)
│   │   ├── dashboard/page.tsx          # Dashboard del trader (774 líneas)
│   │   ├── checkout/page.tsx           # Tienda de Challenges (505 líneas)
│   │   ├── profile/page.tsx            # Perfil + Debug button (dev only)
│   │   ├── leaderboard/page.tsx        # Tabla de líderes
│   │   ├── analytics/page.tsx          # Estadísticas del trader
│   │   ├── login/page.tsx              # Login (email/Google)
│   │   ├── register/page.tsx           # Registro
│   │   └── api/
│   │       ├── risk-engine/
│   │       │   └── mt5-webhook/route.ts  # 🧠 Cerebro del Risk Engine
│   │       ├── payments/
│   │       │   ├── create-invoice/route.ts # Crear factura NOWPayments
│   │       │   └── webhook/route.ts        # IPN webhook (pago completado)
│   │       ├── simulate/route.ts           # Panel CEO (dev only)
│   │       └── auth/
│   │           ├── callback/route.ts       # OAuth callback
│   │           └── signout/route.ts        # Cerrar sesión
│   ├── components/
│   │   ├── Sidebar.tsx                 # Navegación lateral
│   │   ├── AuthModal.tsx               # Modal login/register
│   │   ├── LayoutShell.tsx             # Layout condicional
│   │   └── landing/
│   │       ├── InteractiveElements.tsx # Animaciones del landing
│   │       └── Sections.tsx            # Secciones del landing
│   └── lib/
│       └── supabase/
│           ├── client.ts               # Cliente browser
│           ├── server.ts               # Cliente server
│           └── middleware.ts           # Protección de rutas
├── mt5-bot/
│   └── FundedSpread_Risk.mq5          # 🤖 Expert Advisor (206 líneas)
├── CONTEXTO_Y_ESTRATEGIA.md           # ← ESTE ARCHIVO
├── REGISTRO_DE_DESARROLLO.md          # Diario de desarrollo
├── GUIA_VPS_AWS.md                    # Tutorial VPS headless
├── TEST_LOCAL_MT5.md                  # Tutorial pruebas locales
├── migration-mt5.sql                  # SQL: renombrar a mt5_accounts
├── migration-payments.sql             # SQL: columnas de pagos
└── supabase-migration.sql             # SQL: tablas base + RLS + seed
```

---

## 6. Base de Datos (Supabase)

### Tabla: `mt5_accounts`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Identificador único |
| user_id | UUID FK | Referencia a auth.users |
| mt5_login | VARCHAR | Número de cuenta MT5 |
| mt5_password | VARCHAR | Contraseña MT5 (encriptada) |
| mt5_server | VARCHAR | Servidor del broker |
| initial_balance | NUMERIC | Balance inicial del challenge |
| current_balance | NUMERIC | Balance actual (vía webhook) |
| current_equity | NUMERIC | Equidad actual (vía webhook) |
| daily_initial_balance | NUMERIC | Balance al inicio del día |
| daily_drawdown_pct | NUMERIC | % drawdown diario permitido (default: 5) |
| max_drawdown_pct | NUMERIC | % drawdown máximo permitido (default: 10) |
| account_status | VARCHAR | pending_creation / active / failed / passed |
| status_reason | VARCHAR | Motivo de fallo (si aplica) |
| challenge_tier | VARCHAR | starter / pro / elite / legend |
| challenge_type | VARCHAR | classic_2phase / scaling_x2 |
| challenge_phase | INTEGER | 1 o 2 (solo para challenge clásico 2 fases) |
| can_level_up | BOOLEAN | ¿Cumplió objetivo de profit? |
| is_active | BOOLEAN | ¿Está activa la cuenta? |
| has_raw_spread | BOOLEAN | Add-on: Raw Spreads |
| has_zero_commission | BOOLEAN | Add-on: Zero Commissions |
| has_weekly_payouts | BOOLEAN | Add-on: Retiros semanales |
| peak_equity | NUMERIC | Equidad máxima alcanzada (trailing DD) |
| last_health_check | TIMESTAMP | Último ping del EA |
| created_at | TIMESTAMP | Fecha de creación |

### Tabla: `challenge_transactions`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Identificador |
| user_id | UUID FK | Quién compró |
| challenge_tier | VARCHAR | Tier seleccionado |
| account_size | INTEGER | Tamaño de cuenta |
| price | NUMERIC | Precio final (con add-ons) |
| status | VARCHAR | pending / paid / active / expired |
| nowpayments_invoice_id | VARCHAR | ID de factura NOWPayments |
| has_raw_spread | BOOLEAN | Add-on |
| has_zero_commission | BOOLEAN | Add-on |
| has_weekly_payouts | BOOLEAN | Add-on |

### Tabla: `users` (vía trigger on_auth_user_created)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Igual a auth.users.id |
| email | TEXT | Email del usuario |
| username | TEXT | Gamer Tag |
| avatar_url | TEXT | Avatar |
| checkpoint_level | INTEGER | Nivel de escalamiento |

---

## 7. Expert Advisor MQL5 — Anatomía Completa

### Archivo: `mt5-bot/FundedSpread_Risk.mq5` (206 líneas)

**Parámetros de entrada:**
- `InpWebhookUrl` — URL del servidor (producción o localhost)
- `InpApiSecret` — Clave Bearer para autenticar con el backend
- `InpTimerSeconds` — Frecuencia de chequeo (default: 5 segundos)

**Funciones principales:**
| Función | Responsabilidad |
|---------|----------------|
| `OnInit()` | Activa el temporizador cada N segundos |
| `OnTimer()` | Lee equity/balance, evalúa reglas anti-trampas, envía JSON al servidor |
| `CloseAllPositions()` | Itera todas las posiciones abiertas y las cierra a precio de mercado |
| `OnDeinit()` | Limpia el temporizador al detener el bot |

**Reglas validadas localmente (antes de enviar al servidor):**
1. `PositionsTotal() > 5` → Violación: límite de posiciones
2. `HistoryDealsTotal()` con `DEAL_ENTRY_IN` → Más de 20 trades/día
3. `POSITION_MAGIC > 0` → EA externo detectado

**Payload JSON enviado:**
```json
{
  "login": "12345678",
  "equity": 49500.00,
  "balance": 50000.00,
  "floating": -500.00,
  "timestamp": 1710500000,
  "violation": "Limite de 5 posiciones excedido"  // Solo si hay violación
}
```

**Comportamiento post-violación:**
1. Cierra todas las posiciones (`CloseAllPositions()`)
2. Imprime el motivo en el log de Expertos de MT5
3. Se autoelimina del gráfico (`ExpertRemove()`)

### ¿Se necesitan 2 bots diferentes?
**NO.** Un solo bot es suficiente para ambos tipos de challenge. El bot solo reporta datos crudos (equity, balance, violaciones locales). La lógica de "¿pasó la Fase 1?" o "¿alcanzó el Checkpoint del 20%?" se ejecuta en el **servidor backend** (`mt5-webhook/route.ts`), no en el bot. Esto permite:
- Actualizar reglas sin recompilar el bot
- Manejar ambos tipos de challenge con la misma instancia de MT5
- Menor complejidad = menor riesgo de bugs

---

## 8. Decisiones Estratégicas Tomadas

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 28 Feb | Usar Next.js + Supabase (no Laravel) | Stack moderno, gratis, TypeScript |
| 01 Mar | Estética Cyberpunk/Neón (no Oro Institucional) | Aprobada por CEO, más atractiva para comunidad TikTok |
| 01 Mar | NOWPayments para pagos (no Stripe) | Crypto-native, sin KYC del negocio, menor fricción |
| 07 Mar | Rebranding: "Funded Spread" (antes Neon Trader) | Nombre más profesional e institucional |
| 14 Mar | Pivotar de cTrader a MetaTrader 5 | MT5 es estándar de la industria, menor fricción para traders |
| 14 Mar | VPS Headless (Wine+Xvfb) vs Windows | $0 costo, escalable, ~40MB RAM por instancia |
| 15 Mar | EA con ExpertRemove() (autodestrucción) | Evita spam al servidor tras baneo |
| 15 Mar | 20 trades/día (no 50 como FundedNext) | Prioriza calidad sobre cantidad |
| 15 Mar | Sin límite de lotaje | Escala con el tamaño de cuenta, no ahuyenta traders |
| 15 Mar | 2 tipos de challenge (Clásico + Escalamiento) | Captura ambos mercados: traders conservadores y ambiciosos |

---

## 9. Reglas de Desarrollo OBLIGATORIAS

1. **NUNCA mencionar cTrader** — Fue eliminado 100% del proyecto en Marzo 2026.
2. **Siempre leer este archivo** antes de proponer cambios arquitectónicos.
3. **Siempre leer `REGISTRO_DE_DESARROLLO.md`** para no repetir errores.
4. **NO inventar endpoints** — Verificar documentación oficial de MT5/Supabase/NOWPayments.
5. **Las cuentas son DEMO** — Tanto challenges como "cuentas fondeadas".
6. **El bot MQL5 es universal** — Un solo bot para todos los tipos de challenge.
7. **La lógica de negocio vive en el servidor** — El bot solo reporta datos.
8. **Seguridad:** API Keys en `.env.local`, HMAC para webhooks, RLS en Supabase.
9. **Estética:** Modo oscuro absoluto, neón verde/púrpura/cyan, fuentes Orbitron/Rajdhani.

---

## 10. Próximos Pasos

- [ ] Implementar lógica de Challenge Clásico 2 Fases en el backend (Fase 1/Fase 2 con objetivos diferenciados)
- [ ] Agregar selector de tipo de challenge en `/checkout` (Clásico vs Escalamiento)
- [ ] Desplegar VPS AWS EC2 y configurar MT5 headless en producción
- [ ] Configurar dominio personalizado y SSL
- [ ] Landing page final con SEO optimizado
- [ ] Sistema de notificaciones por email (credenciales MT5, alertas de violación)
- [ ] Panel de administración para crear/gestionar cuentas MT5