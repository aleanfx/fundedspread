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
        const { action } = body;

        switch (action) {
            case "edit_user_profit": {
                const { userId, newProfit, newRank, isLocked } = body;
                
                if (!userId || newProfit === undefined) {
                    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
                }

                const profitNum = Number(newProfit);
                let rankTitle = newRank;
                
                // If no manual rank provided, calculate it based on profit
                if (!rankTitle) {
                  rankTitle = profitNum >= 3000 ? "elite" : profitNum >= 1000 ? "warrior" : "novato";
                }
                
                const checkpointLevel = rankTitle === "legend" ? 4 : rankTitle === "elite" ? 3 : rankTitle === "warrior" ? 2 : 1;

                // Check if user has a leaderboard entry
                const { data: existing } = await supabaseAdmin
                    .from("leaderboard_traders")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("is_fake", false)
                    .single();

                if (existing) {
                    await supabaseAdmin
                        .from("leaderboard_traders")
                        .update({ 
                            total_profit: profitNum, 
                            rank_title: rankTitle, 
                            checkpoint_level: checkpointLevel 
                        })
                        .eq("id", existing.id);
                } else {
                    // Fetch user profile to create entry
                    const { data: profile } = await supabaseAdmin
                        .from("users")
                        .select("username, email")
                        .eq("id", userId)
                        .single();

                    if (!profile) {
                        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
                    }

                    const now = new Date();
                    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                    await supabaseAdmin
                        .from("leaderboard_traders")
                        .insert({
                            username: profile.username || profile.email?.split("@")[0] || "Trader",
                            user_id: userId,
                            is_fake: false,
                            total_profit: profitNum,
                            win_rate: 0,
                            risk_reward: 0,
                            account_size: 0,
                            trades_count: 0,
                            checkpoint_level: checkpointLevel,
                            rank_title: rankTitle,
                            generation_month: currentMonth,
                        });
                }

                // IMPORTANT: Permanently update the 'users' table to reflect this rank if it's locked
                // or just to keep the record of 'highest_rank'
                await supabaseAdmin
                    .from("users")
                    .update({
                        highest_rank: rankTitle,
                        is_rank_locked: isLocked ?? false
                    })
                    .eq("id", userId);

                console.log(`✏️ Admin updated user ${userId} leaderboard profit to $${profitNum}`);
                break;
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin Leaderboard Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
