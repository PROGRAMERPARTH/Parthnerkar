/* ===================================================================
   ParticlePortrait Component
   Futuristic animated profile portrait with neural / constellation
   particle effects, glowing cyber rings, and accessibility support.
   =================================================================== */

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ParticlePortrait({
  src = '/parth-profile.jpg',
  alt = 'Parth Nerkar - AI & Data Science Profile',
  particleCount = 42,
  speed = 1.0,
  glowIntensity = 1.0,
  showStatus = true,
  className = '',
  sizeClasses = 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80',
}) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Particle color palette: Cyan, Electric Blue, Violet, Neon Purple
  const colorPalette = useMemo(
    () => [
      { r: 6, g: 182, b: 212 },   // #06b6d4 - Cyan
      { r: 56, g: 189, b: 248 },  // #38bdf8 - Light Cyan / Sky
      { r: 59, g: 130, b: 246 },  // #3b82f6 - Electric Blue
      { r: 139, g: 92, b: 246 },  // #8b5cf6 - Purple / Violet
      { r: 168, g: 85, b: 247 },  // #a855f7 - Neon Violet
    ],
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    let animationFrameId;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let innerRadius = 0;
    let outerRadius = 0;

    // Setup High-DPI canvas dimensions
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      centerX = width / 2;
      centerY = height / 2;

      // Portrait photo radius in px based on container sizing
      // Canvas is inset by -36px to -48px, so portrait is smaller than canvas
      innerRadius = Math.min(width, height) * 0.36;
      outerRadius = Math.min(width, height) * 0.50;
    };

    updateDimensions();

    // Create particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const color = colorPalette[i % colorPalette.length];
      const angle = Math.random() * Math.PI * 2;
      const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
      const orbitSpeed = (0.003 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1);
      const radialDrift = (Math.random() - 0.5) * 0.2;
      const baseRadius = 1.2 + Math.random() * 1.8;
      const pulseSpeed = 0.02 + Math.random() * 0.03;

      particles.push({
        angle,
        distance,
        orbitSpeed,
        radialDrift,
        baseRadius,
        currentRadius: baseRadius,
        color,
        pulseSpeed,
        pulseOffset: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.6,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const effectiveSpeed = prefersReducedMotion ? 0 : speed * (isHovered ? 1.4 : 1.0);
      const effectiveGlow = glowIntensity * (isHovered ? 1.3 : 1.0);

      // Update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.angle += p.orbitSpeed * effectiveSpeed;
          p.distance += p.radialDrift * effectiveSpeed;

          // Keep within orbital corona band around the portrait
          if (p.distance < innerRadius + 2) {
            p.distance = innerRadius + 2;
            p.radialDrift = Math.abs(p.radialDrift);
          } else if (p.distance > outerRadius) {
            p.distance = outerRadius;
            p.radialDrift = -Math.abs(p.radialDrift);
          }

          // Gentle breathing pulsation
          p.currentRadius = p.baseRadius + Math.sin(time * 2 + p.pulseOffset) * 0.5;
        }

        p.x = centerX + Math.cos(p.angle) * p.distance;
        p.y = centerY + Math.sin(p.angle) * p.distance;
      }

      // Draw connecting constellation lines between nearby particles
      const maxConnectDist = 42;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.28 * (isDark ? 1.0 : 0.7);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw particles with glowing radial aura
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const { r, g, b } = p.color;
        const currentAlpha = Math.max(0.15, Math.min(1.0, p.alpha + Math.sin(time * 3 + p.pulseOffset) * 0.2));

        // Outer glow
        ctx.save();
        ctx.shadowBlur = (8 + p.currentRadius * 2) * effectiveGlow;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.9})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        ctx.fill();

        // Bright particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.currentRadius * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.95})`;
        ctx.fill();
        ctx.restore();
      }

      // If not reduced motion, continue animation loop
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // Window resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      if (prefersReducedMotion) {
        render();
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      mediaQuery.removeEventListener('change', handleMotionChange);
      resizeObserver.disconnect();
    };
  }, [particleCount, speed, glowIntensity, isHovered, isDark, colorPalette]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Particle Canvas (Overlaps perimeter, non-blocking) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 sm:-inset-14 md:-inset-16 w-[calc(100%+5rem)] sm:w-[calc(100%+7rem)] md:w-[calc(100%+8rem)] h-[calc(100%+5rem)] sm:h-[calc(100%+7rem)] md:h-[calc(100%+8rem)] z-10"
      />

      {/* Outer ambient futuristic glow halo */}
      <div
        className={`absolute -inset-2.5 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
          isHovered
            ? 'opacity-80 scale-105 bg-gradient-to-tr from-cyan-500/40 via-blue-500/35 to-purple-600/45'
            : 'opacity-50 bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-purple-600/30'
        }`}
      />

      {/* Cybernetic rotating gradient rim */}
      <div
        className={`absolute -inset-1 rounded-full p-[2px] transition-transform duration-700 ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
        style={{
          background:
            'linear-gradient(135deg, rgba(6,182,212,0.85) 0%, rgba(59,130,246,0.6) 50%, rgba(168,85,247,0.85) 100%)',
        }}
      >
        <div
          className={`w-full h-full rounded-full ${
            isDark ? 'bg-surface-900/90' : 'bg-surface-50/90'
          }`}
        />
      </div>

      {/* Subtle orbital dashed tech ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3.5 sm:-inset-4 rounded-full border border-dashed border-cyan-400/30 dark:border-cyan-400/25"
        animate={{ rotate: 360 }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
      />

      {/* Counter-rotating subtle tech accent ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-5 sm:-inset-6 rounded-full border border-dotted border-purple-500/25 dark:border-purple-400/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 52, repeat: Infinity, ease: 'linear' }}
      />

      {/* Portrait Photo Container */}
      <div
        className={`relative z-20 ${sizeClasses} rounded-full overflow-hidden shadow-2xl ring-2 ring-cyan-400/50 dark:ring-cyan-400/40 bg-surface-800 transition-transform duration-500 group-hover:scale-[1.02]`}
      >
        {!imgError ? (
          <img
            src={src}
            alt={alt}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover object-center filter transition-all duration-700 ${
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${isHovered ? 'brightness-105 contrast-105' : 'brightness-100 contrast-100'}`}
          />
        ) : (
          /* Fallback in case image fails to load */
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl md:text-5xl font-bold select-none">
            PN
          </div>
        )}

        {/* Delicate inner vignette overlay for cinematic depth */}
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.35)]" />
      </div>

      {/* Futuristic status badge ("Available for work" pulse indicator) */}
      {showStatus && (
        <div
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 z-30 flex items-center justify-center"
          title="Parth Nerkar — Open to Opportunities"
        >
          <span className="relative flex h-6 w-6 sm:h-7 sm:w-7">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-6 w-6 sm:h-7 sm:w-7 bg-emerald-500 ring-2 sm:ring-4 ring-surface-900 border border-emerald-300/40 items-center justify-center">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-sm" />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
