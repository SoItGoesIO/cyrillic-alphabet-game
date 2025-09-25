import { rpc } from '../db/rpc.js';

export async function completeItemAndAwardXP(itemId) {
  const { data, error } = await rpc('complete_item', { p_item_id: itemId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { totalXP: row.new_total_xp, level: row.new_level };
}