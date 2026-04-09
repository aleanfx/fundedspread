import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { calculateBotDayProfit } from "@/lib/utils/botSchedule";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
);

export async function GET() {
    try {
        // Verify admin
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

        // Fetch all withdrawal requests using service role (bypass RLS)
        const { data: withdrawals } = await supabaseAdmin
            .from("withdrawal_requests")
            .select("*")
            .order("created_at", { ascending: false });

        // Fetch all mt5 accounts
        const { data: accounts } = await supabaseAdmin
            .from("mt5_accounts")
            .select("*");

        // Fetch user profiles
        const { data: profiles } = await supabaseAdmin
            .from("users")
            .select("id, email, username, avatar_url, account_balance, total_withdrawals, top_three_finishes, top_ten_finishes, highest_rank, is_rank_locked, xp, is_admin, created_at, phases_passed, is_funded");

        // Fetch challenge transactions
        const { data: transactions } = await supabaseAdmin
            .from("challenge_transactions")
            .select("*")
            .order("created_at", { ascending: false });

        // Fetch leaderboard traders for current month rankings
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const { data: leaderboardTraders } = await supabaseAdmin
            .from("leaderboard_traders")
            .select("id, user_id, username, total_profit, is_fake, generation_month")
            .or(`generation_month.eq.${currentMonth},is_fake.eq.false`);

        // Sort by dynamic profit (bots show daily-calculated profit), then total_profit, then username
        const sortedTraders = (leaderboardTraders || []).sort((a: any, b: any) => {
            const profitA = a.is_fake ? calculateBotDayProfit(a.id, a.total_profit) : a.total_profit;
            const profitB = b.is_fake ? calculateBotDayProfit(b.id, b.total_profit) : b.total_profit;
            
            if (profitB !== profitA) return profitB - profitA;
            if (b.total_profit !== a.total_profit) return b.total_profit - a.total_profit;
            return (a.username || "").localeCompare(b.username || "");
        });

        return NextResponse.json({
            withdrawals: withdrawals || [],
            accounts: accounts || [],
            profiles: profiles || [],
            transactions: transactions || [],
            leaderboardTraders: sortedTraders,
        });

    } catch (error) {
        console.error("Admin Data Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
