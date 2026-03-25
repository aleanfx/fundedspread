# 📒 REGISTRO DE DESARROLLO — Funded Spread (Prop Firm)

> Este archivo es el **diario de desarrollo** del proyecto. Documenta TODO lo implementado, los errores encontrados, cómo se solucionaron, y las lecciones aprendidas.  
> **Regla:** Consultar este archivo SIEMPRE antes de proponer nuevas soluciones para no repetir fallos.  
> **Última actualización:** 15 Marzo 2026

---

## 📅 2026-02-28 — Día 1: Inicio del Proyecto

### ✅ Lo que se hizo:
- Lectura completa de la investigación de mercado (modelo B-Book, estadísticas de fracaso, estrategia de bootstrapping).
- Verificación de claves Supabase en `.env.local`.
- Creación de `REGISTRO_DE_DESARROLLO.md` y `CONTEXTO_Y_ESTRATEGIA.md`.
- Generación de mockups vía Google Stitch (MCP).

### 🎯 Arquitectura inicial confirmada:
| Componente | Tecnología |
|------------|-----------|
| Frontend | Next.js + React + TypeScript |
| Estilos | Tailwind CSS |
| Animaciones | Framer Motion |
| Base de datos | Supabase (PostgreSQL) |
| Pagos | NOWPayments (Cripto) |
| Plataforma | MetaTrader 5 |

### 🎨 Estética definida:
- Modo oscuro absoluto (bg-slate-900 / #0f172a)
- Acentos neón: Verde Tóxico (#39ff14), Morado Cyberpunk (#a855f7), Azul Eléctrico (#3b82f6)
- Tipografías: Rajdhani, Orbitron, Inter
- Animaciones: Hover en botones, transiciones en números, confeti al subir de nivel

### ✅ Implementación completada (Día 1):
- **7 páginas** funcionales: Dashboard, Challenge Store, Leaderboard, Login, Register, Analytics, Profile
- **Sistema de Auth** completo con Supabase SSR (browser + server + middleware)
- **Middleware** de protección de rutas (sin login → `/login`, con login → no puede ir a auth pages)
- **Tablas creadas:** `users` (trigger automático), `leaderboard_traders` (10 mock), `challenge_transactions`
- **Sidebar** con email real del usuario + Logout + Profile link
- **0 errores en consola**

### ❌ Errores del Día 1:
| Error | Solución |
|-------|----------|
| `create-next-app` falla si hay archivos en el directorio | Mover archivos a backup temporal, crear proyecto, restaurar |
| Podio no renderizaba (Framer Motion variants) | Usar `initial/animate/transition` explícitos en lugar de `variants` propagados |

---

## 📅 2026-03-01 — Día 2: Pasarela de Pagos + Risk Engine v1

### ✅ NOWPayments integrado:
- `POST /api/payments/create-invoice` — Crea factura cripto con 4 tiers + add-ons
- `POST /api/payments/webhook` — Recibe IPN, valida HMAC-SHA512, crea cuenta en BD
- `GET /api/payments/status/[invoiceId]` — Consulta estado de pago (polling)

### ✅ Checkout (`/checkout`):
- 4 tarjetas de challenge con animaciones hover y bordes neón
- Flujo multi-paso: Seleccionar → Confirmar (con Add-ons) → Procesando → Éxito

### ✅ Risk Engine v1:
- Motor simulado que evalúa drawdown diario (5%) y checkpoint (+20%)
- Panel CEO de simulación para testing (botones: simular fallo / simular level-up)
- Confeti neón al hacer +20%

---

## 📅 2026-03-04 — Día 4: Migración de BD + Landing Page

### ⚠️ Error crítico descubierto:
`.env.local` apuntaba al **proyecto equivocado** de Supabase ("DeliarApp" en lugar de "mi-prop-firm").

### ✅ Solución:
1. Actualizado `.env.local` → proyecto correcto `gboavnbalcdhwfgpzbnw`
2. Creado `supabase-migration.sql` con todas las tablas + RLS + seed
3. Creado `cleanup-deliarapp.sql` para limpiar tablas accidentales
4. Añadido `SUPABASE_SERVICE_ROLE_KEY` al `.env.local`

### ✅ Landing Page Pública:
- Reestructuración: Dashboard movido de `/` a `/dashboard`
- Landing en `/` con Navbar, Hero ("TRADE. PROVE. PROFIT."), Stats, Pricing, How It Works, Footer
- Auth Modal con Framer Motion (slide-up + efecto scan line)
- Middleware actualizado para rutas públicas vs protegidas

### 📝 Lección aprendida:
> **SIEMPRE verificar que `.env.local` apunte al proyecto correcto de Supabase antes de cualquier operación de BD.**

---

## 📅 2026-03-07 — Rebranding: Funded Spread

### ✅ Cambio de nombre:
De "Neon Trader" → **"Funded Spread"** en toda la plataforma.

Archivos modificados: `page.tsx` (landing), `Sidebar.tsx`, `AuthModal.tsx`, `register/page.tsx`, `login/page.tsx`, `profile/page.tsx`, `layout.tsx` (metadata SEO), `create-invoice/route.ts` (recibo NOWPayments).

---

## 📅 2026-03-09 — Sistema de Add-ons (Upselling)

### ✅ Implementación:
- 3 toggles en checkout: Raw Spreads (+10%), Zero Commissions (+15%), Retiros Semanales (+20%)
- Precio recalculado dinámicamente en frontend y validado en backend
- Dashboard: Temporizador de próximo payout (7 o 30 días según add-on)

---

## 📅 2026-03-14 — Fase F: Pivote a MT5 + Expert Advisor

### ✅ Decisión estratégica:
Se pivotó definitivamente a **MetaTrader 5** como plataforma única. Razones:
- MT5 es estándar de la industria, menor fricción para traders
- VPS headless (Wine+Xvfb) permite $0 de costo inicial
- Expert Advisor permite control directo sin APIs de terceros

### ✅ Implementación (Fase F completa):
1. **Migración BD:** `ctrader_accounts` → `mt5_accounts` + columnas `mt5_login`, `mt5_password`, `mt5_server`
2. **API Webhook:** `POST /api/risk-engine/mt5-webhook` — Recibe datos del EA, evalúa drawdown, responde CLOSE_ALL si hay violación
3. **Expert Advisor MQL5:** `FundedSpread_Risk.mq5` — Lee equity cada 5s, envía JSON al servidor
4. **Guías:** `GUIA_VPS_AWS.md` + `TEST_LOCAL_MT5.md`
5. **Limpieza total:** Se eliminó OAuth, librerías y todo rastro de plataformas anteriores del código

### ❌ Errores de la Fase F:
| Error | Causa | Solución |
|-------|-------|----------|
| HTTP 401 en webhook | API Secret no coincidía | Verificar Bearer token en headers |
| HTTP 404 en `/api/simulate` | Next.js no detectó la nueva ruta | Reiniciar el servidor `npm run dev` |
| Botones de simulación "no hacen nada" | El servidor Node.js había crasheado silenciosamente | Matar proceso y reiniciar el servidor |
| ALERTA ROJA se repite infinitamente | El bot seguía enviando webhooks después del baneo | Implementar `ExpertRemove()` |
| `localhost` rechazado en WebRequest de MT5 | MQL5 valida URLs de manera estricta | Usar `127.0.0.1` en lugar de `localhost` |
| Login dinámico no coincide con BD de test | El login real de MT5 demo ≠ "12345678" de prueba | Hardcodear login en dev, restaurar para prod |

### 📝 Lecciones aprendidas (Fase F):
> 1. **MQL5 WebRequest:** Siempre usar IP (`127.0.0.1`) en lugar de hostname (`localhost`).
> 2. **Next.js Hot Reload:** Las rutas API nuevas requieren reinicio del servidor si lleva mucho tiempo corriendo.
> 3. **Testing local:** Crear un flujo claro de "Debug Account" para simular pagos sin NOWPayments.
> 4. **Ciclo de vida del EA:** Un bot que no se detiene tras un baneo causa spam. `ExpertRemove()` es obligatorio.

---

## 📅 2026-03-15 — Fase G: Anti-Trampas (FundedNext Rules)

### ✅ Reglas implementadas en el bot MQL5:
1. **Máximo 5 posiciones:** `PositionsTotal() > 5` → Violación inmediata
2. **Máximo 20 trades/día:** `HistorySelect()` + conteo de `DEAL_ENTRY_IN` → Si > 20, violación
3. **Prohibición de EAs externos:** `POSITION_MAGIC > 0` → Detecta robots de terceros
4. **Autodestrucción:** `ExpertRemove()` tras cualquier violación para evitar spam

### ✅ Backend actualizado:
- `MT5Payload` ahora incluye campo opcional `violation?: string`
- Si el EA reporta violación local, el servidor la procesa como `CLOSE_ALL` + `failed`
- Si el servidor detecta drawdown, responde `CLOSE_ALL` al EA
- Dashboard mostrará el motivo exacto de suspensión

### ✅ Decisiones del CEO:
| Pedido del CEO | Implementación |
|----------------|---------------|
| "Que no salga la alerta infinitamente" | `ExpertRemove()` — bot se autodestruye |
| "20 trades diarios, no 50" | Reducido de 50 a 20 para priorizar calidad |
| "Sin límite de lotaje" | Eliminado — escala con la cuenta |
| "2 tipos de challenge" | Diseñado: Clásico 2 Fases + Escalamiento x2 |
| "Un solo bot universal" | Confirmado — lógica de negocio en servidor, no en EA |

### 📝 Lecciones aprendidas (Fase G):
> 1. **Separación de responsabilidades:** El bot MQL5 solo reporta datos + hace validaciones locales rápidas. La lógica de negocio (fases, checkpoints, objetivos) SIEMPRE vive en el servidor.
> 2. **Magic Number = 0** para trades manuales. Cualquier valor > 0 indica un EA externo.
> 3. **`HistorySelect()` es obligatorio** antes de leer `HistoryDealsTotal()`. Sin él, el historial está vacío.

---

## 📅 2026-03-16 — Fase K: Refinamiento de Escalamiento x2

### ✅ Unificación de Fases Iniciales:
- **Lógica Unificada:** Ahora ambos retos (`classic_2phase` y `scaling_x2`) comparten las mismas fases de evaluación inicial: Fase 1 (Target +8%) y Fase 2 (Target +5%).
- **Estructura:** Evaluación 1 (8%) → Evaluación 2 (5%) → Fondeado. Esto profesionaliza el reto x2, alineándolo con los estándares de la industria.

### ✅ Escalamiento Premium (Modelo Reinversión):
- **Checkpoint Logic:** Solo disponible tras el fondeo en el modelo x2.
- **Doble o Nada:** Al alcanzar el +20% en fase fondeada, el usuario puede elegir **Escalar**.
- **Re-balanceo:** Se duplica el balance inicial y se reinicia el Equity a ese nuevo valor. El profit acumulado se "invierte" para obtener una cuenta de mayor nivel.
- **Niveles:** Soporta hasta 4 niveles de escalamiento exponencial.

### ✅ Dashboard Estratégico:
- Botones de decisión: **"Retirar Profit (80/20)"** o **"Invertir y Escalar x2"**.
- Mapa de Checkpoints adaptativo que muestra todo el viaje: Evaluación → Fondeo → Escalamiento.

### 📝 Lección aprendida (Fase K):
> 1. **UX de Retiro:** Es vital dar la opción al usuario de retirar ganancias aunque el modelo sea de escalamiento. Obligar a escalar genera fricción; permitir elegir genera confianza.
> 2. **Reset de Profit:** Para una escalabilidad real, el profit target debe reiniciarse a 0 sobre el nuevo balance. Calcular profit sobre balance acumulado de niveles anteriores es insostenible matemáticamente para el trader.

---

---

## 🔒 REGLAS DE ORO (NO ROMPER NUNCA)

1. **NUNCA mencionar cTrader** — Eliminado 100% del proyecto.
2. **Verificar `.env.local`** antes de cualquier operación de BD.
3. **Reiniciar `npm run dev`** si se crean rutas API nuevas y no responden.
4. **Usar `127.0.0.1`** en lugar de `localhost` para WebRequest de MQL5.
5. **Un solo bot MQL5** para todos los tipos de challenge.
6. **`ExpertRemove()`** es obligatorio después de cualquier baneo.
7. **El bot envía datos, el servidor toma decisiones.**
8. **Probar localmente** antes de deployer. Guía: `TEST_LOCAL_MT5.md`.
9. **HMAC-SHA512** para validar webhooks de NOWPayments.
10. **RLS activo** en todas las tablas de Supabase.

---

## 📁 Archivos Clave para Retomar

| Archivo | Descripción |
|---------|-------------|
| `CONTEXTO_Y_ESTRATEGIA.md` | Biblia del proyecto (modelo de negocio, arquitectura, reglas) |
| `REGISTRO_DE_DESARROLLO.md` | Este archivo (diario + errores + lecciones) |
| `mt5-bot/FundedSpread_Risk.mq5` | Expert Advisor de producción |
| `src/app/api/risk-engine/mt5-webhook/route.ts` | Cerebro del Risk Engine |
| `src/app/api/payments/webhook/route.ts` | Webhook de NOWPayments |
| `src/app/checkout/page.tsx` | Tienda de Challenges Multi-Fase/Express |
| `src/app/dashboard/page.tsx` | Dashboard del trader Multi-Challenge |
| `.env.local` | Variables de entorno (Supabase, NOWPayments, MT5 Secret) |

### 🛠️ Para levantar el proyecto:
```bash
cd C:\Users\Ale\Desktop\mi-prop-firm
npm run dev
```
Servidor en **http://localhost:3000**

---

## 📅 2026-03-24 — Fase L: Challenge Express 1 Fase
### ✅ Implementación Completada:
- **Backend Risk Engine:** Se añadió `EXPRESS_CONFIG` (Target: 10%, Daily DD: 3%, Max DD: 6%). La cuenta entra directamente a estado `funded` al alcanzar 10% de ganancia.
- **Backend Facturación:** Actualizado `create-invoice` con el requerimiento de +20% en el precio base para cuentas Express.
- **Frontend Dashboard:** CheckpointJourney actualizado a 2 únicas estaciones para "Evaluación Express -> Cuenta Fondeada", actualizando estéticas e identificadores modulares para soportar simultáneamente 3 tipos de retornos (`classic_2phase`, `scaling_x2`, `express_1phase`).
- **Frontend Checkout & Landing:** Se creó la 3ra tarjeta "Express 1 Fase" informando transparentemente el nuevo costo (+20% respecto del clásico) y características premium más restrictivas pero directas al fondeo.

### 🔜 Próxima Fase (Fase M):
- AWS / VPS setup para automatizar la asignación del Headless MT5 y enlazarlo con el webhook recién extendido.
