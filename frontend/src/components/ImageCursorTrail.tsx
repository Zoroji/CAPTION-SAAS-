'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none">
        <h1 className="text-white font-bold text-7xl sm:text-9xl tracking-widest z-10 pointer-events-none drop-shadow-2xl">
          CAPTION
        </h1>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const distance = Math.hypot(
      clientX - lastPosRef.current.x,
      clientY - lastPosRef.current.y
    );

    // Spawn a new hero image when mouse moves > 55px
    if (distance > 55) {
      lastPosRef.current = { x: clientX, y: clientY };

      // Cycle rotationally through all 36 HERO images
      const nextImage = HERO_IMAGES[imageIndexRef.current % HERO_IMAGES.length];
      imageIndexRef.current += 1;

      const newItem: TrailItem = {
        id: idCounterRef.current++,
        x: clientX,
        y: clientY,
        imageSrc: nextImage,
        rotation: (Math.random() - 0.5) * 30, // Random rotation between -15deg and 15deg
      };

      setItems((prev) => [...prev.slice(-6), newItem]); // Maintain max 7 visible trail items

      // Remove after 800ms
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 800);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Framer Motion HERO Image Cursor Trail */}
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.3, rotate: item.rotation }}
            animate={{ opacity: 1, scale: 3, rotate: item.rotation }}
            exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.3 } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: item.y - 80,
              left: item.x - 80,
              pointerEvents: 'none',
            }}
            className="w-40 h-40 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-900"
          >
            <img
              src={item.imageSrc}
              alt="Hero Cursor Trail"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center Landing Page Text */}
      <h1 className="text-white font-bold text-7xl sm:text-9xl tracking-widest z-10 pointer-events-none drop-shadow-2xl">
        CAPTION
      </h1>
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none">
        <h1 className="text-white font-bold text-7xl sm:text-9xl tracking-widest z-10 pointer-events-none drop-shadow-2xl">
          CAPTION
        </h1>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const distance = Math.hypot(
      clientX - lastPosRef.current.x,
      clientY - lastPosRef.current.y
    );

    // Spawn a new hero image when mouse moves > 55px
    if (distance > 55) {
      lastPosRef.current = { x: clientX, y: clientY };

      // Cycle rotationally through all 36 HERO images
      const nextImage = HERO_IMAGES[imageIndexRef.current % HERO_IMAGES.length];
      imageIndexRef.current += 1;

      const newItem: TrailItem = {
        id: idCounterRef.current++,
        x: clientX,
        y: clientY,
        imageSrc: nextImage,
        rotation: (Math.random() - 0.5) * 30, // Random rotation between -15deg and 15deg
      };

      setItems((prev) => [...prev.slice(-6), newItem]); // Maintain max 7 visible trail items

      // Remove after 800ms
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 800);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Framer Motion HERO Image Cursor Trail */}
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.3, rotate: item.rotation }}
            animate={{ opacity: 1, scale: 3, rotate: item.rotation }}
            exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.3 } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: item.y - 80,
              left: item.x - 80,
              pointerEvents: 'none',
            }}
            className="w-40 h-40 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-900"
          >
            <img
              src={item.imageSrc}
              alt="Hero Cursor Trail"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center Landing Page Text */}
      <h1 className="text-white font-bold text-7xl sm:text-9xl tracking-widest z-10 pointer-events-none drop-shadow-2xl">
        CAPTION
      </h1>
    </div>
  );
}
