import { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Undo2, Redo2, Check, MoreHorizontal,
  Pin, Archive, Lock, Trash2, Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { useAutoSave } from '../../hooks/useAutoSave';
import { TagInput } from '../ui/TagInput';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { exportNoteAsMarkdown } from '../../modules/sync';

function useHistory(initial) {
  const [value, setValue] = useState(initial);
  const stack = useRef([initial]);
  const cursor = useRef(0);

  const set = useCallback((next) => {
    stack.current = stack.current.slice(0, cursor.current + 1);
    stack.current.push(next);
    if (stack.current.length > 100) stack.current.shift();
    cursor.current = stack.current.length - 1;
    setValue(next);
  }, []);

  const undo = useCallback(() => {
    if (cursor.current > 0) { cursor.current--; setValue(stack.current[cursor.current]); }
  }, []);

  const redo = useCallback(() => {
    if (cursor.current < stack.current.length - 1) { cursor.current++; setValue(stack.current[cursor.current]); }
  }, []);

  const reset = useCallback((val) => {
    stack.current = [val]; cursor.current = 0; setValue(val);
  }, []);

  return [value, set, undo, redo, reset];
}

export function Editor() {
  const { state, dispatch, updateNote, removeNote, togglePin, toggleArchive, sendToVault } = useApp();
  const toast = useToast();
  const note = state.activeNote;
  const textareaRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent, undo, redo, resetContent] = useHistory(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [tab, setTab] = useState('normal'); // 'normal' | 'markdown'

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      resetContent(note.content || '');
      setTags(note.tags || []);
      setTab('normal');
      setShowMore(false);
    }
  }, [note?.id]);

  const save = useCallback(async () => {
    if (!note) return;
    await updateNote({ ...note, title, content, tags });
  }, [note, title, content, tags, updateNote]);

  useAutoSave({ title, content, tags }, save, 1000);

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
  const handleSave = async () => { await save(); toast('Saved', 'success'); };

  const charCount = content.length;
  const ts = note?.updatedAt || note?.createdAt || Date.now();
  const metaStr = format(ts, 'd MMMM  h:mm aa') + '  |  ' + charCount + ' characters';

  // When user taps the rendered view → switch to Markdown tab to edit
  const focusEdit = () => {
    setTab('markdown');
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    });
  };

  if (!note) return null;

  const isDark = state.theme === 'dark';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-2 pt-12 pb-1 shrink-0">
        <button onClick={back} className="btn-icon" title="Back">
          <ArrowLeft size={22} />
        </button>

        <div className="flex items-center gap-0.5">
          <button onClick={undo} className="btn-icon" title="Undo"><Undo2 size={20} /></button>
          <button onClick={redo} className="btn-icon" title="Redo"><Redo2 size={20} /></button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMore(s => !s)}
              className="btn-icon"
              title="More"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMore && (
              <div
                className="absolute right-0 top-full mt-1 rounded-2xl border shadow-2xl z-50 overflow-hidden min-w-44 animate-scale-in"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {[
                  { icon: <Pin size={15} />, label: note.isPinned ? 'Unpin' : 'Pin', action: () => { togglePin(note.id, note.isPinned); toast(note.isPinned ? 'Unpinned' : 'Pinned', 'success'); } },
                  { icon: <Archive size={15} />, label: note.isArchived ? 'Unarchive' : 'Archive', action: () => { toggleArchive(note.id, note.isArchived); toast('Done', 'success'); } },
                  { icon: <Download size={15} />, label: 'Export .md', action: () => { exportNoteAsMarkdown({ ...note, title, content }); toast('Exported', 'success'); } },
                  { icon: <Lock size={15} />, label: 'Move to Vault', action: () => { sendToVault({ ...note, title, content, tags }); toast('Moved to vault', 'success'); } },
                  { sep: true },
                  { icon: <Trash2 size={15} />, label: 'Delete', danger: true, action: () => { removeNote(note.id); toast('Deleted', 'info'); } },
                ].map((item, i) => item.sep ? (
                  <div key={i} style={{ borderTop: '1px solid var(--border)' }} />
                ) : (
                  <button
                    key={i}
                    onClick={() => { item.action(); setShowMore(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${item.danger ? 'text-red-400' : ''}`}
                    style={!item.danger ? { color: 'var(--text-1)' } : {}}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <span style={{ color: item.danger ? undefined : 'var(--text-2)' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save / Done ✓ */}
          <button
            onClick={handleSave}
            className="btn-icon !text-amber-400 hover:!text-amber-300"
            title="Save"
          >
            <Check size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="px-5 pt-2 pb-0 shrink-0">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-[26px] font-bold bg-transparent border-none outline-none leading-tight"
          style={{ color: 'var(--text-1)', caretColor: '#f5a623' }}
        />
        <p className="text-[12px] mt-1.5 mb-3" style={{ color: 'var(--text-2)' }}>
          {metaStr}
        </p>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* ── Mode tabs: Normal | Markdown ── */}
      <div
        className="flex items-center gap-5 px-5 pt-4 pb-0 shrink-0 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {['normal', 'markdown'].map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === 'markdown') requestAnimationFrame(() => textareaRef.current?.focus());
            }}
            className="pb-2 text-sm font-medium capitalize transition-colors border-b-2"
            style={tab === t
              ? { color: 'var(--text-1)', borderColor: 'var(--text-1)' }
              : { color: 'var(--text-3)', borderColor: 'transparent' }
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Markdown toolbar ── */}
      {tab === 'markdown' && (
        <MarkdownToolbar textareaRef={textareaRef} value={content} onChange={setContent} />
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {tab === 'normal' ? (
          /* Rendered markdown — tap to edit (switches to Markdown tab) */
          <MarkdownPreview
            content={content}
            onClick={focusEdit}
          />
        ) : (
          /* Raw editor */
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing…"
            spellCheck
            className="w-full h-full resize-none px-5 py-3 bg-transparent text-[15px] leading-relaxed outline-none font-mono"
            style={{ color: 'var(--text-1)', caretColor: '#f5a623' }}
          />
        )}
      </div>

      {/* Dismiss more-menu backdrop */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
      )}
    </div>
  );
}
