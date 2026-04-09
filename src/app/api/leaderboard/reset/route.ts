import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateBots } from "@/lib/utils/botSchedule";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const CRON_SECRET = process.env.CRON_SECRET || "";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
);

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getPreviousMonth(): string {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request: Request) {
    try {
        // Auth: either CRON_SECRET (for Vercel cron) or admin user
        const authHeader = request.headers.get("authorization");
        const isCron = authHeader === `Bearer ${CRON_SECRET}` && CRON_SECRET;

        // Ensure ONLY crons or Admin users can reset the leaderboard
        if (!isCron) {
            const supabase = await createServerClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                return NextResponse.json({ error: "No autorizado" }, { status: 403 });
            }
        }

        const currentMonth = getCurrentMonth();
        const previousMonth = getPreviousMonth();

        console.log(`🔄 Leaderboard reset: ${previousMonth} → ${currentMonth}`);

        // ─── Step 1: Get Top 10 from previous/current month (before reset) ───
        const { data: allTraders } = await supabaseAdmin
            .from("leaderboard_traders")
            .select("*")
            .or(`generation_month.eq.${previousMonth},generation_month.eq.${currentMonth},is_fake.eq.false`)
            .order("total_profit", { ascending: false });

        const top10 = (allTraders || []).slice(0, 10);
        console.log(`🏆 Top 10 saved: ${top10.map(t => t.username).join(", ")}`);

        // ─── Step 2: Delete ALL old bots (any month) ───
        const { error: deleteError } = await supabaseAdmin
            .from("leaderboard_traders")
            .delete()
            .eq("is_fake", true);

        if (deleteError) {
            console.error("Error deleting old bots:", deleteError);
        }

        // ─── Step 3: Reset real users' monthly profit to 0 ───
        const { error: resetError } = await supabaseAdmin
            .from("leaderboard_traders")
            .update({ total_profit: 0 })
            .eq("is_fake", false);

        if (resetError) {
            console.error("Error resetting real users:", resetError);
        }

        // ─── Step 4: Generate ~200 new bots for the current month ───
        const newBots = generateBots(200, currentMonth);

        // Insert in batches of 50
        for (let i = 0; i < newBots.length; i += 50) {
            const batch = newBots.slice(i, i + 50);
            const { error: insertError } = await supabaseAdmin
                .from("leaderboard_traders")
                .insert(batch);

            if (insertError) {
                console.error(`Error inserting bot batch ${i}:`, insertError);
            }
        }

        console.log(`🤖 Generated ${newBots.length} new bots for ${currentMonth}`);

        // ─── Step 5: Evaluate Historic ranks for Top 10 to preserve permanent achievements ───
        const top10WithRanks = top10.map((t, index) => {
            let historicRank = t.rank_title || "novato";
            const currentRanks = ["novato", "warrior", "elite", "leyenda"];
            
            // Map historic rank to weight index
            let currentWeight = currentRanks.indexOf(historicRank);
            if (currentWeight === -1) currentWeight = 0; // default to novato
            
            // New possible rank based on Top 10 finish
            let newWeight = 0;
            if (index < 3) newWeight = 3; // "leyenda"
            else if (index < 10) newWeight = 2; // "elite"
            
            // Keep the maximum rank achieved
            const finalRank = currentRanks[Math.max(currentWeight, newWeight)];

            return { ...t, newHistoricRank: finalRank };
        });

        // Re-insert Top 10 carry-over as new bots for this month
        const carryOvers = top10WithRanks
            .filter(t => t.is_fake) // Only bots; real users already exist with profit=0
            .map(t => ({
                username: t.username,
                checkpoint_level: 1,
                total_profit: Math.round(100 + Math.random() * 300), // Small head start $100-400
                win_rate: t.win_rate,
                risk_reward: t.risk_reward,
                account_size: t.account_size,
                trades_count: Math.round(5 + Math.random() * 20),
                rank_title: t.newHistoricRank, // PRESERVED/UPGRADED RANK
                is_fake: true,
                country_code: t.country_code,
                generation_month: currentMonth,
            }));

        if (carryOvers.length > 0) {
            const { error: carryError } = await supabaseAdmin
                .from("leaderboard_traders")
                .insert(carryOvers);

            if (carryError) {
                console.error("Error inserting carry-overs:", carryError);
            }
            console.log(`🏅 Carried over ${carryOvers.length} top bots from last month`);
        }

        // Give real users from top 10 a small head start and their preserved rank
        for (let i = 0; i < top10WithRanks.length; i++) {
            const t = top10WithRanks[i];
            if (t.is_fake) continue;

            // 1. Update leaderboard entry
            await supabaseAdmin
                .from("leaderboard_traders")
                .update({ 
                    total_profit: Math.round(50 + Math.random() * 200),
                    rank_title: t.newHistoricRank // PRESERVED/UPGRADED RANK
                })
                .eq("id", t.id);

            // 2. Permanently update the 'users' table so their dashboard preserves the badge (Elite/Legend)
            // If they were top 3, increment top_three_finishes. If top 10, increment top_ten_finishes.
            const { data: userData } = await supabaseAdmin
                .from("users")
                .select("top_ten_finishes, top_three_finishes")
                .eq("id", t.user_id)
                .single();

            if (userData) {
                const isTop3 = i < 3;
                await supabaseAdmin
                    .from("users")
                    .update({
                        top_three_finishes: isTop3 ? (userData.top_three_finishes || 0) + 1 : userData.top_three_finishes,
                        top_ten_finishes: (userData.top_ten_finishes || 0) + 1
                    })
                    .eq("id", t.user_id);
            }

            console.log(`🏅 Real user carry-over: ${t.username} → head start & rank: ${t.newHistoricRank}`);
        }

        return NextResponse.json({
            success: true,
            month: currentMonth,
            botsGenerated: newBots.length,
            carryOvers: carryOvers.length,
            realUsersReset: (allTraders || []).filter(t => !t.is_fake).length,
        });

    } catch (error) {
        console.error("Leaderboard Reset Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
