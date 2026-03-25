# 🧪 Guía: Prueba Local del Bot (MT5 Risk Engine)

Antes de subir nuestro bot al VPS en la nube, es una práctica excelente probarlo en tu propia computadora conectándolo al servidor Next.js que estás corriendo actualmente (`localhost:3000`).

Esta guía te enseñará cómo compilar el bot y hacer que le envíe datos a tu backend local de Supabase/Next.js.

## Requisitos
1. Tener MetaTrader 5 instalado en tu PC Windows.
2. Tener tu servidor de Next.js (`npm run dev`) corriendo (Lo tengo corriendo en mi consola por ti en el puerto 3000).
3. Haber vinculado una cuenta de prueba `12345678` desde la página de **Mi Perfil** (botón de DEBUG amarillo al fondo).

---

## 1️⃣ Habilitar Peticiones Web en MT5

Por seguridad, MetaTrader 5 bloquea todas las peticiones HTTP HTTP salientes a menos que tú autorices la URL explícitamente.

1. Abre tu MetaTrader 5 en Windows.
2. Ve al menú superior: **Herramientas > Opciones** (Tools > Options). También puedes usar el atajo `Ctrl + O`.
3. Ve a la pestaña **Asesores Expertos** (Expert Advisors).
4. Marca la casilla que dice **"Permitir WebRequest para las URL listadas:"** (Allow WebRequest for listed URL:).
5. Haz doble clic en el símbolo `+` verde para agregar una nueva URL.
6. Escribe exactamente esto y presiona Enter: `http://127.0.0.1:3000`
7. Dale en **Aceptar** (OK).

---

## 2️⃣ Compilar el Bot MQL5

1. Ve a la carpeta de tu proyecto Next.js y busca la ruta:
   `C:\Users\Ale\Desktop\mi-prop-firm\mt5-bot\`
2. Da doble clic en el archivo llamado **`FundedSpread_Risk.mq5`**. Esto debería abrir un programa llamado **MetaEditor**.
3. Una vez abierto en MetaEditor, arriba al centro hay un botón grande que dice **Compilar** o "Compile" (también sirve la tecla `F7`). Hazle clic.
4. Abajo en la pestaña *Errores*, debería decir `0 errors, 0 warnings`.
5. Si todo salió bien, ahora tendrás un archivo llamado `FundedSpread_Risk.ex5` en esa misma carpeta. ¡Ese es el bot listo para usar!

---

## 3️⃣ Ejecutar el Bot en un Gráfico Dummy

1. En MetaEditor, dale al botón verde brillante de "Play" arriba a la izquierda, o ve directo a tu MetaTrader 5.
2. Abre cualquier gráfico (ejemplo: EURUSD). No importa la temporalidad.
3. En el panel izquierdo de MT5 llamado **Navegador** (Navigator), expande la carpeta de **Asesores Expertos** (Expert Advisors).
4. Arrastra tu bot `FundedSpread_Risk` (el archivo `.ex5` que acabas de compilar) directamente hacia el gráfico de EURUSD.
5. Se abrirá una ventana de configuración:
   - Ve a la pestaña **General** y asegúrate de marcar "Permitir Trading Algorítmico".
   - Ve a la pestaña **Parámetros de entrada** (Inputs).
   - Verás que la URL apunta a `http://127.0.0.1:3000/api/risk-engine/mt5-webhook`. Déjala así.
   - El Api Secret también déjalo por defecto.
6. Dale en **Aceptar**.

---

## 4️⃣ Validando la Conexión

1. Abre la pestaña **Expertos** (Experts) en la parte inferior de tu MetaTrader 5. Deberías empezar a ver un mensaje que dice:
   `FundedSpread Risk Engine Bot Iniciado. Enviando datos cada 5 segundos.`
2. Ahora, revisa la consola negra (Terminal o PowerShell) donde tienes corriendo tu servidor `npm run dev`.
3. Deberías empezar a ver mensajes que dicen impresiones del servidor recibiendo el payload cada 5 segundos, similar a esto:
   `✅ RISK ENGINE WEBHOOK ACTIVO`

### 💥 Cómo Forzar la Regla del Drawdown

Si quieres ver al bot cerrando operaciones en vivo:

1. Abre una operación (Compra o Venta) masiva en MT5 de forma manual (ej. 10 Lotes de Oro) en una cuenta Demo real de MT5 que esté conectada.
2. Si el flotante negativo hace que tu Equidad baje del -5% permitido.
3. En el próximo segundo (el bot lee cada 5s), el servidor de Next.js detectará el evento y le responderá `{"action": "CLOSE_ALL"}` al bot.
4. Inmediatamente verás cómo el bot cerrará las posiciones en milisegundos y en la pestaña Expertos de MT5 saltará la alerta: `"🚨 ALERTA ROJA: drawdown violado. Cerrando posiciones de cuenta..."`. 

---

### Siguientes Pasos
Una vez verifiques que esta conexión entre Metatrader y Next.js en tu Localhost funciona perfectamente, el paso será sencillamente llevarnos todo esto al VPS de Amazon configurándole las URL reales (`https://tu-dominio.com/...`).
