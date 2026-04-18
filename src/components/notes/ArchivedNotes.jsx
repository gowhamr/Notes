import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';

export function ArchivedNotes() {
  const { state, toggleArchive, removeNote } = useApp();
  const toast = useToast();
  const archived = state.notes.filter(n => n.isArchived && !n.isHidden);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Archive size={15} className="text-gray-500" />
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Archived Notes</h2>
          <span className="ml-auto text-xs text-gray-400">{archived.length}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {archived.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <Archive size={28} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No archived notes</p>
          </div>
        ) : (
          archived.map(note => (
            <div key={note.id} className="note-card flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {note.title || 'Untitled'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{format(note.updatedAt, 'MMM d, yyyy')}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => { toggleArchive(note.id, 1); toast('Unarchived', 'success'); }}
                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                  title="Restore"
                >
                  <ArchiveRestore size={14} />
                </button>
                <button
                  onClick={() => { removeNote(note.id); toast('Deleted', 'info'); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
