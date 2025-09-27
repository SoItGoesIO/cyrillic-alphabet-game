import { rpc } from '../db/rpc.js';
import { supa } from '../supa.js';

export async function completeLetter(letter) {
  const { data, error } = await rpc('complete_letter', { p_letter: letter });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    totalXP: row?.new_total_xp ?? 0,
    level: row?.new_level ?? 1,
    reward: row?.reward ?? null,
    itemId: row?.item_id ?? null,
  };
}

export async function initializeCyrillicLetters() {
  const { data: user } = await supa.auth.getUser();
  if (!user?.user?.id) throw new Error('Not authenticated');

  const { data, error } = await rpc('initialize_cyrillic_letters', {
    p_user_id: user.user.id
  });
  if (error) throw error;
  return data;
}

export async function getLetterProgress() {
  const { data, error } = await rpc('get_letter_progress', {});
  if (error) throw error;
  return data || [];
}

export function getLetterXP(letter) {
  const xpMap = {
    // Easy letters (similar to English) - 5 XP
    'А': 5, 'Е': 5, 'К': 5, 'М': 5, 'О': 5, 'Т': 5,
    // Medium letters (moderate difference) - 10 XP
    'Б': 10, 'В': 10, 'Г': 10, 'Д': 10, 'И': 10, 'Л': 10, 'Н': 10, 'П': 10, 'Р': 10, 'С': 10, 'У': 10, 'Ф': 10,
    // Hard letters (very different/unique sounds) - 15 XP
    'Ж': 15, 'З': 15, 'Й': 15, 'Ц': 15, 'Ч': 15, 'Ш': 15, 'Щ': 15, 'Ы': 15, 'Э': 15, 'Ю': 15, 'Я': 15,
    // Very hard letters (signs and complex sounds) - 20 XP
    'Ё': 20, 'Х': 20, 'Ъ': 20, 'Ь': 20
  };
  return xpMap[letter] || 10;
}