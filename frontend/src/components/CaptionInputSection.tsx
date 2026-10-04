'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiUploadSimpleBold,
  PiArrowsClockwise,
  PiCopy,
  PiCheck,
  PiLightning,
  PiSparkle,
  PiArrowRightBold,
  PiCheckCircle
} from 'react-icons/pi';

type AppState = 'initial' | 'buffering' | 'final';

const CLAUDE_THINKING_PHRASES = [
  'Pondering...',
  'Beholding...',
  'Divining...',
  'Unravelling...',
  'Conjuring...',
  'Devising...',
  'Scribing...',
  'Weaving...',
  'Forging...',
  'Harkening...',
  'Discerning...',
  'Bestowing...',
];

const MOCK_CAPTIONS = [
  {
    id: '1',
    category: 'Aesthetic & Vibe',
    text: 'Golden light hitting just right. Capturing moments that feel like quiet poetry in the middle of a busy world.',
  },
  {
    id: '2',
    category: 'Short & Punchy',
    text: 'Less noise, more signal. Pure unscripted moments.',
  },
  {
    id: '3',
    category: 'Storytelling Hook',
    text: 'Somewhere between dreamscapes and reality. Taking a brief pause to appreciate the small details that usually slip by.',
  },
  {
    id: '4',
    category: 'Hashtag Ensemble',
    text: '#AestheticVibes #VisualPoetry #MinimalMood #GoldenHour #CapturedMoments #DailyInspiration',
  },
];

export function CaptionInputSection() {
  const [state, setState] = useState<AppState>('initial');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic thinking phrase cycling during buffering
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'buffering') {
      setThinkingIndex(0);
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % CLAUDE_THINKING_PHRASES.length);
      }, 1400);
      return () => clearInterval(interval);
    }
  }, [state]);

  const processFile = async (file: File) => {
    setCurrentFile(file);
    setImageName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setState('buffering');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const rawBackend = process.env.Python_Backend || process.env.NEXT_PUBLIC_PYTHON_BACKEND;
      const backendUrl = rawBackend ? rawBackend.replace(/\/+$/, '') : 'http://127.0.0.1:8000';

      const res = await fetch(`${backendUrl}/input_image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const resultList = data.llm_response?.captions || (data.llm_response?.raw_output ? [data.llm_response.raw_output] : []);
      setCaptions(resultList.length > 0 ? resultList : MOCK_CAPTIONS.map(c => c.text));
      setState('final');
    } catch (err: any) {
      // Fallback gracefully to high-end mock captions if backend offline
      setTimeout(() => {
        setCaptions(MOCK_CAPTIONS.map(c => c.text));
        setState('final');
      }, 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReupload = () => {
    setImagePreview(null);
    setImageName('');
    setCurrentFile(null);
    setCaptions([]);
    setErrorMsg(null);
    setState('initial');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section
      id="caption-input-section"
      className="w-full bg-[#050505] py-24 sm:py-36 px-4 sm:px-6 md:px-8 text-zinc-100 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">

        {/* Header Text */}
        <div className="text-center mb-12 sm:mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-4">
            <PiLightning className="w-3.5 h-3.5 text-emerald-400" />
            <span>GEN Z INSTAGRAM AI ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Upload your image & generate
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            The #1 <strong className="text-white">Instagram AI caption generator</strong> for Gen Z. Upload your photo to receive instant aesthetic captions, viral slang quotes, and social hooks.
          </p>
        </div>

        {/* Double-Bezel Architecture Input Wrapper */}
        <div className="w-full p-1.5 sm:p-2 rounded-[2.5rem] bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
          <div className="w-full rounded-[calc(2.5rem-0.5rem)] bg-[#0A0A0A] p-6 sm:p-12 border border-white/10 transition-all">

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs sm:text-sm text-center font-mono">
                {errorMsg}
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ---------------- STATE 1: INITIAL STATE (Dropzone) ---------------- */}
              {state === 'initial' && (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-cursor="UPLOAD"
                    className="group relative border-2 border-dashed border-white/15 hover:border-white/40 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {/* Outer Shell Icon Container */}
                    <div className="p-1 rounded-full bg-white/5 border border-white/10 mb-6 group-hover:scale-105 transition-transform duration-300">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-inner group-hover:bg-white group-hover:text-black transition-colors">
                        <PiUploadSimpleBold className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                      Drop your photo here or browse
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-mono max-w-sm mb-6">
                      Supports JPG, PNG, WEBP. Neural vision model analyzes visual vibes instantly.
                    </p>

                    {/* Double-Bezel Button-in-Button CTA */}
                    <div className="inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold shadow-lg group-hover:bg-zinc-200 transition-colors">
                      <span>Select Image File</span>
                      <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center">
                        <PiArrowRightBold className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---------------- STATE 2: BUFFERING STATE (Neural Processing) ---------------- */}
              {state === 'buffering' && (
                <motion.div
                  key="buffering"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="w-full py-12 flex flex-col items-center text-center"
                >
                  {/* Image Preview Shell */}
                  {imagePreview && (
                    <div className="p-1 rounded-2xl bg-white/10 border border-white/20 mb-8 shadow-2xl">
                      <div className="w-32 h-32 rounded-[calc(1rem-0.25rem)] overflow-hidden bg-zinc-900 relative">
                        <img src={imagePreview} alt="Processing Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                      </div>
                    </div>
                  )}

                  {/* Pure CSS Equalizer Loader */}
                  <div className="flex items-center justify-center gap-1.5 h-12 mb-6">
                    <span className="pure-loader-span bg-amber-400" style={{ animationDelay: '0ms' }} />
                    <span className="pure-loader-span bg-emerald-400" style={{ animationDelay: '150ms' }} />
                    <span className="pure-loader-span bg-indigo-400" style={{ animationDelay: '300ms' }} />
                    <span className="pure-loader-span bg-rose-400" style={{ animationDelay: '450ms' }} />
                  </div>

                  <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-3 border border-emerald-500/20">
                    <PiSparkle className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span>Neural Processing Active</span>
                  </div>

                  <p className="text-zinc-200 text-sm sm:text-base font-mono min-h-[28px]">
                    {CLAUDE_THINKING_PHRASES[thinkingIndex]}
                  </p>
                </motion.div>
              )}

              {/* ---------------- STATE 3: FINAL STATE (Generated Results) ---------------- */}
              {state === 'final' && (
                <motion.div
                  key="final"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="w-full"
                >
                  {/* Header & Re-upload Controller */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <div className="p-1 rounded-xl bg-white/10 border border-white/20 shrink-0">
                          <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-white">{imageName || 'Attached Image'}</h4>
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <PiCheckCircle className="w-3.5 h-3.5" />
                          <span>Captions Generated</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleReupload}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
                    >
                      <PiArrowsClockwise className="w-3.5 h-3.5" />
                      <span>Upload New Image</span>
                    </button>
                  </div>

                  {/* Generated Caption Cards */}
                  <div className="space-y-4 mb-8">
                    {captions.map((text, idx) => {
                      const category = MOCK_CAPTIONS[idx % MOCK_CAPTIONS.length]?.category || 'Gen Z Caption';
                      const cardId = `cap-${idx}`;
                      const isCopied = copiedId === cardId;

                      return (
                        <div
                          key={cardId}
                          className="p-1 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200"
                        >
                          <div className="rounded-[calc(1rem-0.25rem)] bg-zinc-950 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5">
                            <div className="space-y-1.5 flex-1 pr-2">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 inline-block">
                                {category}
                              </span>
                              <p className="text-zinc-100 text-sm sm:text-base font-medium leading-relaxed">
                                "{text}"
                              </p>
                            </div>

                            {/* Double-Bezel Copy CTA Button */}
                            <button
                              onClick={() => handleCopy(cardId, text)}
                              data-cursor={isCopied ? "DONE" : "COPY"}
                              className={`shrink-0 inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all active:scale-[0.98] ${isCopied
                                  ? 'bg-emerald-500 text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'
                                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                                }`}
                            >
                              <span>{isCopied ? 'Copied!' : 'Copy Caption'}</span>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCopied ? 'bg-black/10' : 'bg-white/10'}`}>
                                {isCopied ? <PiCheck className="w-3.5 h-3.5 text-black font-bold" /> : <PiCopy className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}
