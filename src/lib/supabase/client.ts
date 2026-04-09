import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
    if (client) return client;

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return client;
}

/** Convenience alias — some pages import as `supabase` directly */
export const supabase = createClient();

/**
 * Read the auth session directly from localStorage — 0ms, no Web Locks, no network.
 * Supabase stores it at `sb-{projectRef}-auth-token`.
 */
function getSessionFromStorage(): { user: any } | null {
    if (typeof window === "undefined") return null;
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const projectRef = url.replace("https://", "").split(".")[0];
        const storageKey = `sb-${projectRef}-auth-token`;
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.user) return { user: parsed.user };
        return null;
    } catch {
        return null;
    }
}

/**
 * getSafeSession() — Ultra-fast auth check:
 *
 * 1. Read from localStorage DIRECTLY (0ms, no Web Locks, no network)
 * 2. If localStorage has a session, return it immediately
 * 3. Only if localStorage is empty, try getUser() as fallback (network call)
 *
 * Token refresh is handled automatically by the Supabase SDK on API calls.
 */
export async function getSafeSession() {
    // Step 1: Instant read from localStorage
    const stored = getSessionFromStorage();
    if (stored?.user) {
        return { data: { session: { user: stored.user } }, error: null };
    }

    // Step 2: No stored session — try network call as fallback
    try {
        const { data: { user }, error } = await Promise.race([
            createClient().auth.getUser(),
            new Promise<{ data: { user: null }; error: null }>((resolve) =>
                setTimeout(() => resolve({ data: { user: null }, error: null }), 4000)
            ),
        ]);

        if (user) {
            return { data: { session: { user } }, error: null };
        }
        return { data: { session: null }, error };
    } catch (err) {
        return { data: { session: null }, error: err };
    }
}

/**
 * Check if an impersonation cookie exists — call BEFORE fetching impersonation data.
 * This prevents unnecessary API calls for non-admin users.
 */
export function hasImpersonationCookie(): boolean {
    if (typeof document === "undefined") return false;
    return document.cookie.split("; ").some(row => row.startsWith("impersonate_user_id="));
}
