import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Shield, Lock, Trash2, ArchiveRestore, Plus, PenSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useInactivityLock } from '../../hooks/useInactivityLock';
import { getVaultNotes, saveNote, deleteNote } from '../../modules/storage';

export function VaultNotes() {
  const { lockVault, retrieveFromVault, dispatch, state } = useApp();
  const toast = useToast();
  const [vaultNotes, setVaultNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useInactivityLock(lockVault, 5 * 60 * 1000, true);

  useEffect(() => { loadVaultNotes(); }, []);

  const loadVaultNotes = async () => {
    const notes = await getVaultNotes();
    setVaultNotes(notes);
  };

  const createVaultNote = async () => {
    const id = await saveNote({
      title: '', content: '', tags: [],
      isPinned: 0, isArchived: 0, isHidden: 1,
      createdAt: Date.now(), updatedAt: Date.now(),
    });
    await loadVaultNotes();
    setSelected({ id, title: '', content: '', tags: [], isHidden: 1 });
    setEditTitle('');
    setEditContent('');
  };

  const saveVaultNote = async () => {
    if (!selected) return;
    await saveNote({ ...selected, title: editTitle, content: editContent, updatedAt: Date.now() });
    await loadVaultNotes();
    setSelected(null);
    toast('Saved', 'success');
  };

  const openNote = (note) => {
    setSelected(note);
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
  };

  const restore = async (note) => {
    await retrieveFromVault(note.id);
    await loadVaultNotes();
    toast('Moved to notes', 'success');
  };

  const remove = async (id) => {
    await deleteNote(id);
    await loadVaultNotes();
    if (selected?.id === id) setSelected(null);
    toast('Deleted', 'info');
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/10 shrink-0">
          <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 transition-colors text-sm flex items-center gap-1">
            ← Back
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <Shield size={14} className="text-purple-500" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Vault Note</span>
          </div>
          <button onClick={saveVaultNote} className="btn-vault ml-auto">Save</button>
        </div>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          placeholder="Title..."
          className="px-6 pt-5 pb-2 text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600"
        />
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          placeholder="Write your private note..."
          className="flex-1 px-6 py-2 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 resize-none text-sm leading-relaxed placeholder-gray-300 dark:placeholder-gray-600"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-100 dark:border-purple-800/30 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-900 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Hidden Vault</h2>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">AES-256 Encrypted • Auto-locks in 5 min</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={createVaultNote} className="btn-vault">
            <Plus size={14} /> New
          </button>
          <button onClick={lockVault} className="btn-secondary text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700">
            <Lock size={14} /> Lock
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {vaultNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Shield size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vault is empty</p>
              <p className="text-xs text-gray-400 mt-1">Move sensitive notes here for extra protection</p>
            </div>
            <button onClick={createVaultNote} className="btn-vault mt-2">
              <PenSquare size={14} /> Create Vault Note
            </button>
          </div>
        ) : (
          vaultNotes.map(note => (
            <div
              key={note.id}
              className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl p-4 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
              onClick={() => openNote(note)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {note.title || <span className="text-gray-400 italic">Untitled</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {(note.content || '').slice(0, 80) || <span className="italic">Empty note</span>}
                  </p>
                  <p className="text-[10px] text-purple-400 mt-1.5">{format(note.updatedAt, 'MMM d, yyyy')}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => restore(note)}
                    title="Move to notes"
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                  >
                    <ArchiveRestore size={13} />
                  </button>
                  <button
                    onClick={() => remove(note.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
