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

const CHALLENGE_PRICES: Record<string, { price: number; expressPrice: number; accountSize: number }> = {
    micro: { price: 35, expressPrice: 57, accountSize: 5000 },
    starter: { price: 56, expressPrice: 98, accountSize: 10000 },
    pro: { price: 135, expressPrice: 215, accountSize: 25000 },
    elite: { price: 225, expressPrice: 315, accountSize: 50000 },
    legend: { price: 389, expressPrice: 549, accountSize: 100000 },
    apex: { price: 789, expressPrice: 1089, accountSize: 200000 },
};

export async function POST(request: Request) {
    try {
        const { challengeTier, challengeType, userId, userEmail, addonRawSpread, addonZeroCommission, addonWeeklyPayouts, addonScalingX2, addonSplit90, addonSplit100 } = await request.json();

        if (!challengeTier || !userId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const tierConfig = CHALLENGE_PRICES[challengeTier];
        if (!tierConfig) {
            return NextResponse.json({ error: "Invalid challenge tier" }, { status: 400 });
        }

        const basePrice = challengeType === "express_1phase" ? tierConfig.expressPrice : tierConfig.price;

        // Calculate final price with Add-ons
        const finalPrice = Number((basePrice * (1 + (addonRawSpread ? 0.10 : 0) + (addonZeroCommission ? 0.10 : 0) + (addonWeeklyPayouts ? 0.15 : 0) + (addonScalingX2 ? 0.25 : 0) + (addonSplit90 ? 0.10 : 0) + (addonSplit100 ? 0.20 : 0))).toFixed(2));

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
                ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.funded-spread.com'}/api/payments/webhook`,
                success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.funded-spread.com'}/checkout?status=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.funded-spread.com'}/checkout?status=cancel`,
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
                has_raw_spread: Boolean(addonRawSpread),
                has_zero_commission: Boolean(addonZeroCommission),
                has_weekly_payouts: Boolean(addonWeeklyPayouts),
                has_scaling_x2: Boolean(addonScalingX2),
                addon_split_90: Boolean(addonSplit90),
                addon_split_100: Boolean(addonSplit100),
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
