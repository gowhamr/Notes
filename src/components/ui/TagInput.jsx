import { useState } from 'react';
import { X, Tag } from 'lucide-react';

export function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('');

  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const tag = input.trim().toLowerCase().replace(/,/g, '');
      if (tag && !tags.includes(tag)) onChange([...tags, tag]);
      setInput('');
    }
  };

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-8 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500">
      <Tag size={13} className="text-gray-400 dark:text-gray-500 shrink-0" />
      {tags.map(t => (
        <span key={t} className="tag-badge">
          {t}
          <button onClick={() => remove(t)} className="hover:text-blue-800 dark:hover:text-blue-200"><X size={11} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={tags.length ? '' : 'Add tags...'}
        className="flex-1 min-w-16 text-xs bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
      />
    </div>
  );
}
