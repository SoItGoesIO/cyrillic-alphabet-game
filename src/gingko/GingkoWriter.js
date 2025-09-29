const { useState, useEffect, useCallback } = React;
import { GingkoDb } from './db.js';
import { GingkoExporter } from './export.js';

function GingkoWriter({ treeId, onTreeChange }) {
  const [tree, setTree] = useState(null);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [focusedCard, setFocusedCard] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  // Load tree and cards
  const loadTreeData = useCallback(async () => {
    if (!treeId) return;

    try {
      setLoading(true);
      const [treeData, cardsData] = await Promise.all([
        GingkoDb.getTree(treeId),
        GingkoDb.getTreeCards(treeId)
      ]);

      setTree(treeData);
      setCards(cardsData);

      // Organize cards into columns by depth
      const cardColumns = GingkoDb.getCardsByDepth(cardsData);
      setColumns(cardColumns);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  // Auto-save debounced updates
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    const timeout = setTimeout(() => {
      // Auto-save would trigger here if implemented
    }, 2000);
    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout]);

  // Card operations
  const handleCardUpdate = async (cardId, updates) => {
    try {
      const updatedCard = await GingkoDb.updateCard(cardId, updates);
      setCards(prev => prev.map(card =>
        card.id === cardId ? { ...card, ...updatedCard } : card
      ));

      // Rebuild columns
      const updatedCards = cards.map(card =>
        card.id === cardId ? { ...card, ...updatedCard } : card
      );
      setColumns(GingkoDb.getCardsByDepth(updatedCards));

      scheduleAutoSave();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCardCreate = async (parentId, content = '') => {
    try {
      const newCard = await GingkoDb.createCard(treeId, parentId, content);
      setCards(prev => [...prev, newCard]);

      // Rebuild columns and focus new card
      const updatedCards = [...cards, newCard];
      setColumns(GingkoDb.getCardsByDepth(updatedCards));
      setFocusedCard(newCard.id);

      onTreeChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCardDelete = async (cardId) => {
    try {
      await GingkoDb.deleteCard(cardId);
      setCards(prev => prev.filter(card => card.id !== cardId));

      // Remove from collapsed cards and rebuild columns
      setCollapsedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });

      const updatedCards = cards.filter(card => card.id !== cardId);
      setColumns(GingkoDb.getCardsByDepth(updatedCards));

      if (focusedCard === cardId) {
        setFocusedCard(null);
      }

      onTreeChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCardMove = async (cardId, newParentId) => {
    try {
      const updatedCard = await GingkoDb.moveCard(cardId, newParentId);
      setCards(prev => prev.map(card =>
        card.id === cardId ? { ...card, ...updatedCard } : card
      ));

      // Rebuild columns
      const updatedCards = cards.map(card =>
        card.id === cardId ? { ...card, ...updatedCard } : card
      );
      setColumns(GingkoDb.getCardsByDepth(updatedCards));

      onTreeChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCardToggleCollapse = (cardId) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleCreateRootCard = () => {
    handleCardCreate(null, '');
  };

  // Filter cards based on collapsed state
  const getVisibleCardsForColumn = (columnCards, depth) => {
    if (depth === 0) return columnCards;

    return columnCards.filter(card => {
      // Check if any parent is collapsed
      let currentCard = card;
      while (currentCard.parent_id) {
        if (collapsedCards.has(currentCard.parent_id)) {
          return false;
        }
        currentCard = cards.find(c => c.id === currentCard.parent_id);
        if (!currentCard) break;
      }
      return true;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={loadTreeData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {tree?.title || 'Untitled Document'}
            </h1>
            <div className="text-sm text-gray-500">
              {cards.length} card{cards.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Focus mode toggle */}
            {focusedCard && (
              <button
                onClick={() => setFocusedCard(null)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
              >
                Exit Focus
              </button>
            )}

            {/* Export buttons */}
            <div className="flex gap-1">
              <button
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => GingkoExporter.export(treeId, 'md')}
                title="Export as Markdown"
              >
                📄 MD
              </button>
              <button
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => GingkoExporter.export(treeId, 'json')}
                title="Export as JSON"
              >
                📊 JSON
              </button>
              <button
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => GingkoExporter.export(treeId, 'docx')}
                title="Export as HTML (opens in new tab for DOCX conversion)"
              >
                📝 HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Horizontal scrolling container */}
        <div className="flex overflow-x-auto overflow-y-hidden">
          {columns.map((columnCards, depth) =>
            React.createElement(window.GingkoColumn || 'div', {
              key: depth,
              cards: getVisibleCardsForColumn(columnCards, depth),
              depth: depth,
              onCardUpdate: handleCardUpdate,
              onCardDelete: handleCardDelete,
              onCardCreate: handleCardCreate,
              onCardMove: handleCardMove,
              focusedCard: focusedCard,
              onCardFocus: setFocusedCard,
              collapsedCards: collapsedCards,
              onCardToggleCollapse: handleCardToggleCollapse,
              onCreateRootCard: handleCreateRootCard
            })
          )}

          {/* Add column for new depth level */}
          {columns.length > 0 &&
            React.createElement(window.GingkoColumn || 'div', {
              key: 'new-column',
              cards: [],
              depth: columns.length,
              onCardUpdate: handleCardUpdate,
              onCardDelete: handleCardDelete,
              onCardCreate: handleCardCreate,
              onCardMove: handleCardMove,
              focusedCard: focusedCard,
              onCardFocus: setFocusedCard,
              collapsedCards: collapsedCards,
              onCardToggleCollapse: handleCardToggleCollapse
            })
          }
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>Tree: {tree?.id}</span>
            <span>Last updated: {new Date(tree?.updated_at || '').toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            {focusedCard && <span>Focused: {focusedCard.slice(0, 8)}...</span>}
            <span>Columns: {columns.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export to global for use in other components
window.GingkoWriter = GingkoWriter;
export { GingkoWriter };