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
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 200);
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
      action: () => { removeNote(note.id); toast('Note deleted', 'info'); },
    },
  ];

  const preview = (note.content || '')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 120);

  return (
    <>
      <div
        className={`note-card ${note.isPinned ? 'pinned' : ''} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
        onClick={open}
        onContextMenu={onContextMenu}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate flex-1">
            {note.title || <span className="text-gray-400 italic">Untitled</span>}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {note.isPinned && <Pin size={11} className="text-yellow-500 fill-yellow-500" />}
            <button
              onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={13} />
            </button>
          </div>
        </div>
        {preview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">{preview}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {(note.tags || []).slice(0, 3).map(t => (
              <span key={t} className="tag-badge">{t}</span>
            ))}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-600 shrink-0">
            {format(note.updatedAt || note.createdAt, 'MMM d')}
          </span>
        </div>
      </div>
      <ContextMenu items={menuItems} position={menu} onClose={() => setMenu(null)} />
    </>
  );
}
