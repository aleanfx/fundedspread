// Barrel re-export so pages can `import { supabase, getSafeSession } from "@/lib/supabase"`
export { createClient, supabase, getSafeSession, hasImpersonationCookie } from "./client";
