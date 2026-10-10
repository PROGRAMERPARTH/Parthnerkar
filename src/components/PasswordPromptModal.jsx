/* ============================================
   Password Prompt Modal — For action verification
   ============================================ */

import { useState } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { IoEyeOutline, IoEyeOffOutline, IoLockClosedOutline, IoTrashOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export default function PasswordPromptModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Enter Password',
  description = 'Please enter the password to continue.',
  confirmText = 'Verify',
  isDanger = false,
}) {
  const { isDark } = useTheme();
  const { authenticate } = useData();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter the password');
      return;
    }

    setIsSubmitting(true);
    const result = await authenticate(password);
    setIsSubmitting(false);
    if (result.success) {
      setPassword('');
      setShowPassword(false);
      onSuccess();
    } else {
      toast.error(result.error || 'Incorrect password.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDanger
                ? isDark
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-rose-100 text-rose-600'
                : isDark
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-primary-100 text-primary-600'
            }`}
          >
            {isDanger ? <IoTrashOutline size={20} /> : <IoLockClosedOutline size={20} />}
          </div>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-surface-200/90' : 'text-surface-700'}`}>
            {description}
          </p>
        </div>

        <div>
          <label
            htmlFor="action-password"
            className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-surface-200' : 'text-surface-700'
            }`}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="action-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className={`w-full pl-4 pr-11 py-2.5 rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500'
                  : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500'
              }`}
              autoFocus
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                isDark
                  ? 'text-surface-200/50 hover:text-surface-200'
                  : 'text-surface-700/50 hover:text-surface-700'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className={`flex-1 py-2.5 rounded-xl font-medium border transition-colors ${
              isDark
                ? 'border-white/10 text-surface-200 hover:bg-white/5'
                : 'border-surface-200 text-surface-700 hover:bg-surface-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all cursor-pointer ${
              isDanger
                ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/25 hover:shadow-rose-500/40'
                : 'bg-gradient-to-r from-primary-500 to-accent-500 shadow-primary-500/25 hover:shadow-primary-500/40'
            }`}
          >
            {isSubmitting ? 'Verifying…' : confirmText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
