# 📘 MANUAL DE PLATAFORMA — FUNDED SPREAD

> **Versión:** 1.0 — Producción  
> **Fecha:** Marzo 2026  
> **Stack:** Next.js 16 + Supabase + NOWPayments + MetaTrader 5

---

## 1. ¿Qué es FundedSpread?

FundedSpread es una **prop firm** (empresa de fondeo) que evalúa traders y les proporciona capital para operar en los mercados financieros. El modelo de negocio es:

1. El trader paga una tarifa para acceder a un **challenge** (evaluación).
2. El challenge se realiza en una cuenta de MetaTrader 5 con reglas de riesgo.
3. Si el trader cumple los objetivos (profit target sin violar drawdown), recibe una **cuenta fondeada**.
4. Con la cuenta fondeada, el trader opera con el capital de la empresa y recibe un **porcentaje de los beneficios** (profit split).

### Flujo General del Usuario

```
Registro → Selección de Challenge → Pago Crypto → 
Recibir cuenta MT5 → Trading en MT5 → Evaluación automática →
Cuenta Fondeada → Trading real → Retiros de beneficios
```

---

## 2. Tipos de Challenge

### 1 Fase
> *(key interna BD: `express_1phase`)*
| Parámetro | Valor |
|---|---|
| Profit Target | 10% |
| Daily Drawdown | 3% |
| Max Drawdown | 5% |
| Mínimo de días operando | 2 |
| Profit Split al ser fondeado | 80% (upgradeable) |

### 2 Fases
> *(key interna BD: `classic_2phase`)*
| Parámetro | Fase 1 | Fase 2 |
|---|---|---|
| Profit Target | 8% | 5% |
| Daily Drawdown | 4% | 4% |
| Max Drawdown | 10% | 10% |
| Mínimo de días operando | 5 | 5 |
| Profit Split al ser fondeado | 80% (upgradeable) |

### Tiers Disponibles (Tamaños de Cuenta)

| Tier | Cuenta | Precio 2 Fases | Precio 1 Fase |
|---|---|---|---|
| MICRO | $5,000 | $35 | $57 |
| STARTER | $10,000 | $56 | $98 |
| PRO | $25,000 | $135 | $215 |
| ELITE | $50,000 | $225 | $315 |
| LEGEND | $100,000 | $389 | $549 |
| APEX | $200,000 | $789 | $1,089 |

### Add-ons (Complementos)
- **Raw Spread:** +10% del precio base
- **Zero Commission:** +15% del precio base
- **Weekly Payouts:** +20% del precio base (retiros semanales en vez de bisemanales)
- **Scaling x2:** +25% del precio base (escalamiento de cuenta)
- **90% Profit Split:** +15% del precio base
- **100% Profit Split:** +25% del precio base

---

## 3. Panel de Administración

### Cómo Acceder (Easter Egg)

> ⚠️ **INFORMACIÓN CONFIDENCIAL — NO COMPARTIR**

El botón de administración ha sido eliminado de la UI. Para acceder:

1. **Inicia sesión** con la cuenta de administrador.
2. En el **sidebar**, haz clic **5 veces rápido** (en menos de 3 segundos) en el área del **logo "FUNDED SPREAD"**.
3. Serás redirigido automáticamente a `/admin`.
4. Solo funciona si el email autenticado coincide con la variable de entorno `ADMIN_EMAIL`.

### Funcionalidades del Panel Admin

#### Gestión de Retiros
- Ver todas las solicitudes de retiro pendientes
- **Aprobar:** Marca la solicitud como aprobada
- **Completar:** Ingresa el hash de transacción (TxHash) cuando se ejecuta el pago
- **Rechazar:** Rechaza con nota opcional

#### Vista de Cuentas
- Lista de todas las cuentas MT5 activas y fondeadas
- Balances, equity, estado del challenge

#### Usuarios
- Lista de usuarios registrados con email y username

---

## 4. Risk Engine (Motor de Riesgo)

### Arquitectura

```
MetaTrader 5 EA → HTTP POST → /api/risk-engine/mt5-webhook → Supabase
```

### Flujo del EA
1. El **Expert Advisor (EA)** instalado en la cuenta MT5 del trader envía datos periódicos al webhook.
2. El webhook verifica la autenticación con `MT5_EA_SECRET`.
3. Evalúa las reglas de riesgo:
   - **Daily Drawdown:** Si el equity cae más del % permitido respecto al balance de inicio del día.
   - **Max Drawdown:** Si el equity cae más del % permitido respecto al balance inicial.
4. Si se viola una regla → la cuenta se marca como `failed` con el tipo de violación.
5. Si se cumple el profit target → la cuenta puede subir de fase o quedar `funded`.

### EA para MetaTrader 5
- **Archivo:** `mt5-bot/FundedSpread_Risk.mq5`
- **Secret:** Configurado en `MT5_EA_SECRET` en `.env.local`
- El EA envía: `mt5_login`, `balance`, `equity`, `profit`, `open_positions`

---

## 5. Sistema de Pagos (NOWPayments)

### Flujo de Pago

```
Usuario selecciona challenge → API crea invoice en NOWPayments →
Usuario paga en crypto → NOWPayments envía webhook IPN →
API verifica firma IPN → Actualiza transacción en DB → 
Crea cuenta MT5 automáticamente
```

### Endpoints
- **Crear invoice:** `POST /api/payments/create-invoice`
- **Webhook IPN:** `POST /api/payments/nowpayments-ipn`

### Configuración
- `NOWPAYMENTS_API_KEY`: API key de NOWPayments
- `NOWPAYMENTS_IPN_SECRET`: Secret para verificar webhooks IPN

### Estados de Transacción (`challenge_transactions.status`)
- `pending`: Factura creada, esperando pago
- `paid`: Pago confirmado por NOWPayments
- `active`: Cuenta MT5 creada y activa
- `completed`: Challenge completado exitosamente
- `failed`: Pago falló o fue rechazado

---

## 6. Sistema de Retiros

### Reglas
- Solo cuentas con status `funded` y equity > initial_balance
- Redes soportadas: **TRC20** y **BEP20** (USDT)
- Profit split configurable: 80%, 90%, o 100% según add-ons
- **Payout Timer:**
  - Sin weekly payouts: cada 14 días desde la fecha de último retiro
  - Con weekly payouts: cada 7 días

### Flujo
```
Trader solicita retiro → Ingresa wallet + red →
Admin aprueba → Admin completa con TxHash →
Se actualiza last_withdrawal_at en la cuenta
```

### Estados de Retiro (`withdrawal_requests.status`)
- `pending`: Solicitud enviada por el trader
- `approved`: Aprobada por admin
- `processing`: En proceso de envío
- `completed`: Transferencia realizada (incluye tx_hash)
- `rejected`: Rechazada por admin (incluye admin_notes)

---

## 7. Leaderboard (Clasificación)

### Estructura
- Los **traders fake** se generan con `is_fake: true` y `generation_month` correspondiente al mes actual.
- Los **traders reales** tienen `is_fake: false` y `user_id` vinculado.
- Solo se muestran los del mes actual (fake) y todos los reales.

### Profit Dinámico
Los traders fake tienen un boost del 5% después del día 15 del mes para dar la impresión de actividad creciente.

### Prize Pool
- $10,000 USD mensuales (distribuido entre top 3)
- #1: $5,000 | #2: $3,000 | #3: $2,000
- Countdown hasta fin de mes

### Actualización Mensual
Los fake traders deben regenerarse cada mes con un nuevo `generation_month`. Los datos actuales se conservan y el query filtra por el mes actual.

---

## 8. Base de Datos (Supabase)

### Tablas Principales

| Tabla | Descripción | RLS |
|---|---|---|
| `users` | Perfiles de usuario (id, email, username, avatar) | ✅ |
| `mt5_accounts` | Cuentas MT5 vinculadas (balance, equity, status, challenge info) | ✅ |
| `challenge_transactions` | Pagos de challenges (tier, precio, status de pago) | ✅ |
| `withdrawal_requests` | Solicitudes de retiro (monto, wallet, status) | ✅ |
| `daily_snapshots` | Snapshots diarios de equity/balance para PnL chart | ✅ |
| `leaderboard_traders` | Traders del leaderboard (fake + reales) | ✅ |

### Campos Clave de `mt5_accounts`

| Campo | Descripción |
|---|---|
| `account_status` | `pending_link`, `active`, `under_review`, `funded`, `failed` |
| `challenge_type` | `express_1phase` (1 Fase), `classic_2phase` (2 Fases) |
| `challenge_phase` | 1 o 2 (para 2 Fases) |
| `challenge_tier` | `micro`, `starter`, `pro`, `elite`, `legend`, `apex` |
| `initial_balance` | Balance inicial de la evaluación |
| `current_balance` / `current_equity` | Valores actuales |
| `daily_drawdown_pct` / `max_drawdown_pct` | Límites de drawdown |
| `profit_target_pct` / `profit_split_pct` | Target y split configurados |
| `violation_type` / `violation_date` | Si fue violada, tipo y fecha |
| `mt5_login` / `mt5_password` / `mt5_server` | Credenciales MT5 |
| `has_raw_spread`, `has_weekly_payouts`, etc. | Add-ons activos |

---

## 9. Variables de Entorno

### Archivo: `.env.local`

| Variable | Tipo | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon key (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Service role (server-side only) |
| `RISK_ENGINE_SECRET` | Secret | Auth del risk engine interno |
| `NOWPAYMENTS_API_KEY` | Secret | API key NOWPayments |
| `NOWPAYMENTS_IPN_SECRET` | Secret | Verificación webhooks IPN |
| `MT5_EA_SECRET` | Secret | Auth del EA de MT5 |
| `ADMIN_EMAIL` | Secret | Email del admin (server-side) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Public | Email del admin (client) |

> ⚠️ **SEGURIDAD:** `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `NOWPAYMENTS_IPN_SECRET` y `MT5_EA_SECRET` **NUNCA** deben exponerse en el client-side.

---

## 10. Stack Técnico

| Componente | Tecnología |
|---|---|
| **Frontend** | Next.js 16 (App Router, React 19) |
| **Estilos** | Tailwind CSS + CSS custom properties |
| **Animaciones** | Framer Motion |
| **Base de datos** | Supabase (PostgreSQL + Row Level Security) |
| **Autenticación** | Supabase Auth (email/password + Google OAuth) |
| **Pagos** | NOWPayments (crypto: USDT, BTC, etc.) |
| **Trading** | MetaTrader 5 (MT5) via Expert Advisor |
| **Hosting** | Vercel / localhost:3000 (dev) |
| **Internacionalización** | i18n custom (ES/EN) |
| **Tipografía** | Orbitron (headings), Rajdhani (body), Inter |

---

## 11. Estructura de Archivos Clave

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Panel del trader
│   ├── checkout/page.tsx     # Selección de challenge + pago
│   ├── profile/page.tsx      # Perfil del usuario
│   ├── leaderboard/page.tsx  # Clasificación mensual
│   ├── admin/page.tsx        # Panel de administración
│   └── api/
│       ├── admin/
│       │   ├── data/route.ts        # Fetch admin data
│       │   └── withdrawals/route.ts # Gestión de retiros
│       ├── payments/
│       │   ├── create-invoice/route.ts  # Crear factura NOWPayments
│       │   └── nowpayments-ipn/route.ts # Webhook IPN
│       └── risk-engine/
│           └── mt5-webhook/route.ts     # Webhook del EA
├── components/
│   ├── Sidebar.tsx           # Navegación lateral + Easter Egg admin
│   ├── WithdrawModal.tsx     # Modal de retiro
│   └── dashboard/
│       ├── PnLChart.tsx       # Gráfico de rendimiento
│       ├── TradingObjectives.tsx # Objetivos del challenge
│       └── RecentTrades.tsx   # Trades recientes
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Cliente Supabase (browser)
│   │   ├── server.ts         # Cliente Supabase (server)
│   │   └── middleware.ts     # Middleware de sesión
│   └── i18n/
│       ├── LanguageContext.tsx # Contexto de idioma
│       ├── es.json            # Traducciones español
│       └── en.json            # Traducciones inglés
└── mt5-bot/
    └── FundedSpread_Risk.mq5  # Expert Advisor de MT5
```

---

## 12. Instrucciones de Desarrollo

### Iniciar el servidor de desarrollo
```bash
npm run dev
# → http://localhost:3000
```

### Build de producción
```bash
npm run build
npm start
```

### Requisitos previos
- Node.js 18+
- npm o yarn
- Cuenta Supabase con proyecto configurado
- Cuenta NOWPayments con API key
- MetaTrader 5 con EA compilado

---

## 13. Cambios de Producción Realizados (Marzo 2026)

### Seguridad
- ✅ Email de admin movido de hardcoded a variables de entorno (`ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL`)
- ✅ Botón visible de admin eliminado del sidebar
- ✅ Easter Egg implementado (5 clics rápidos en el logo)
- ✅ Endpoint `/api/admin/test-setup` eliminado completamente
- ✅ Cero emails hardcodeados en el código fuente

### Datos
- ✅ Cuenta MT5 de prueba eliminada de la base de datos
- ✅ Leaderboard actualizado con datos competitivos más realistas
- ✅ Función `generateMockPnLData` eliminada
- ✅ Función `handleDebugLink` eliminada del perfil (datos mock MT5)
- ✅ PnL Chart muestra empty state elegante cuando no hay datos reales

### UI
- ✅ Verified badge usa env var en vez de email hardcodeado
- ✅ KYC verification usa env var
- ✅ Dashboard muestra estado vacío profesional cuando no hay snapshots

---

*Documento generado para referencia interna del equipo de FundedSpread.*
