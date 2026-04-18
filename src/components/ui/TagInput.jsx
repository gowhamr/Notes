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
    <div className="flex flex-wrap gap-1.5 items-center min-h-8">
      <Tag size={12} className="text-neutral-700 shrink-0" />
      {tags.map(t => (
        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-400">
          {t}
          <button onClick={() => remove(t)} className="hover:text-white transition-colors"><X size={10} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={tags.length ? '' : 'Add tags…'}
        className="flex-1 min-w-16 text-xs bg-transparent outline-none text-neutral-500 placeholder-neutral-700"
      />
    </div>
  );
}
