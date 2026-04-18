import { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Undo2, Redo2, Pin, Archive, Lock, Trash2, Download, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useAutoSave } from '../../hooks/useAutoSave';
import { TagInput } from '../ui/TagInput';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { exportNoteAsMarkdown } from '../../modules/sync';

// Simple undo/redo stack
function useHistory(initial) {
  const [value, setValue] = useState(initial);
  const history = useRef([initial]);
  const cursor = useRef(0);

  const set = useCallback((next) => {
    history.current = history.current.slice(0, cursor.current + 1);
    history.current.push(next);
    if (history.current.length > 100) history.current.shift();
    cursor.current = history.current.length - 1;
    setValue(next);
  }, []);

  const undo = useCallback(() => {
    if (cursor.current > 0) {
      cursor.current--;
      setValue(history.current[cursor.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (cursor.current < history.current.length - 1) {
      cursor.current++;
      setValue(history.current[cursor.current]);
    }
  }, []);

  const reset = useCallback((val) => {
    history.current = [val];
    cursor.current = 0;
    setValue(val);
  }, []);

  return [value, set, undo, redo, reset];
}

export function Editor() {
  const { state, dispatch, updateNote, removeNote, togglePin, toggleArchive, sendToVault } = useApp();
  const toast = useToast();
  const note = state.activeNote;
  const textareaRef = useRef(null);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent, undo, redo, resetContent] = useHistory(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  // Two modes: 'normal' (default) | 'markdown'
  const [editorMode, setEditorMode] = useState('normal');
  // Within markdown mode: 'edit' | 'preview'
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      resetContent(note.content || '');
      setTags(note.tags || []);
      setEditorMode('normal');
      setPreview(false);
    }
  }, [note?.id]);

  const save = useCallback(async () => {
    if (!note) return;
    await updateNote({ ...note, title, content, tags });
  }, [note, title, content, tags, updateNote]);

  useAutoSave({ title, content, tags }, save, 1200);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textareaRef.current;
      const s = el.selectionStart;
      const next = content.slice(0, s) + '  ' + content.slice(el.selectionEnd);
      setContent(next);
      requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
    }
  };

  const back = () => { save(); dispatch({ type: 'SET_ACTIVE', payload: null }); };

  const charCount = content.length;
  const ts = note?.updatedAt || note?.createdAt || Date.now();
  const metaDate = format(ts, 'd MMMM  h:mm aa');

  if (!note) return null;

  return (
    <div className="flex flex-col h-full bg-black">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-2 pt-12 pb-2 shrink-0">
        <button onClick={back} className="btn-icon" title="Back">
          <ArrowLeft size={22} />
        </button>

        <div className="flex items-center gap-1">
          <button onClick={undo} className="btn-icon" title="Undo"><Undo2 size={19} /></button>
          <button onClick={redo} className="btn-icon" title="Redo"><Redo2 size={19} /></button>
          <button
            onClick={() => { togglePin(note.id, note.isPinned); toast(note.isPinned ? 'Unpinned' : 'Pinned', 'success'); }}
            className={`btn-icon ${note.isPinned ? '!text-amber-400' : ''}`}
            title="Pin"
          >
            <Pin size={19} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => { exportNoteAsMarkdown({ ...note, title, content }); toast('Exported', 'success'); }}
            className="btn-icon" title="Export .md"
          >
            <Download size={19} />
          </button>
          <button
            onClick={() => { sendToVault({ ...note, title, content, tags }); toast('Moved to vault', 'success'); }}
            className="btn-icon hover:!text-purple-400" title="Move to vault"
          >
            <Lock size={19} />
          </button>
          <button
            onClick={() => { removeNote(note.id); toast('Deleted', 'info'); }}
            className="btn-icon hover:!text-red-400" title="Delete"
          >
            <Trash2 size={19} />
          </button>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="px-5 pt-2 pb-1 shrink-0">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-[26px] font-semibold bg-transparent border-none outline-none text-neutral-300 placeholder-neutral-700 leading-tight"
        />
        {/* Meta */}
        <p className="text-neutral-600 text-[12px] mt-1.5 mb-3">
          {metaDate}&nbsp;&nbsp;|&nbsp;&nbsp;{charCount} characters
        </p>
        {/* Tags */}
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* ── Mode tabs: Normal | Markdown ── */}
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 shrink-0">
        <button
          onClick={() => { setEditorMode('normal'); setPreview(false); }}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            editorMode === 'normal'
              ? 'text-white border-white'
              : 'text-neutral-600 border-transparent hover:text-neutral-400'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => { setEditorMode('markdown'); setPreview(false); }}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            editorMode === 'markdown'
              ? 'text-white border-white'
              : 'text-neutral-600 border-transparent hover:text-neutral-400'
          }`}
        >
          Markdown
        </button>
        {editorMode === 'markdown' && (
          <button
            onClick={() => setPreview(p => !p)}
            className={`ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${
              preview ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Eye size={13} /> {preview ? 'Editing' : 'Preview'}
          </button>
        )}
      </div>

      {/* ── Markdown toolbar (only in markdown edit mode) ── */}
      {editorMode === 'markdown' && !preview && (
        <MarkdownToolbar textareaRef={textareaRef} value={content} onChange={setContent} />
      )}

      {/* ── Content area ── */}
      <div className="flex-1 overflow-hidden">
        {editorMode === 'markdown' && preview ? (
          <MarkdownPreview content={content} />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editorMode === 'normal' ? 'Start typing' : 'Start typing (Markdown supported)'}
            spellCheck
            className={`w-full h-full resize-none px-5 py-3 bg-transparent text-neutral-200 text-[15px] leading-relaxed outline-none placeholder-neutral-700 ${
              editorMode === 'markdown' ? 'font-mono' : ''
            }`}
          />
        )}
      </div>
    </div>
  );
}
