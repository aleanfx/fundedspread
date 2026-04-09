import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

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
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { data: userData } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
        const isDbAdmin = userData?.is_admin === true;
        const isEnvAdmin = user.email === ADMIN_EMAIL && ADMIN_EMAIL !== "";

        if (!isDbAdmin && !isEnvAdmin) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const { id, action, newStatus, mt5Login, mt5Password, mt5Server } = body;

        if (!id || !action) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        switch (action) {
            case "update_status": {
                const validStatuses = ["pending", "paid", "active", "completed", "failed"];
                if (!validStatuses.includes(newStatus)) {
                    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
                }
                await supabaseAdmin
                    .from("challenge_transactions")
                    .update({ status: newStatus })
                    .eq("id", id);

                console.log(`✅ Admin updated transaction ${id} status to: ${newStatus}`);
                break;
            }

            case "activate_with_credentials": {
                if (!mt5Login || !mt5Password) {
                    return NextResponse.json({ error: "Faltan credenciales MT5" }, { status: 400 });
                }

                // 1. Get the transaction to find the user_id
                const { data: tx, error: txErr } = await supabaseAdmin
                    .from("challenge_transactions")
                    .select("user_id, challenge_tier")
                    .eq("id", id)
                    .single();

                if (txErr || !tx) {
                    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
                }

                // 2. Find the mt5_account linked to this user with pending_creation status
                const { data: accounts } = await supabaseAdmin
                    .from("mt5_accounts")
                    .select("id")
                    .eq("user_id", tx.user_id)
                    .eq("account_status", "pending_creation")
                    .eq("challenge_tier", tx.challenge_tier)
                    .order("created_at", { ascending: false })
                    .limit(1);

                if (!accounts || accounts.length === 0) {
                    return NextResponse.json({ error: "No se encontró cuenta MT5 pendiente" }, { status: 404 });
                }

                // 3. Update the mt5_account with credentials and activate it
                const { error: updateErr } = await supabaseAdmin
                    .from("mt5_accounts")
                    .update({
                        mt5_login: mt5Login,
                        mt5_password: mt5Password,
                        mt5_server: mt5Server || "FundedSpread-Server",
                        is_active: true,
                        account_status: "active",
                    })
                    .eq("id", accounts[0].id);

                if (updateErr) {
                    console.error("Error updating MT5 account:", updateErr);
                    return NextResponse.json({ error: "Error al actualizar cuenta MT5" }, { status: 500 });
                }

                // 4. Mark the transaction as active
                await supabaseAdmin
                    .from("challenge_transactions")
                    .update({ status: "active" })
                    .eq("id", id);

                console.log(`✅ Admin activated challenge for user ${tx.user_id} with MT5 login: ${mt5Login}`);
                break;
            }

            case "manual_create_account": {
                /* Admin manually creates a challenge + MT5 account for a user
                   who paid outside the platform. */
                const { userId, challengeTier, challengeType: cType, challengePhase, accountSize, price,
                        mt5Login: manualLogin, mt5Password: manualPwd, mt5Server: manualSrv,
                        addons } = body;

                if (!userId || !challengeTier || !manualLogin || !manualPwd) {
                    return NextResponse.json({ error: "Faltan datos requeridos (userId, tier, login, password)" }, { status: 400 });
                }

                // 1. Create challenge_transaction as "active"
                const { data: newTx, error: txCreateErr } = await supabaseAdmin
                    .from("challenge_transactions")
                    .insert({
                        user_id: userId,
                        user_email: body.userEmail || null,
                        challenge_tier: challengeTier,
                        challenge_type: cType || "classic_2phase",
                        account_size: accountSize || 10000,
                        price: price || 0,
                        status: "active",
                        payment_method: "manual",
                        has_raw_spread: addons?.rawSpread || false,
                        has_zero_commission: addons?.zeroCommission || false,
                        has_weekly_payouts: addons?.weeklyPayouts || false,
                        has_scaling_x2: addons?.scalingX2 || false,
                        addon_split_90: addons?.split90 || false,
                        addon_split_100: addons?.split100 || false,
                    })
                    .select("id")
                    .single();

                if (txCreateErr) {
                    console.error("Error creating manual transaction:", txCreateErr);
                    return NextResponse.json({ error: "Error al crear la transacción" }, { status: 500 });
                }

                // 2. Create mt5_account
                const { error: acctErr } = await supabaseAdmin
                    .from("mt5_accounts")
                    .insert({
                        user_id: userId,
                        mt5_login: manualLogin,
                        mt5_password: manualPwd,
                        mt5_server: manualSrv || "FundedSpread-Server",
                        is_active: true,
                        account_status: (challengePhase || 1) === 3 ? "funded" : "active",
                        challenge_tier: challengeTier,
                        challenge_type: cType || "classic_2phase",
                        challenge_phase: challengePhase || 1,
                        initial_balance: accountSize || 10000,
                        current_balance: accountSize || 10000,
                        current_equity: accountSize || 10000,
                        daily_initial_balance: accountSize || 10000,
                        profit_target_pct: cType === "express_1phase" ? 10 : ((challengePhase || 1) === 2 ? 5 : 8),
                        max_drawdown_pct: cType === "express_1phase" ? 5 : 10,
                        daily_drawdown_pct: cType === "express_1phase" ? 3 : 4,
                        has_raw_spread: addons?.rawSpread || false,
                        has_zero_commission: addons?.zeroCommission || false,
                        has_weekly_payouts: addons?.weeklyPayouts || false,
                        has_scaling_x2: addons?.scalingX2 || false,
                        addon_split_90: addons?.split90 || false,
                        addon_split_100: addons?.split100 || false,
                    });

                if (acctErr) {
                    console.error("Error creating manual MT5 account:", acctErr);
                    return NextResponse.json({ error: "Error al crear la cuenta MT5" }, { status: 500 });
                }

                console.log(`✅ Admin manually created account for user ${userId} — Tier: ${challengeTier}, MT5: ${manualLogin}`);
                break;
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin Transaction Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
