import { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

export function MarkdownPreview({ content }) {
  const html = useMemo(() => marked.parse(content || ''), [content]);

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none px-6 py-4 overflow-y-auto h-full
        prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
        prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-blue-700 dark:prose-code:text-blue-300 prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:rounded-xl prose-pre:text-sm
        prose-blockquote:border-blue-400 prose-blockquote:text-gray-500 dark:prose-blockquote:text-gray-400
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-hr:border-gray-200 dark:prose-hr:border-gray-700
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        prose-table:text-sm prose-th:bg-gray-50 dark:prose-th:bg-gray-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
