const SUPABASE_URL = "https://gsbiwgnltvbpyexizmdo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzYml3Z25sdHZicHlleGl6bWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzMxNzUsImV4cCI6MjA3NTAwOTE3NX0.fGOzAbd3MYb27X_F1Zak7zV0EBt86fPwVKyVxr3k0Nk";

// Initialize Supabase client with auto refresh token setting// Initialize Supabase client

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
