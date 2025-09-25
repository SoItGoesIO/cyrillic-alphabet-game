export function readEnv() {
  const el = document.getElementById('env');
  if (el) return JSON.parse(el.textContent);
  return {
    SUPABASE_URL: window.SUPABASE_URL,
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY,
  };
}