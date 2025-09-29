const { useState, useEffect, useRef } = React;

function Card({
  card,
  onUpdate,
  onDelete,
  onCreateChild,
  onCreateSibling,
  onMove,
  focused,
  onFocus,
  _onBlur,
  collapsed,
  onToggleCollapse,
  depth = 0
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(card.content_markdown || '');
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const cardRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [content, isEditing]);

  // Save content when leaving edit mode
  const handleSave = async () => {
    if (content.trim() !== card.content_markdown?.trim()) {
      await onUpdate(card.id, { content_markdown: content.trim() });
    }
    setIsEditing(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setContent(card.content_markdown || '');
      setIsEditing(false);
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      onCreateSibling(card.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onCreateChild(card.id);
    }
  };

  // Parse markdown for display
  const renderMarkdown = (text) => {
    if (!text) return '';

    // Simple markdown parsing for display
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-medium mb-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  // Drag and drop handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedCardId = e.dataTransfer.getData('text/plain');
    if (draggedCardId !== card.id) {
      onMove(draggedCardId, card.id);
    }
  };

  const cardContent = content || card.content_markdown || '';
  const displayContent = cardContent || 'Empty card...';
  const isEmpty = !cardContent.trim();

  return (
    <div
      ref={cardRef}
      className={`
        group relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 mb-3
        ${focused ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}
        ${isDragging ? 'opacity-50 transform rotate-1' : ''}
        ${collapsed ? 'opacity-60' : ''}
        hover:shadow-md hover:border-gray-300
      `}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => !isEditing && onFocus(card.id)}
    >
      {/* Drag handle */}
      <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-50 cursor-grab">
        <svg width="12" height="12" viewBox="0 0 12 12" className="fill-gray-400">
          <circle cx="2" cy="2" r="1"/>
          <circle cx="6" cy="2" r="1"/>
          <circle cx="10" cy="2" r="1"/>
          <circle cx="2" cy="6" r="1"/>
          <circle cx="6" cy="6" r="1"/>
          <circle cx="10" cy="6" r="1"/>
          <circle cx="2" cy="10" r="1"/>
          <circle cx="6" cy="10" r="1"/>
          <circle cx="10" cy="10" r="1"/>
        </svg>
      </div>

      {/* Action buttons */}
      {showActions && !isEditing && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(card.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? '▶' : '▼'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(card.id);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Add child card (Tab)"
          >
            ➕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateSibling(card.id);
            }}
            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            title="Add sibling card (Shift+Tab)"
          >
            ↩️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this card and all its children?')) {
                onDelete(card.id);
              }
            }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete card"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Card content */}
      <div className="p-4 pl-8">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[4rem] p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter markdown content..."
            autoFocus
          />
        ) : (
          <div
            className={`min-h-[3rem] cursor-text ${isEmpty ? 'text-gray-400 italic' : ''}`}
            onClick={() => setIsEditing(true)}
            dangerouslySetInnerHTML={{
              __html: isEmpty ? displayContent : renderMarkdown(displayContent)
            }}
          />
        )}
      </div>

      {/* Depth indicator */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-blue-400 rounded-l-lg"
          style={{ opacity: Math.max(0.3, 1 - depth * 0.15) }}
        />
      )}

      {/* Word count (if not empty) */}
      {!isEmpty && !isEditing && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
          {cardContent.split(/\s+/).filter(word => word.length > 0).length} words
        </div>
      )}
    </div>
  );
}

// Export to global for use in other components
window.GingkoCard = Card;
export { Card };