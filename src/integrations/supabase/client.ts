
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqqzikhfinymvlzipwvr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcXppa2hmaW55bXZsemlwd3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjA3NzAsImV4cCI6MjA2MjczNjc3MH0.K56rQoBWiIPHqRYvQetRUdZv_blEU4nzk501ZZ8fO2Q";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add RPC function to check for admin/staff role directly
export const hasRole = async (roles: string[]): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;
    return roles.includes(data.role);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Safe RPC function for email retrieval that handles type casting
export const getUserEmail = async (userId: string): Promise<string | null> => {
  try {
    // Type assertion for the entire RPC call to bypass TypeScript constraints
    const { data, error } = await (supabase.rpc as any)('get_user_email', { user_id: userId });

    if (error) throw error;
    // Type assertion to handle the unknown return type
    return data as string;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};
