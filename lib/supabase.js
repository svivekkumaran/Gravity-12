// Supabase Client Configuration
// Using global supabase from CDN (loaded in index.html)

// Get Supabase credentials from environment variables (will be undefined in browser)
// For browser, we'll need to set these directly or use a config file
const supabaseUrl = 'https://vnzjajcvvprypawihngc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuemphamN2dnByeXBhd2lobmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjUxNzMsImV4cCI6MjA4MDAwMTE3M30.sOy2LIoxlf2DH_qDlB3aUj2qvKSFPgXO3b3KgJQuoZU';

// Create Supabase client using the global supabase object from CDN
export const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseAnonKey) : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabase !== null && supabaseUrl && supabaseAnonKey;
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
    console.error('Supabase error:', error);
    if (error.message) {
        throw new Error(error.message);
    }
    throw error;
};
