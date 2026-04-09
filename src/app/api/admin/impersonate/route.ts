import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        // Validate admin
        const { data: userData } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
        if (!userData?.is_admin && user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const { userId, targetUserId, action } = body;
        const finalUserId = userId || targetUserId;
        const cookieStore = await cookies();

        if (action === "start") {
            if (!finalUserId) return NextResponse.json({ error: "Missing Target ID" }, { status: 400 });
            
            // Set cookie for 24 hours
            cookieStore.set('impersonate_user_id', finalUserId, {
                httpOnly: false, // Accessible from client js to read easily if needed
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24
            });

            return NextResponse.json({ success: true, message: `Impersonating ${targetUserId}` });
        }

        if (action === "stop") {
            cookieStore.delete('impersonate_user_id');
            return NextResponse.json({ success: true, message: "Impersonation stopped" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        console.error("Impersonate API Error:", err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
