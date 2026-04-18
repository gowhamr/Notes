import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NoteCard } from './NoteCard';

export function NotesList() {
  const { state, dispatch } = useApp();
  const { filteredNotes, searchQuery, loading } = state;

  const handleSearch = (e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  const clearSearch = () => dispatch({ type: 'SET_SEARCH', payload: '' });

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search notes..."
            className="input-field pl-9 pr-8"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Active tag filter */}
      {state.activeTag && (
        <div className="px-4 py-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-gray-800">
          <SlidersHorizontal size={12} />
          <span>Tag: <strong>{state.activeTag}</strong></span>
          <button onClick={() => dispatch({ type: 'SET_TAG', payload: null })} className="ml-auto hover:text-blue-800 dark:hover:text-blue-200">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Notes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Search size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No results found' : 'No notes yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery ? 'Try a different search' : 'Create your first note'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
