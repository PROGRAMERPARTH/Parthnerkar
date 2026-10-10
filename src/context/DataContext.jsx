/* ============================================
   Data Context — Manages skills, projects, 
   certificates with Server Database & LocalStorage sync
   ============================================ */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext(null);

// ---- Default seed data (empty - demo data removed) ----
const DEFAULT_SKILLS = [];
const DEFAULT_PROJECTS = [];
const DEFAULT_CERTIFICATES = [];

const DEMO_SKILL_NAMES = new Set([
  'Python', 'JavaScript', 'C++', 'Java', 'React.js', 'Node.js',
  'Tailwind CSS', 'HTML/CSS', 'Git & GitHub', 'Docker', 'TensorFlow', 'VS Code',
]);
const DEMO_PROJECT_TITLES = new Set([
  'AI Chatbot Platform', 'E-Commerce Dashboard', 'Portfolio Builder',
]);
const DEMO_CERT_TITLES = new Set([
  'Deep Learning Specialization', 'AWS Cloud Practitioner', 'React Developer Certificate',
]);

// ---- Helper: generate unique IDs ----
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---- Helper: LocalStorage read/write ----
function loadFromStorage(key, fallback, isDemoFilter) {
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? JSON.parse(raw) : fallback;
    const list = Array.isArray(fallback) && !Array.isArray(value) ? fallback : value;
    if (Array.isArray(list) && isDemoFilter) {
      return list.filter((item) => !isDemoFilter(item));
    }
    return list;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// ---- Provider Component ----
export function DataProvider({ children }) {
  const [skills, setSkills] = useState(() =>
    loadFromStorage('portfolio_skills', DEFAULT_SKILLS, (s) => DEMO_SKILL_NAMES.has(s?.name) || ['1','2','3','4','5','6','7','8','9','10','11','12'].includes(String(s?.id)))
  );
  const [projects, setProjects] = useState(() =>
    loadFromStorage('portfolio_projects', DEFAULT_PROJECTS, (p) => DEMO_PROJECT_TITLES.has(p?.title) || ['1','2','3'].includes(String(p?.id)))
  );
  const [certificates, setCertificates] = useState(() =>
    loadFromStorage('portfolio_certificates', DEFAULT_CERTIFICATES, (c) => DEMO_CERT_TITLES.has(c?.title) || ['1','2','3'].includes(String(c?.id)))
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth session on startup
  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : { authenticated: false }))
      .then((data) => {
        if (active) setIsAuthenticated(data.authenticated === true);
      })
      .catch(() => {
        if (active) setIsAuthenticated(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Fetch initial data from server database
  useEffect(() => {
    let active = true;
    fetch('/api/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.skills)) setSkills(data.skills);
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.certificates)) setCertificates(data.certificates);
      })
      .catch((err) => {
        console.warn('Could not load data from server database, using cached local data:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  const authenticate = async (password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.authenticated) {
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Authentication failed.' };
    } catch {
      return { success: false, error: 'Unable to reach the authentication service.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore network errors on logout
    }
    setIsAuthenticated(false);
  };

  // Persist locally whenever state changes as cache
  useEffect(() => saveToStorage('portfolio_skills', skills), [skills]);
  useEffect(() => saveToStorage('portfolio_projects', projects), [projects]);
  useEffect(() => saveToStorage('portfolio_certificates', certificates), [certificates]);

  // ---- Skills CRUD ----
  const addSkill = useCallback(async (skill) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(skill),
      });
      if (res.ok) {
        const created = await res.json();
        setSkills((prev) => [...prev, created]);
        return created;
      }
    } catch (err) {
      console.error('Error saving skill to server database:', err);
    }
    const local = { ...skill, id: generateId() };
    setSkills((prev) => [...prev, local]);
    return local;
  }, []);

  const updateSkill = useCallback(async (id, updated) => {
    try {
      await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating skill in server database:', err);
    }
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  }, []);

  const deleteSkill = useCallback(async (id) => {
    try {
      await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Error deleting skill from server database:', err);
    }
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ---- Projects CRUD ----
  const addProject = useCallback(async (project) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(project),
      });
      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [...prev, created]);
        return created;
      }
    } catch (err) {
      console.error('Error saving project to server database:', err);
    }
    const local = { ...project, id: generateId() };
    setProjects((prev) => [...prev, local]);
    return local;
  }, []);

  const updateProject = useCallback(async (id, updated) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating project in server database:', err);
    }
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Error deleting project from server database:', err);
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---- Certificates CRUD ----
  const addCertificate = useCallback(async (cert) => {
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(cert),
      });
      if (res.ok) {
        const created = await res.json();
        setCertificates((prev) => [...prev, created]);
        return created;
      }
    } catch (err) {
      console.error('Error saving certificate to server database:', err);
    }
    const local = { ...cert, id: generateId() };
    setCertificates((prev) => [...prev, local]);
    return local;
  }, []);

  const updateCertificate = useCallback(async (id, updated) => {
    try {
      await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating certificate in server database:', err);
    }
    setCertificates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }, []);

  const deleteCertificate = useCallback(async (id) => {
    try {
      await fetch(`/api/certificates/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Error deleting certificate from server database:', err);
    }
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = {
    skills, addSkill, updateSkill, deleteSkill,
    projects, addProject, updateProject, deleteProject,
    certificates, addCertificate, updateCertificate, deleteCertificate,
    isAuthenticated, authenticate, logout,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ---- Custom Hook ----
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
