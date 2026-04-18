import { useMemo } from 'react';
import {
  FileText, Archive, Lock, Settings, Tag, Sun, Moon,
  PenSquare, Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar({ onClose }) {
  const { state, dispatch, createNote, toggleTheme } = useApp();

  const allTags = useMemo(() => {
    const set = new Set();
    state.notes.forEach(n => (n.tags || []).forEach(t => set.add(t)));
    return [...set].sort();
  }, [state.notes]);

  const archived = state.notes.filter(n => n.isArchived && !n.isHidden);

  const go = (view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    dispatch({ type: 'SET_ACTIVE', payload: null });
    onClose?.();
  };

  const handleNew = async () => {
    await createNote();
    onClose?.();
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileText size={14} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">SecureNotes</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {state.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* New Note */}
      <div className="px-3 pt-3">
        <button onClick={handleNew} className="btn-primary w-full justify-center">
          <PenSquare size={14} /> New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <button
          className={`sidebar-item w-full ${state.view === 'list' && !state.activeTag ? 'active' : ''}`}
          onClick={() => { dispatch({ type: 'SET_TAG', payload: null }); go('list'); }}
        >
          <FileText size={15} /> All Notes
          <span className="ml-auto text-xs opacity-50">{state.notes.filter(n => !n.isArchived && !n.isHidden).length}</span>
        </button>

        {archived.length > 0 && (
          <button
            className={`sidebar-item w-full ${state.view === 'archived' ? 'active' : ''}`}
            onClick={() => go('archived')}
          >
            <Archive size={15} /> Archived
            <span className="ml-auto text-xs opacity-50">{archived.length}</span>
          </button>
        )}

        <button
          className={`sidebar-item w-full ${state.view === 'vault' ? 'active' : ''} text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20`}
          onClick={() => go('vault')}
        >
          <Lock size={15} /> Hidden Vault
          <span className="ml-auto text-xs opacity-50">{state.notes.filter(n => n.isHidden).length}</span>
        </button>

        {/* Tags */}
        {allTags.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Tags
            </div>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`sidebar-item w-full ${state.activeTag === tag ? 'active' : ''}`}
                onClick={() => { dispatch({ type: 'SET_TAG', payload: tag }); go('list'); }}
              >
                <Tag size={13} />
                <span className="truncate">{tag}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
        <button
          className={`sidebar-item w-full ${state.view === 'settings' ? 'active' : ''}`}
          onClick={() => go('settings')}
        >
          <Settings size={15} /> Settings
        </button>
      </div>
    </aside>
  );
}
