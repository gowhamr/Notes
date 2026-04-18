import { useState, useRef } from 'react';
import {
  Sun, Moon, Download, Upload, Trash2, Shield, RefreshCw,
  FileJson, FileText, Key, CloudUpload, Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import {
  exportToJSON, importFromJSON, importMarkdownFile,
} from '../../modules/sync';
import { clearAllData, saveNote } from '../../modules/storage';
import { Modal } from '../ui/Modal';

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3 px-1">{title}</h3>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, description, action, danger }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
      <div className={`shrink-0 ${danger ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export function Settings() {
  const { state, toggleTheme, setupVaultPin, refreshNotes } = useApp();
  const toast = useToast();
  const jsonRef = useRef();
  const mdRef = useRef();
  const [clearModal, setClearModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleExportJSON = async () => {
    await exportToJSON();
    toast('Backup exported', 'success');
  };

  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importFromJSON(file);
      await refreshNotes();
      toast(`Imported ${count} notes`, 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
    e.target.value = '';
  };

  const handleImportMD = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let count = 0;
    for (const file of files) {
      const note = await importMarkdownFile(file);
      await saveNote(note);
      count++;
    }
    await refreshNotes();
    toast(`Imported ${count} markdown file${count > 1 ? 's' : ''}`, 'success');
    e.target.value = '';
  };

  const handleClearData = async () => {
    await clearAllData();
    await refreshNotes();
    setClearModal(false);
    toast('All data cleared', 'info');
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) { toast('PIN must be at least 4 characters', 'error'); return; }
    if (newPin !== confirmPin) { toast('PINs do not match', 'error'); return; }
    await setupVaultPin(newPin);
    setPinModal(false);
    setNewPin('');
    setConfirmPin('');
    toast('Vault PIN updated', 'success');
  };

  const noteCount = state.notes.filter(n => !n.isHidden).length;
  const vaultCount = state.notes.filter(n => n.isHidden).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Notes', value: noteCount },
            { label: 'Vault', value: vaultCount },
            { label: 'Total', value: noteCount + vaultCount },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <Section title="Appearance">
          <Row
            icon={state.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            label="Theme"
            description={state.theme === 'dark' ? 'Dark mode active' : 'Light mode active'}
            action={
              <button
                onClick={toggleTheme}
                className={`relative w-11 h-6 rounded-full transition-colors ${state.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${state.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            }
          />
        </Section>

        <Section title="Import / Export">
          <Row
            icon={<Download size={16} />}
            label="Export Backup"
            description="Download all notes as JSON"
            action={<button onClick={handleExportJSON} className="btn-primary"><FileJson size={13} /> Export</button>}
          />
          <Row
            icon={<Upload size={16} />}
            label="Import Backup"
            description="Restore from JSON backup file"
            action={
              <>
                <button onClick={() => jsonRef.current?.click()} className="btn-secondary"><Upload size={13} /> Import</button>
                <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
              </>
            }
          />
          <Row
            icon={<FileText size={16} />}
            label="Import Markdown"
            description="Import one or more .md files"
            action={
              <>
                <button onClick={() => mdRef.current?.click()} className="btn-secondary"><Upload size={13} /> Import .md</button>
                <input ref={mdRef} type="file" accept=".md" multiple className="hidden" onChange={handleImportMD} />
              </>
            }
          />
        </Section>

        <Section title="Security">
          <Row
            icon={<Key size={16} />}
            label="Vault PIN"
            description={state.vaultPin ? 'Change your vault PIN' : 'Set up vault PIN protection'}
            action={<button onClick={() => setPinModal(true)} className="btn-secondary"><Shield size={13} /> {state.vaultPin ? 'Change PIN' : 'Setup PIN'}</button>}
          />
        </Section>

        <Section title="Cloud Sync">
          <Row
            icon={<CloudUpload size={16} />}
            label="Google Drive"
            description="Connect to sync & backup (configure API key in settings)"
            action={<button className="btn-secondary opacity-60 cursor-not-allowed"><RefreshCw size={13} /> Connect</button>}
          />
        </Section>

        <Section title="Danger Zone">
          <Row
            icon={<Trash2 size={16} />}
            label="Clear All Data"
            description="Permanently delete all notes and settings"
            danger
            action={<button onClick={() => setClearModal(true)} className="btn-danger"><Trash2 size={13} /> Clear</button>}
          />
        </Section>

        <div className="text-center py-4 text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <Info size={12} /> SecureNotes v1.0.0 • Offline-first • AES-256 Encrypted
        </div>
      </div>

      {/* Clear modal */}
      <Modal isOpen={clearModal} onClose={() => setClearModal(false)} title="Clear All Data" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          This will permanently delete all notes, vault contents, and settings. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setClearModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleClearData} className="btn-danger flex-1 justify-center">Delete Everything</button>
        </div>
      </Modal>

      {/* PIN modal */}
      <Modal isOpen={pinModal} onClose={() => setPinModal(false)} title="Change Vault PIN" size="sm">
        <div className="space-y-3">
          <input
            type="password"
            value={newPin}
            onChange={e => setNewPin(e.target.value)}
            placeholder="New PIN (min. 4 chars)"
            className="input-field"
          />
          <input
            type="password"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value)}
            placeholder="Confirm PIN"
            className="input-field"
          />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPinModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleChangePin} className="btn-vault flex-1 justify-center">Save PIN</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
