import { useState } from 'react';
import { format } from 'date-fns';
import { Pin, Archive, Trash2, Lock, MoreVertical, ArchiveRestore } from 'lucide-react';
import { ContextMenu } from '../ui/ContextMenu';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';

export function NoteCard({ note }) {
  const { state, dispatch, togglePin, toggleArchive, removeNote, sendToVault } = useApp();
  const toast = useToast();
  const [menu, setMenu] = useState(null);

  const isActive = state.activeNote?.id === note.id;

  const open = () => dispatch({ type: 'SET_ACTIVE', payload: note });

  const onContextMenu = (e) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 192);
    const y = Math.min(e.clientY, window.innerHeight - 180);
    setMenu({ x, y });
  };

  const menuItems = [
    {
      label: note.isPinned ? 'Unpin' : 'Pin',
      icon: <Pin size={14} />,
      action: () => { togglePin(note.id, note.isPinned); toast(note.isPinned ? 'Unpinned' : 'Pinned', 'success'); },
    },
    {
      label: note.isArchived ? 'Unarchive' : 'Archive',
      icon: note.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />,
      action: () => { toggleArchive(note.id, note.isArchived); toast(note.isArchived ? 'Unarchived' : 'Archived', 'success'); },
    },
    {
      label: 'Move to Vault',
      icon: <Lock size={14} />,
      action: () => { sendToVault(note); toast('Moved to vault', 'success'); },
    },
    { separator: true },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      action: () => { removeNote(note.id); toast('Deleted', 'info'); },
    },
  ];

  // Plain text preview
  const preview = (note.content || '').slice(0, 120);

  // Format date like MI Notes: "Feb 3, 2025" or "Apr 17 6:52 PM"
  const ts = note.updatedAt || note.createdAt;
  const now = Date.now();
  const diffDays = Math.floor((now - ts) / 86400000);
  const dateStr = diffDays === 0
    ? format(ts, 'MMM d h:mm aa')
    : diffDays < 365
    ? format(ts, 'MMM d')
    : format(ts, 'MMM d, yyyy');

  return (
    <>
      <div
        className={`note-card group ${note.isPinned ? 'pinned' : ''} ${isActive ? 'active-card' : ''}`}
        onClick={open}
        onContextMenu={onContextMenu}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-[15px] leading-snug truncate flex-1" style={{ color: 'var(--text-1)' }}>
            {note.title || <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Untitled</span>}
          </h3>
          <button
            onClick={e => { e.stopPropagation(); onContextMenu(e); }}
            className="p-0.5 rounded text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Preview */}
        <p className="text-[13px] leading-snug line-clamp-1 mb-2.5" style={{ color: 'var(--text-2)' }}>
          {preview || <span className="italic" style={{ color: 'var(--text-3)' }}>No text</span>}
        </p>

        {/* Footer: date + pin */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{dateStr}</span>
          <div className="flex items-center gap-1.5">
            {(note.tags || []).slice(0, 2).map(t => (
              <span key={t} className="tag-badge">{t}</span>
            ))}
            {note.isPinned && (
              <Pin size={13} className="text-amber-400 fill-amber-400" />
            )}
          </div>
        </div>
      </div>

      <ContextMenu items={menuItems} position={menu} onClose={() => setMenu(null)} />
    </>
  );
}
