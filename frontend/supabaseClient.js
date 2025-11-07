// Supabase client setup// Supabase client setup

const SUPABASE_URL = "https://nhptfcagmaphffiwjdxd.supabase.co";
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocHRmY2FnbWFwaGZmaXdqZHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNDU5MjksImV4cCI6MjAxNDgyMTkyOX0.J7T76m4wJnGwT9_93KHNL5yF8ttHmS8cnOw7zLywUR4';



// Initialize Supabase client with auto refresh token setting// Initialize Supabase client

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {

    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});