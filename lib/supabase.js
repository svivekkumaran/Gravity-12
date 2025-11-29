// Supabase Client Configuration
// This file initializes the Supabase client for database operations

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables or fall back to empty strings
// In production, these will be set in Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
    console.error('Supabase error:', error);
    if (error.message) {
        throw new Error(error.message);
    }
    throw error;
};
