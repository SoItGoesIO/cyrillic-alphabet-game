const { useState } = React;

function Column({
  cards = [],
  depth,
  onCardUpdate,
  onCardDelete,
  onCardCreate,
  onCardMove,
  focusedCard,
  onCardFocus,
  collapsedCards,
  onCardToggleCollapse,
  onCreateRootCard
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const draggedCardId = e.dataTransfer.getData('text/plain');
    const targetParentId = depth === 0 ? null : cards[0]?.parent_id;

    // Move to this column (make it a sibling of existing cards)
    onCardMove(draggedCardId, targetParentId);
  };

  const handleCreateChild = (parentId) => {
    onCardCreate(parentId, '');
  };

  const handleCreateSibling = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      onCardCreate(card.parent_id, '');
    }
  };

  return (
    <div
      className={`
        flex-shrink-0 w-80 h-full p-4 border-r border-gray-200 overflow-y-auto
        ${isDragOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}
        transition-colors duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">
          {depth === 0 ? 'Outline' : `Level ${depth + 1}`}
        </h3>
        <span className="text-xs text-gray-400">
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {cards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              {depth === 0 ? '📝' : '💭'}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {depth === 0 ? 'Start writing your document' : 'Add details here'}
            </p>
            <button
              onClick={() => depth === 0 ? onCreateRootCard() : null}
              className={`
                px-4 py-2 text-sm rounded-lg transition-colors
                ${depth === 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
              disabled={depth !== 0}
            >
              {depth === 0 ? 'Create first card' : 'Select parent card'}
            </button>
          </div>
        ) : (
          cards.map((card) =>
            React.createElement(window.GingkoCard || 'div', {
              key: card.id,
              card: card,
              onUpdate: onCardUpdate,
              onDelete: onCardDelete,
              onCreateChild: handleCreateChild,
              onCreateSibling: handleCreateSibling,
              onMove: onCardMove,
              focused: focusedCard === card.id,
              onFocus: onCardFocus,
              onBlur: () => onCardFocus(null),
              collapsed: collapsedCards.has(card.id),
              onToggleCollapse: onCardToggleCollapse,
              depth: depth
            })
          )
        )}
      </div>

      {/* Quick add button for existing cards */}
      {cards.length > 0 && (
        <button
          onClick={() => onCardCreate(cards[0]?.parent_id, '')}
          className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + Add card
        </button>
      )}
    </div>
  );
}

// Export to global for use in other components
window.GingkoColumn = Column;
export { Column };