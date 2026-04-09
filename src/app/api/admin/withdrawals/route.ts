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
        // 1. Verify admin
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

        const { id, action, txHash, notes } = await request.json();

        if (!id || !action) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        // 2. Fetch the withdrawal request
        const { data: withdrawal, error: fetchError } = await supabaseAdmin
            .from("withdrawal_requests")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !withdrawal) {
            return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        // 3. Handle actions
        switch (action) {
            case "approve": {
                if (withdrawal.status !== "pending") {
                    return NextResponse.json({ error: "Solo se pueden aprobar solicitudes pendientes" }, { status: 400 });
                }
                await supabaseAdmin
                    .from("withdrawal_requests")
                    .update({
                        status: "approved",
                        processed_at: new Date().toISOString(),
                    })
                    .eq("id", id);

                console.log(`✅ Admin approved withdrawal ${id}`);
                break;
            }

            case "complete": {
                if (!["pending", "approved"].includes(withdrawal.status)) {
                    return NextResponse.json({ error: "Solo se pueden completar solicitudes aprobadas" }, { status: 400 });
                }
                if (!txHash) {
                    return NextResponse.json({ error: "Se requiere el hash de transacción" }, { status: 400 });
                }
                await supabaseAdmin
                    .from("withdrawal_requests")
                    .update({
                        status: "completed",
                        tx_hash: txHash,
                        completed_at: new Date().toISOString(),
                        processed_at: withdrawal.processed_at || new Date().toISOString(),
                    })
                    .eq("id", id);

                // Update last_withdrawal_at on the account
                await supabaseAdmin
                    .from("mt5_accounts")
                    .update({ last_withdrawal_at: new Date().toISOString() })
                    .eq("id", withdrawal.account_id);

                // Update total_withdrawals and auto-upgrade rank
                const withdrawalAmount = Number(withdrawal.user_amount) || 0;
                if (withdrawalAmount > 0 && withdrawal.user_id) {
                    const { data: userRow } = await supabaseAdmin
                        .from("users")
                        .select("total_withdrawals, highest_rank")
                        .eq("id", withdrawal.user_id)
                        .single();

                    const currentTotal = Number(userRow?.total_withdrawals || 0);
                    const newTotal = currentTotal + withdrawalAmount;
                    const currentHighest = userRow?.highest_rank || "unranked";

                    const rankUpdates: Record<string, unknown> = {
                        total_withdrawals: newTotal,
                    };

                    // Auto-upgrade rank based on withdrawal thresholds
                    const RANK_ORDER = ["unranked", "novato", "warrior", "elite", "legend"];
                    const currentIdx = RANK_ORDER.indexOf(currentHighest);

                    if (newTotal >= 3000 && currentIdx < RANK_ORDER.indexOf("elite")) {
                        rankUpdates.highest_rank = "elite";
                    } else if (newTotal >= 1000 && currentIdx < RANK_ORDER.indexOf("warrior")) {
                        rankUpdates.highest_rank = "warrior";
                    }

                    await supabaseAdmin
                        .from("users")
                        .update(rankUpdates)
                        .eq("id", withdrawal.user_id);

                    console.log(`🏅 Updated user ${withdrawal.user_id} total_withdrawals: $${newTotal}`, rankUpdates.highest_rank ? `→ Rank: ${rankUpdates.highest_rank}` : "");
                }

                console.log(`✅ Admin completed withdrawal ${id}, tx: ${txHash}`);
                break;
            }

            case "reject": {
                if (withdrawal.status !== "pending") {
                    return NextResponse.json({ error: "Solo se pueden rechazar solicitudes pendientes" }, { status: 400 });
                }
                await supabaseAdmin
                    .from("withdrawal_requests")
                    .update({
                        status: "rejected",
                        admin_notes: notes || "Rechazado por el administrador",
                        processed_at: new Date().toISOString(),
                    })
                    .eq("id", id);

                console.log(`❌ Admin rejected withdrawal ${id}: ${notes}`);
                break;
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin Withdrawal Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
