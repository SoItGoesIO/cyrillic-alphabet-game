import { supa } from '../supa.js';

export async function fetchProfile() {
  const { data, error } = await supa.from('profiles').select('total_xp, level').single();
  if (error) return { total_xp: 0, level: 1 };
  return data;
}