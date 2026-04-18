import { useRef, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Minus, Link, Heading1, Heading2, Code2,
} from 'lucide-react';

const FORMATS = [
  { icon: <Heading1 size={13} />, title: 'Heading 1',  wrap: ['# ', ''],          block: true },
  { icon: <Heading2 size={13} />, title: 'Heading 2',  wrap: ['## ', ''],          block: true },
  { separator: true },
  { icon: <Bold size={13} />,         title: 'Bold',       wrap: ['**', '**'] },
  { icon: <Italic size={13} />,       title: 'Italic',     wrap: ['*', '*'] },
  { icon: <Strikethrough size={13} />,title: 'Strikethrough', wrap: ['~~', '~~'] },
  { separator: true },
  { icon: <Code size={13} />,         title: 'Inline code', wrap: ['`', '`'] },
  { icon: <Code2 size={13} />,        title: 'Code block',  wrap: ['```\n', '\n```'], block: true },
  { separator: true },
  { icon: <List size={13} />,         title: 'Bullet list',    wrap: ['- ', ''],    block: true, multiline: true },
  { icon: <ListOrdered size={13} />,  title: 'Numbered list',  wrap: ['1. ', ''],   block: true, multiline: true },
  { icon: <Quote size={13} />,        title: 'Blockquote',     wrap: ['> ', ''],    block: true },
  { icon: <Minus size={13} />,        title: 'Divider',        wrap: ['\n---\n', ''], block: true },
  { separator: true },
  { icon: <Link size={13} />,         title: 'Link',       wrap: ['[', '](url)'] },
];

export function MarkdownToolbar({ textareaRef, onChange, value }) {
  const applyFormat = useCallback((fmt) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const [before, after] = fmt.wrap;

    let newText;
    let newCursor;

    if (fmt.multiline && selected.includes('\n')) {
      // prefix each line
      const lines = selected.split('\n').map(l => before + l).join('\n');
      newText = value.slice(0, start) + lines + value.slice(end);
      newCursor = start + lines.length;
    } else if (fmt.block && !selected) {
      newText = value.slice(0, start) + before + (after ? 'text' + after : '') + value.slice(end);
      newCursor = start + before.length;
    } else {
      newText = value.slice(0, start) + before + selected + after + value.slice(end);
      newCursor = selected
        ? start + before.length + selected.length + after.length
        : start + before.length;
    }

    onChange(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    });
  }, [textareaRef, value, onChange]);

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex-wrap">
      {FORMATS.map((fmt, i) =>
        fmt.separator ? (
          <div key={i} className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
        ) : (
          <button
            key={i}
            type="button"
            title={fmt.title}
            onMouseDown={(e) => { e.preventDefault(); applyFormat(fmt); }}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {fmt.icon}
          </button>
        )
      )}
    </div>
  );
}
