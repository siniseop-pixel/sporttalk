// src/lib/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

let _server = null;

export function getServerClient() {
  if (_server) return _server;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // ❗ notFound로 숨지 말고 에러를 던져서 원인 보이게
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (server env)');
  }

  _server = createClient(url, key);
  return _server;
}
