/* ============================================
   Projects Section — Card layout for projects
   with Add / Edit / Delete + searching
   ============================================ */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoAdd,
  IoCreateOutline,
  IoTrashOutline,
  IoLogoGithub,
  IoOpenOutline,
  IoSearch,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import Modal from '../components/Modal';
import PasswordPromptModal from '../components/PasswordPromptModal';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { getSafeExternalUrl } from '../utils/url';

const EMPTY_FORM = {
  title: '',
  description: '',
  techStack: '',
  githubUrl: '',
  liveUrl: '',
};

export default function ProjectsSection() {
  const { isDark } = useTheme();
  const { isAuthenticated, projects, addProject, updateProject, deleteProject } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  // ---- Handlers ----
  const executeAction = (action) => {
    if (!action) return;
    if (action.type === 'add') {
      setEditingProject(null);
      setForm(EMPTY_FORM);
      setModalOpen(true);
    } else if (action.type === 'edit') {
      const project = action.payload;
      setEditingProject(project);
      setForm({
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
      });
      setModalOpen(true);
    } else if (action.type === 'delete') {
      const { id, title } = action.payload;
      deleteProject(id);
      toast.success(`"${title}" deleted`);
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
  const openEdit = (project) => requireAuth({ type: 'edit', payload: project });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.techStack.trim()) {
      toast.error('Project title, description, and tech stack are required');
      return;
    }
    const githubUrl = getSafeExternalUrl(form.githubUrl);
    const liveUrl = getSafeExternalUrl(form.liveUrl);
    if ((form.githubUrl.trim() && !githubUrl) || (form.liveUrl.trim() && !liveUrl)) {
      toast.error('Links must use an http:// or https:// URL');
      return;
    }
    const project = { ...form, githubUrl: githubUrl || '', liveUrl: liveUrl || '' };
    if (editingProject) {
      updateProject(editingProject.id, project);
      toast.success('Project updated!');
    } else {
      addProject(project);
      toast.success('Project added!');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    setPendingAction({ type: 'delete', payload: { id, title } });
    setAuthModalOpen(true);
  };

  return (
    <SectionWrapper id="projects" title="Projects" subtitle="Some of my recent work and side projects.">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        {/* Search */}
        <div className={`relative w-full max-w-sm ${isDark ? '' : ''}`}>
          <IoSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-surface-200/40' : 'text-surface-700/40'}`} />
          <input
            type="text"
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                : 'bg-white border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
            }`}
          />
        </div>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow cursor-pointer whitespace-nowrap"
        >
          <IoAdd size={20} /> Add Project
        </motion.button>
      </div>

      {/* Projects grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, i) => {
            const githubUrl = getSafeExternalUrl(project.githubUrl);
            const liveUrl = getSafeExternalUrl(project.liveUrl);

            return (
              <motion.article
              key={project.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 hover:bg-white/8 border border-white/5 hover:border-primary-500/30'
                  : 'bg-white hover:shadow-lg border border-surface-200 hover:border-primary-200'
              }`}
            >
              {/* Colored header bar */}
              <div className="h-2 bg-gradient-to-r from-primary-500 to-accent-500" />

              <div className="flex-1 p-5">
                {/* Title + actions */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-surface-800'}`}>
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(project)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isDark ? 'hover:bg-white/10 text-surface-200' : 'hover:bg-surface-100 text-surface-600'
                      }`}
                      title="Edit"
                      aria-label={`Edit ${project.title}`}
                    >
                      <IoCreateOutline size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="p-1.5 rounded-lg hover:bg-danger-500/15 text-danger-500 cursor-pointer"
                      title="Delete"
                      aria-label={`Delete ${project.title}`}
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-surface-200/70' : 'text-surface-700/70'
                }`}>
                  {project.description}
                </p>

                {/* Tech stack badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.split(',').map((tech) => (
                    <span
                      key={tech.trim()}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isDark
                          ? 'bg-primary-500/15 text-primary-300'
                          : 'bg-primary-50 text-primary-600'
                      }`}
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links footer */}
              <div className={`flex items-center gap-3 px-5 py-3 border-t ${
                isDark ? 'border-white/5' : 'border-surface-100'
              }`}>
                  {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isDark ? 'text-surface-200/70 hover:text-white' : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    <IoLogoGithub size={16} /> Code
                  </a>
                )}
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <IoOpenOutline size={16} /> Live Demo
                  </a>
                )}
              </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <p className={`text-center mt-8 ${isDark ? 'text-surface-200/50' : 'text-surface-700/50'}`}>
          {searchQuery ? 'No projects match your search.' : 'No projects yet. Add one above!'}
        </p>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
              Project Title
            </label>
            <input
              type="text"
              id="project-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. AI Chatbot"
              className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                  : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
              }`}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
              Description
            </label>
            <textarea
              rows={3}
              id="project-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief project description…"
              required
              className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all resize-none ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                  : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
              }`}
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
              Tech Stack <span className={`font-normal ${isDark ? 'text-surface-200/40' : 'text-surface-700/40'}`}>(comma-separated)</span>
            </label>
            <input
              type="text"
              id="project-tech-stack"
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
              placeholder="React, Node.js, MongoDB"
              required
              className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                  : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
              }`}
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
                GitHub URL
              </label>
              <input
                type="url"
              id="project-github-url"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://…"
                className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                    : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
                Live URL
              </label>
              <input
                type="url"
              id="project-live-url"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder="https://…"
                className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
                    : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow cursor-pointer"
          >
            {editingProject ? 'Save Changes' : 'Add Project'}
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
            ? 'Add Project'
            : 'Edit Project'
        }
        description={
          pendingAction?.type === 'delete'
            ? `Please enter the password to delete "${pendingAction?.payload?.title}".`
            : pendingAction?.type === 'add'
            ? 'Please enter the password to add a new project.'
            : `Please enter the password to edit "${pendingAction?.payload?.title}".`
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
