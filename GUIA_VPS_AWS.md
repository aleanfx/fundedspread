# ⚠️ DEPRECADO — Guía: Setup de MetaTrader 5 en AWS VPS Entorno Headless (Linux)

> **🚨 IMPORTANTE (9 Abril 2026):** Esta guía describe un método con Wine + Xvfb en Linux que **NO ES CONFIABLE** para producción. MT5 se crashea repetidamente con errores `X connection broken`. 
>
> **➡️ Ver la guía actualizada:** [GUIA_BOT_MT5_RISK_ENGINE.md](./GUIA_BOT_MT5_RISK_ENGINE.md) — que documenta el método correcto usando **Windows nativo** (PC local o VPS Windows).
>
> Esta guía se mantiene solo como referencia histórica de lo que se intentó.

---

Esta guía describe cómo levantar un servidor en Amazon Web Services (AWS) con Linux para correr MetaTrader 5 via Wine. **NOTA: Este método demostró ser inestable en producción.**

## Fase 1: Creación del Servidor (AWS EC2)

1. Ve a [aws.amazon.com](https://aws.amazon.com/) y crea una cuenta o inicia sesión.
2. En la barra de búsqueda superior, escribe **EC2** y selecciona el servicio de Servidores Virtuales.
3. Haz clic en el botón naranja **"Lanzar instancias"** (Launch Instances).
4. Configuración de la máquina:
   - **Nombre:** `MT5-Node-1`
   - **AMI (Sistema Operativo):** Selecciona **Ubuntu** (Ubuntu Server 22.04 LTS o 24.04 LTS). Aparecerá una etiqueta verde que dice *"Apto para la capa gratuita"*.
   - **Tipo de instancia:** Selecciona **`t2.micro`** (1 vCPU, 1 GiB de memoria). *Apto para la capa gratuita*.
   - **Par de claves (Login):** Haz clic en "Crear nuevo par de claves", ponle nombre `llave-mt5`, descarga el archivo `.pem` y guárdalo en un lugar seguro (ej. tu escritorio).
   - **Configuración de red:** Marca las casillas "Permitir tráfico SSH desde cualquier lugar".
   - **Almacenamiento:** Lo puedes subir hasta **30 GB** (el máximo gratis).
5. Haz clic en el botón naranja inferior derecho **"Lanzar instancia"**.

*¡Felicidades! Tienes tu propio servidor en la nube.*

---

## Fase 2: Conexión Remota al Servidor (SSH)

1. En el panel de AWS EC2, ve a **Instancias** y espera que el "Estado de la instancia" diga **En ejecución** (verde).
2. Haz clic en el ID de la instancia y fíjate en la parte que dice **"Dirección IPv4 pública"**. Esa es la IP de tu servidor. Cópiala.
3. Abre tu **PowerShell** o **Símbolo del sistema** en Windows.
4. Navega a la carpeta donde guardaste tu archivo `.pem` (si lo tienes en el escritorio, escribe `cd Desktop`).
5. Ejecuta este comando (cambiando la IP por la tuya):

```bash
ssh -i llave-mt5.pem ubuntu@TU_IP_PÚBLICA_DE_AWS
```
*(Si te pregunta "Are you sure you want to continue connecting?", escribe `yes` y presiona Enter).*

---

## Fase 3: La "Medicina" Headless (Instalación)

Ahora que estás dentro de la consola del servidor de AWS (la pantalla dirá algo como `ubuntu@ip-172-31-xx-xx:`), vamos a instalar Xvfb (la pantalla invisible) y Wine (el emulador de Windows).

Ejecuta estos 4 comandos uno por uno (el primero puede que tarde unos 2 minutos, si te pide confirmar [Y/n], presiona `Y` y Enter):

```bash
# 1. Actualizar el servidor
sudo apt update && sudo apt upgrade -y

# 2. Habilitar la arquitectura de 32 bits (Wine la necesita)
sudo dpkg --add-architecture i386

# 3. Instalar Wine (Emulador Windows) y Xvfb (Pantalla virtual)
sudo apt install -y wine64 wine32 xvfb curl unzip

# 4. Instalar winetricks (Librerías extra de windows) y fuentes base
sudo apt install -y winetricks
```

---

## Fase 4: Preparar tu MT5 Portable (Desde tu PC Local)

Para no consumir recursos instalando MT5 en el servidor, simplemente vas a enviarle desde tu PC los archivos ya descomprimidos.

1. En tu computadora (Windows), ve a `C:\Program Files\MetaTrader 5` y copia toda la carpeta al Escritorio.
2. Abre la carpeta del Escritorio. Borra todo lo que no sirva para ahorrar espacio temporal:
   - Borra carpetas como `/MQL5/Experts/Examples`, `/MQL5/Indicators/Examples`.
   - Borra archivos de desinstalación (`uninstall.exe`).
3. **El Bot:** Toma tu archivo `FundedSpread_Risk.ex5` (Una vez que lo compiles en el paso anterior) y colócalo dentro de la ruta `MQL5/Experts/Advisors/FundedSpread/` dentro de tu carpeta MT5 portátil.
4. **Comprimir:** Dale clic derecho a la carpeta raíz de MetaTrader 5 y selecciona "Comprimir en archivo ZIP".
5. Una vez tengas tu `MT5.zip`, necesitamos subirlo al VPS. La forma más fácil para alguien nuevo en AWS es subirlo a un enlace temporal (Dropbox, Google Drive, Transfer.sh). 

*Como alternativa súper pro de desarrollador sin usar Drive, desde otra pestaña de PowerShell de tu Windows, ubicado donde está el zip, envíalo por protocolo SCP así:*
```bash
scp -i llave-mt5.pem MT5.zip ubuntu@TU_IP_PÚBLICA_DE_AWS:/home/ubuntu/
```

---

## Fase 5: Arrancar el Servidor Headless en AWS

1. Vuelve a la consola negra de tu VPS AWS.
2. Descomprime el archivo y entra a la carpeta:
```bash
unzip "MT5.zip" -d mt5-1
cd mt5-1
```
3. **🔥 COMANDO MÁGICO (Ejecución Invisible):**
Este es el secreto de la alta densidad. Levanta MT5 en una pantalla "falsa" número 99:

```bash
xvfb-run -a -n 99 -s "-screen 0 1024x768x24" wine terminal64.exe /portable &
```
Al ejecutar `/portable`, el MT5 se abrirá y correrá sin interfaz gráfica usando casi nada de RAM. 
Tu Expert Advisor correrá perfectamente y se comunicará con el Backend de Supabase.

*Nota: Para automatizar el alta de servidores masivos en el futuro usando la API, se crearán comandos Bash especiales, pero por ahora en la prueba manual este es el proceso de despliegue directo.*

---

## Fase 6: Flujo Rápido de Aprobación Manual (Para nuevos clientes)

Cuando un cliente te paga por fuera de la plataforma (cripto, transferencia, cash), este es el proceso completo exacto resumido para darle su cuenta en 5 minutos:

1. **Vincular en Panel Admin:**
   - Entra a tu Admin Panel de Funded Spread.
   - Busca al usuario, dale clic a **"📦 Agregar Cuenta"**.
   - Coloca los datos de la cuenta MT5 que le vas a crear y el tamaño de la cuenta.

2. **Crear y Configurar MetaTrader 5:**
   - Ve a tu Broker (Alpari/IC Markets) y crea la cuenta Demo con capital inicial, 1:100 de apalancamiento, etc.
   - Abre tu cliente MetaTrader 5 local en tu PC y loguéate en esa cuenta.
   - Arrastra el **EA (Bot)** al gráfico para que quede activo.
   - Asegúrate de que las credenciales de la Pestaña "Inputs" y los permisos de Request Webhook estén habilitados hacia `https://www.fundedspread.com`.

3. **Subir al VPS Activo:**
   - Comprime tu carpeta de MetaTrader ya activa (ej. `mt5-nombreCliente.zip`).
   - Abre **PowerShell** en tu Windows (desde tu escritorio).
   - Súbelo con el comando: 
     `scp -i llave.pem mt5-nombreCliente.zip ubuntu@IP_DEL_VPS:/home/ubuntu/`

4. **Arrancar en el VPS:**
   - Ingresa a la consola web de AWS (Terminal del VPS).
   - Extrae el zip que acaba de subir:
     `unzip "mt5-nombreCliente.zip" -d mt5-nombreCliente`
   - Entra en la carpeta final donde está el `.exe`:
     `cd mt5-nombreCliente` *(Nota: si el zip metió una sobre-carpeta, haz `cd mt5-nombreCliente/mt5-nombreCliente`)*
   - Corre el comando en segundo plano:
     `xvfb-run -a -n 100 -s "-screen 0 1024x768x24" wine terminal64.exe /portable &`

5. **Verificación:**
   - Ve a tu Admin Panel nuevamente, busca al usuario y haz clic en **"Monitorear"** (Impersonate).
   - Si el dashboard muestra el balance que indicaste (ej: $100,000), el bot envió con éxito la lectura inicial y tu cliente está 100% operativo y listo para tradear.
