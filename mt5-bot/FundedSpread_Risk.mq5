//+------------------------------------------------------------------+
//|                                             FundedSpread_Risk.mq5|
//|                                        Copyright 2026, CEO       |
//+------------------------------------------------------------------+
#property copyright "FundedSpread"
#property link      "https://fundedspread.com"
#property version   "1.00"

// Inputs (Parámetros configurables desde MT5)
input string InpWebhookUrl = "http://127.0.0.1:3000/api/risk-engine/mt5-webhook"; // URL del Webhook (Modificar en Prod)
input string InpApiSecret = "fundedspread_ea_secret_key_2026"; // API Secret Key
input int InpTimerSeconds = 5; // Frecuencia de envío (segundos)
input bool InpDebugMode = true; // Modo Debug (Enviar siempre)

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   // Iniciar el temporizador
   EventSetTimer(InpTimerSeconds);
   Print("FundedSpread Risk Engine Bot Iniciado. Enviando datos cada ", InpTimerSeconds, " segundos.");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   Print("FundedSpread Risk Engine Bot Detenido.");
  }

//+------------------------------------------------------------------+
//| Timer function (Se ejecuta cada 5 segundos)                      |
//+------------------------------------------------------------------+
void OnTimer()
  {
   // 0. Optimización de envío de datos
   if(!InpDebugMode && PositionsTotal() == 0)
     {
      // En modo producción, no hacer ping al servidor si no hay posiciones abiertas para ahorrar recursos
      return;
     }

   // 1. Recopilar datos de la cuenta
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double floating = equity - balance;
   long timestamp = TimeCurrent();

   // 1.5. Reglas Locales (Anti-Trampas basados en FundedNext)
   string localViolation = "";

   // Regla A: Límite de Posiciones (Máximo 5)
   if(PositionsTotal() > 5)
     {
      localViolation = "Limite de 5 posiciones excedido";
     }

   // Regla B: Límite de 20 Operaciones Diarias
   if(localViolation == "")
     {
      datetime startOfDay = TimeCurrent() - (TimeCurrent() % 86400);
      if(HistorySelect(startOfDay, TimeCurrent())) // Cargar historial del día
        {
         int tradesToday = 0;
         for(int i = 0; i < HistoryDealsTotal(); i++)
           {
            ulong dealTicket = HistoryDealGetTicket(i);
            if(dealTicket > 0)
              {
               long entry = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
               if(entry == DEAL_ENTRY_IN) tradesToday++;
              }
           }
         if(tradesToday > 20)
           {
            localViolation = "Limite de 20 operaciones diarias excedido";
           }
        }
     }

   // Regla C: Prohibición de EAs Externos (Magic Number > 0)
   if(localViolation == "")
     {
      for(int i = 0; i < PositionsTotal(); i++)
        {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0)
           {
            long magic = PositionGetInteger(POSITION_MAGIC);
            // Operations executed manually usually have Magic = 0.
            if(magic > 0)
              {
               localViolation = "Uso prohibido de Expert Advisor detectado";
               break;
              }
           }
        }
     }

   // 2. Construir el JSON
   string jsonPayload = "";
   if(localViolation != "")
     {
      jsonPayload = StringFormat(
         "{\"login\":\"%d\",\"equity\":%f,\"balance\":%f,\"floating\":%f,\"timestamp\":%d,\"violation\":\"%s\"}",
         login, equity, balance, floating, timestamp, localViolation
      );
     }
   else
     {
      jsonPayload = StringFormat(
         "{\"login\":\"%d\",\"equity\":%f,\"balance\":%f,\"floating\":%f,\"timestamp\":%d}",
         login, equity, balance, floating, timestamp
      );
     }

   // 3. Configurar la petición HTTP HTTP POST
   char postData[];
   char result[];
   string resultHeaders;
   int res;
   
   StringToCharArray(jsonPayload, postData, 0, WHOLE_ARRAY, CP_UTF8);
   // Quitar el terminador nulo que StringToCharArray añade al final
   ArrayResize(postData, ArraySize(postData) - 1);

   string headers = "Content-Type: application/json\r\n" + 
                    "Authorization: Bearer " + InpApiSecret + "\r\n";

   // 4. Enviar el WebRequest al servidor Next.js
   res = WebRequest("POST", InpWebhookUrl, headers, 5000, postData, result, resultHeaders);

   // 5. Evaluar la respuesta del servidor
   if(res == 200)
     {
      string responseText = CharArrayToString(result);
      
      // Si el servidor de Next.js detectó que violó el drawdown o enviamos nosotros violación local (CLOSE_ALL)
      if(StringFind(responseText, "CLOSE_ALL") >= 0)
        {
         if(localViolation != "")
           {
            Print("🚨 ALERTA ROJA (LOCAL): ", localViolation, ". Cerrando posiciones de cuenta ", login);
           }
         else
           {
            Print("🚨 ALERTA ROJA (SERVIDOR): Violacion detectada remotamente. Cerrando posiciones de cuenta ", login);
           }
         
         CloseAllPositions();
         
         // 6. Autodestrucción del EA (evitar spam continuo)
         Print("🛑 Cuenta baneada. Desactivando el Risk Engine (ExpertRemove) para evitar sobrecarga.");
         ExpertRemove(); // Detiene el bot y lo elimina del gráfico inmediatamente
        }
     }
   else
     {
      Print("Error de WebRequest. Código HTTP: ", res, ". Error MT5: ", GetLastError());
     }
  }

//+------------------------------------------------------------------+
//| Función de seguridad: Cierra el 100% de operaciones abiertas     |
//+------------------------------------------------------------------+
void CloseAllPositions()
  {
   // Iterar por cada posición abierta y cerrarla a precio de mercado
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
        {
         MqlTradeRequest request = {};
         MqlTradeResult result = {};
         
         request.action = TRADE_ACTION_DEAL;
         request.position = ticket;
         request.symbol = PositionGetString(POSITION_SYMBOL);
         request.volume = PositionGetDouble(POSITION_VOLUME);
         request.deviation = 50;
         request.magic = 0;
         
         long type = PositionGetInteger(POSITION_TYPE);
         if(type == POSITION_TYPE_BUY)
           {
            request.type = ORDER_TYPE_SELL;
            request.price = SymbolInfoDouble(request.symbol, SYMBOL_BID);
           }
         else if(type == POSITION_TYPE_SELL)
           {
            request.type = ORDER_TYPE_BUY;
            request.price = SymbolInfoDouble(request.symbol, SYMBOL_ASK);
           }
           
         // Ejecutar el cierre
         if(!OrderSend(request, result))
           {
            Print("Error cerrando posicion #", ticket, ": ", GetLastError());
           }
         else
           {
            Print("Posición #", ticket, " cerrada correctamente por el EA Risk Engine.");
           }
        }
     }
  }
//+------------------------------------------------------------------+
