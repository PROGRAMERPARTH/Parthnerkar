/* ============================================
   Resume Section — Download button + preview
   ============================================ */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoDownloadOutline, IoDocumentTextOutline, IoEyeOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { generateResume, previewResume } from '../utils/generateResume';

export default function ResumeSection() {
  const { isDark } = useTheme();
  const { skills, projects, certificates } = useData();
  const [loadingAction, setLoadingAction] = useState(null); // 'download' | 'preview' | null

  const handleDownload = async (e) => {
    e.preventDefault();
    if (loadingAction) return;
    try {
      setLoadingAction('download');
      toast.loading('Generating PDF resume...', { id: 'resume-op' });
      await generateResume(skills, projects, certificates);
      toast.success('Resume downloaded!', { id: 'resume-op' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF resume.', { id: 'resume-op' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePreview = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction('preview');
      toast.loading('Opening PDF preview...', { id: 'resume-op' });
      await previewResume(skills, projects, certificates);
      toast.dismiss('resume-op');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to preview PDF.', { id: 'resume-op' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <SectionWrapper id="resume" title="Resume" subtitle="Get a copy of my latest resume.">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`relative rounded-2xl p-8 md:p-12 text-center overflow-hidden ${
            isDark
              ? 'bg-white/5 border border-white/5'
              : 'bg-white border border-surface-200 shadow-sm'
          }`}
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
              isDark
                ? 'bg-primary-500/15 text-primary-400'
                : 'bg-primary-50 text-primary-600'
            }`}>
              <IoDocumentTextOutline size={32} />
            </div>

            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-surface-800'}`}>
              My Resume
            </h3>
            <p className={`text-sm mb-8 max-w-md mx-auto ${
              isDark ? 'text-surface-200/60' : 'text-surface-700/60'
            }`}>
              Interested in working together? Download my resume to learn more about my experience,
              education, and skill set.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Download button */}
              <motion.button
                type="button"
                onClick={handleDownload}
                disabled={Boolean(loadingAction)}
                whileHover={{ scale: loadingAction ? 1 : 1.04 }}
                whileTap={{ scale: loadingAction ? 1 : 0.97 }}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all ${
                  loadingAction ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <IoDownloadOutline size={20} />
                {loadingAction === 'download' ? 'Generating PDF...' : 'Download Resume'}
              </motion.button>

              {/* Preview button */}
              <motion.button
                type="button"
                onClick={handlePreview}
                disabled={Boolean(loadingAction)}
                whileHover={{ scale: loadingAction ? 1 : 1.04 }}
                whileTap={{ scale: loadingAction ? 1 : 0.97 }}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border transition-all ${
                  isDark
                    ? 'border-white/15 text-surface-200 hover:bg-white/8'
                    : 'border-surface-200 text-surface-700 hover:bg-surface-100'
                } ${loadingAction ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <IoEyeOutline size={20} />
                {loadingAction === 'preview' ? 'Opening PDF...' : 'Preview PDF'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
