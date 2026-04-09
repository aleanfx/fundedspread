import { createClient, getSafeSession as getSafe } from "./supabase/client";

// Re-export the singleton instance for legacy compatibility
export const supabase = createClient();
export const getSafeSession = getSafe;
