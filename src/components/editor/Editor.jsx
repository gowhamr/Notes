import { useState, useCallback, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  ArrowLeft, Pin, Archive, Lock, Trash2, Download,
  MoreHorizontal, Eye, Edit3, Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useAutoSave } from '../../hooks/useAutoSave';
import { TagInput } from '../ui/TagInput';
import { exportNoteAsMarkdown } from '../../modules/sync';

export function Editor() {
  const { state, dispatch, updateNote, removeNote, togglePin, toggleArchive, sendToVault } = useApp();
  const toast = useToast();
  const note = state.activeNote;

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [mode, setMode] = useState('edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
    }
  }, [note?.id]);

  const save = useCallback(async () => {
    if (!note) return;
    setSaving(true);
    await updateNote({ ...note, title, content, tags });
    setSaving(false);
  }, [note, title, content, tags, updateNote]);

  useAutoSave({ title, content, tags }, save, 1200);

  const back = () => dispatch({ type: 'SET_ACTIVE', payload: null });

  if (!note) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <button onClick={back} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors md:hidden">
          <ArrowLeft size={16} />
        </button>
        <button onClick={back} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors hidden md:flex">
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {saving && <span className="text-xs text-gray-400 animate-pulse mr-2">Saving...</span>}

          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setMode('edit')}
              className={`p-1.5 rounded-md transition-colors text-xs flex items-center gap-1 ${mode === 'edit' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}
            >
              <Edit3 size={12} /> Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`p-1.5 rounded-md transition-colors text-xs flex items-center gap-1 ${mode === 'preview' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}
            >
              <Eye size={12} /> Preview
            </button>
          </div>

          <button
            onClick={() => { togglePin(note.id, note.isPinned); toast(note.isPinned ? 'Unpinned' : 'Pinned', 'success'); }}
            className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={15} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => { exportNoteAsMarkdown(note); toast('Exported as .md', 'success'); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Export as Markdown"
          >
            <Download size={15} />
          </button>

          <button
            onClick={() => { sendToVault(note); toast('Moved to vault', 'success'); }}
            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Move to vault"
          >
            <Lock size={15} />
          </button>

          <button
            onClick={() => { toggleArchive(note.id, note.isArchived); toast(note.isArchived ? 'Unarchived' : 'Archived', 'success'); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Archive"
          >
            <Archive size={15} />
          </button>

          <button
            onClick={() => { removeNote(note.id); toast('Deleted', 'info'); }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>

          <button
            onClick={save}
            className="btn-primary ml-1"
            title="Save"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600"
        />
        {/* Tags */}
        <div className="mt-3">
          <TagInput tags={tags} onChange={setTags} />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden" data-color-mode={state.theme}>
        <MDEditor
          value={content}
          onChange={val => setContent(val || '')}
          preview={mode === 'preview' ? 'preview' : 'edit'}
          hideToolbar={mode === 'preview'}
          height="100%"
          style={{ height: '100%' }}
          visibleDragbar={false}
        />
      </div>
    </div>
  );
}
