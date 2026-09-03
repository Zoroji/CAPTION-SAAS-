'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample images copied from RedditImages directory
const REDDIT_IMAGES = [
  '/RedditImages/10k51i.jpg',
  '/RedditImages/10ka7c.jpg',
  '/RedditImages/11yvp1.jpg',
  '/RedditImages/11zelv.jpg',
  '/RedditImages/127fa0.jpg',
  '/RedditImages/12dpd0.jpg',
  '/RedditImages/12usdz.jpg',
  '/RedditImages/13l3xv.jpg',
  '/RedditImages/13pdgm.jpg',
  '/RedditImages/14i0ax.jpg',
  '/RedditImages/14k5km.jpg',
  '/RedditImages/14wamy.jpg',
  '/RedditImages/151x7a.jpg',
  '/RedditImages/152k8j.jpg',
  '/RedditImages/158yom.jpg',
];

interface TrailItem {
  id: number;
  x: number;
  y: number;
  imageSrc: string;
  rotation: number;
}

export function ImageCursorTrail() {
  const [items, setItems] = useState<TrailItem[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const imageIndexRef = useRef(0);
  const idCounterRef = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const distance = Math.hypot(
      clientX - lastPosRef.current.x,
      clientY - lastPosRef.current.y
    );

    // Spawn a new image when mouse moves > 55px
    if (distance > 55) {
      lastPosRef.current = { x: clientX, y: clientY };

      const nextImage = REDDIT_IMAGES[imageIndexRef.current % REDDIT_IMAGES.length];
      imageIndexRef.current += 1;

      const newItem: TrailItem = {
        id: idCounterRef.current++,
        x: clientX,
        y: clientY,
        imageSrc: nextImage,
        rotation: (Math.random() - 0.5) * 30, // Random angle between -15deg and 15deg
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
      {/* Framer Motion Cursor Trail Image Popups */}
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.3, rotate: item.rotation }}
            animate={{ opacity: 1, scale: 1, rotate: item.rotation }}
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
              alt="Reddit Cursor Trail"
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
