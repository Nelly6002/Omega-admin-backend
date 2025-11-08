const SUPABASE_URL = "https://nhptfcagmaphffiwjdxd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocHRmY2FnbWFwaGZmaXdqZHhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ4MDkyOSwiZXhwIjoyMDc1MDU2OTI5fQ.AmqHbkFZHXGCJseFvxh17fcf6_Ij4QI1YyP4XkFr2rg";

// Initialize Supabase client with auto refresh token setting// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
