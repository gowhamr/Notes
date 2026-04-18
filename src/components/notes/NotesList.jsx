import { useState, useMemo } from 'react';
import { Archive, Settings, Search, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NoteCard } from './NoteCard';

export function NotesList() {
  const { state, dispatch } = useApp();
  const { filteredNotes, notes, searchQuery, activeTag, loading } = state;
  const [searching, setSearching] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set();
    notes.filter(n => !n.isArchived && !n.isHidden)
         .forEach(n => (n.tags || []).forEach(t => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const setTag = (tag) => dispatch({ type: 'SET_TAG', payload: tag });

  return (
    <div className="flex flex-col h-full bg-black">

      {/* ── Header ── */}
      {searching ? (
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 shrink-0">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-sm outline-none focus:border-neutral-600"
            />
          </div>
          <button
            onClick={() => { setSearching(false); dispatch({ type: 'SET_SEARCH', payload: '' }); }}
            className="text-neutral-400 text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center px-4 pt-12 pb-3 shrink-0">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'vault' })}
            className="btn-icon"
            title="Vault"
          >
            <Archive size={20} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-white tracking-tight">
            Notes
          </h1>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearching(true)} className="btn-icon" title="Search">
              <Search size={20} />
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'settings' })}
              className="btn-icon"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="chips-scroll flex items-center gap-2 px-4 pb-3 overflow-x-auto shrink-0">
        <button
          onClick={() => setTag(null)}
          className={`chip ${!activeTag ? 'chip-active' : 'chip-inactive'}`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setTag(activeTag === tag ? null : tag)}
            className={`chip ${activeTag === tag ? 'chip-active' : 'chip-inactive'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Notes ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-24 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-neutral-600 text-sm">Loading…</div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center">
              <FileText size={24} className="text-neutral-700" />
            </div>
            <p className="text-neutral-600 text-sm">
              {searchQuery ? 'No results found' : 'No notes yet — tap + to create one'}
            </p>
          </div>
        ) : (
          filteredNotes.map(note => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </div>
  );
}
