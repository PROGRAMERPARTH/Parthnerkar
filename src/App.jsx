/* ============================================
   App.jsx — Root application component
   Assembles all sections with loading screen
   ============================================ */

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import IntroVideo from './components/IntroVideo';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificatesSection from './sections/CertificatesSection';
import ResumeSection from './sections/ResumeSection';
import ContactSection from './sections/ContactSection';

// Inner app that uses theme context
function AppContent() {
  const { isDark } = useTheme();
  const [showIntro, setShowIntro] = useState(true);

  // When intro video finishes or is skipped
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <IntroVideo onComplete={handleIntroComplete} />}

      <div className={`min-h-screen ${isDark ? 'bg-surface-900 text-surface-200' : 'bg-surface-50 text-surface-800'}`}>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#0f172a',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: isDark ? '#1e293b' : '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: isDark ? '#1e293b' : '#ffffff' },
          },
        }}
      />

      <Navbar onReplayIntro={() => setShowIntro(true)} />

      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <CertificatesSection />
        <ResumeSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}
