'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function WhyDifferentSection() {
  const [rightStep, setRightStep] = useState(0);
  const [isPosted, setIsPosted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRightStep((prev) => {
        const next = (prev + 1) % 4;
        if (next === 3) {
          setIsPosted(false);
          setTimeout(() => setIsPosted(true), 1200);
        }
        return next;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-[#050505] py-24 sm:py-32 px-4 sm:px-6 md:px-8 text-zinc-100 border-b border-white/10 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20 max-w-3xl">
          <div className="inline-block text-[10px] font-mono tracking-[0.25em] uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full mb-6">
            AUTHENTIC VIBES VS GENERIC AI
          </div>

          {/* Robust Animated Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15] text-center"
          >
            Captions that actually sound like you
          </motion.h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Standard AI chatbots spam outdated hashtags and robotic phrases. CAPTION references <strong className="text-white font-semibold">320,000 real aesthetic posts</strong> to generate authentic Gen Z captions instantly.
          </p>
        </div>

        {/* Asymmetrical Double-Bezel Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">

          {/* ---------------- LEFT CARD: Generic LLM Chatbots ---------------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
          >
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between border border-white/5">
              <div>
                {/* Card Top Pill & Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Generic LLM Tools</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">Standard Chatbots & Prompt Wrappers</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                    Slop Detected
                  </span>
                </div>

                {/* Bad Example Visual Container with Tenor GIF */}
                <div className="bg-zinc-900/90 border border-rose-500/20 rounded-2xl p-5 mb-6 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
                  <div className="text-[10px] font-mono text-zinc-500 mb-3 w-full text-left">
                    DEFAULT_PROMPT_OUTPUT
                  </div>

                  {/* Single Clean Tenor GIF */}
                  <div className="w-full max-w-md h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-rose-500/40 bg-rose-950/40 shadow-2xl relative mb-4">
                    <img
                      src="https://c.tenor.com/TAY-AkEwytcAAAAd/tenor.gif"
                      alt="AI Slop Emoji GIF"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-mono text-rose-300 border border-rose-500/30">
                      Stupid AI
                    </div>
                  </div>

                  <div className="bg-black/80 border border-rose-500/30 p-3.5 rounded-xl font-mono text-xs text-rose-300 leading-relaxed mb-3 text-center w-full">
                    "Embracing the serenity of today! ✨ Living my absolute best life... #blessed #photooftheday #happy #vibes #inspiration"
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 justify-center">
                    <span className="bg-rose-950/50 text-rose-300 px-2 py-0.5 rounded border border-rose-800/40">20+ Dead Hashtags</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded">Cringe Emojis</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded">Zero Visual Awareness</span>
                  </div>
                </div>

                {/* Key Flaws List */}
                <div className="space-y-3 text-xs sm:text-sm text-zinc-400 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                    <span>Stuffed with obsolete hashtags nobody actually posts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                    <span>Overly formal or forced tone that sounds like a corporate bot</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                    <span>Blind to modern photographic aesthetics and Gen Z slang</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-zinc-500 font-mono text-center">
                Outcome: Gets scrolled past immediately in the feed
              </div>
            </div>
          </motion.div>

          {/* ---------------- RIGHT CARD: CAPTION 320k Engine ---------------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-1.5 rounded-[2rem] bg-gradient-to-b from-white/15 to-white/5 border border-white/20 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-between border border-white/10">
              <div>
                {/* Card Top Pill & Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">CAPTION 320k Engine</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">Real-time Aesthetic Neural Matrix</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Caption for Generation Z
                  </span>
                </div>

                {/* 4-Stage Scanner Viewport */}
                <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 mb-6 text-white min-h-[300px] flex flex-col justify-between relative overflow-hidden shadow-2xl">

                  {/* Top Stage Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pb-3 border-b border-white/10">
                    <span className="text-emerald-400 truncate uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {rightStep === 0 && 'STAGE 1: BRAIN AI NEURAL ANALYSIS'}
                      {rightStep === 1 && 'STAGE 2: SCANNING 320,000 DATASET IMAGES'}
                      {rightStep === 2 && 'STAGE 3: SLANG & VIBE SYNTHESIS'}
                      {rightStep === 3 && 'STAGE 4: INSTAGRAM FEED PREVIEW'}
                    </span>
                    <span className="text-zinc-500 font-bold">0{rightStep + 1}/04</span>
                  </div>

                  {/* Animated Stage Display */}
                  <div className="py-4 my-auto flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">

                      {/* STEP 0: Atlantic Brain AI GIF */}
                      {rightStep === 0 && (
                        <motion.div
                          key="step0"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col items-center text-center gap-2.5 w-full"
                        >
                          <div className="w-full max-w-md h-40 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative bg-zinc-900">
                            <img
                              src="https://cdn.theatlantic.com/thumbor/UPK0L3L_wAKbLF6uXaQCj0nDunE=/0x28:1400x757/1200x625/media/img/mt/2026/09/2026_09_17_brain_AI_mpg/original.gif"
                              alt="Brain AI Processing GIF"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                              NEURAL VISION ACTIVE
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-300 font-mono">
                            Image Received → Brain AI Neural Network Analyzing
                          </p>
                        </motion.div>
                      )}

                      {/* STEP 1: Pinterest Data Scanning GIF */}
                      {rightStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full flex flex-col items-center gap-2.5"
                        >
                          <div className="w-full max-w-md h-40 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative bg-zinc-900">
                            <img
                              src="https://i.pinimg.com/originals/10/90/b0/1090b076249fea28b750c046e96c5489.gif"
                              alt="320,000 Data Scanning GIF"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                              320,000 ARCHIVES SEARCHING
                            </div>
                          </div>
                          <div className="text-[11px] text-emerald-300 font-mono text-center">
                            Scanning 320,000 Real Instagram Photos Layer-by-Layer
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2: Caption Synthesis */}
                      {rightStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="w-full text-center flex flex-col items-center gap-3 py-4"
                        >
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                            Gen Z Output Synthesized
                          </span>
                          <p className="text-zinc-100 font-medium text-lg sm:text-xl leading-snug px-4">
                            "A ship maybe at its safest in the harbour but a ship was meant to sail the ocean"
                          </p>
                        </motion.div>
                      )}

                      {/* STEP 3: Feed Replica */}
                      {rightStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full flex flex-col items-center justify-center"
                        >
                          <div className="w-full max-w-[270px] bg-zinc-900 text-white rounded-2xl p-3.5 border border-white/15 shadow-2xl font-sans text-xs">
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10 text-[10px] font-mono text-zinc-400">
                              <span className="font-semibold text-white">
                                @romanos
                              </span>
                              <span className="text-emerald-400">FEED PREVIEW</span>
                            </div>
                            <div className="w-full h-28 bg-zinc-800 rounded-xl mb-2.5 overflow-hidden relative border border-white/10">
                              <img src="/instagram_post_sample.png" alt="Post Preview" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[11px] text-zinc-300 mb-2.5 leading-tight">
                              <strong className="text-white mr-1">romanos</strong>
                              A ship maybe at its safest in the harbour but a ship was meant to sail the ocean
                            </p>
                            <button
                              className={`w-full py-2 rounded-xl font-mono text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${isPosted ? 'bg-emerald-500 text-black shadow-lg' : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                            >
                              {isPosted ? 'Posted to Feed!' : 'Post to Instagram'}
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Stage Progress Dots */}
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/10">
                    {[0, 1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setRightStep(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${rightStep === idx ? 'w-8 bg-emerald-400' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-3 text-xs sm:text-sm text-zinc-300 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    <span>Neural Vision recognizes lighting, outfit mood, and framing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    <span>Scans 320,000 real viral posts to match authentic phrasing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    <span>Ready for 1-click copy or direct Instagram feed posting</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-emerald-400 font-mono text-center font-semibold">
                Outcome: Instant engagement with effortless Gen Z tone
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
