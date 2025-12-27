import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables before reading SUPABASE_* values.
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  // Keep the client undefined when credentials are absent; the server will log during startup.
  console.warn('Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabase = url && key ? createClient(url, key) : null;

console.info('[supabase] configured:', {
  hasUrl: Boolean(url),
  hasKey: Boolean(key),
  clientReady: Boolean(supabase)
});
