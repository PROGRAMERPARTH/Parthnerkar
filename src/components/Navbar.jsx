/* ============================================
   Navbar — Fixed top navigation bar
   Includes dark/light toggle & mobile menu
   ============================================ */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSunny, IoMoon, IoMenu, IoClose, IoPlayCircleOutline } from 'react-icons/io5';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ onReplayIntro }) {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll for blur background
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop / Tablet navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? isDark
              ? 'bg-surface-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10'
              : 'bg-white/80 backdrop-blur-xl border-b border-surface-200 shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <a href="#hero" className="text-xl font-bold gradient-text tracking-tight">
            &lt;Portfolio /&gt;
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-surface-200 hover:text-white hover:bg-white/8'
                    : 'text-surface-700 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                {link.label}
              </a>
            ))}

            {/* Replay Intro Video */}
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className={`ml-2 p-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  isDark
                    ? 'bg-white/8 hover:bg-white/15 text-primary-300 hover:text-white'
                    : 'bg-surface-100 hover:bg-surface-200 text-primary-600 hover:text-primary-700'
                }`}
                title="Play Intro Video"
                aria-label="Play Intro Video"
              >
                <IoPlayCircleOutline size={18} />
                <span className="hidden lg:inline">Intro</span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`ml-1 p-2.5 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/8 hover:bg-white/15 text-yellow-300'
                  : 'bg-surface-100 hover:bg-surface-200 text-primary-600'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <IoSunny size={18} /> : <IoMoon size={18} />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-white/8 hover:bg-white/15 text-primary-300'
                    : 'bg-surface-100 hover:bg-surface-200 text-primary-600'
                }`}
                title="Play Intro Video"
                aria-label="Play Intro Video"
              >
                <IoPlayCircleOutline size={18} />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/8 hover:bg-white/15 text-yellow-300'
                  : 'bg-surface-100 hover:bg-surface-200 text-primary-600'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <IoSunny size={18} /> : <IoMoon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/8 hover:bg-white/15 text-white'
                  : 'bg-surface-100 hover:bg-surface-200 text-surface-800'
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={`fixed inset-0 z-30 pt-20 ${
              isDark ? 'bg-surface-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center gap-2 p-6">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`w-full text-center py-3 rounded-xl text-lg font-medium transition-colors ${
                    isDark
                      ? 'text-surface-200 hover:text-white hover:bg-white/8'
                      : 'text-surface-700 hover:text-surface-900 hover:bg-surface-100'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
