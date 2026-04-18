import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Shield, Lock, Trash2, ArchiveRestore, Plus, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useInactivityLock } from '../../hooks/useInactivityLock';
import { getVaultNotes, saveNote, deleteNote } from '../../modules/storage';

export function VaultNotes() {
  const { lockVault, retrieveFromVault, dispatch } = useApp();
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
    setEditTitle(''); setEditContent('');
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

  const backToList = () => dispatch({ type: 'SET_VIEW', payload: 'list' });

  // ── Vault Note Editor ────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 pt-12 pb-2 shrink-0">
          <button
            onClick={() => setSelected(null)}
            className="btn-icon"
            title="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-purple-400" />
            <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>Vault Note</span>
          </div>
          <button onClick={saveVaultNote} className="btn-icon !text-amber-400 hover:!text-amber-300" title="Save">
            <Check size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Title */}
        <div className="px-5 pt-2 pb-3 shrink-0">
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-[22px] font-bold bg-transparent border-none outline-none leading-tight"
            style={{ color: 'var(--text-1)', caretColor: '#f5a623' }}
          />
        </div>

        {/* Content */}
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          placeholder="Write your private note…"
          className="flex-1 px-5 py-2 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed"
          style={{ color: 'var(--text-1)', caretColor: '#f5a623' }}
        />
      </div>
    );
  }

  // ── Vault List ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>

      {/* Top bar with BACK button */}
      <div className="flex items-center justify-between px-2 pt-12 pb-2 shrink-0">
        <button onClick={backToList} className="btn-icon" title="Back to Notes">
          <ArrowLeft size={22} />
        </button>

        <div className="flex items-center gap-1.5">
          <Shield size={15} className="text-purple-400" />
          <span className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Hidden Vault</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={createVaultNote} className="btn-icon !text-amber-400" title="New vault note">
            <Plus size={22} />
          </button>
          <button onClick={lockVault} className="btn-icon !text-purple-400" title="Lock vault">
            <Lock size={20} />
          </button>
        </div>
      </div>

      {/* Encrypted badge */}
      <div className="px-5 pb-3 shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          AES-256 Encrypted • Auto-locks after 5 min inactivity
        </p>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
        {vaultNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3 text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, #9333ea 15%, var(--bg-card))' }}
            >
              <Shield size={28} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Vault is empty</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                Move sensitive notes here for extra protection
              </p>
            </div>
            <button onClick={createVaultNote} className="btn-vault mt-2">
              <Plus size={14} /> Create Vault Note
            </button>
          </div>
        ) : (
          vaultNotes.map(note => (
            <div
              key={note.id}
              className="rounded-2xl p-4 cursor-pointer transition-all group border"
              style={{
                background: 'color-mix(in srgb, #9333ea 8%, var(--bg-card))',
                borderColor: 'color-mix(in srgb, #9333ea 20%, var(--border))',
              }}
              onClick={() => openNote(note)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                    {note.title || <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Untitled</span>}
                  </p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-2)' }}>
                    {(note.content || '').slice(0, 80) || <span style={{ color: 'var(--text-3)' }}>Empty note</span>}
                  </p>
                  <p className="text-[11px] mt-1.5 text-purple-400">
                    {format(note.updatedAt, 'MMM d, yyyy')}
                  </p>
                </div>
                <div
                  className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => restore(note)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-2)' }}
                    title="Restore to notes"
                  >
                    <ArchiveRestore size={14} />
                  </button>
                  <button
                    onClick={() => remove(note.id)}
                    className="p-1.5 rounded-lg text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
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
