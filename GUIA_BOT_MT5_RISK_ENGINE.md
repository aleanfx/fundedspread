# 🤖 Guía Definitiva: Bot MT5 Risk Engine — FundedSpread

> **Última actualización:** 9 de Abril, 2026  
> **Autor:** Agente AI (Antigravity)  
> **Propósito:** Documentar TODO lo necesario para que cualquier sesión futura de agente tenga contexto completo sobre el bot de riesgo MT5.

---

## 📋 Tabla de Contenidos
1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Estado Actual de Cuentas](#2-estado-actual-de-cuentas)
3. [El EA (Expert Advisor)](#3-el-ea-expert-advisor)
4. [El Webhook (Backend)](#4-el-webhook-backend)
5. [Procedimiento de Activación de Cuenta](#5-procedimiento-de-activación-de-cuenta)
6. [VPS y Hosting](#6-vps-y-hosting)
7. [Optimización Multi-Cuenta](#7-optimización-multi-cuenta)
8. [Problemas Conocidos y Soluciones](#8-problemas-conocidos-y-soluciones)
9. [Credenciales y Accesos](#9-credenciales-y-accesos)

---

## 1. Arquitectura del Sistema

```
┌─────────────────┐     HTTP POST cada 5s      ┌──────────────────────┐
│   MetaTrader 5   │ ──────────────────────────►│  Next.js Webhook     │
│   (Windows/VPS)  │                            │  /api/risk-engine/   │
│                  │◄────────────────────────── │  mt5-webhook         │
│   EA: FundedSpread_Risk.ex5                   │                      │
│   Envía: login, equity, balance,              │  Evalúa reglas:      │
│   floating_pnl, positions[]                   │  - Drawdown diario   │
│                  │    Responde:                │  - Drawdown máximo   │
│                  │    {"action":"CLOSE_ALL"}   │  - Progreso de fases │
│                  │    o {"action":"NONE"}      │                      │
└─────────────────┘                            └──────────┬───────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │     Supabase         │
                                               │  - mt5_accounts      │
                                               │  - daily_snapshots   │
                                               │  - trade_history     │
                                               │  - challenge_trans.  │
                                               └──────────────────────┘
```

### Flujo de datos:
1. **EA en MT5** lee equity, balance, posiciones abiertas de la cuenta del trader
2. **Cada 5 segundos** (con posiciones) o **cada 30 minutos** (sin posiciones), envía un POST HTTP al webhook
3. **El webhook (Vercel/Next.js)** recibe los datos, los valida con `MT5_EA_SECRET`, y:
   - Actualiza `current_balance`, `current_equity`, `floating_pnl` en `mt5_accounts`
   - Guarda snapshots diarios en `daily_snapshots`
   - Evalúa reglas de drawdown (diario y máximo)
   - Si hay violación → responde `{"action": "CLOSE_ALL"}` → el EA cierra todas las posiciones
   - Si el trader alcanza el profit target → progresa a la siguiente fase automáticamente

### Puntos clave:
- **La lógica de negocio está en el servidor**, NO en el EA
- **El EA es universal** — el mismo `.ex5` sirve para TODAS las cuentas
- **Sin el EA corriendo, NO hay vigilancia de riesgo** = riesgo financiero directo

---

## 2. Estado Actual de Cuentas

### Cuentas MT5 Activas (al 9 de Abril 2026)

| # | Trader | Login MT5 | Server | Balance | Status | EA Activo? | Notas |
|---|--------|-----------|--------|---------|--------|------------|-------|
| 1 | Joseph Sifontes | `160702415` | ForexTimeFXTM-Demo01 | $25,000 | active | ❌ **NO** | Está operando sin vigilancia |
| 2 | Victor Hugo Diaz | `160702717` | ForexTimeFXTM-Demo01 | $10,000 | active | ❌ **NO** | Cuenta recién creada |
| 3 | Jose Antonio (showcase) | `52867778` | Alpari-MT5-Demo | $100,000 | active | ❌ NO | Cuenta demo/showcase |
| 4 | Alejandro (admin) | null | - | $10,000 | funded | - | Cuenta showcase, sin MT5 |
| 5 | Jose Antonio (showcase) | null | - | $25,000 | funded | - | Cuenta showcase, sin MT5 |

### Supabase Project ID: `gboavnbalcdhwfgpzbnw`

---

## 3. El EA (Expert Advisor)

### Archivos:
- **Código fuente:** `c:\Users\Ale\Desktop\mi-prop-firm\mt5-bot\FundedSpread_Risk.mq5`
- **Compilado:** `c:\Users\Ale\Desktop\mi-prop-firm\mt5-bot\FundedSpread_Risk.ex5`

### Inputs (Parámetros configurables):
```
InpWebhookUrl  = "https://www.funded-spread.com/api/risk-engine/mt5-webhook"  (YA CAMBIADO A PRODUCCIÓN)
InpApiSecret   = "fundedspread_ea_secret_key_2026"
InpTimerSeconds = 5    (cada 5 seg con posiciones abiertas)
InpIdleMinutes  = 30   (cada 30 min sin posiciones)
```

### IMPORTANTE — Historial de Cambios:
- **9 Abril 2026:** Se cambió la URL por defecto de `http://127.0.0.1:3000/...` a `https://www.funded-spread.com/...`
- Antes de este cambio, cada vez que se subía el EA al VPS, apuntaba a localhost y no funcionaba
- **SIEMPRE recompilar el .ex5 después de cambiar el .mq5** (F7 en MetaEditor)

### Lo que hace el EA:
1. `OnInit()` — Inicializa, configura timer
2. `OnTimer()` — Cada N segundos, lee datos de la cuenta y envía al webhook
3. Envía JSON con: `mt5_login`, `equity`, `balance`, `floating_pnl`, `open_positions[]`, `api_secret`
4. Si la respuesta del servidor contiene `"action": "CLOSE_ALL"` → cierra todas las posiciones inmediatamente
5. Si `"trade_history"` viene en la respuesta → las reenvía al servidor para guardado

### Requisitos para que funcione:
1. ✅ MT5 debe estar abierto y logueado en la cuenta del trader
2. ✅ El EA debe estar adjuntado a un gráfico (cualquier par, cualquier temporalidad)
3. ✅ "Permitir Trading Algorítmico" debe estar habilitado en las propiedades del EA
4. ✅ En **Herramientas > Opciones > Expert Advisors** debe estar la URL `https://www.funded-spread.com` en la lista de WebRequest permitidas
5. ✅ El ícono del EA en la esquina superior derecha del gráfico debe mostrar una carita 😃 (no ❌)

---

## 4. El Webhook (Backend)

### Archivo: `src/app/api/risk-engine/mt5-webhook/route.ts`

### Variables de entorno necesarias (Vercel/local):
```
MT5_EA_SECRET=fundedspread_ea_secret_key_2026
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  (la key completa)
NEXT_PUBLIC_SUPABASE_URL=https://gboavnbalcdhwfgpzbnw.supabase.co
```

### Endpoint: `POST https://www.funded-spread.com/api/risk-engine/mt5-webhook`

### Lógica:
1. Valida `api_secret` contra `MT5_EA_SECRET`
2. Busca la cuenta en `mt5_accounts` por `mt5_login`
3. Actualiza balance, equity, floating_pnl, last_health_check
4. Evalúa drawdown diario y máximo según la config del challenge
5. Si viola reglas → responde con `CLOSE_ALL`
6. Si alcanza profit target → progresa la fase del challenge

---

## 5. Procedimiento de Activación de Cuenta

### Cuando un cliente paga un Challenge, seguir ESTE ORDEN:

#### Paso 1: Crear cuenta Demo en el broker (FXTM)
1. Ir al portal del broker (FXTM, Alpari, etc.)
2. Crear cuenta Demo con el balance correspondiente al challenge comprado
3. Anotar: **Login**, **Password**, **Server** (ej: ForexTimeFXTM-Demo01)

#### Paso 2: Registrar en Supabase (Admin Panel)
```sql
-- Insertar en mt5_accounts
INSERT INTO mt5_accounts (user_id, mt5_login, mt5_server, mt5_password, account_status, initial_balance, current_balance, current_equity, challenge_type, phase)
VALUES (
  'UUID-del-usuario',
  '160702415',           -- Login MT5
  'ForexTimeFXTM-Demo01', -- Server
  'contraseña',           -- Password
  'active',               -- Status
  25000,                  -- Balance inicial
  25000,                  -- Balance actual
  25000,                  -- Equity actual
  'express_x',            -- Tipo de challenge
  1                       -- Fase 1
);

-- Actualizar challenge_transactions a 'active'
UPDATE challenge_transactions SET status = 'active' WHERE user_id = 'UUID' AND status = 'pending_activation';
```

#### Paso 3: Conectar el EA (EN PC WINDOWS)
```
□ 1. Abrir MetaTrader 5 en tu PC Windows
□ 2. Archivo > Abrir cuenta > Buscar servidor: ForexTimeFXTM-Demo01
□ 3. Login: [login del cliente] | Password: [password asignada]
□ 4. Verificar que el balance sea correcto
□ 5. Herramientas > Opciones > Expert Advisors
□ 6. Marcar "Permitir WebRequest para las URLs listadas"
□ 7. Agregar: https://www.funded-spread.com
□ 8. Aceptar
□ 9. Abrir gráfico EURUSD (cualquier temporalidad)
□ 10. En el Navegador, arrastrar FundedSpread_Risk.ex5 al gráfico
     (ubicación: c:\Users\Ale\Desktop\mi-prop-firm\mt5-bot\FundedSpread_Risk.ex5)
□ 11. Pestaña "Inputs": Verificar URL = https://www.funded-spread.com/api/risk-engine/mt5-webhook
□ 12. Pestaña "General": Marcar "Permitir Trading Algorítmico"
□ 13. Aceptar
□ 14. Verificar en pestaña "Expertos" que dice:
      "FundedSpread Risk Engine v2.10 | Trading: cada 5s | Idle: cada 30 min"
□ 15. Esperar 10 segundos
□ 16. Ir al Admin Panel de la web > Buscar usuario > Monitorear
□ 17. Verificar que last_health_check se actualiza y el balance cambia
□ 18. ✅ CUENTA ACTIVADA
```

#### Paso 4: Modo Portable (múltiples cuentas simultáneas)
Para correr MÁS de UNA cuenta MT5 a la vez en la misma PC:
```
"C:\Program Files\MetaTrader 5\terminal64.exe" /portable
```
Cada instancia portable tiene su propia carpeta de datos independiente.

---

## 6. VPS y Hosting

### VPS Linux Actual (NO FUNCIONA para MT5)
- **IP:** 3.131.142.51
- **Tipo:** AWS EC2 (Ubuntu Linux)
- **Acceso SSH:** `ssh -i llave-aws.pem ubuntu@3.131.142.51`
- **Llave PEM:** `c:\Users\Ale\Desktop\mi-prop-firm\llave-aws.pem`
- **¿Por qué no funciona?** Wine + Xvfb es INESTABLE con MT5 64-bit. Los procesos se crashean con `X connection broken`. No es una solución confiable para producción.
- **Lo que se intentó:** Inyectar configuración del EA en archivos `.chr`, configurar `common.ini` con WebRequest, relanzar con `xvfb-run`. El proceso no sobrevive.

### ⚠️ CONCLUSIÓN CRÍTICA:
> **MT5 en Linux via Wine NO ES VIABLE para producción.**
> MetaTrader 5 fue diseñado para Windows. La única solución confiable es correr MT5 en un entorno Windows nativo.

### Opciones de Hosting (ordenadas por recomendación):

| Opción | Costo/mes | RAM | Cuentas MT5 estimadas | Confiabilidad |
|--------|-----------|-----|----------------------|---------------|
| **PC Windows local (temporal)** | $0 | Tu RAM | 3-5 | Alta (si está encendida) |
| **AWS EC2 Windows (free tier)** | $0 (12 meses) | 1 GB | 1-2 max | Media-Baja (muy limitado) |
| **Contabo VPS Windows** | $5.99 | 4 GB | 5-8 | Alta |
| **Hetzner Cloud + Windows** | ~$8 | 4 GB | 5-8 | Muy Alta |
| **AWS EC2 t3.small Windows** | ~$15 | 2 GB | 3-4 | Alta |
| **AWS EC2 t3.medium Windows** | ~$30 | 4 GB | 5-8 | Muy Alta |
| **VPS especializado (FXVM, ForexVPS)** | $25-50 | 2-4 GB | 4-8 | Muy Alta (optimizado para trading) |

### AWS Windows Free Tier — Detalles:
- **Instancia:** t2.micro o t3.micro
- **RAM:** 1 GB
- **vCPU:** 1 (t2.micro) o 2 (t3.micro)
- **Duración:** 750 horas/mes, solo durante los **primeros 12 meses** de la cuenta AWS
- **Almacenamiento:** 30 GB EBS gratis
- **Limitación:** Con solo 1 GB de RAM, Windows Server + 1 instancia de MT5 ya estarán al límite. **No es viable para múltiples cuentas.**
- **Veredicto:** Sirve para **probar** con 1 cuenta, pero no para producción con múltiples traders.

---

## 7. Optimización Multi-Cuenta

### ¿Cuánta RAM consume cada instancia de MT5?
- **MT5 base (sin charts extras):** ~150-300 MB
- **MT5 con EA simple (nuestro caso):** ~200-350 MB
- **MT5 con indicadores pesados:** ~500 MB+
- **Windows Server base:** ~500-800 MB

### Fórmula para calcular cuentas máximas:
```
Cuentas = (RAM_Total - RAM_Windows - 20%_Reserva) / RAM_por_MT5

Ejemplo con 4 GB:
Cuentas = (4096 - 800 - 820) / 250 = ~9-10 instancias
```

### Técnicas de Optimización (aplicar SIEMPRE):

#### A. Reducir "Max Bars" (CRÍTICO — mayor ahorro de RAM)
En cada instancia de MT5:
1. `Herramientas > Opciones > Gráficos`
2. **Max bars en historial:** cambiar de 500,000 → `5,000`
3. **Max bars en gráfico:** cambiar de 100,000 → `500`
4. Esto puede reducir el consumo de RAM un 40-60%

#### B. Limpiar Market Watch
1. Click derecho en la ventana "Observación de Mercado"
2. "Ocultar todos" → Mostrar solo 1 par (EURUSD)
3. Esto evita que MT5 descargue datos de 100+ símbolos

#### C. Un solo gráfico
- Solo necesitamos 1 gráfico por instancia (donde va el EA)
- Cerrar todos los demás gráficos que MT5 abre por defecto

#### D. Desactivar noticias
1. `Herramientas > Opciones > Servidor`
2. Desmarcar "Habilitar Noticias"

#### E. Desactivar sonidos
1. `Herramientas > Opciones > Eventos`
2. Desmarcar "Habilitar"

### Virtual Memory / Pagefile (Lo que leíste sobre "extender la RAM"):

Esto se llama **Swap / Pagefile** — usa el disco duro como RAM extra.

**Cómo configurar en Windows:**
1. `Win + R` → `sysdm.cpl` → Enter
2. Pestaña **Avanzado** → **Rendimiento** → **Configuración**
3. Pestaña **Avanzado** → **Memoria Virtual** → **Cambiar**
4. Desmarcar "Administrar automáticamente"
5. Seleccionar disco C:
6. **Tamaño personalizado:**
   - Inicial: `RAM × 1.5` (ej: 4096 MB para 4 GB RAM → poner 6144)
   - Máximo: `RAM × 3` (ej: 4096 MB → poner 12288)
7. Clic en **Establecer** → **Aceptar** → **Reiniciar**

**⚠️ ADVERTENCIA:** El pagefile es MUCHO más lento que la RAM real. Si MT5 necesita acceder al swap constantemente, las órdenes de cierre por drawdown tendrán latencia de segundos en lugar de milisegundos. **Usar pagefile como último recurso, nunca como reemplazo de RAM real.**

### Tabla de capacidad estimada por plan:

| Plan | RAM Real | Con Pagefile | Cuentas MT5 (optimizadas) | Cuentas MT5 (normales) |
|------|----------|-------------|--------------------------|----------------------|
| 1 GB (free tier) | 1 GB | +1.5 GB | 1-2 | 1 |
| 2 GB | 2 GB | +3 GB | 4-5 | 2-3 |
| 4 GB | 4 GB | +6 GB | 8-12 | 5-8 |
| 8 GB | 8 GB | +12 GB | 15-25 | 10-15 |
| 16 GB | 16 GB | +24 GB | 30-50 | 20-30 |

---

## 8. Problemas Conocidos y Soluciones

### ❌ "El dashboard dice $25,000 pero el trader tiene $25,005"
**Causa:** El EA no está corriendo o no envía datos al webhook.  
**Solución:** Verificar que el EA está corriendo (ver pestaña "Expertos" en MT5), revisar que la URL apunta a producción, verificar WebRequest habilitado.

### ❌ "Wine: X connection broken"
**Causa:** MT5 en Linux via Wine es inestable.  
**Solución:** Migrar a VPS Windows. Ver sección 6.

### ❌ "El EA muestra error WebRequest"
**Causa:** La URL no está en la lista de permitidas o no se agregó `https://www.funded-spread.com`.  
**Solución:** `Herramientas > Opciones > Expert Advisors > Permitir WebRequest > Agregar URL`.

### ❌ "last_health_check no se actualiza"
**Causa:** El EA no está conectado o la cuenta MT5 no está logueada.  
**Solución:** Verificar que MT5 dice "Conectado" abajo a la derecha (barra de estado verde).

### ❌ "El EA responde error 403 o 401"
**Causa:** El `InpApiSecret` no coincide con `MT5_EA_SECRET` en Vercel.  
**Solución:** Verificar que ambos son exactamente `fundedspread_ea_secret_key_2026`.

### ❌ "Múltiples registros de la misma cuenta en mt5_accounts"
**Causa:** Bug previo donde el flujo de compra creaba registros duplicados con status `pending_creation`.  
**Solución:** Eliminar los duplicados manualmente, dejando solo la cuenta activa.

---

## 9. Credenciales y Accesos

### VPS AWS (Linux — deprecated, no usar para MT5)
- **IP:** `3.131.142.51`
- **Usuario:** `ubuntu`
- **Llave:** `c:\Users\Ale\Desktop\mi-prop-firm\llave-aws.pem`
- **Comando SSH:** `ssh -i llave-aws.pem ubuntu@3.131.142.51`
- **Nota:** Necesita permisos restrictivos: `icacls llave-aws.pem /inheritance:r /grant:r "$($env:USERNAME):R"`

### Supabase
- **Project ID:** `gboavnbalcdhwfgpzbnw`
- **URL:** `https://gboavnbalcdhwfgpzbnw.supabase.co`

### Webhook de Producción
- **URL:** `https://www.funded-spread.com/api/risk-engine/mt5-webhook`
- **Secret:** `fundedspread_ea_secret_key_2026`

### Admin
- **Email:** `gutierrezalejandro551@gmail.com`

---

## 📝 Notas para el Agente AI Futuro

1. **SIEMPRE verifica `last_health_check`** en `mt5_accounts` para saber si el EA está enviando datos. Si es `null` o tiene más de 10 minutos de antigüedad, el EA NO está funcionando.

2. **No intentes correr MT5 en Linux/Wine.** Ya se intentó extensivamente y no es estable. La solución es Windows nativo.

3. **El EA es universal** — el mismo archivo `.ex5` sirve para todas las cuentas. No necesita recompilación por cuenta.

4. **Las reglas de negocio están en el webhook**, no en el EA. Si necesitas cambiar límites de drawdown, modifica la lógica en `route.ts`.

5. **Para debugging rápido del webhook**, puedes hacer un `curl` manual:
```bash
curl -X POST https://www.funded-spread.com/api/risk-engine/mt5-webhook \
  -H "Content-Type: application/json" \
  -d '{"mt5_login":"160702415","equity":25000,"balance":25000,"floating_pnl":0,"open_positions":[],"api_secret":"fundedspread_ea_secret_key_2026"}'
```

6. **Si el usuario dice "el bot no envía señales"**, el problema es casi siempre:
   - MT5 no está corriendo
   - El EA no está adjuntado al gráfico
   - WebRequest no tiene la URL permitida
   - La URL del EA apunta a localhost en vez de producción
