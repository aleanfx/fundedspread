export const emailTemplates = {
  phase1: (traderName = "{{TRADER_NAME}}", certificateUrl = "{{CERTIFICATE_URL}}") => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Fase 1 Superada!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: 'Arial', sans-serif; color: #ffffff;">
  <div style="max-w-width: 600px; margin: 0 auto; background-color: #12141d; border: 1px solid #1f222e; border-top: 4px solid #10b981; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
    
    <!-- Logo/Header -->
    <div style="text-align: center; padding: 40px 20px;">
      <a href="https://funded-spread.com" style="text-decoration: none; display: inline-block;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">
          <!-- IMPORTANTE: El fondo negro es porque el logo en la web fue exportado con fondo negro en lugar de transparente (PNG transparent). Reemplaza tu archivo por uno sin fondo. -->
          <img src="https://www.funded-spread.com/logo.png" alt="" width="54" style="vertical-align: middle; margin-right: 12px; border: 0;" />
          <span style="color: #ffffff;">FUNDED SPREAD</span>
        </h1>
      </a>
    </div>

    <!-- Body -->
    <div style="padding: 0 40px 40px 40px; text-align: center;">
      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #ffffff;">¡Felicidades <span style="color: #10b981;">${traderName}</span>!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px;">
        <span style="color: #a1a1aa;">Tu disciplina y excelente gestión de riesgo han rendido frutos. Has superado oficialmente la <strong>Fase 1</strong> de nuestro desafío y estás un paso más cerca de unirte a la Élite.</span>
      </p>

      <div style="background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 15px; color: #e4e4e7;">
          <strong>El siguiente paso:</strong> Se están preparando las credenciales para tu Fase 2. Continúa demostrando que tienes la ventaja estadística en el mercado.
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px;">
        Para conmemorar este hito, hemos generado un certificado digital oficial de tu logro.
      </p>

      <!-- CTA -->
      <a href="${certificateUrl}" style="display: inline-block; background-color: #10b981; color: #000000; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px;">Ver mi Certificado</a>
    </div>

    <!-- Footer -->
    <div style="background-color: #0b0c10; padding: 20px; text-align: center; border-top: 1px solid #1f222e;">
      <p style="margin: 0; font-size: 12px; color: #71717a;">
        © 2026 Funded Spread. Todos los derechos reservados.<br>
        Si tienes preguntas, contacta a nuestro soporte técnico.
      </p>
    </div>
  </div>
</body>
</html>
`,

  funded: (traderName = "{{TRADER_NAME}}", accountSize = "{{ACCOUNT_SIZE}}", certificateUrl = "{{CERTIFICATE_URL}}") => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a la Élite. ¡Estás Fondeado!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: 'Arial', sans-serif; color: #ffffff;">
  <div style="max-w-width: 600px; margin: 0 auto; background-color: #12141d; border: 1px solid #a855f7; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);">
    
    <!-- Header Oro -->
    <div style="text-align: center; padding: 40px 20px; background-image: linear-gradient(180deg, rgba(168,85,247,0.1) 0%, rgba(18,20,29,1) 100%);">
      <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
      <a href="https://funded-spread.com" style="text-decoration: none; display: inline-block;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">
          <!-- IMPORTANTE: El fondo negro es porque el logo en la web fue exportado con fondo negro en lugar de transparente (PNG transparent). Reemplaza tu archivo por uno sin fondo. -->
          <img src="https://www.funded-spread.com/logo.png" alt="" width="54" style="vertical-align: middle; margin-right: 12px; border: 0;" />
          <span style="color: #ffffff;">FUNDED SPREAD</span>
        </h1>
      </a>
      <p style="margin-top: 5px; color: #a855f7; font-weight: bold; letter-spacing: 3px; font-size: 12px;">ESTATUS: ELITE</p>
    </div>

    <!-- Body -->
    <div style="padding: 0 40px 40px 40px; text-align: center;">
      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #ffffff;">¡Oficialmente Fondeado, <span style="color: #a855f7;">${traderName}</span>!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px;">
        <span style="color: #a1a1aa;">Las pruebas terminaron. Demostraste rentabilidad consistente, psicología de hierro y estricto manejo de riesgo. Ahora eres oficialmente un Trader Fondeado con una cuenta de <strong>$${accountSize}</strong>.</span>
      </p>

      <div style="border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 15px; color: #e4e4e7;">
          Tus credenciales de cuenta real serán emitidas a continuación tras firmar el contrato. Es hora de hacer dinero real.
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px;">
        Presume tu nuevo estatus. Comparte este logro con tu comunidad. Hemos generado tu certificado oficial de paso.
      </p>

      <!-- CTA -->
      <a href="${certificateUrl}" style="display: inline-block; background-color: #a855f7; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px;">Descargar mi Título</a>
    </div>

    <!-- Footer -->
    <div style="background-color: #0b0c10; padding: 20px; text-align: center; border-top: 1px solid #1f222e;">
      <p style="margin: 0; font-size: 12px; color: #71717a;">
        © 2026 Funded Spread. Todos los derechos reservados.<br>
        Bienvenido a las ligas mayores.
      </p>
    </div>
  </div>
</body>
</html>
`,

  payout: (traderName = "{{TRADER_NAME}}", amount = "{{AMOUNT}}", certificateUrl = "{{CERTIFICATE_URL}}") => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Retiro Procesado y en Camino!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: 'Arial', sans-serif; color: #ffffff;">
  <div style="max-w-width: 600px; margin: 0 auto; background-color: #12141d; border: 1px solid #1f222e; border-top: 4px solid #39FF14; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
    
    <!-- Logo/Header -->
    <div style="text-align: center; padding: 40px 20px; background-color: rgba(57, 255, 20, 0.03);">
      <a href="https://funded-spread.com" style="text-decoration: none; display: inline-block;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">
          <!-- IMPORTANTE: El fondo negro es porque el logo en la web fue exportado con fondo negro en lugar de transparente (PNG transparent). Reemplaza tu archivo por uno sin fondo. -->
          <img src="https://www.funded-spread.com/logo.png" alt="" width="54" style="vertical-align: middle; margin-right: 12px; border: 0;" />
          <span style="color: #ffffff;">FUNDED SPREAD</span>
        </h1>
      </a>
      <h2 style="margin: 20px 0 0 0; font-size: 40px; font-weight: 800; color: #39FF14; font-family: monospace;">+$${amount}</h2>
      <p style="margin-top: 5px; color: #a1a1aa; font-weight: bold; letter-spacing: 1px; font-size: 13px; text-transform: uppercase;">Retiro Aprobado</p>
    </div>

    <!-- Body -->
    <div style="padding: 30px 40px 40px 40px; text-align: center;">
      <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #ffffff;"><span style="color: #ffffff;">Has cobrado,</span> <span style="color: #ffffff;">${traderName}</span></h3>
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px;">
        <span style="color: #a1a1aa;">Tu pago ha sido procesado exitosamente por nuestro equipo financiero. Los fondos llegarán a tu billetera según los tiempos de procesamiento de red.</span>
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #e4e4e7; margin-bottom: 30px; font-weight: bold;">
        <span style="color: #e4e4e7;">Retirar del mercado no es suerte, es disciplina.<br>Sigue ejecutando tu mismo plan de trading con precisión.</span>
      </p>

      <!-- CTA -->
      <a href="${certificateUrl}" style="display: inline-block; background-color: #39FF14; color: #000000; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px;">Certificado de Payout</a>
    </div>

    <!-- Footer -->
    <div style="background-color: #0b0c10; padding: 20px; text-align: center; border-top: 1px solid #1f222e;">
      <p style="margin: 0; font-size: 12px; color: #71717a;">
        Si tienes preguntas sobre el retiro, no dudes en contactarnos.<br>
        © 2026 Funded Spread
      </p>
    </div>
  </div>
</body>
</html>
`
};
