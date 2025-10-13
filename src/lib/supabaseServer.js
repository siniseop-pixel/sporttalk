// src/lib/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

let _server = null;

export function getServerClient() {
  if (_server) return _server;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null; // 빌드 시 터지지 않도록 throw 대신 null
  }

  _server = createClient(url, key);
  return _server;
}
