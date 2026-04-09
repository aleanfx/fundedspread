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
        const { userId, action } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        switch (action) {
            case "delete_user": {
                // 1. Delete related mt5_accounts (and their daily_snapshots via cascade)
                await supabaseAdmin
                    .from("mt5_accounts")
                    .delete()
                    .eq("user_id", userId);

                // 2. Delete challenge_transactions
                await supabaseAdmin
                    .from("challenge_transactions")
                    .delete()
                    .eq("user_id", userId);

                // 3. Delete withdrawal_requests
                await supabaseAdmin
                    .from("withdrawal_requests")
                    .delete()
                    .eq("user_id", userId);

                // 4. Delete from users table
                await supabaseAdmin
                    .from("users")
                    .delete()
                    .eq("id", userId);

                // 5. Delete from auth.users (Supabase Admin API)
                await supabaseAdmin.auth.admin.deleteUser(userId);

                console.log(`🗑️ Admin deleted user ${userId} and all related data`);
                break;
            }

            case "update_profile": {
                const { updates } = body;
                
                if (!updates || typeof updates !== "object") {
                    return NextResponse.json({ error: "Faltan datos de actualización" }, { status: 400 });
                }

                // Only allow these fields to be updated
                const allowedFields = [
                    "username", "avatar_url", "total_withdrawals", 
                    "top_three_finishes", "top_ten_finishes", 
                    "highest_rank", "is_rank_locked", "xp", 
                    "account_balance", "is_admin", "phases_passed", "is_funded"
                ];
                
                const sanitized: Record<string, any> = {};
                for (const key of allowedFields) {
                    if (updates[key] !== undefined) {
                        sanitized[key] = updates[key];
                    }
                }

                if (Object.keys(sanitized).length === 0) {
                    return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
                }

                const { error: updateError } = await supabaseAdmin
                    .from("users")
                    .update(sanitized)
                    .eq("id", userId);

                if (updateError) {
                    console.error("Error updating user profile:", updateError);
                    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
                }

                console.log(`✏️ Admin updated profile for user ${userId}:`, Object.keys(sanitized));
                break;
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin User Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
