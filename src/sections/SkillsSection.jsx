/* ============================================
   Skills Section — Categorized skills display
   with Add / Edit / Delete functionality
   ============================================ */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAdd, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import Modal from '../components/Modal';
import PasswordPromptModal from '../components/PasswordPromptModal';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['Programming', 'Web Development', 'Tools & Technologies'];

const CATEGORY_COLORS = {
  Programming: { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-100 text-violet-700', tag: 'bg-violet-500/15 text-violet-300' },
  'Web Development': { bg: 'from-cyan-500 to-blue-600', light: 'bg-cyan-100 text-cyan-700', tag: 'bg-cyan-500/15 text-cyan-300' },
  'Tools & Technologies': { bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-100 text-emerald-700', tag: 'bg-emerald-500/15 text-emerald-300' },
};

// Default form state
const EMPTY_FORM = { name: '', category: 'Programming', proficiency: 80 };

export default function SkillsSection() {
  const { isDark } = useTheme();
  const { isAuthenticated, skills, addSkill, updateSkill, deleteSkill } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null); // null = add mode
  const [form, setForm] = useState(EMPTY_FORM);

  // ---- Handlers ----
  const executeAction = (action) => {
    if (!action) return;
    if (action.type === 'add') {
      setEditingSkill(null);
      setForm(EMPTY_FORM);
      setModalOpen(true);
    } else if (action.type === 'edit') {
      const skill = action.payload;
      setEditingSkill(skill);
      setForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency });
      setModalOpen(true);
    } else if (action.type === 'delete') {
      const { id, name } = action.payload;
      deleteSkill(id);
      toast.success(`"${name}" deleted`);
    }
  };

  const executePendingAction = () => {
    executeAction(pendingAction);
    setPendingAction(null);
    setAuthModalOpen(false);
  };

  const requireAuth = (action) => {
    // Always require admin password for adding, editing, or deleting
    setPendingAction(action);
    setAuthModalOpen(true);
  };

  const openAdd = () => requireAuth({ type: 'add' });
  const openEdit = (skill) => requireAuth({ type: 'edit', payload: skill });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Skill name is required');
      return;
    }
    if (editingSkill) {
      updateSkill(editingSkill.id, form);
      toast.success('Skill updated!');
    } else {
      addSkill(form);
      toast.success('Skill added!');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    setPendingAction({ type: 'delete', payload: { id, name } });
    setAuthModalOpen(true);
  };

  return (
    <SectionWrapper id="skills" title="Skills" subtitle="Technologies and tools I work with.">
      {/* Add button */}
      <div className="flex justify-center mb-10">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow cursor-pointer"
        >
          <IoAdd size={20} /> Add Skill
        </motion.button>
      </div>

      {/* Categorized skills */}
      {CATEGORIES.map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat);
        if (catSkills.length === 0) return null;
        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Programming'];

        return (
          <motion.div
            key={cat}
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Category heading */}
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-800'}`}>
              {cat}
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {catSkills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={`group relative p-4 rounded-2xl transition-all duration-300 ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/8 border border-white/5 hover:border-primary-500/30'
                        : 'bg-white hover:shadow-md border border-surface-200 hover:border-primary-200'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-surface-800'}`}>
                        {skill.name}
                      </span>
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(skill)}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            isDark ? 'hover:bg-white/10 text-surface-200' : 'hover:bg-surface-100 text-surface-600'
                          }`}
                          title="Edit"
                          aria-label={`Edit ${skill.name}`}
                        >
                          <IoCreateOutline size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id, skill.name)}
                          className="p-1.5 rounded-lg hover:bg-danger-500/15 text-danger-500 cursor-pointer"
                          title="Delete"
                          aria-label={`Delete ${skill.name}`}
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-white/10' : 'bg-surface-100'
                    }`}>
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bg}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Proficiency label */}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${isDark ? colors.tag : colors.light} px-2 py-0.5 rounded-full`}>
                        {cat.split(' ')[0]}
                      </span>
                      <span className={`text-xs font-mono ${isDark ? 'text-surface-200/60' : 'text-surface-700/60'}`}>
                        {skill.proficiency}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {skills.length === 0 && (
        <p className={`text-center mt-8 ${isDark ? 'text-surface-200/50' : 'text-surface-700/50'}`}>
          No skills yet. Add one above!
        </p>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Skill name */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
              Skill Name
            </label>
            <input
              type="text"
              id="skill-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. React.js"
              className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                  : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
              }`}
              autoFocus
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
              Category
            </label>
            <select
              value={form.category}
              id="skill-category"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500'
                  : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500'
              }`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className={isDark ? 'bg-surface-800' : ''}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
              Proficiency — {form.proficiency}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={form.proficiency}
              id="skill-proficiency"
              onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow cursor-pointer"
          >
            {editingSkill ? 'Save Changes' : 'Add Skill'}
          </button>
        </form>
      </Modal>

      {/* Auth Modal */}
      <PasswordPromptModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={executePendingAction}
        title={
          pendingAction?.type === 'delete'
            ? 'Confirm Deletion'
            : pendingAction?.type === 'add'
            ? 'Add Skill'
            : 'Edit Skill'
        }
        description={
          pendingAction?.type === 'delete'
            ? `Please enter the password to delete "${pendingAction?.payload?.name}".`
            : pendingAction?.type === 'add'
            ? 'Please enter the password to add a new skill.'
            : `Please enter the password to edit "${pendingAction?.payload?.name}".`
        }
        confirmText={
          pendingAction?.type === 'delete'
            ? 'Delete'
            : pendingAction?.type === 'add'
            ? 'Continue'
            : 'Edit'
        }
        isDanger={pendingAction?.type === 'delete'}
      />
    </SectionWrapper>
  );
}
