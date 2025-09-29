import { supa } from '../supa.js';

export class GingkoDb {
  // Trees
  static async createTree(title = 'Untitled Document', description = '') {
    const { data, error } = await supa
      .from('trees')
      .insert({ title, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTrees() {
    const { data, error } = await supa
      .from('trees')
      .select('*')
      .eq('archived', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTree(treeId) {
    const { data, error } = await supa
      .from('trees')
      .select('*')
      .eq('id', treeId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTree(treeId, updates) {
    const { data, error } = await supa
      .from('trees')
      .update(updates)
      .eq('id', treeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTree(treeId) {
    const { error } = await supa
      .from('trees')
      .delete()
      .eq('id', treeId);

    if (error) throw error;
  }

  // Cards
  static async createCard(treeId, parentId = null, content = '', position = null) {
    const orderIndex = position !== null ? position : await this.getNextOrderIndex(treeId, parentId);

    const { data, error } = await supa
      .from('cards')
      .insert({
        tree_id: treeId,
        parent_id: parentId,
        content_markdown: content,
        order_index: orderIndex
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTreeCards(treeId) {
    const { data, error } = await supa
      .from('cards')
      .select('*')
      .eq('tree_id', treeId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  }

  static async updateCard(cardId, updates) {
    const { data, error } = await supa
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCard(cardId) {
    const { error } = await supa
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  }

  static async moveCard(cardId, newParentId = null, newPosition = null) {
    const { data: card } = await supa
      .from('cards')
      .select('tree_id')
      .eq('id', cardId)
      .single();

    if (!card) throw new Error('Card not found');

    const orderIndex = newPosition !== null ? newPosition :
      await this.getNextOrderIndex(card.tree_id, newParentId);

    const { data, error } = await supa
      .from('cards')
      .update({
        parent_id: newParentId,
        order_index: orderIndex
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getNextOrderIndex(treeId, parentId = null) {
    const { data, error } = await supa
      .from('cards')
      .select('order_index')
      .eq('tree_id', treeId)
      .is('parent_id', parentId)
      .order('order_index', { ascending: false })
      .limit(1);

    if (error) throw error;
    return (data && data.length > 0) ? data[0].order_index + 1 : 0;
  }

  // Tree structure helpers
  static buildTreeStructure(cards) {
    const cardMap = new Map();
    const rootCards = [];

    // First pass: create map of all cards
    cards.forEach(card => {
      cardMap.set(card.id, { ...card, children: [] });
    });

    // Second pass: build parent-child relationships
    cards.forEach(card => {
      if (card.parent_id) {
        const parent = cardMap.get(card.parent_id);
        if (parent) {
          parent.children.push(cardMap.get(card.id));
        }
      } else {
        rootCards.push(cardMap.get(card.id));
      }
    });

    return rootCards;
  }

  static getCardsByDepth(cards) {
    const structure = this.buildTreeStructure(cards);
    const columns = [];

    function traverse(nodes, depth = 0) {
      if (!columns[depth]) columns[depth] = [];

      nodes.forEach(node => {
        columns[depth].push(node);
        if (node.children.length > 0) {
          traverse(node.children, depth + 1);
        }
      });
    }

    traverse(structure);
    return columns;
  }

  // Settings
  static async getUserSettings() {
    const { data, error } = await supa
      .from('gingko_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error

    // Return default settings if none exist
    return data || {
      default_export_format: 'md',
      theme: 'light',
      auto_save_enabled: true,
      auto_save_interval_seconds: 30,
      show_word_count: true
    };
  }

  static async updateUserSettings(settings) {
    const { data, error } = await supa
      .from('gingko_settings')
      .upsert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}