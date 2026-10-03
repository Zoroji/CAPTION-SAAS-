'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiArrowUpRightBold, PiSparkleBold, PiStack, PiBroadcast } from 'react-icons/pi';

// All 36 Hero Images from public/HERO with safe URL encoding
const HERO_IMAGES = [
  '/HERO/1.jpg',
  '/HERO/2.jpg',
  '/HERO/3.jpg',
  '/HERO/4.jpg',
  '/HERO/5.jpg',
  '/HERO/6.jpg',
  '/HERO/7.jpg',
  '/HERO/8.jpg',
  '/HERO/9.jpg',
  '/HERO/10.jpg',
  '/HERO/11.jpg',
  '/HERO/12.jpg',
  '/HERO/13.jpg',
  '/HERO/14.jpg',
  '/HERO/15.jpg',
  '/HERO/Chitkul%20Diaries%20%F0%9F%8F%94.jpg',
  '/HERO/Ella%20Bright.jpg',
  '/HERO/Olive%20Green%20Outfit%20_%20Men\'s%20Pose%20_%20Bike%20Pose.jpg',
  '/HERO/download.jpg',
  '/HERO/download%20(1).jpg',
  '/HERO/download%20(2).jpg',
  '/HERO/download%20(3).jpg',
  '/HERO/download%20(4).jpg',
  '/HERO/download%20(5).jpg',
  '/HERO/download%20(6).jpg',
  '/HERO/download%20(7).jpg',
  '/HERO/download%20(8).jpg',
  '/HERO/download%20(9).jpg',
  '/HERO/download%20(10).jpg',
  '/HERO/download%20(11).jpg',
  '/HERO/download%20(12).jpg',
  '/HERO/download%20(13).jpg',
  '/HERO/download%20(14).jpg',
  '/HERO/download%20(15).jpg',
  '/HERO/download%20(16).jpg',
  '/HERO/releics.jpg',
];

interface TrailItem {
  id: number;
  x: number;
  y: number;
  imageSrc: string;
  rotation: number;
}

export function ImageCursorTrail() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<TrailItem[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const imageIndexRef = useRef(0);
  const idCounterRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    })
  }, []);



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const distance = Math.hypot(
      x - lastPosRef.current.x,
      y - lastPosRef.current.y
    );

    // Spawn a new hero image when mouse moves > 50px
    if (distance > 50) {
      lastPosRef.current = { x, y };

      const nextImage = HERO_IMAGES[imageIndexRef.current % HERO_IMAGES.length];
      imageIndexRef.current += 1;

      const newItem: TrailItem = {
        id: idCounterRef.current++,
        x,
        y,
        imageSrc: nextImage,
        rotation: (Math.random() - 0.5) * 24, // Subtle rotation -12deg to +12deg
      };

      setItems((prev) => [...prev.slice(-6), newItem]); // Max 7 visible items

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 850);
    }
  };

  const scrollToInput = () => {
    const el = document.getElementById('caption-input-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[90dvh] bg-[#050505] overflow-hidden flex flex-col items-center justify-between select-none border-b border-white/10">
      {/* 1. Fluid Island Detached Floating Navbar */}
      <nav className="z-30 pt-6 px-4 w-full flex justify-center sticky top-0 pointer-events-auto">
        <div className="p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-4 px-4 py-2">
          {/* Logo Brand Pill */}
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-400 to-indigo-500 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <PiSparkleBold className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">CAPTION.AI</span>
          </div>

          {/* Model Engine Live Badge */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>320K DATASET ENGINE</span>
          </div>

          {/* Double-Bezel CTA Button */}
          <button
            onClick={scrollToInput}
            data-cursor="CREATE"
            className="group relative inline-flex items-center gap-2 pl-4 pr-1.5 py-1 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            <span>Create Caption</span>
            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <PiArrowUpRightBold className="w-3.5 h-3.5 text-black" />
            </div>
          </button>
        </div>
      </nav>

      {/* 2. Interactive Trail Canvas Container */}
      <div
        onMouseMove={handleMouseMove}
        className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[550px] px-4 cursor-crosshair"
      >
        {/* Cursor Trail Framer Motion Overlay */}
        <AnimatePresence>
          {mounted && items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.4, rotate: item.rotation, y: 10 }}
              animate={{ opacity: 1, scale: 2.1, rotate: item.rotation, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: item.y - 70,
                left: item.x - 70,
                pointerEvents: 'none',
              }}
              className="w-36 h-36 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="w-full h-full rounded-[calc(1rem-0.25rem)] overflow-hidden bg-zinc-900 relative">
                <img
                  src={item.imageSrc}
                  alt="Hero Aesthetic Visual"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hero Central Typography & High-End Content Architecture */}
        <div className="z-10 flex flex-col items-center text-center pointer-events-none max-w-4xl mx-auto py-12">

          {/* Eyebrow Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-inner"
          >
            <div className="px-4 py-1 rounded-full bg-zinc-950/80 border border-white/5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-300">
              <PiStack className="w-3.5 h-3.5 text-amber-400" />
              <span>Aesthetic Neural Synthesis</span>
            </div>
          </motion.div>

          {/* Massive Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white font-extrabold text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-[0.95] drop-shadow-2xl"
          >
            CAPTION
          </motion.h1>

          {/* Subtitle & Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-zinc-400 text-xs sm:text-sm md:text-base font-mono tracking-widest uppercase mt-6 max-w-xl leading-relaxed"
          >
            INSTAGRAM AI CAPTION GENERATOR FROM IMAGE FOR GEN Z
          </motion.p>

          {/* Interactive Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex items-center gap-2 text-[11px] text-zinc-500 font-mono tracking-wider uppercase bg-white/[0.02] px-3.5 py-1.5 rounded-full border border-white/5"
          >
            <PiBroadcast className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Hover cursor anywhere on canvas to reveal photo archive</span>
          </motion.div>
        </div>
      </div>

      {/* Hero Bottom Ambient Ticker */}
      <div className="w-full border-t border-white/10 py-3 px-6 bg-black/40 backdrop-blur-lg flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className="hidden sm:inline">01 // VISUAL EMOTION RECOGNITION</span>
        <span className="text-zinc-400 font-semibold">NO AI SLOP • 100% AUTHENTIC VIBES</span>
        <span className="hidden sm:inline">320,000+ INSTAGRAM REPLICATOR</span>
      </div>
    </section>
  );
}
