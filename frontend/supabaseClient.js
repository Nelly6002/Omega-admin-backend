const SUPABASE_URL = "https://nhptfcagmaphffiwjdxd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocHRmY2FnbWFwaGZmaXdqZHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODA5MjksImV4cCI6MjA3NTA1NjkyOX0.0GhQ_kYkBwRbwb_zcyuCMLXBAy5PhKzsYoep0wyOGTg";

// Initialize Supabase client with auto refresh token setting// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
