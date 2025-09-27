import { supa } from '../supa.js';

export const listItems = async () =>
  supa.from('items').select('*').order('created_at', { ascending: true });

export const createItem = async (payload) => supa.from('items').insert([payload]).select().single();
