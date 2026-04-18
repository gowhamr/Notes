import { useEffect, useRef } from 'react';

export function useInactivityLock(lockFn, timeoutMs = 5 * 60 * 1000, enabled = true) {
  const timer = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(lockFn, timeoutMs);
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset, true));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset, true));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lockFn, timeoutMs, enabled]);
}
