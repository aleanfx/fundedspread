import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// SECURITY: Require Service Role Key — fail explicitly if missing
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
);

// Payload structure from the MQL5 Expert Advisor
interface MT5Payload {
    login: string;
    equity: number;
    balance: number;
    floating: number;
    timestamp: number;
    violation?: string;
    // New fields for trade completion
    trade?: {
        symbol: string;
        type: string;
        lots: number;
        entry: number;
        exit: number;
        pnl: number;
        closed_at?: string;
    };
}

// ============================================
// CHALLENGE TYPE CONFIGURATIONS
// ============================================

// Classic 2-Phase
const CLASSIC_CONFIG = {
    phase1: { profitTarget: 8, dailyDD: 4, maxDD: 10, minDays: 5, timeLimit: 30 },
    phase2: { profitTarget: 5, dailyDD: 4, maxDD: 10, minDays: 5, timeLimit: 60 },
    funded: { dailyDD: 4, maxDD: 10 },
};

// Scaling x2 (Checkpoints)
const SCALING_CONFIG = {
    profitTarget: 20, // +20% para escalar
    dailyDD: 4,
    maxDD: 10,
};

// Express 1-Phase (Stricter rules, 1 phase only)
const EXPRESS_CONFIG = {
    profitTarget: 10, // +10% target
    dailyDD: 3,       // Stricter daily
    maxDD: 5,         // Stricter max total
};

export async function POST(request: Request) {
    try {
        // 1. Basic API Key Authentication
        const authHeader = request.headers.get("authorization");
        const EA_SECRET = process.env.MT5_EA_SECRET || "fundedspread_ea_secret_key_2026";
        
        if (authHeader !== `Bearer ${EA_SECRET}`) {
            console.error("⛔ [MT5 Webhook] Unauthorized access attempt.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: MT5Payload = await request.json();
        
        if (!body.login || typeof body.equity !== 'number') {
            return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
        }

        console.log(`📡 [MT5 Webhook] Tick de cuenta ${body.login} | Equity: $${body.equity}`);

        // 2. Fetch the corresponding account from Supabase
        const { data: accounts, error: fetchError } = await supabaseAdmin
            .from("mt5_accounts")
            .select("*")
            .eq("mt5_login", body.login)
            .limit(1);

        if (fetchError || !accounts || accounts.length === 0) {
            console.error(`❌ [MT5 Webhook] Cuenta ${body.login} no encontrada en la BD.`);
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const account = accounts[0];
        const challengeType = account.challenge_type || "classic_2phase";
        const challengePhase = account.challenge_phase || 1;

        // --- RISK ENGINE RULES EVALUATION ---
        let action = "OK";
        let violationReason = account.status_reason || "";
        let newStatus = account.account_status;
        let shouldLevelUp = false;

        // ====== PRE-CHECK: Violaciones inmediatas ======

        // EA reporta violación local (> 5 posiciones, EA externo, > 20 trades/día)
        if (body.violation) {
            action = "CLOSE_ALL";
            newStatus = "failed";
            violationReason = body.violation;
        } 
        // Cuenta ya estaba baneada (simulación web o ban previo)
        else if (newStatus === "failed") {
            action = "CLOSE_ALL";
            violationReason = violationReason || "Suspensión de cuenta forzada";
        }

        // ====== AUTOMATIZACIÓN DE ACTIVACIÓN ======
        // Si empezamos a recibir ticks válidos y la cuenta estaba pendiente, se activa.
        if (action === "OK" && (newStatus === "pending_creation" || newStatus === "inactive")) {
            newStatus = "active";
            console.log(`✅ [MT5 Webhook] Cuenta ${body.login} activada automáticamente al validar el primer tick.`);
        }

        // ====== REGLAS DE DRAWDOWN (aplican a AMBOS tipos) ======
        if (action === "OK") {
            // Regla 1: Daily Drawdown (4% default for classic)
            const dailyDDPct = account.daily_drawdown_pct || 4;
            const maxDailyLoss = account.daily_initial_balance * (dailyDDPct / 100);
            const minDailyEquity = account.daily_initial_balance - maxDailyLoss;

            if (body.equity <= minDailyEquity) {
                action = "CLOSE_ALL";
                violationReason = `Daily Drawdown Exceeded (${dailyDDPct}%)`;
                newStatus = "failed";
            }

            // Regla 2: Max Total Drawdown (10%)
            const maxDDPct = account.max_drawdown_pct || 10;
            const maxTotalLoss = account.initial_balance * (maxDDPct / 100);
            const minTotalEquity = account.initial_balance - maxTotalLoss;

            if (body.equity <= minTotalEquity) {
                action = "CLOSE_ALL";
                violationReason = `Max Drawdown Exceeded (${maxDDPct}%)`;
                newStatus = "failed";
            }
        }

        // ====== LÓGICA DE PROGRESIÓN (FASES Y ESCALAMIENTO) ======
        if (action === "OK") {
            const profitPct = ((body.equity - account.initial_balance) / account.initial_balance) * 100;

            // 1. Fase de Evaluación (Phase 1 y Phase 2) - Aplica a classic_2phase y scaling_x2
            if (account.account_status !== "funded" && account.account_status !== "checkpoint_reached") {
                
                if (challengeType === "express_1phase") {
                    // Logic for Express 1-Phase
                     if (profitPct >= (account.profit_target_pct || 10)) {
                        shouldLevelUp = true;
                        newStatus = "funded";
                        console.log(`🏆 [MT5 Webhook] Cuenta ${body.login} pasó la Evaluación (+${profitPct.toFixed(1)}%). ¡CUENTA FONDEADA!`);
                    }
                } else {
                     // Logic for Classic 2-Phase and Scaling x2 (Unified Evaluation)
                    const phaseConfig = challengePhase === 1 ? CLASSIC_CONFIG.phase1 : CLASSIC_CONFIG.phase2;
    
                    if (profitPct >= (account.profit_target_pct || phaseConfig.profitTarget)) {
                        if (challengePhase === 1) {
                            shouldLevelUp = true;
                            newStatus = "phase2_ready";
                            console.log(`🎯 [MT5 Webhook] Cuenta ${body.login} pasó FASE 1 (+${profitPct.toFixed(1)}%).`);
                        } else if (challengePhase === 2) {
                            shouldLevelUp = true;
                            newStatus = "funded";
                            console.log(`🏆 [MT5 Webhook] Cuenta ${body.login} pasó FASE 2 (+${profitPct.toFixed(1)}%). ¡CUENTA FONDEADA!`);
                        }
                    }
                }
            } 
            // 2. Fase de Escalamiento - SOLO para scaling_x2 en estado funded
            else if (challengeType === "scaling_x2" && account.account_status === "funded") {
                if (profitPct >= SCALING_CONFIG.profitTarget) {
                    shouldLevelUp = true;
                    newStatus = "checkpoint_reached";
                    console.log(`🚀 [MT5 Webhook] Cuenta ${body.login} alcanzó Checkpoint de Escalamiento (+${profitPct.toFixed(1)}%).`);
                }
            }
        }

        // ====== ACTUALIZAR BASE DE DATOS ======
        const isActive = newStatus !== "failed" && newStatus !== "pending_creation" && newStatus !== "inactive";
        
        const updateData: Record<string, unknown> = {
            current_equity: body.equity,
            current_balance: body.balance,
            floating_pnl: body.floating || 0,
            last_health_check: new Date().toISOString(),
            account_status: newStatus,
            is_active: isActive,
            status_reason: violationReason || account.status_reason,
        };

        // Si pasó de fase o alcanzó checkpoint
        if (shouldLevelUp) {
            updateData.can_level_up = true;
            
            if (challengeType === "classic_2phase" && challengePhase === 1 && newStatus === "phase2_ready") {
                // Preparar datos para Fase 2 (el admin debe resetear la cuenta)
                updateData.challenge_phase = 2;
                updateData.profit_target_pct = CLASSIC_CONFIG.phase2.profitTarget;
            }
        }

        // Track peak equity (para trailing drawdown futuro)
        if (body.equity > (account.peak_equity || 0)) {
            updateData.peak_equity = body.equity;
        }

        const { error: updateError } = await supabaseAdmin
            .from("mt5_accounts")
            .update(updateData)
            .eq("id", account.id);

        if (updateError) {
            console.error(`⚠️ [MT5 Webhook] Failed to update stats for ${body.login}:`, updateError);
        }

        // ====== UPDATE USER RANK STATS (phases_passed, is_funded) ======
        if (shouldLevelUp && account.user_id) {
            try {
                const rankUpdates: Record<string, unknown> = {};

                if (newStatus === "phase2_ready") {
                    // Passed Phase 1 → increment phases_passed
                    const { data: userRow } = await supabaseAdmin
                        .from("users")
                        .select("phases_passed, highest_rank")
                        .eq("id", account.user_id)
                        .single();

                    const currentPhases = (userRow?.phases_passed || 0) + 1;
                    rankUpdates.phases_passed = currentPhases;

                    // Auto-upgrade rank if applicable (Novato requires 1 phase)
                    const currentHighest = userRow?.highest_rank || "unranked";
                    if (currentHighest === "unranked" && currentPhases >= 1) {
                        rankUpdates.highest_rank = "novato";
                    }
                } else if (newStatus === "funded") {
                    // Got funded → set is_funded, increment phases_passed
                    const { data: userRow } = await supabaseAdmin
                        .from("users")
                        .select("phases_passed, highest_rank, total_withdrawals")
                        .eq("id", account.user_id)
                        .single();

                    const currentPhases = (userRow?.phases_passed || 0) + 1;
                    rankUpdates.phases_passed = currentPhases;
                    rankUpdates.is_funded = true;

                    // Auto-upgrade rank
                    const currentHighest = userRow?.highest_rank || "unranked";
                    if (currentHighest === "unranked") {
                        rankUpdates.highest_rank = "novato";
                    }
                }

                if (Object.keys(rankUpdates).length > 0) {
                    await supabaseAdmin
                        .from("users")
                        .update(rankUpdates)
                        .eq("id", account.user_id);
                    console.log(`🏅 [MT5 Webhook] Updated rank stats for user ${account.user_id}:`, rankUpdates);
                }
            } catch (rankErr) {
                console.error(`⚠️ [MT5 Webhook] Failed to update rank stats:`, rankErr);
            }
        }

        // ====== RECORD DAILY SNAPSHOT ======
        // We record the latest equity for the current day. 
        // This will be used to build the P&L chart in the dashboard.
        const todayStr = new Date().toISOString().split('T')[0];
        const { error: snapshotError } = await supabaseAdmin
            .from("daily_snapshots")
            .upsert({
                mt5_account_id: account.id,
                date: todayStr,
                equity: body.equity,
                balance: body.balance
            }, { onConflict: 'mt5_account_id,date' });

        if (snapshotError) {
            console.error(`⚠️ [MT5 Webhook] Failed to save daily snapshot for ${body.login}:`, snapshotError);
        }

        // ====== RECORD CLOSED TRADE ======
        if (body.trade) {
            const { error: tradeError } = await supabaseAdmin
                .from("trade_history")
                .insert({
                    mt5_account_id: account.id,
                    symbol: body.trade.symbol,
                    type: body.trade.type,
                    lots: body.trade.lots,
                    entry_price: body.trade.entry,
                    exit_price: body.trade.exit,
                    pnl: body.trade.pnl,
                    closed_at: body.trade.closed_at || new Date().toISOString()
                });
            
            if (tradeError) {
                console.error(`⚠️ [MT5 Webhook] Failed to record closed trade for ${body.login}:`, tradeError);
            } else {
                console.log(`📝 [MT5 Webhook] Trade guardado: ${body.trade.symbol} | PnL: $${body.trade.pnl}`);
            }
        }

        // ====== RESPONDER AL EXPERT ADVISOR ======
        if (action === "CLOSE_ALL") {
            console.log(`🚨 [MT5 Webhook] Violación: ${body.login} → ${violationReason}. Enviando CLOSE_ALL.`);
            return NextResponse.json({ action: "CLOSE_ALL", reason: violationReason });
        }

        // Si todo está bien, responder OK + info de progreso
        const response: Record<string, unknown> = { action: "OK" };
        
        if (shouldLevelUp) {
            response.level_up = true;
            response.new_status = newStatus;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error("🔥 [MT5 Webhook] Error interno:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
