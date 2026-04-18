import { useEffect, useRef } from 'react';

export function ContextMenu({ items, position, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-44 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl py-1.5 animate-scale-in overflow-hidden"
      style={{ top: position.y, left: position.x }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="my-1 border-t border-neutral-800" />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
              item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {item.icon && <span className="opacity-60">{item.icon}</span>}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
