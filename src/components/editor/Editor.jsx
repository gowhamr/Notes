import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft, Pin, Archive, Lock, Trash2, Download,
  Eye, Edit3, Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useAutoSave } from '../../hooks/useAutoSave';
import { TagInput } from '../ui/TagInput';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { exportNoteAsMarkdown } from '../../modules/sync';

export function Editor() {
  const { state, dispatch, updateNote, removeNote, togglePin, toggleArchive, sendToVault } = useApp();
  const toast = useToast();
  const note = state.activeNote;
  const textareaRef = useRef(null);

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
      setMode('edit');
    }
  }, [note?.id]);

  const save = useCallback(async () => {
    if (!note) return;
    setSaving(true);
    await updateNote({ ...note, title, content, tags });
    setSaving(false);
  }, [note, title, content, tags, updateNote]);

  useAutoSave({ title, content, tags }, save, 1200);

  // Tab key inserts 2 spaces instead of focus-trap
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textareaRef.current;
      const s = el.selectionStart;
      const next = content.slice(0, s) + '  ' + content.slice(el.selectionEnd);
      setContent(next);
      requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
    }
  };

  const back = () => dispatch({ type: 'SET_ACTIVE', payload: null });

  if (!note) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* Top action bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <button
          onClick={back}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="Back"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Edit / Preview toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 ml-1">
          <button
            onClick={() => { setMode('edit'); requestAnimationFrame(() => textareaRef.current?.focus()); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'edit'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Edit3 size={11} /> Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'preview'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Eye size={11} /> Preview
          </button>
        </div>

        <div className="flex items-center gap-0.5 ml-auto">
          {saving && <span className="text-[11px] text-gray-400 dark:text-gray-600 mr-1 animate-pulse">Saving…</span>}

          <button
            onClick={() => { togglePin(note.id, note.isPinned); toast(note.isPinned ? 'Unpinned' : 'Pinned', 'success'); }}
            className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'}`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={14} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => { exportNoteAsMarkdown({ ...note, title, content }); toast('Exported as .md', 'success'); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Download .md"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => { sendToVault({ ...note, title, content, tags }); toast('Moved to vault', 'success'); }}
            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Move to vault"
          >
            <Lock size={14} />
          </button>

          <button
            onClick={() => { toggleArchive(note.id, note.isArchived); toast(note.isArchived ? 'Unarchived' : 'Archived', 'success'); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title={note.isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive size={14} />
          </button>

          <button
            onClick={() => { removeNote(note.id); toast('Deleted', 'info'); }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>

          <button onClick={save} className="btn-primary ml-1 py-1.5 px-3">
            <Save size={13} /> Save
          </button>
        </div>
      </div>

      {/* Title + Tags */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full text-xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 mb-3"
        />
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Markdown toolbar (edit mode only) */}
      {mode === 'edit' && (
        <MarkdownToolbar
          textareaRef={textareaRef}
          value={content}
          onChange={setContent}
        />
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Start writing...\n\nMarkdown supported:\n  **bold**  *italic*  \`code\`  # Heading\n  - list item\n  > blockquote`}
            spellCheck
            className="w-full h-full resize-none px-6 py-4 bg-transparent text-gray-800 dark:text-gray-200 text-sm leading-relaxed outline-none placeholder-gray-300 dark:placeholder-gray-600 font-mono"
          />
        ) : (
          <MarkdownPreview content={content} />
        )}
      </div>
    </div>
  );
}
