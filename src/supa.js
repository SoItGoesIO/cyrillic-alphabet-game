import { readEnv } from './env.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = readEnv();
export const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);