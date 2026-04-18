import { useState, useRef } from 'react';
import {
  Sun, Moon, Download, Upload, Trash2, Shield, RefreshCw,
  FileJson, FileText, Key, CloudUpload, Info, ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { exportToJSON, importFromJSON, importMarkdownFile } from '../../modules/sync';
import { clearAllData, saveNote } from '../../modules/storage';
import { Modal } from '../ui/Modal';

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-3)' }}>{title}</p>
      <div className="settings-section">{children}</div>
    </div>
  );
}

function Row({ icon, label, description, action, danger }) {
  return (
    <div className="settings-row" style={danger ? { color: '#f87171' } : {}}>
      <div className="shrink-0" style={{ color: danger ? '#ef4444' : 'var(--text-2)' }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export function Settings() {
  const { state, dispatch, toggleTheme, setupVaultPin, refreshNotes } = useApp();
  const toast = useToast();
  const jsonRef = useRef();
  const mdRef = useRef();
  const [clearModal, setClearModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const back = () => dispatch({ type: 'SET_VIEW', payload: 'list' });

  const handleExportJSON = async () => { await exportToJSON(); toast('Backup exported', 'success'); };

  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const n = await importFromJSON(file); await refreshNotes(); toast(`Imported ${n} notes`, 'success'); }
    catch (err) { toast(err.message, 'error'); }
    e.target.value = '';
  };

  const handleImportMD = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    for (const f of files) await saveNote(await importMarkdownFile(f));
    await refreshNotes();
    toast(`Imported ${files.length} file${files.length > 1 ? 's' : ''}`, 'success');
    e.target.value = '';
  };

  const handleClearData = async () => {
    await clearAllData(); await refreshNotes();
    setClearModal(false); toast('All data cleared', 'info');
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) { toast('Min. 4 characters', 'error'); return; }
    if (newPin !== confirmPin) { toast('PINs do not match', 'error'); return; }
    await setupVaultPin(newPin); setPinModal(false); setNewPin(''); setConfirmPin('');
    toast('Vault PIN updated', 'success');
  };

  const noteCount  = state.notes.filter(n => !n.isHidden).length;
  const vaultCount = state.notes.filter(n => n.isHidden).length;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="flex items-center px-2 pt-12 pb-3 shrink-0">
        <button onClick={back} className="btn-icon"><ArrowLeft size={22} /></button>
        <h1 className="flex-1 text-center text-lg font-semibold text-white">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[{ label: 'Notes', value: noteCount }, { label: 'Vault', value: vaultCount }, { label: 'Total', value: noteCount + vaultCount }].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <Section title="Appearance">
          <Row
            icon={state.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            label="Theme"
            description="Follows your system dark/light setting"
            action={
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-input)', color: 'var(--text-2)' }}>
                {state.theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            }
          />
        </Section>

        <Section title="Import / Export">
          <Row icon={<Download size={16} />} label="Export JSON Backup" description="Download all notes"
            action={<button onClick={handleExportJSON} className="btn-secondary py-1.5 text-xs"><FileJson size={12} /> Export</button>} />
          <Row icon={<Upload size={16} />} label="Import JSON Backup" description="Restore from backup"
            action={<>
              <button onClick={() => jsonRef.current?.click()} className="btn-secondary py-1.5 text-xs"><Upload size={12} /> Import</button>
              <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
            </>} />
          <Row icon={<FileText size={16} />} label="Import Markdown" description="Import .md files"
            action={<>
              <button onClick={() => mdRef.current?.click()} className="btn-secondary py-1.5 text-xs"><Upload size={12} /> Import</button>
              <input ref={mdRef} type="file" accept=".md" multiple className="hidden" onChange={handleImportMD} />
            </>} />
        </Section>

        <Section title="Security">
          <Row icon={<Key size={16} />} label="Vault PIN" description={state.vaultPin ? 'Change PIN' : 'Set up PIN'}
            action={<button onClick={() => setPinModal(true)} className="btn-secondary py-1.5 text-xs"><Shield size={12} /> {state.vaultPin ? 'Change' : 'Setup'}</button>} />
        </Section>

        <Section title="Cloud Sync">
          <Row icon={<CloudUpload size={16} />} label="Google Drive" description="Sync & backup (API key required)"
            action={<button disabled className="btn-secondary py-1.5 text-xs opacity-40 cursor-not-allowed"><RefreshCw size={12} /> Connect</button>} />
        </Section>

        <Section title="Danger Zone">
          <Row icon={<Trash2 size={16} />} label="Clear All Data" description="Delete all notes and settings" danger
            action={<button onClick={() => setClearModal(true)} className="btn-danger py-1.5 text-xs"><Trash2 size={12} /> Clear</button>} />
        </Section>

        <p className="text-center py-4 text-xs text-neutral-800 flex items-center justify-center gap-1.5">
          <Info size={11} /> SecureNotes v1.0.0 • AES-256 • Offline-first
        </p>
      </div>

      <Modal isOpen={clearModal} onClose={() => setClearModal(false)} title="Clear All Data" size="sm">
        <p className="text-sm text-neutral-400 mb-5">This permanently deletes all notes, vault, and settings. Cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setClearModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleClearData} className="btn-danger flex-1 justify-center">Delete All</button>
        </div>
      </Modal>

      <Modal isOpen={pinModal} onClose={() => setPinModal(false)} title="Vault PIN" size="sm">
        <div className="space-y-3">
          <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN (min. 4 chars)" className="input-field" />
          <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirm PIN" className="input-field" />
          <div className="flex gap-3 pt-1">
            <button onClick={() => setPinModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleChangePin} className="btn-vault flex-1 justify-center">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
