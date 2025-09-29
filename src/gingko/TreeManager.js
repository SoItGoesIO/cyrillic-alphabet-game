const { useState, useEffect } = React;
import { GingkoDb } from './db.js';

function TreeManager({ onTreeSelect, currentTreeId }) {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTreeTitle, setNewTreeTitle] = useState('');
  const [newTreeDescription, setNewTreeDescription] = useState('');

  // Load trees
  const loadTrees = async () => {
    try {
      setLoading(true);
      const treesData = await GingkoDb.getTrees();
      setTrees(treesData);
    } catch (err) {
      console.error('Failed to load trees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  // Create new tree
  const handleCreateTree = async (e) => {
    e.preventDefault();
    if (!newTreeTitle.trim()) return;

    try {
      const newTree = await GingkoDb.createTree(
        newTreeTitle.trim(),
        newTreeDescription.trim()
      );

      setTrees(prev => [newTree, ...prev]);
      setNewTreeTitle('');
      setNewTreeDescription('');
      setShowCreateForm(false);

      // Auto-select new tree
      onTreeSelect(newTree.id);
    } catch (err) {
      console.error('Failed to create tree:', err);
      alert('Failed to create document: ' + err.message);
    }
  };

  // Delete tree
  const handleDeleteTree = async (treeId, treeName) => {
    if (!confirm(`Delete document "${treeName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await GingkoDb.deleteTree(treeId);
      setTrees(prev => prev.filter(tree => tree.id !== treeId));

      // If this was the current tree, clear selection
      if (currentTreeId === treeId) {
        onTreeSelect(null);
      }
    } catch (err) {
      console.error('Failed to delete tree:', err);
      alert('Failed to delete document: ' + err.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffHours < 168) { // 7 days
      return `${Math.floor(diffHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">📄 Documents</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            {showCreateForm ? 'Cancel' : '+ New'}
          </button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <form onSubmit={handleCreateTree} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={newTreeTitle}
              onChange={(e) => setNewTreeTitle(e.target.value)}
              placeholder="Document title..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
            <textarea
              value={newTreeDescription}
              onChange={(e) => setNewTreeDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto">
        {trees.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">No documents yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create your first document
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {trees.map((tree) => (
              <div
                key={tree.id}
                className={`
                  group p-4 border rounded-lg cursor-pointer transition-all
                  ${currentTreeId === tree.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => onTreeSelect(tree.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {tree.title}
                    </h3>
                    {tree.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {tree.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Updated {formatDate(tree.updated_at)}</span>
                      <span>Created {formatDate(tree.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTree(tree.id, tree.title);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete document"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Current indicator */}
                {currentTreeId === tree.id && (
                  <div className="mt-3 flex items-center text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Currently open
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Export to global for use in other components
window.GingkoTreeManager = TreeManager;
export { TreeManager };