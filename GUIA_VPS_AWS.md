# Guía: Setup de MetaTrader 5 en AWS VPS Entorno Headless (Linux)

Esta guía te ayudará a levantar un servidor completamente gratis en Amazon Web Services (AWS) durante 1 año, y a configurarlo para que pueda ejecutar múltiples instancias de MetaTrader 5 sin necesidad de un entorno gráfico pesado (Windows), logrando alojar entre 10 y 15 cuentas con apenas 1GB de RAM.

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
xvfb-run -a -n 99 -s "-screen 0 1024x768x24" wine terminal64.exe /portable
```
Al ejecutar `/portable`, el MT5 se abrirá y correrá sin interfaz gráfica usando casi nada de RAM. 
Tu Expert Advisor correrá perfectamente y se comunicará con el Backend de Supabase.

*Nota: Para automatizar el alta de servidores masivos en el futuro usando la API, se crearán comandos Bash especiales, pero por ahora en la prueba manual este es el proceso de despliegue directo.*
