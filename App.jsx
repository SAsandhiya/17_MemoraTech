import { useState, useEffect, useCallback, useRef } from 'react';
import { DecisionForm } from './components/DecisionForm';
import { MemoryTimeline } from './components/MemoryTimeline';
import { ChatBot } from './components/ChatBot';
import { Toast } from './components/Toast';
import { Tooltip } from './components/Tooltip';
import { Login } from './components/Login';
import { UserMenu } from './components/UserMenu';
import { HAMCSLogo } from './components/HAMCSLogo';
import { useAuth } from './hooks/useAuth';
import { api, CATEGORIES } from './api';
import { HiOutlineDownload, HiOutlineDocumentText, HiOutlineBookOpen, HiPlus, HiOutlineClock, HiOutlineSearch, HiOutlineX, HiSparkles } from 'react-icons/hi';

export default function App() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [toast, setToast] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const exportRef = useRef(null);

  // Load decisions on mount (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadDecisions();
    } else {
      setDecisions([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K = Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Ctrl/Cmd + N = New decision
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('new');
      }
      // Ctrl/Cmd + E = Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportRef.current?.('json');
      }
      // Escape = Close modals
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
      // ? = Show shortcuts
      if (e.key === '?' && !e.target.closest('input, textarea')) {
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadDecisions = async () => {
    try {
      const data = await api.getDecisions();
      setDecisions(data);
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionCreated = (newDecision) => {
    setDecisions(prev => [newDecision, ...prev]);
    showToast('Decision saved!', 'success');
  };

  const handleDecisionDeleted = useCallback(async (id) => {
    try {
      const result = await api.deleteDecision(id);
      setDecisions(prev => prev.filter(d => d._id !== id));

      // Show undo toast
      showToast(
        'Decision deleted',
        'info',
        {
          action: 'Undo',
          onAction: async () => {
            try {
              const restored = await api.undoDelete(result.undoId);
              setDecisions(prev => [restored, ...prev]);
              showToast('Decision restored!', 'success');
            } catch {
              showToast('Undo expired', 'error');
            }
          }
        }
      );
    } catch {
      showToast('Failed to delete', 'error');
    }
  }, []);

  const handleTogglePin = useCallback(async (id) => {
    try {
      const updated = await api.togglePin(id);
      setDecisions(prev =>
        prev.map(d => d._id === id ? { ...d, pinned: updated.pinned } : d)
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch {
      showToast('Failed to pin', 'error');
    }
  }, []);

  const handleUpdateCategory = useCallback(async (id, category) => {
    try {
      await api.updateCategory(id, category);
      setDecisions(prev =>
        prev.map(d => d._id === id ? { ...d, category } : d)
      );
    } catch {
      showToast('Failed to update category', 'error');
    }
  }, []);

  const handleClearAll = () => {
    setDecisions([]);
    showToast('All decisions cleared', 'info');
  };

  const showToast = (message, type = 'info', options = {}) => {
    setToast({ message, type, ...options });
    if (!options.action) {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const exportDecisions = (format) => {
    const dataToExport = filteredDecisions.length > 0 ? filteredDecisions : decisions;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      downloadFile(blob, 'hamcs-decisions.json');
    } else {
      const headers = ['Summary', 'Goal', 'Reasoning', 'Category', 'Tags', 'Created'];
      const rows = dataToExport.map(d => [
        d.summary,
        d.goal,
        d.reasoning,
        d.category || 'general',
        (d.tags || []).join('; '),
        new Date(d.createdAt).toLocaleDateString()
      ]);
      const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'hamcs-decisions.csv');
    }
    showToast(`Exported as ${format.toUpperCase()}`, 'success');
  };

  // Keep ref updated with latest export function
  exportRef.current = exportDecisions;

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter decisions
  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = !searchQuery ||
      d.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.goal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reasoning?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || d.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <HAMCSLogo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">HAMCS</h1>
                <p className="text-[10px] text-slate-500 -mt-0.5">Human–AI Memory Continuity</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Export Buttons */}
              <Tooltip text="Export JSON (Ctrl+E)" position="bottom">
                <button
                  onClick={() => exportDecisions('json')}
                  className="p-2 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="Export CSV" position="bottom">
                <button
                  onClick={() => exportDecisions('csv')}
                  className="p-2 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <HiOutlineDocumentText className="w-4 h-4" />
                </button>
              </Tooltip>

              {/* Shortcuts */}
              <Tooltip text="Keyboard Shortcuts (?)" position="bottom">
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <HiOutlineBookOpen className="w-4 h-4" />
                </button>
              </Tooltip>

              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <span className="text-xs text-slate-500">{decisions.length}</span>
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="space-y-3 text-center">
              <div className="w-10 h-10 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-600 text-sm">Loading memories...</p>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-60px)]">
            {/* Left Sidebar */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-white">
                <Tooltip text="New Decision" position="bottom" className="flex-1">
                  <button
                    onClick={() => setActiveTab('new')}
                    className={`w-full py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'new'
                      ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-800'
                      }`}
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip text="History" position="bottom" className="flex-1">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`w-full py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'history'
                      ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-800'
                      }`}
                  >
                    <HiOutlineClock className="w-4 h-4" />
                    <span>{filteredDecisions.length}</span>
                  </button>
                </Tooltip>
              </div>

              {/* Search & Filter - Only show in history tab */}
              {activeTab === 'history' && (
                <div className="p-3 border-b border-slate-200 space-y-3 bg-white">
                  {/* Search */}
                  <div className="relative">
                    <HiOutlineSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search... (Ctrl+K)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-450 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${filterCategory === 'all'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                      All
                    </button>
                    {Object.entries(CATEGORIES).map(([key, { color }]) => (
                      <button
                        key={key}
                        onClick={() => setFilterCategory(key)}
                        className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${filterCategory === key
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'new' ? (
                  <div className="p-4">
                    <DecisionForm onDecisionCreated={handleDecisionCreated} />
                  </div>
                ) : (
                  <MemoryTimeline
                    decisions={filteredDecisions}
                    onDecisionDeleted={handleDecisionDeleted}
                    onTogglePin={handleTogglePin}
                    onUpdateCategory={handleUpdateCategory}
                    onClearAll={handleClearAll}
                  />
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              <ChatBot decisions={decisions} />
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onAction={toast.onAction}
          onClose={() => setToast(null)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600">
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                ['Ctrl + N', 'New decision'],
                ['Ctrl + K', 'Search'],
                ['Ctrl + E', 'Export JSON'],
                ['?', 'Show shortcuts'],
                ['Esc', 'Close modal']
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{desc}</span>
                  <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono text-[10px] border border-slate-200">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}