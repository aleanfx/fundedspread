//+------------------------------------------------------------------+
//|                                             FundedSpread_Risk.mq5|
//|                                        Copyright 2026, CEO       |
//+------------------------------------------------------------------+
#property copyright "FundedSpread"
#property link      "https://fundedspread.com"
#property version   "2.10"

// Inputs (Parámetros configurables desde MT5)
input string InpWebhookUrl = "http://127.0.0.1:3000/api/risk-engine/mt5-webhook"; // URL del Webhook (Modificar en Prod)
input string InpApiSecret = "fundedspread_ea_secret_key_2026"; // API Secret Key
input int InpTimerSeconds = 5; // Frecuencia con posiciones abiertas (seg)
input int InpIdleMinutes = 30; // Frecuencia sin posiciones (minutos)

// Variable global para controlar el heartbeat en idle
datetime g_lastIdlePing = 0;

// ====== TRADE TRACKING SYSTEM ======
// Almacena los tickets de deals ya reportados para no duplicar
ulong g_reportedDeals[];
int   g_reportedCount = 0;
// Timestamp del último escaneo de historial
datetime g_lastHistoryScan = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   // Timer siempre a 5 seg para reaccionar rápido si se abren posiciones
   EventSetTimer(InpTimerSeconds);
   g_lastIdlePing = 0; // Forzar primer ping inmediato
   g_lastHistoryScan = TimeCurrent(); // Empezar a escanear desde ahora
   Print("FundedSpread Risk Engine v2.10 | Trading: cada ", InpTimerSeconds, "s | Idle: cada ", InpIdleMinutes, " min | Trade Tracker: ON");
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
//| Verifica si un deal ya fue reportado                              |
//+------------------------------------------------------------------+
bool IsDealReported(ulong dealTicket)
  {
   for(int i = 0; i < g_reportedCount; i++)
     {
      if(g_reportedDeals[i] == dealTicket)
         return true;
     }
   return false;
  }

//+------------------------------------------------------------------+
//| Marca un deal como reportado                                      |
//+------------------------------------------------------------------+
void MarkDealReported(ulong dealTicket)
  {
   g_reportedCount++;
   ArrayResize(g_reportedDeals, g_reportedCount);
   g_reportedDeals[g_reportedCount - 1] = dealTicket;
   
   // Limitar memoria: si hay más de 500 deals, eliminar los más viejos
   if(g_reportedCount > 500)
     {
      int toRemove = g_reportedCount - 300;
      for(int i = 0; i < 300; i++)
         g_reportedDeals[i] = g_reportedDeals[i + toRemove];
      g_reportedCount = 300;
      ArrayResize(g_reportedDeals, 300);
     }
  }

//+------------------------------------------------------------------+
//| Escanea el historial y detecta trades cerrados nuevos             |
//+------------------------------------------------------------------+
string DetectClosedTrades()
  {
   string tradeJson = "";
   
   // Seleccionar historial desde el último escaneo hasta ahora
   datetime scanFrom = g_lastHistoryScan;
   datetime scanTo = TimeCurrent();
   
   if(!HistorySelect(scanFrom, scanTo))
      return "";
   
   int totalDeals = HistoryDealsTotal();
   
   for(int i = 0; i < totalDeals; i++)
     {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(dealTicket == 0) continue;
      
      // Solo nos interesan los DEAL_ENTRY_OUT (cierres de posición)
      long entry = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT) continue;
      
      // Verificar que no lo hayamos reportado ya
      if(IsDealReported(dealTicket)) continue;
      
      // ¡Trade cerrado nuevo encontrado! Extraer datos
      string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
      double lots   = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
      double price  = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
      double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
      double swap    = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
      long   dealType = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
      datetime dealTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
      
      // PnL total incluyendo comisión y swap
      double totalPnl = profit + commission + swap;
      
      // Tipo de operación original (si cierra BUY, fue BUY; si cierra SELL, fue SELL)
      // DEAL_TYPE_SELL = cerrando un BUY, DEAL_TYPE_BUY = cerrando un SELL
      string tradeType = (dealType == DEAL_TYPE_SELL) ? "BUY" : "SELL";
      
      // Buscar el precio de entrada usando el ticket de posición
      long positionId = (long)HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      double entryPrice = 0;
      
      // Buscar el deal de entrada correspondiente
      if(HistorySelect(0, scanTo)) // Ampliar búsqueda para encontrar la entrada
        {
         for(int j = 0; j < HistoryDealsTotal(); j++)
           {
            ulong searchTicket = HistoryDealGetTicket(j);
            if(searchTicket == 0) continue;
            long searchPosId = (long)HistoryDealGetInteger(searchTicket, DEAL_POSITION_ID);
            long searchEntry = HistoryDealGetInteger(searchTicket, DEAL_ENTRY);
            if(searchPosId == positionId && searchEntry == DEAL_ENTRY_IN)
              {
               entryPrice = HistoryDealGetDouble(searchTicket, DEAL_PRICE);
               break;
              }
           }
        }
      
      // Si no encontramos el precio de entrada, usar el precio actual como fallback
      if(entryPrice == 0)
         entryPrice = price;
      
      // Formatear la fecha de cierre en ISO 8601
      MqlDateTime dt;
      TimeToStruct(dealTime, dt);
      string closedAt = StringFormat("%04d-%02d-%02dT%02d:%02d:%02dZ",
                                     dt.year, dt.mon, dt.day, dt.hour, dt.min, dt.sec);
      
      // Construir JSON del trade (solo el último cerrado para no sobrecargar)
      tradeJson = StringFormat(
         ",\"trade\":{\"symbol\":\"%s\",\"type\":\"%s\",\"lots\":%.2f,\"entry\":%.5f,\"exit\":%.5f,\"pnl\":%.2f,\"closed_at\":\"%s\"}",
         symbol, tradeType, lots, entryPrice, price, totalPnl, closedAt
      );
      
      // Marcar como reportado
      MarkDealReported(dealTicket);
      
      Print("📝 Trade cerrado detectado: ", symbol, " | ", tradeType, " | Lots: ", lots,
            " | Entry: ", entryPrice, " → Exit: ", price, " | PnL: $", totalPnl);
     }
   
   // Actualizar timestamp del último escaneo
   g_lastHistoryScan = scanTo;
   
   return tradeJson;
  }

//+------------------------------------------------------------------+
//| Timer function — Lógica Adaptativa                               |
//+------------------------------------------------------------------+
void OnTimer()
  {
   // MODO INTELIGENTE: Si no hay posiciones, solo enviar heartbeat cada N minutos
   if(PositionsTotal() == 0)
     {
      datetime now = TimeCurrent();
      int idleIntervalSec = InpIdleMinutes * 60;
      
      // Pero SIEMPRE escanear trades cerrados incluso en idle
      string closedTradeJson = DetectClosedTrades();
      
      // Si encontramos un trade cerrado, forzar envío inmediato
      if(closedTradeJson != "")
        {
         SendTick(closedTradeJson);
         return;
        }
      
      if(g_lastIdlePing > 0 && (now - g_lastIdlePing) < idleIntervalSec)
        {
         return; // Aún no toca el heartbeat, no enviar nada
        }
      g_lastIdlePing = now; // Marcar que enviamos heartbeat ahora
     }
   else
     {
      // Hay posiciones abiertas: resetear el timer idle para que
      // cuando cierre posiciones, el primer heartbeat sea inmediato
      g_lastIdlePing = 0;
     }

   // Escanear trades cerrados (puede haber cierres parciales con posiciones abiertas)
   string closedTradeJson = DetectClosedTrades();
   
   SendTick(closedTradeJson);
  }

//+------------------------------------------------------------------+
//| Envía el tick con datos de cuenta + trade cerrado (si hay)        |
//+------------------------------------------------------------------+
void SendTick(string closedTradeJson = "")
  {
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
      // Incluir datos de trade cerrado si existe
      jsonPayload = StringFormat(
         "{\"login\":\"%d\",\"equity\":%f,\"balance\":%f,\"floating\":%f,\"timestamp\":%d%s}",
         login, equity, balance, floating, timestamp, closedTradeJson
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
