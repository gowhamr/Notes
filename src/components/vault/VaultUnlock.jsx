import { useState } from 'react';
import { Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';

export function VaultUnlock() {
  const { state, unlockVault, setupVaultPin } = useApp();
  const toast = useToast();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const isSetup = !state.vaultPin;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (isSetup) {
      if (pin.length < 4) { setError('PIN must be at least 4 characters'); return; }
      if (pin !== confirm) { setError('PINs do not match'); return; }
      setupVaultPin(pin);
      toast('Vault PIN set!', 'success');
    } else {
      if (!unlockVault(pin)) {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-950/30 dark:via-gray-900 dark:to-purple-950/30">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-scale-in">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Shield size={28} className="text-white" />
            </div>
          </div>

          <h2 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {isSetup ? 'Setup Vault PIN' : 'Hidden Vault'}
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isSetup
              ? 'Create a PIN to protect your hidden notes'
              : 'Enter your PIN to access encrypted notes'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder={isSetup ? 'Create PIN' : 'Enter PIN'}
                className="input-field pl-9 pr-10 text-center tracking-widest text-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {isSetup && (
              <input
                type={showPin ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm PIN"
                className="input-field text-center tracking-widest text-lg"
              />
            )}

            {error && (
              <p className="text-xs text-red-500 text-center animate-fade-in">{error}</p>
            )}

            <button type="submit" className="btn-vault w-full justify-center py-3 text-base">
              {isSetup ? 'Create Vault' : 'Unlock Vault'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Notes in vault are encrypted with AES-256
          </p>
        </div>
      </div>
    </div>
  );
}
