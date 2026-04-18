import { useEffect, useRef } from 'react';

export function useAutoSave(value, saveFn, delay = 1000) {
  const timer = useRef(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveFn(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);
}
