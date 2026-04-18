import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { Sidebar } from './components/layout/Sidebar';
import { NotesList } from './components/notes/NotesList';
import { ArchivedNotes } from './components/notes/ArchivedNotes';
import { Editor } from './components/editor/Editor';
import { VaultUnlock } from './components/vault/VaultUnlock';
import { VaultNotes } from './components/vault/VaultNotes';
import { Settings } from './components/settings/Settings';

function AppShell() {
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderMain = () => {
    if (state.view === 'editor' && state.activeNote) return <Editor />;
    if (state.view === 'vault') {
      return state.vaultLocked ? <VaultUnlock /> : <VaultNotes />;
    }
    if (state.view === 'settings') return <Settings />;
    if (state.view === 'archived') return <ArchivedNotes />;
    return null;
  };

  const showList = !state.activeNote && state.view !== 'vault' && state.view !== 'settings' && state.view !== 'archived';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-w-0 h-full">
        {/* Notes list pane */}
        <div className={`
          flex flex-col border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900
          ${state.activeNote ? 'hidden lg:flex lg:w-72 xl:w-80' : 'flex w-full lg:w-72 xl:w-80'}
          shrink-0
        `}>
          {/* Mobile header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Menu size={18} />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">SecureNotes</span>
          </div>
          {showList ? <NotesList /> : (
            <div className="flex-1 overflow-y-auto">
              {state.view === 'archived' ? <ArchivedNotes /> : <NotesList />}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className={`flex-1 min-w-0 ${!state.activeNote && state.view === 'list' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
          {renderMain() || (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-5">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Select a note</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                Pick a note from the list or create a new one to start writing
              </p>
            </div>
          )}
        </div>
      </div>
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
