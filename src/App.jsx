import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { NotesList } from './components/notes/NotesList';
import { Editor } from './components/editor/Editor';
import { VaultUnlock } from './components/vault/VaultUnlock';
import { VaultNotes } from './components/vault/VaultNotes';
import { Settings } from './components/settings/Settings';
import { TasksList } from './components/tasks/TasksList';
import { BottomNav } from './components/layout/BottomNav';
import { Plus } from 'lucide-react';

function AppShell() {
  const { state, createNote, dispatch } = useApp();
  const { view, activeNote, bottomTab } = state;

  const showEditor = view === 'editor' && activeNote;
  const showVault  = view === 'vault';
  const showSettings = view === 'settings';

  const showList = !showEditor && !showVault && !showSettings;
  const showFAB  = showList && bottomTab === 'notes';

  return (
    <div className="relative flex flex-col h-screen max-w-2xl mx-auto overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-hidden">
        {showEditor && <Editor />}
        {showVault  && (state.vaultLocked ? <VaultUnlock /> : <VaultNotes />)}
        {showSettings && <Settings />}
        {showList && (
          bottomTab === 'tasks' ? <TasksList /> : <NotesList />
        )}
      </div>

      {/* ── FAB ── */}
      {showFAB && (
        <button
          onClick={createNote}
          className="absolute bottom-20 right-5 w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 flex items-center justify-center shadow-2xl shadow-amber-400/30 transition-all z-30"
          aria-label="New note"
        >
          <Plus size={26} strokeWidth={2.5} className="text-black" />
        </button>
      )}

      {/* ── Bottom Nav ── */}
      {!showEditor && !showVault && (
        <BottomNav />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ToastProvider>
  );
}
