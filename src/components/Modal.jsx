/* ============================================
   Reusable Modal Component
   Glassmorphism overlay with Framer Motion
   ============================================ */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { useTheme } from '../context/ThemeContext';

export default function Modal({ isOpen, onClose, title, children }) {
  const { isDark } = useTheme();
  const titleId = 'modal-title';

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto ${
                isDark
                  ? 'bg-surface-800/90 backdrop-blur-xl border border-white/10'
                  : 'bg-white/90 backdrop-blur-xl border border-surface-200'
              }`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 id={titleId} className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-800'}`}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-white/10 text-surface-200'
                      : 'hover:bg-surface-100 text-surface-700'
                  }`}
                  aria-label="Close modal"
                >
                  <IoClose size={22} />
                </button>
              </div>

              {/* Content */}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
