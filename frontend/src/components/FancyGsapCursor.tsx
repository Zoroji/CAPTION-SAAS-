'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export function FancyGsapCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on non-touch desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    // Use GSAP quickTo for ultra-performant 60fps physics interpolation
    const xDotTo = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const yDotTo = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const xRingTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const yRingTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      xDotTo(e.clientX);
      yDotTo(e.clientY);
      xRingTo(e.clientX);
      yRingTo(e.clientY);

      // Check if mouse target or any ancestor is interactive
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest('button, a, input, [role="button"], .cursor-pointer, [data-cursor]');

      if (interactiveEl) {
        setIsHovered(true);
        const customText = interactiveEl.getAttribute('data-cursor');
        setCursorText(customText || '');
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* 1. Precise Inner Glowing Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-2.5 h-2.5 -mt-1.25 -ml-1.25 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] transition-transform duration-200 ease-out ${
          isHovered ? 'scale-0 opacity-0' : isClicked ? 'scale-75' : 'scale-100 opacity-100'
        }`}
      />

      {/* 2. Fluid Magnetic Trailing Outer Ring */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 w-10 h-10 -mt-5 -ml-5 rounded-full border transition-all duration-300 ease-out flex items-center justify-center backdrop-blur-[2px] ${
          isHovered
            ? 'scale-[2.2] bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
            : isClicked
            ? 'scale-90 bg-white/10 border-white/40'
            : 'scale-100 bg-white/[0.03] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
        }`}
      >
        {/* Optional Custom Cursor Micro-Label (e.g. "UPLOAD", "COPY") */}
        {cursorText && (
          <span
            ref={cursorTextRef}
            className="text-[7px] font-mono uppercase tracking-widest text-emerald-300 font-bold px-1 text-center animate-fade-in"
          >
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
