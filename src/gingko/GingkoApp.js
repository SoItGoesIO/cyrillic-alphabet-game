const { useState, useEffect } = React;
import { supa } from '../supa.js';

export function GingkoApp() {
  const [currentView, setCurrentView] = useState('manager'); // 'manager' | 'writer'
  const [currentTreeId, setCurrentTreeId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supa.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supa.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTreeSelect = (treeId) => {
    setCurrentTreeId(treeId);
    if (treeId) {
      setCurrentView('writer');
    }
  };

  const handleBackToManager = () => {
    setCurrentView('manager');
    setCurrentTreeId(null);
  };

  const handleTreeChange = () => {
    // Called when tree structure changes (for potential auto-save, etc.)
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Gingko Writer...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">🌳 Gingko Writer</h1>
            <p className="text-gray-600">
              Please sign in to access your documents
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Use the authentication panel above to sign in
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* App header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToManager}
              className={`
                flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors
                ${currentView === 'manager'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              🌳 Gingko Writer
            </button>

            {currentView === 'writer' && currentTreeId && (
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                <span>/</span>
                <button
                  onClick={handleBackToManager}
                  className="hover:text-gray-700"
                >
                  Documents
                </button>
                <span>/</span>
                <span className="text-gray-900">Editor</span>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <button
              onClick={() => supa.auth.signOut()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'manager' ?
          React.createElement(window.GingkoTreeManager || 'div', {
            onTreeSelect: handleTreeSelect,
            currentTreeId: currentTreeId
          })
        : currentView === 'writer' && currentTreeId ?
          React.createElement(window.GingkoWriter || 'div', {
            treeId: currentTreeId,
            onTreeChange: handleTreeChange
          })
        : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-4">🌳</div>
              <p className="text-gray-500">No document selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-2">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex gap-6">
            <span><kbd className="px-1 bg-white border rounded">Tab</kbd> Add child</span>
            <span><kbd className="px-1 bg-white border rounded">Shift+Tab</kbd> Add sibling</span>
            <span><kbd className="px-1 bg-white border rounded">Cmd+Enter</kbd> Save</span>
            <span><kbd className="px-1 bg-white border rounded">Esc</kbd> Cancel</span>
          </div>
          <div>
            Gingko Writer v1.0
          </div>
        </div>
      </div>
    </div>
  );
}