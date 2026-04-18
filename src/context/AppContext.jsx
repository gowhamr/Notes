import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllNotes, saveNote, deleteNote, pinNote, archiveNote,
  moveToVault, moveFromVault, searchNotes, getSetting, setSetting,
} from '../modules/storage';
import { encryptNote, decryptNote, hashPin } from '../modules/encryption';

const AppContext = createContext(null);

const initialState = {
  notes: [],
  filteredNotes: [],
  activeNote: null,
  searchQuery: '',
  activeTag: null,
  view: 'list',          // 'list' | 'editor' | 'vault' | 'settings'
  bottomTab: 'notes',   // 'notes' | 'tasks'
  theme: 'dark',
  vaultLocked: true,
  vaultPin: null,
  vaultPassword: 'vault-default-key',
  syncStatus: 'idle',
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NOTES': return { ...state, notes: action.payload, loading: false };
    case 'SET_FILTERED': return { ...state, filteredNotes: action.payload };
    case 'SET_ACTIVE': return { ...state, activeNote: action.payload, view: action.payload ? 'editor' : 'list' };
    case 'SET_VIEW': return { ...state, view: action.payload };
    case 'SET_SEARCH': return { ...state, searchQuery: action.payload };
    case 'SET_TAG': return { ...state, activeTag: action.payload };
    case 'SET_THEME': return { ...state, theme: action.payload };
    case 'SET_VAULT_LOCKED': return { ...state, vaultLocked: action.payload };
    case 'SET_VAULT_PIN': return { ...state, vaultPin: action.payload };
    case 'SET_SYNC_STATUS': return { ...state, syncStatus: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_BOTTOM_TAB': return { ...state, bottomTab: action.payload };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Boot — load vault PIN, notes; theme is driven by system
  useEffect(() => {
    (async () => {
      const vaultPin = await getSetting('vaultPin', null);
      dispatch({ type: 'SET_VAULT_PIN', payload: vaultPin });
      await refreshNotes();
    })();
  }, []);

  // Auto dark/light — follow OS preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (dark) => dispatch({ type: 'SET_THEME', payload: dark ? 'dark' : 'light' });
    apply(mq.matches);
    const handler = (e) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.classList.toggle('light', state.theme === 'light');
  }, [state.theme]);

  const refreshNotes = useCallback(async () => {
    const notes = await getAllNotes();
    dispatch({ type: 'SET_NOTES', payload: notes });
  }, []);

  // Filter notes when query / tag changes
  useEffect(() => {
    let filtered = state.notes.filter(n => !n.isArchived && !n.isHidden);
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (state.activeTag) {
      filtered = filtered.filter(n => (n.tags || []).includes(state.activeTag));
    }
    const pinned = filtered.filter(n => n.isPinned);
    const unpinned = filtered.filter(n => !n.isPinned);
    dispatch({ type: 'SET_FILTERED', payload: [...pinned, ...unpinned] });
  }, [state.notes, state.searchQuery, state.activeTag]);

  // ── Note actions ─────────────────────────────────────────────────────────────

  const createNote = useCallback(async () => {
    const note = {
      id: undefined,
      title: '',
      content: '',
      tags: [],
      isPinned: 0,
      isArchived: 0,
      isHidden: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const id = await saveNote(note);
    const saved = { ...note, id };
    await refreshNotes();
    dispatch({ type: 'SET_ACTIVE', payload: saved });
    return saved;
  }, [refreshNotes]);

  const updateNote = useCallback(async (note) => {
    await saveNote({ ...note, updatedAt: Date.now() });
    dispatch({ type: 'SET_ACTIVE', payload: { ...note, updatedAt: Date.now() } });
    await refreshNotes();
  }, [refreshNotes]);

  const removeNote = useCallback(async (id) => {
    await deleteNote(id);
    dispatch({ type: 'SET_ACTIVE', payload: null });
    await refreshNotes();
  }, [refreshNotes]);

  const togglePin = useCallback(async (id, isPinned) => {
    await pinNote(id, !isPinned);
    await refreshNotes();
  }, [refreshNotes]);

  const toggleArchive = useCallback(async (id, isArchived) => {
    await archiveNote(id, !isArchived);
    await refreshNotes();
  }, [refreshNotes]);

  const sendToVault = useCallback(async (note) => {
    await moveToVault(note.id);
    await refreshNotes();
    dispatch({ type: 'SET_ACTIVE', payload: null });
  }, [refreshNotes]);

  const retrieveFromVault = useCallback(async (id) => {
    await moveFromVault(id);
    await refreshNotes();
  }, [refreshNotes]);

  // ── Theme ─────────────────────────────────────────────────────────────────────

  const toggleTheme = useCallback(async () => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    await setSetting('theme', next);
    dispatch({ type: 'SET_THEME', payload: next });
  }, [state.theme]);

  // ── Vault auth ────────────────────────────────────────────────────────────────

  const setupVaultPin = useCallback(async (pin) => {
    const hashed = hashPin(pin);
    await setSetting('vaultPin', hashed);
    dispatch({ type: 'SET_VAULT_PIN', payload: hashed });
  }, []);

  const unlockVault = useCallback((pin) => {
    if (!state.vaultPin) {
      dispatch({ type: 'SET_VAULT_LOCKED', payload: false });
      return true;
    }
    const hashed = hashPin(pin);
    if (hashed === state.vaultPin) {
      dispatch({ type: 'SET_VAULT_LOCKED', payload: false });
      return true;
    }
    return false;
  }, [state.vaultPin]);

  const lockVault = useCallback(() => {
    dispatch({ type: 'SET_VAULT_LOCKED', payload: true });
  }, []);

  const value = {
    state,
    dispatch,
    refreshNotes,
    createNote,
    updateNote,
    removeNote,
    togglePin,
    toggleArchive,
    sendToVault,
    retrieveFromVault,
    toggleTheme,
    setupVaultPin,
    unlockVault,
    lockVault,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
