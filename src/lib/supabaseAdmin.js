// src/lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

let _admin = null;
export function getSupabaseAdmin() {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  _admin = createClient(url, key);
  return _admin;
}
