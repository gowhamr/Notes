import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';

export function VaultUnlock() {
  const { state, dispatch, unlockVault, setupVaultPin } = useApp();
  const toast = useToast();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const isSetup = !state.vaultPin;

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    if (isSetup) {
      if (pin.length < 4) { setError('PIN must be at least 4 characters'); return; }
      if (pin !== confirm) { setError('PINs do not match'); return; }
      setupVaultPin(pin); toast('Vault PIN set!', 'success');
    } else {
      if (!unlockVault(pin)) { setError('Incorrect PIN'); setPin(''); }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Back */}
      <div className="px-2 pt-12 pb-4 shrink-0">
        <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'list' })} className="btn-icon">
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Lock icon */}
        <div className="w-20 h-20 rounded-3xl bg-purple-900/40 border border-purple-800/40 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-white mb-1">
          {isSetup ? 'Create Vault PIN' : 'Hidden Vault'}
        </h2>
        <p className="text-sm text-neutral-500 text-center mb-8 max-w-xs">
          {isSetup
            ? 'Set a PIN to protect your private notes'
            : 'Enter your PIN to unlock your encrypted notes'}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder={isSetup ? 'Create PIN' : 'Enter PIN'}
              className="input-field text-center tracking-[0.3em] text-lg pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {isSetup && (
            <input
              type={showPin ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm PIN"
              className="input-field text-center tracking-[0.3em] text-lg"
            />
          )}

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button type="submit" className="btn-vault w-full justify-center py-3 text-base mt-2">
            {isSetup ? 'Create Vault' : 'Unlock'}
          </button>
        </form>

        <p className="text-xs text-neutral-700 mt-6 text-center">
          Protected with AES-256 encryption
        </p>
      </div>
    </div>
  );
}
