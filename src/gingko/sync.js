import { supa } from '../supa.js';

class GingkoSync {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.isInitialized = false;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GingkoWriter', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Trees store
        if (!db.objectStoreNames.contains('trees')) {
          const treesStore = db.createObjectStore('trees', { keyPath: 'id' });
          treesStore.createIndex('user_id', 'user_id');
          treesStore.createIndex('updated_at', 'updated_at');
        }

        // Cards store
        if (!db.objectStoreNames.contains('cards')) {
          const cardsStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardsStore.createIndex('tree_id', 'tree_id');
          cardsStore.createIndex('parent_id', 'parent_id');
          cardsStore.createIndex('updated_at', 'updated_at');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('type', 'type');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'user_id' });
        }
      };
    });
  }

  // Local CRUD operations with sync queue
  async localCreate(storeName, data) {
    await this.init();

    const transaction = this.db.transaction([storeName, 'sync_queue'], 'readwrite');
    const store = transaction.objectStore(storeName);
    const syncStore = transaction.objectStore('sync_queue');

    // Add to local store
    await store.add(data);

    // Add to sync queue
    await syncStore.add({
      type: 'create',
      storeName,
      data,
      timestamp: Date.now()
    });

    if (this.isOnline) {
      this.processSyncQueue();
    }

    return data;
  }

  async localUpdate(storeName, id, updates) {
    await this.init();

    const transaction = this.db.transaction([storeName, 'sync_queue'], 'readwrite');
    const store = transaction.objectStore(storeName);
    const syncStore = transaction.objectStore('sync_queue');

    // Get existing data
    const existing = await store.get(id);
    if (!existing) throw new Error('Record not found');

    // Update local store
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await store.put(updated);

    // Add to sync queue
    await syncStore.add({
      type: 'update',
      storeName,
      id,
      data: updates,
      timestamp: Date.now()
    });

    if (this.isOnline) {
      this.processSyncQueue();
    }

    return updated;
  }

  async localDelete(storeName, id) {
    await this.init();

    const transaction = this.db.transaction([storeName, 'sync_queue'], 'readwrite');
    const store = transaction.objectStore(storeName);
    const syncStore = transaction.objectStore('sync_queue');

    // Delete from local store
    await store.delete(id);

    // Add to sync queue
    await syncStore.add({
      type: 'delete',
      storeName,
      id,
      timestamp: Date.now()
    });

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async localGet(storeName, id) {
    await this.init();
    const transaction = this.db.transaction(storeName);
    const store = transaction.objectStore(storeName);
    return await store.get(id);
  }

  async localGetAll(storeName, indexName = null, value = null) {
    await this.init();
    const transaction = this.db.transaction(storeName);
    const store = transaction.objectStore(storeName);

    if (indexName && value !== null) {
      const index = store.index(indexName);
      return await index.getAll(value);
    }

    return await store.getAll();
  }

  // Sync operations
  async syncFromServer() {
    if (!this.isOnline) return;

    try {
      // Get current user
      const { data: { user } } = await supa.auth.getUser();
      if (!user) return;

      // Sync trees
      const { data: trees } = await supa
        .from('trees')
        .select('*')
        .eq('user_id', user.id);

      if (trees) {
        const transaction = this.db.transaction(['trees'], 'readwrite');
        const store = transaction.objectStore('trees');

        for (const tree of trees) {
          await store.put(tree);
        }
      }

      // Sync cards
      const { data: cards } = await supa
        .from('cards')
        .select(`
          *,
          trees!inner(user_id)
        `)
        .eq('trees.user_id', user.id);

      if (cards) {
        const transaction = this.db.transaction(['cards'], 'readwrite');
        const store = transaction.objectStore('cards');

        for (const card of cards) {
          await store.put(card);
        }
      }

      // Sync settings
      const { data: settings } = await supa
        .from('gingko_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        await store.put(settings);
      }

    } catch (error) {
      console.error('Sync from server failed:', error);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline) return;

    await this.init();

    const transaction = this.db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');
    const queueItems = await store.getAll();

    for (const item of queueItems.sort((a, b) => a.timestamp - b.timestamp)) {
      try {
        await this.syncItem(item);

        // Remove from queue on success
        const deleteTransaction = this.db.transaction(['sync_queue'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('sync_queue');
        await deleteStore.delete(item.id);

      } catch (error) {
        console.error('Failed to sync item:', item, error);
        // Keep in queue for retry
      }
    }
  }

  async syncItem(item) {
    const { type, storeName, id, data } = item;

    switch (type) {
      case 'create':
        if (storeName === 'trees') {
          await supa.from('trees').insert(data);
        } else if (storeName === 'cards') {
          await supa.from('cards').insert(data);
        }
        break;

      case 'update':
        if (storeName === 'trees') {
          await supa.from('trees').update(data).eq('id', id);
        } else if (storeName === 'cards') {
          await supa.from('cards').update(data).eq('id', id);
        }
        break;

      case 'delete':
        if (storeName === 'trees') {
          await supa.from('trees').delete().eq('id', id);
        } else if (storeName === 'cards') {
          await supa.from('cards').delete().eq('id', id);
        }
        break;
    }
  }

  // High-level API for components
  async createTree(title, description = '') {
    const tree = {
      id: crypto.randomUUID(),
      user_id: (await supa.auth.getUser()).data.user?.id,
      title,
      description,
      is_public: false,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isOnline) {
      const { data, error } = await supa.from('trees').insert(tree).select().single();
      if (error) throw error;

      // Also save locally
      await this.localCreate('trees', data);
      return data;
    } else {
      return await this.localCreate('trees', tree);
    }
  }

  async getTrees() {
    if (this.isOnline) {
      try {
        const { data, error } = await supa
          .from('trees')
          .select('*')
          .eq('archived', false)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Update local cache
        if (data) {
          const transaction = this.db.transaction(['trees'], 'readwrite');
          const store = transaction.objectStore('trees');
          for (const tree of data) {
            await store.put(tree);
          }
        }

        return data || [];
      } catch (error) {
        console.warn('Online fetch failed, using local data:', error);
        return await this.localGetAll('trees');
      }
    } else {
      return await this.localGetAll('trees');
    }
  }

  async getTreeCards(treeId) {
    if (this.isOnline) {
      try {
        const { data, error } = await supa
          .from('cards')
          .select('*')
          .eq('tree_id', treeId)
          .order('order_index');

        if (error) throw error;

        // Update local cache
        if (data) {
          const transaction = this.db.transaction(['cards'], 'readwrite');
          const store = transaction.objectStore('cards');
          for (const card of data) {
            await store.put(card);
          }
        }

        return data || [];
      } catch (error) {
        console.warn('Online fetch failed, using local data:', error);
        return await this.localGetAll('cards', 'tree_id', treeId);
      }
    } else {
      return await this.localGetAll('cards', 'tree_id', treeId);
    }
  }

  // Initialize sync on app start
  async initialize() {
    await this.init();
    if (this.isOnline) {
      await this.syncFromServer();
      await this.processSyncQueue();
    }
  }
}

export const gingkoSync = new GingkoSync();