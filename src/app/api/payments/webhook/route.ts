import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// SECURITY: Require Service Role Key — fail explicitly if missing
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
);

const CHALLENGE_SIZES: Record<string, number> = {
    micro: 5000,
    starter: 10000,
    pro: 25000,
    elite: 50000,
    legend: 100000,
    titan: 200000,
};

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate IPN signature from NOWPayments
        const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET!;
        const hmac = crypto.createHmac("sha512", ipnSecret);

        // NOWPayments signs the sorted JSON body
        const sortedBody = JSON.stringify(sortObject(body));
        const signature = hmac.update(sortedBody).digest("hex");

        const receivedSig = request.headers.get("x-nowpayments-sig");
        if (receivedSig !== signature) {
            console.error("IPN signature mismatch!", { received: receivedSig, expected: signature });
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        console.log("IPN received:", JSON.stringify(body, null, 2));

        const { payment_status, invoice_id, order_id } = body;

        // Only process finished payments
        if (payment_status === "finished" || payment_status === "confirmed") {
            // 1. Update challenge_transactions status to 'paid'
            const { data: transactions, error: fetchError } = await supabaseAdmin
                .from("challenge_transactions")
                .select("*")
                .eq("nowpayments_invoice_id", String(invoice_id))
                .limit(1);

            if (fetchError || !transactions || transactions.length === 0) {
                console.error("Transaction not found for invoice:", invoice_id);
                return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
            }

            const transaction = transactions[0];

            // 2. Mark as paid
            await supabaseAdmin
                .from("challenge_transactions")
                .update({ status: "paid" })
                .eq("id", transaction.id);

            // 3. Create the trader's MT5 account (activate the challenge)
            const accountSize = CHALLENGE_SIZES[transaction.challenge_tier] || 10000;
            const challengeType = transaction.challenge_type || "classic_2phase";

            // Calculate drawdown limits based on challenge type and tier
            let dailyDDPct = 4; // Default for Classic
            let maxDDPct = 10;  // Default for Classic
            let profitTargetPct = 8; // Default for Classic Phase 1

            if (challengeType === "express_1phase") {
                dailyDDPct = 3;
                maxDDPct = 5;
                profitTargetPct = 10;
            }

            // Determine Profit Split
            let profitSplitPct = 80; // Base Split
            if (transaction.addon_split_100) {
                profitSplitPct = 90;
            } else if (transaction.addon_split_90) {
                profitSplitPct = 85;
            }

            const { error: accountError } = await supabaseAdmin
                .from("mt5_accounts")
                .insert({
                    user_id: transaction.user_id,
                    initial_balance: accountSize,
                    current_balance: 0,
                    current_equity: 0,
                    daily_initial_balance: accountSize,
                    is_active: false,
                    account_status: "pending_creation",
                    challenge_tier: transaction.challenge_tier,
                    challenge_type: challengeType,
                    challenge_phase: 1,
                    profit_target_pct: profitTargetPct,
                    daily_drawdown_pct: dailyDDPct,
                    max_drawdown_pct: maxDDPct,
                    profit_split_pct: profitSplitPct,
                    can_level_up: false,
                    has_raw_spread: transaction.has_raw_spread || false,
                    has_zero_commission: transaction.has_zero_commission || false,
                    has_weekly_payouts: transaction.has_weekly_payouts || false,
                    has_scaling_x2: transaction.has_scaling_x2 || false,
                    addon_split_90: transaction.addon_split_90 || false,
                    addon_split_100: transaction.addon_split_100 || false,
                });

            if (accountError) {
                console.error("Error creating mt5_account:", accountError);
            }

            // Transaction stays at 'paid' — admin will review, assign MT5 credentials, and activate manually
            console.log(`✅ Payment confirmed for user ${transaction.user_id}: ${transaction.challenge_tier} ($${accountSize}) — awaiting admin activation`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Helper: sort object keys alphabetically (required by NOWPayments HMAC)
function sortObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);
    return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => {
            result[key] = sortObject(obj[key]);
            return result;
        }, {});
}
