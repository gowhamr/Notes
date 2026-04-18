import { FileText, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function BottomNav() {
  const { state, dispatch } = useApp();
  const { bottomTab, view } = state;

  const setTab = (tab) => {
    dispatch({ type: 'SET_BOTTOM_TAB', payload: tab });
    dispatch({ type: 'SET_VIEW', payload: 'list' });
    dispatch({ type: 'SET_ACTIVE', payload: null });
  };

  const isSettings = view === 'settings';

  return (
    <nav
      className="shrink-0 flex items-center border-t"
      style={{ background: 'var(--bg-nav)', borderColor: 'var(--border)' }}
    >
      {[
        { key: 'notes', Icon: FileText, label: 'Notes' },
        { key: 'tasks', Icon: CheckSquare, label: 'Tasks' },
      ].map(({ key, Icon, label }) => {
        const active = bottomTab === key && !isSettings;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="nav-tab transition-colors"
            style={{ color: active ? 'var(--text-1)' : 'var(--text-3)' }}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
