import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// SECURITY: Require Service Role Key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
);

export async function POST(request: Request) {
    try {
        // 1. Authenticate current user
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }



        const { accountId, amount, userAmount, network, walletAddress, profitSplitPct } = await request.json();

        // 2. Validate inputs
        if (!accountId || !amount || !userAmount || !network || !walletAddress || !profitSplitPct) {
            return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
        }

        if (!["BEP20", "TRC20"].includes(network)) {
            return NextResponse.json({ error: "Red no válida" }, { status: 400 });
        }

        if (userAmount < 100) {
            return NextResponse.json({ error: "El monto mínimo de retiro es $100" }, { status: 400 });
        }

        // Basic wallet address validation
        if (network === "TRC20" && !/^T[a-zA-Z0-9]{33}$/.test(walletAddress)) {
            return NextResponse.json({ error: "Dirección TRC20 inválida" }, { status: 400 });
        }
        if (network === "BEP20" && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return NextResponse.json({ error: "Dirección BEP20 inválida" }, { status: 400 });
        }

        // 3. Verify the account belongs to this user and is funded
        const { data: account, error: accountError } = await supabaseAdmin
            .from("mt5_accounts")
            .select("*")
            .eq("id", accountId)
            .eq("user_id", user.id)
            .single();

        if (accountError || !account) {
            return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
        }

        if (account.account_status !== "funded") {
            return NextResponse.json({ error: "Solo cuentas fondeadas pueden realizar retiros" }, { status: 400 });
        }

        // 4. Validate trading days requirement (minimum 5 valid trading days)
        const tradingDays = account.trading_days_count || 0;
        if (tradingDays < 5) {
            return NextResponse.json({
                error: `Necesitas al menos 5 días operados con operaciones válidas. Llevas ${tradingDays} días.`
            }, { status: 400 });
        }

        // 5. Check profit
        const currentEquity = Number(account.current_equity) || 0;
        const initialBalance = Number(account.initial_balance) || 0;
        const actualProfit = currentEquity - initialBalance;

        if (actualProfit <= 0) {
            return NextResponse.json({ error: "No hay ganancias disponibles para retirar" }, { status: 400 });
        }

        // 6. Validate payout timing
        const createdAt = new Date(account.created_at);
        const lastWithdrawal = account.last_withdrawal_at ? new Date(account.last_withdrawal_at) : null;
        const referenceDate = lastWithdrawal || createdAt;
        const daysToWait = account.has_weekly_payouts ? 7 : 30;
        const nextPayoutDate = new Date(referenceDate.getTime() + daysToWait * 24 * 60 * 60 * 1000);

        if (new Date() < nextPayoutDate) {
            return NextResponse.json({
                error: `Tu próximo retiro estará disponible el ${nextPayoutDate.toLocaleDateString()}`
            }, { status: 400 });
        }


        // 7. Check no pending withdrawal for this account
        const { data: existingRequests } = await supabaseAdmin
            .from("withdrawal_requests")
            .select("id")
            .eq("account_id", accountId)
            .in("status", ["pending", "approved", "processing"])
            .limit(1);

        if (existingRequests && existingRequests.length > 0) {
            return NextResponse.json({
                error: "Ya tienes una solicitud de retiro pendiente para esta cuenta"
            }, { status: 400 });
        }

        // 8. Create withdrawal request
        const { error: insertError } = await supabaseAdmin
            .from("withdrawal_requests")
            .insert({
                user_id: user.id,
                account_id: accountId,
                amount: Number(amount.toFixed(2)),
                user_amount: Number(userAmount.toFixed(2)),
                network,
                wallet_address: walletAddress,
                profit_split_pct: profitSplitPct,
                status: "pending",
            });

        if (insertError) {
            console.error("Error creating withdrawal request:", insertError);
            return NextResponse.json({ error: "Error al crear la solicitud" }, { status: 500 });
        }

        // 9. Update last_withdrawal_at on the account
        await supabaseAdmin
            .from("mt5_accounts")
            .update({ last_withdrawal_at: new Date().toISOString() })
            .eq("id", accountId);

        console.log(`✅ Withdrawal request created: User ${user.id}, Account ${accountId}, $${userAmount} USDT (${network})`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Withdrawal Request Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
