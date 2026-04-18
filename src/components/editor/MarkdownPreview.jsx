import { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

export function MarkdownPreview({ content, onClick, className = '' }) {
  const html = useMemo(() => marked.parse(content || ''), [content]);

  if (!content?.trim()) {
    return (
      <div
        onClick={onClick}
        className={`px-5 py-3 h-full cursor-text ${className}`}
        style={{ color: 'var(--text-3)' }}
      >
        Start typing…
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`md-render px-5 py-3 overflow-y-auto h-full cursor-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
