import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Removemos el /rest/v1/ si el usuario lo puso por error
const cleanUrl = supabaseUrl.replace('/rest/v1/', '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(cleanUrl, supabaseAnonKey);
