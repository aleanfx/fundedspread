import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ invoiceId: string }> }
) {
    try {
        const { invoiceId } = await params;

        const res = await fetch(`https://api.nowpayments.io/v1/payment/?invoiceId=${invoiceId}`, {
            headers: {
                "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
            },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Payment status error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
