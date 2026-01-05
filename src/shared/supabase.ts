import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  if (!url || !key) {
    throw new Error(
      'Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  client = createClient(url, key);
  return client;
}
