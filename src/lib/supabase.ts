import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: any) => 
  typeof url === 'string' && 
  url.startsWith('http') && 
  url !== 'undefined' && 
  url !== 'null';

const isValidKey = (key: any) => 
  typeof key === 'string' && 
  key.length > 10 && 
  key !== 'undefined' && 
  key !== 'null';

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://sgqtqzmnapsaandcmvrs.supabase.co';
const supabaseAnonKey = isValidKey(rawKey) ? rawKey : 'sb_publishable_Kkw3fAYanLJ1rAaRqAC7Tg_nP37T6e0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
