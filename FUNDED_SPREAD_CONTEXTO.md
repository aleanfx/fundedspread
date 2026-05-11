# FUNDED SPREAD — CONTEXTO COMPLETO DEL PROYECTO
> Generado el 05/05/2026 a partir del código fuente real del repositorio.
> Este archivo reemplaza cualquier documentación anterior. Refleja el estado actual del código.

---

## 1. QUÉ ES FUNDED SPREAD

Prop Firm de Forex fundada y operada en solitario por un trader con +6 años de experiencia real en SMC/ICT. Opera bajo modelo **B-Book puro** (cuentas Demo de MT5). Los traders pagan un Challenge, operan en Demo, y si cumplen objetivos reciben retiros reales pagados con el fondo acumulado de challenges fallidos.

- **Web**: https://www.funded-spread.com
- **Repo**: https://github.com/aleanfx/fundedspread
- **Hosting**: Vercel (deploy automático desde GitHub main)
- **BD**: Supabase (PostgreSQL + Auth + Storage)
- **Pagos**: NOWPayments (cripto — BTC/USDT)
- **Trading**: MetaTrader 5 (MT5) con Expert Advisor MQL5 propio
- **VPS**: AWS EC2 t2.micro (Ubuntu) — pendiente configurar en producción

---

## 2. STACK TÉCNICO

| Capa | Tecnología |
|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| Animaciones | Framer Motion + canvas-confetti |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| Pagos | NOWPayments API v1 |
| Bot de riesgo | Expert Advisor MQL5 (FundedSpread_Risk.mq5) |
| Hosting | Vercel |
| VPS | AWS EC2 Ubuntu (Wine + Xvfb para MT5 headless) |
| i18n | Sistema propio con JSON (es.json / en.json) + Context API |

**Fuentes:** Orbitron (títulos), Rajdhani (cuerpo) — estética cyberpunk/neón verde.

---

## 3. ESTRUCTURA DE ARCHIVOS (src/)

```
src/
├── app/
│   ├── page.tsx                          # Landing page pública
│   ├── layout.tsx                        # Layout global
│   ├── globals.css                       # Sistema de diseño neón/cyberpunk
│   ├── admin/page.tsx                    # Panel de administración (EXISTE y funciona)
│   ├── dashboard/page.tsx                # Dashboard del trader
│   ├── checkout/page.tsx                 # Tienda de Challenges
│   ├── profile/page.tsx                  # Perfil de usuario
│   ├── leaderboard/page.tsx              # Tabla de líderes
│   ├── analytics/page.tsx                # Estadísticas del trader
│   ├── certificate/[type]/page.tsx       # Certificados de logros
│   ├── rules/page.tsx                    # Reglas del challenge
│   ├── terms/page.tsx                    # Términos y condiciones
│   ├── login/page.tsx                    # Login
│   ├── register/page.tsx                 # Registro
│   └── api/
│       ├── risk-engine/mt5-webhook/      # 🧠 Cerebro del Risk Engine
│       ├── payments/create-invoice/      # Crear factura NOWPayments
│       ├── payments/webhook/             # IPN webhook (pago confirmado)
│       ├── payments/status/[invoiceId]/  # Estado de pago
│       ├── admin/data/                   # Datos admin
│       ├── admin/users/                  # Gestión usuarios (admin)
│       ├── admin/transactions/           # Transacciones (admin)
│       ├── admin/withdrawals/            # Retiros (admin)
│       ├── admin/leaderboard/            # Leaderboard (admin)
│       ├── admin/impersonate/            # Impersonación de usuario (admin)
│       ├── withdrawals/request/          # Solicitar retiro (trader)
│       ├── leaderboard/reset/            # Reset mensual (cron job)
│       └── proxy-image/                  # Proxy de imágenes
├── components/
│   ├── AuthModal.tsx                     # Modal login/registro
│   ├── Sidebar.tsx                       # Navegación lateral (dashboard)
│   ├── LayoutShell.tsx                   # Layout condicional
│   ├── ProfileDropdown.tsx               # Dropdown de perfil (avatar + opciones)
│   ├── WithdrawModal.tsx                 # Modal de retiro
│   ├── RankBadge.tsx                     # Badge de rango
│   ├── FundedSpreadLogo.tsx              # Logo SVG
│   ├── Flags.tsx                         # Banderas ES/EN
│   ├── dashboard/
│   │   ├── PnLChart.tsx                  # Gráfica de P&L (usa daily_snapshots)
│   │   └── TradingObjectives.tsx         # Objetivos de trading
│   └── landing/
│       ├── Sections.tsx                  # Todas las secciones del landing
│       └── InteractiveElements.tsx       # Ticker, partículas, gráfica 3D
└── lib/
    ├── i18n/
    │   ├── LanguageContext.tsx            # Contexto de idioma (ES/EN)
    │   ├── es.json                        # Traducciones español
    │   └── en.json                        # Traducciones inglés
    ├── supabase/
    │   ├── client.ts                      # Cliente browser (con getSafeSession)
    │   ├── server.ts                      # Cliente server
    │   ├── middleware.ts                  # Protección de rutas
    │   └── index.ts
    ├── emails/templates.ts                # Templates HTML de emails
    └── utils/
        ├── rankSystem.ts                  # Sistema de rangos
        └── botSchedule.ts                 # Scheduler del bot
```

---

## 4. TIPOS DE CHALLENGE (NOMENCLATURA OFICIAL)

> ⚠️ IMPORTANTE: Los nombres en UI son distintos a los keys internos.

| UI (lo que ve el trader) | Key interno (BD/código) |
|---|---|
| **1 Fase** | `express_1phase` |
| **2 Fases** | `classic_2phase` |

Nunca mostrar al trader: "Express", "Classic", "1Phase", "2Phase".

### Reglas por tipo:

| Métrica | 1 Fase | 2 Fases — Fase 1 | 2 Fases — Fase 2 | Fondeada |
|---|---|---|---|---|
| Objetivo Profit | 10% | 8% | 5% | Sin límite |
| DD Diario | 3% | 4% | 4% | 4% |
| DD Máximo | 5% | 10% | 10% | 10% |
| Días Mínimos | 2 | 5 | 5 | — |
| Tiempo Límite | 30 días | 30 días | 60 días | Ilimitado |
| Profit Split Base | 80% | — | 80% | 80% |

---

## 5. PRECIOS (ESTADO ACTUAL EN CÓDIGO)

Según `src/app/api/payments/create-invoice/route.ts`:

| Tier | 2 Fases | 1 Fase | Cuenta |
|---|---|---|---|
| Micro | $35 | $57 | $5,000 |
| Starter | $56 | $98 | $10,000 |
| Pro | $135 | $215 | $25,000 |
| Elite | $225 | $315 | $50,000 |
| Legend | $389 | $549 | $100,000 |
| Apex | $789 | $1,089 | $200,000 |

*Precio 1 Fase ≈ Precio 2 Fases × 1.2 (no exactamente, están hardcodeados individualmente)*

### Add-ons (% sobre precio total):
- Raw Spread: +10%
- Zero Commission: +10%
- Weekly Payouts: +15%
- Scaling x2: +25%
- Split 90% (`addon_split_90`): +10%
- Split 100% (`addon_split_100`): +20%

### Cupones activos (hardcodeados server-side):
- `PERFORMANCE` → 10% de descuento
- `SPREADZERO` → 8% de descuento

---

## 6. BASE DE DATOS SUPABASE

### Tablas principales:

**`mt5_accounts`** — Cuentas de trading de cada trader
- `id`, `user_id`, `mt5_login`, `mt5_password`, `mt5_server`
- `initial_balance`, `current_balance`, `current_equity`, `floating_pnl`
- `daily_initial_balance`, `daily_drawdown_pct`, `max_drawdown_pct`
- `account_status`: `pending_creation` | `active` | `failed` | `phase2_ready` | `funded` | `checkpoint_reached` | `inactive`
- `challenge_tier`, `challenge_type`, `challenge_phase`
- `profit_target_pct`, `profit_split_pct`
- `can_level_up`, `is_active`
- `has_raw_spread`, `has_zero_commission`, `has_weekly_payouts`, `has_scaling_x2`
- `addon_split_90`, `addon_split_100`
- `peak_equity`, `last_health_check`, `trading_days_count`

**`challenge_transactions`** — Historial de compras
- `id`, `user_id`, `user_email`
- `challenge_tier`, `challenge_type`, `account_size`, `price`
- `status`: `pending` | `paid` | `active` | `expired`
- `nowpayments_invoice_id`, `payment_method`
- Todos los add-ons como booleans

**`users`** — Perfiles (creados por trigger on_auth_user_created)
- `id`, `email`, `username`, `avatar_url`
- `is_admin` (boolean) — da acceso al panel /admin
- `highest_rank`, `is_rank_locked`, `xp`
- `phases_passed`, `is_funded`
- `total_withdrawals`, `top_three_finishes`, `top_ten_finishes`

**`daily_snapshots`** — Para gráfica P&L
- `mt5_account_id`, `date`, `equity`, `balance`
- Unique constraint: `(mt5_account_id, date)` — upsert diario

**`trade_history`** — Trades cerrados
- `mt5_account_id`, `symbol`, `type`, `lots`, `entry_price`, `exit_price`, `pnl`, `closed_at`

**`withdrawal_requests`** — Solicitudes de retiro
- `id`, `user_id`, `account_id`, `amount`, `user_amount`
- `network`, `wallet_address`, `status`
- `profit_split_pct`, `admin_notes`, `tx_hash`

---

## 7. SISTEMA DE AUTENTICACIÓN

- **Login**: Email/contraseña + Google OAuth
- **Protección de rutas**: middleware en `src/middleware.ts` → `updateSession()`
- **getSafeSession()**: Función custom que lee primero de localStorage (0ms, sin Web Locks) para evitar lentitud. Si no hay sesión en storage, hace llamada de red con timeout de 4 segundos. Esto resuelve el problema de carga lenta en el dashboard.
- **Impersonación**: Admin puede ver la cuenta de cualquier trader via cookie `impersonate_user_id`

---

## 8. PANEL DE ADMINISTRACIÓN (/admin)

**YA EXISTE** en el código. Acceso: email en `ADMIN_EMAIL` env var, o `is_admin = true` en tabla `users`.

Tabs disponibles:
- **Retiros**: Aprobar/rechazar solicitudes de retiro con filtros (pending/approved/completed/rejected)
- **Compras**: Ver todas las transacciones con filtros (pending/paid/active)
- **Usuarios**: Ver todos los traders, editar rangos, eliminar cuentas
- **Cuentas**: Ver y gestionar cuentas MT5 (asignar credenciales, cambiar status)
- **Emails**: Enviar emails desde templates predefinidos (Fase1, Fondeado, Retiro)

APIs de admin:
- `POST /api/admin/users` — Acciones sobre usuarios (delete, etc.)
- `GET /api/admin/data` — Datos consolidados del panel
- `GET/POST /api/admin/transactions` — Gestión de transacciones
- `GET/POST /api/admin/withdrawals` — Gestión de retiros
- `POST /api/admin/impersonate` — Ver cuenta de un trader

---

## 9. RISK ENGINE (Bot MT5)

### Expert Advisor: `mt5-bot/FundedSpread_Risk.mq5`
- Se instala en cada cuenta MT5 del trader
- Envía JSON cada 5 segundos a `/api/risk-engine/mt5-webhook`
- Autenticación: Bearer token (`MT5_EA_SECRET` env var)

### Payload enviado por el EA:
```json
{
  "login": "12345678",
  "equity": 49500.00,
  "balance": 50000.00,
  "floating": -500.00,
  "timestamp": 1710500000,
  "violation": "Limite de 5 posiciones excedido",
  "trade": { "symbol": "EURUSD", "type": "buy", "lots": 0.1, "entry": 1.0800, "exit": 1.0850, "pnl": 50.00 }
}
```

### Reglas evaluadas localmente por el EA (antes de enviar):
1. Más de 5 posiciones abiertas → `violation`
2. Más de 20 trades en el día → `violation`
3. EA externo detectado (`POSITION_MAGIC > 0`) → `violation`

### Respuestas posibles del servidor al EA:
- `{ "action": "OK" }` → Continuar
- `{ "action": "CLOSE_ALL", "reason": "..." }` → Cerrar todo y autodestruirse

### Lógica del backend (mt5-webhook/route.ts):
1. Valida Bearer token
2. Busca cuenta por `mt5_login` en Supabase
3. Activa cuenta automáticamente si estaba `pending_creation` y llegan ticks válidos
4. Evalúa Daily DD y Max DD
5. Evalúa progresión de fases (phase1_ready → phase2_ready → funded)
6. Actualiza `daily_snapshots` (para P&L chart)
7. Registra `trade_history` si hay trade cerrado
8. Actualiza stats de rango del usuario

---

## 10. FLUJO DE COMPRA

```
Trader visita /checkout
→ Selecciona Tier + Tipo (1F o 2F) + Add-ons
→ POST /api/payments/create-invoice
  → Crea factura en NOWPayments
  → Inserta registro en challenge_transactions (status: "pending")
→ Trader paga en wallet cripto
→ NOWPayments envía IPN webhook a /api/payments/webhook
  → Valida firma HMAC-SHA512
  → Actualiza challenge_transactions (status: "paid")
  → Crea registro en mt5_accounts (status: "pending_creation")
→ ADMIN (manualmente) asigna credenciales MT5 desde /admin
→ Trader instala EA en su cuenta MT5
→ Primer tick activa la cuenta automáticamente (status: "active")
```

---

## 11. SISTEMA DE RANGOS

Rangos disponibles (nunca degradan, solo suben):

| Rango | Key | Requisito | Color |
|---|---|---|---|
| Aspirante | `unranked` | Sin requisitos | Gris |
| Novato | `novato` | 1 fase completada | Verde neón |
| Guerrero | `warrior` | $1,000+ retirados | Cyan |
| Elite | `elite` | $3,000+ retirados o Top 10 | Púrpura |
| Leyenda | `legend` | Top 3 mundial | Amarillo |

---

## 12. SISTEMA I18N

- **Idiomas**: Español (default) e Inglés
- **Archivos**: `src/lib/i18n/es.json` y `en.json`
- **Selector**: Bandera en navbar (ES 🇪🇸 / EN 🇺🇸)
- **Persistencia**: `localStorage["fundedspread_lang"]`

### ⚠️ BUG CONOCIDO — CAUSA DEL TEXTO ROTO:
En `LanguageContext.tsx`, antes del montaje del componente, devuelve `t: (k) => k` (retorna la clave como texto en lugar del texto real). Esto hace que en SSR o primer render, el usuario vea `navbar.pricing` en lugar de "Precios". Se ve diferente según configuración de caché del navegador.

```tsx
// PROBLEMA: Este bloque causa el bug
if (!mounted) {
  return (
    <LanguageContext.Provider value={{ language: "es", setLanguage: () => {}, t: (k) => k }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

---

## 13. EMAILS

Templates HTML disponibles en `src/lib/emails/templates.ts`:
- **phase1**: Felicitación por pasar Fase 1 + link a certificado
- **funded**: Bienvenida a cuenta fondeada + link a certificado
- *(Más templates pendientes)*

Se envían manualmente desde el panel /admin (tab "Emails"). Aún no hay envío automático.

### ⚠️ Bug en logo del email:
El logo en los templates usa `https://www.funded-spread.com/logo.png` pero fue exportado con fondo negro en lugar de transparente. Hay un comentario en el código marcando esto.

---

## 14. ESTADÍSTICAS DEL LANDING (HARDCODEADAS)

En `StatsSection` de `Sections.tsx`, los números son ficticios:
```tsx
{ value: 2400000, label: "Pagado a traders", prefix: "$", suffix: "+" },
{ value: 12500,   label: "Traders activos",  suffix: "+" },
{ value: 2200,    label: "Retiro promedio",  prefix: "$" },
{ value: 90,      label: "Profit Split",     suffix: "%" },
```
Cuando haya datos reales de Supabase, estos deben conectarse a la BD.

### Social Proof Ticker (también hardcodeado):
Nombres falsos en `es.json` y `en.json`: @TradeMaster42, @AlphaFX, @CryptoPhantom, etc. Deberán reemplazarse con datos reales de traders.

---

## 15. BUGS Y PROBLEMAS CONOCIDOS

### 🔴 CRÍTICO — Bug i18n (texto roto):
**Causa**: `LanguageContext` devuelve claves crudas antes del montaje del cliente.
**Síntoma**: Usuarios ven `navbar.pricing`, `hero.title1`, etc. en vez de texto real.
**Afecta**: Usuarios en primera carga sin caché o con ciertos idiomas del navegador.

### 🔴 BUG — Profit Split incorrecto en webhook:
En `payments/webhook/route.ts`:
```ts
if (transaction.addon_split_100) profitSplitPct = 90;  // ❌ Debería ser 100
else if (transaction.addon_split_90) profitSplitPct = 85;  // ❌ Debería ser 90
```
Los traders que paguen por 90% o 100% de split reciben 85% o 90% respectivamente.

### 🔴 BUG — Nombre de tier inconsistente:
En `payments/webhook/route.ts`, `CHALLENGE_SIZES` usa `titan` (200,000) pero en todo el resto del código y la UI se usa `apex`. El tier `apex` no matchea en el webhook al procesar pagos.

### 🟡 PENDIENTE — Foto de perfil no aparece:
El `ProfileDropdown` muestra `avatar_url` del usuario. Con `getSafeSession()` (lectura de localStorage), el `avatar_url` puede no estar disponible en el primer render rápido. Requiere revisión del flujo de datos del usuario.

### 🟡 PENDIENTE — Dashboard sin datos reales:
El dashboard muestra datos de la cuenta MT5 pero hasta que el EA no esté instalado en el VPS, los campos `current_equity`, `current_balance`, etc. son 0. Solo 3 clientes activos, todos manejados manualmente.

### 🟡 Logo con fondo negro en emails:
Archivo de logo exportado con fondo negro. Necesita re-exportación con transparencia.

### 🟡 Estadísticas hardcodeadas en landing:
$2.4M pagado, 12,500 traders, etc. son números falsos.

---

## 16. VARIABLES DE ENTORNO NECESARIAS

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NOWPAYMENTS_API_KEY=
NOWPAYMENTS_IPN_SECRET=
MT5_EA_SECRET=fundedspread_ea_secret_key_2026
NEXT_PUBLIC_APP_URL=https://www.funded-spread.com
NEXT_PUBLIC_ADMIN_EMAIL=        # Para acceso al /admin desde el cliente
ADMIN_EMAIL=                    # Para verificación server-side en API routes
```

### ⚠️ Inconsistencia en env vars de admin:
- `src/app/admin/page.tsx` usa `NEXT_PUBLIC_ADMIN_EMAIL` (disponible en cliente)
- `src/app/api/admin/users/route.ts` usa `ADMIN_EMAIL` (solo servidor)
Ambas deben estar configuradas en Vercel.

---

## 17. CRON JOBS (vercel.json)

```json
{ "path": "/api/leaderboard/reset", "schedule": "0 5 1 * *" }
```
Resetea el leaderboard mensualmente (día 1 de cada mes a las 5am UTC).

---

## 18. FUNCIONALIDADES YA CONSTRUIDAS Y FUNCIONANDO

✅ Landing page completa con i18n (ES/EN)
✅ Sistema de autenticación (email + Google OAuth)
✅ Checkout con selector de tier, tipo y add-ons
✅ Integración NOWPayments (cripto)
✅ Webhook de pagos con validación HMAC
✅ Risk Engine backend (mt5-webhook)
✅ Expert Advisor MQL5 (el bot)
✅ Dashboard del trader (pendiente datos reales)
✅ Panel de administración completo (/admin)
✅ Sistema de rangos (Novato → Leyenda)
✅ Leaderboard
✅ Sistema de retiros (solicitud + aprobación admin)
✅ Templates de email
✅ Certificados de logros (/certificate)
✅ Página de reglas
✅ Términos y condiciones
✅ Modal de soporte (botón flotante → email)
✅ Gráfica P&L (PnLChart con daily_snapshots)
✅ Impersonación de usuarios (admin)

---

## 19. PENDIENTE / POR HACER

- [ ] Instalar EA en VPS AWS para los 3 clientes actuales
- [ ] Conectar estadísticas del landing a datos reales de Supabase
- [ ] Corregir bug del profit split en el webhook
- [ ] Corregir inconsistencia `titan` vs `apex` en el webhook
- [ ] Corregir bug i18n (texto roto en primer render)
- [ ] Re-exportar logo con fondo transparente para emails
- [ ] Notificaciones automáticas por email al pagar / pasar fase / ser fondeado
- [ ] Investigar y corregir bug de foto de perfil
- [ ] SEO: metadata, sitemap, robots.txt, Google Search Console
- [ ] Panel de administración: más acciones (editar datos de cuenta MT5 directamente)
- [ ] Conectar leaderboard con datos reales de retiros
- [ ] Configurar dominio custom para emails (no Gmail)

---

## 20. REGLAS PARA TRABAJAR EN ESTE PROYECTO

1. **NO modificar nada sin aprobación explícita del fundador.**
2. Las cuentas son siempre DEMO de MT5. Nunca mencionar que son cuentas reales.
3. En UI, usar siempre "1 Fase" / "2 Fases" — nunca "Express" / "Classic".
4. La lógica de negocio vive en el servidor (API routes), nunca en el EA.
5. El EA solo reporta datos crudos, no toma decisiones de negocio.
6. Seguridad: API Keys solo en env vars, HMAC para webhooks, RLS en Supabase.
7. Antes de cualquier cambio en el Risk Engine, verificar que no rompa la lógica de fases.
8. El panel /admin es interno — solo el fundador tiene acceso.
