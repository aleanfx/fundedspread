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

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1";

const CHALLENGE_PRICES: Record<string, { price: number; accountSize: number }> = {
    micro: { price: 39, accountSize: 5000 },
    starter: { price: 49, accountSize: 10000 },
    pro: { price: 99, accountSize: 25000 },
    elite: { price: 199, accountSize: 50000 },
    legend: { price: 499, accountSize: 100000 },
    titan: { price: 999, accountSize: 200000 },
};

export async function POST(request: Request) {
    try {
        const { challengeTier, challengeType, userId, userEmail, hasRawSpread, hasZeroCommission, hasWeeklyPayouts, hasScalingX2 } = await request.json();

        if (!challengeTier || !userId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const tierConfig = CHALLENGE_PRICES[challengeTier];
        if (!tierConfig) {
            return NextResponse.json({ error: "Invalid challenge tier" }, { status: 400 });
        }

        const basePrice = challengeType === "express_1phase" ? Math.round(tierConfig.price * 1.2) : tierConfig.price;

        // Calculate final price with Add-ons
        const finalPrice = Number((basePrice * (1 + (hasRawSpread ? 0.1 : 0) + (hasZeroCommission ? 0.15 : 0) + (hasWeeklyPayouts ? 0.2 : 0) + (hasScalingX2 ? 0.2 : 0))).toFixed(2));

        // 1. Create invoice on NOWPayments
        const invoiceRes = await fetch(`${NOWPAYMENTS_API}/invoice`, {
            method: "POST",
            headers: {
                "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                price_amount: finalPrice,
                price_currency: "usd",
                order_id: `challenge_${challengeTier}_${userId.slice(0, 8)}_${Date.now()}`,
                order_description: `Funded Spread ${challengeTier.toUpperCase()} Challenge - $${tierConfig.accountSize.toLocaleString()} Account with Add-ons`,
                ipn_callback_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com' : 'http://localhost:3000'}/api/payments/webhook`,
                success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?status=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?status=cancel`,
            }),
        });

        if (!invoiceRes.ok) {
            const errData = await invoiceRes.text();
            console.error("NOWPayments invoice error:", errData);
            return NextResponse.json({ error: "Failed to create payment invoice", details: errData }, { status: 500 });
        }

        const invoiceData = await invoiceRes.json();

        // 2. Save transaction in DB
        const { error: dbError } = await supabaseAdmin
            .from("challenge_transactions")
            .insert({
                user_id: userId,
                user_email: userEmail || null,
                challenge_tier: challengeTier,
                account_size: tierConfig.accountSize,
                price: finalPrice,
                status: "pending",
                payment_method: "crypto",
                nowpayments_invoice_id: String(invoiceData.id),
                has_raw_spread: Boolean(hasRawSpread),
                has_zero_commission: Boolean(hasZeroCommission),
                has_weekly_payouts: Boolean(hasWeeklyPayouts),
                has_scaling_x2: Boolean(hasScalingX2),
                challenge_type: challengeType || "classic_2phase",
            });

        if (dbError) {
            console.error("DB insert error:", dbError);
            // Don't block — still return the invoice URL
        }

        return NextResponse.json({
            success: true,
            invoice_url: invoiceData.invoice_url,
            invoice_id: invoiceData.id,
        });

    } catch (error) {
        console.error("Create Invoice Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
