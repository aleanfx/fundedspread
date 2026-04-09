import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

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
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        // Validate admin - Fast check first
        const isAdminEmail = user.email === process.env.ADMIN_EMAIL;
        
        // Only query DB if email doesn't match
        if (!isAdminEmail) {
            const { data: adminData } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
            if (!adminData?.is_admin) {
                return NextResponse.json({ error: "No autorizado" }, { status: 403 });
            }
        }

        const cookieStore = await cookies();
        const targetUserId = cookieStore.get('impersonate_user_id')?.value;

        if (!targetUserId) {
            return NextResponse.json({ 
                isImpersonating: false,
                user: null, 
                userData: null, 
                accountsData: [], 
                transactionsData: [] 
            });
        }

        // Parallelize all data fetching for the target user
        const [authDataRes, userDataRes, accountsDataRes, transactionsDataRes] = await Promise.all([
            supabaseAdmin.auth.admin.getUserById(targetUserId),
            supabaseAdmin.from("users").select("*").eq("id", targetUserId).single(),
            supabaseAdmin.from("mt5_accounts").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }),
            supabaseAdmin.from("challenge_transactions").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false })
        ]);

        if (authDataRes.error || !authDataRes.data.user) {
            return NextResponse.json({ error: "Usuario no encontrado en Auth" }, { status: 404 });
        }
        
        const impersonatedAuthUser = authDataRes.data.user;

        return NextResponse.json({
            user: impersonatedAuthUser,
            userData: userDataRes.data || null,
            accountsData: accountsDataRes.data || [],
            transactionsData: transactionsDataRes.data || [],
        });

    } catch (err) {
        console.error("Impersonate Data Fetch Error:", err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

