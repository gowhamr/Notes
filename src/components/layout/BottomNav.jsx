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
    <nav className="shrink-0 flex items-center border-t border-neutral-800 bg-neutral-950 pb-safe">
      <button
        className={`nav-tab ${bottomTab === 'notes' && !isSettings ? 'text-white' : 'text-neutral-600'}`}
        onClick={() => setTab('notes')}
      >
        <FileText size={22} strokeWidth={bottomTab === 'notes' && !isSettings ? 2 : 1.5} />
        <span className="text-[11px] font-medium">Notes</span>
      </button>

      <button
        className={`nav-tab ${bottomTab === 'tasks' && !isSettings ? 'text-white' : 'text-neutral-600'}`}
        onClick={() => setTab('tasks')}
      >
        <CheckSquare size={22} strokeWidth={bottomTab === 'tasks' && !isSettings ? 2 : 1.5} />
        <span className="text-[11px] font-medium">Tasks</span>
      </button>
    </nav>
  );
}
