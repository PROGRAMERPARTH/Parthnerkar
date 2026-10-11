/* ============================================
   IntroVideo.jsx — Fullscreen Intro Video
   - preload="auto" for smooth autoplay without buffering stutter
   - WebM + MP4 source fallback for optimal delivery
   - Proper browser autoplay handling with DOM-level muted enforcement
   - Zero React re-renders during playback (direct DOM progress bar)
   - Smooth fade transition on completion or click
   ============================================ */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSkipForward } from 'react-icons/fi';

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // Smooth finish transition
  const handleFinish = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete?.();
    }, 800); // 800ms fade duration
  }, [onComplete]);

  // Play video with audio enabled
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enable audio by default
    video.defaultMuted = false;
    video.muted = false;

    let cleanupListeners = null;

    const startPlayback = async () => {
      try {
        // Attempt playback with audio
        await video.play();
      } catch (err) {
        console.warn('Unmuted autoplay prevented by browser policy; starting muted until user interaction:', err);
        // If browser blocks unmuted autoplay, start muted so video plays smoothly...
        video.muted = true;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('Playback error:', playErr);
        }

        // ...and unmute immediately on the very first user interaction
        const enableAudio = () => {
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
          window.removeEventListener('pointerdown', enableAudio);
          window.removeEventListener('keydown', enableAudio);
          window.removeEventListener('touchstart', enableAudio);
        };

        window.addEventListener('pointerdown', enableAudio, { once: true });
        window.addEventListener('keydown', enableAudio, { once: true });
        window.addEventListener('touchstart', enableAudio, { once: true });

        cleanupListeners = () => {
          window.removeEventListener('pointerdown', enableAudio);
          window.removeEventListener('keydown', enableAudio);
          window.removeEventListener('touchstart', enableAudio);
        };
      }
    };

    if (video.readyState >= 2) {
      startPlayback();
    } else {
      video.addEventListener('canplay', startPlayback, { once: true });
    }

    return () => {
      if (cleanupListeners) cleanupListeners();
    };
  }, []);


  // High-performance direct DOM progress updates (0 React re-renders)
  const handleTimeUpdate = () => {
    if (videoRef.current && progressBarRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      progressBarRef.current.style.width = `${pct}%`;
    }
  };

  // Graceful error fallback — skip intro if video fails to load
  const handleError = () => {
    console.warn('IntroVideo: video failed to load, skipping intro.');
    // Give a brief moment so the user isn't jarred, then complete
    setTimeout(() => handleFinish(), 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-video-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden select-none"
        >
          {/* Main Video: Centered, 100% visible, uncropped */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src="/intro-video.mp4"
              className="w-full h-full object-contain max-h-screen"
              poster="/intro-poster.jpg"
              playsInline
              autoPlay
              preload="auto"
              disablePictureInPicture
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleFinish}
              onError={handleError}
            />
          </div>

          {/* Floating Controls (Top Right) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-30">
            {/* Skip Button */}
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 bg-primary-600/90 hover:bg-primary-500 text-white backdrop-blur-md px-4 py-2 rounded-full border border-primary-400/40 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shadow-lg shadow-primary-950/50 cursor-pointer hover:scale-105 active:scale-95"
              title="Skip intro to website"
            >
              <span>Skip</span>
              <FiSkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 pointer-events-none">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-primary-500 via-accent-400 to-primary-400"
              style={{ width: '0%' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
