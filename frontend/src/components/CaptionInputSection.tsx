'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiUpload, 
  FiRotateCcw, 
  FiCopy, 
  FiCheck, 
  FiImage, 
  FiZap 
} from 'react-icons/fi';

type AppState = 'initial' | 'buffering' | 'final';

const CLAUDE_THINKING_PHRASES = [
  'Analyzing visual composition and lighting semantics...',
  'Extracting aesthetic mood, tone, and focal points...',
  'Synthesizing creative perspectives and story hooks...',
  'Drafting engaging social captions & hashtag pairings...',
  'Polishing word choices and emotional resonance...',
  'Finalizing response variations...',
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Claude-style dynamic thinking string animation in Buffering state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'buffering') {
      setThinkingIndex(0);
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % CLAUDE_THINKING_PHRASES.length);
      }, 1400);

      // Auto transition to final state after 3.8s
      const timer = setTimeout(() => {
        setState('final');
      }, 3800);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setState('buffering');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleReupload = () => {
    setImagePreview(null);
    setImageName('');
    setState('initial');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = () => {
    setState('buffering');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section className="w-full bg-[#F5F2EB] py-12 px-4 sm:px-6 md:px-8 text-stone-800 transition-colors">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Header Text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-2">
            Input here
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Upload your JPG photo below to generate tailored AI captions, aesthetic quotes, and social media hooks.
          </p>
        </div>

        {/* White Input Div Box */}
        <div className="w-full bg-white border border-stone-200/90 rounded-3xl shadow-xl p-6 sm:p-10 transition-all">
          <AnimatePresence mode="wait">
            {/* ---------------- STATE 1: INITIAL STATE ---------------- */}
            {state === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="group relative border-2 border-dashed border-stone-300 hover:border-stone-600 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-all duration-200"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 mb-4 group-hover:bg-stone-900 group-hover:text-white transition-colors duration-200 shadow-sm"
                  >
                    <FiUploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
                  </motion.div>

                  <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-1">
                    Upload JPG Image
                  </h3>
                  <p className="text-stone-500 text-xs sm:text-sm max-w-xs mb-4">
                    Drag and drop your image here, or click to browse files
                  </p>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/70 text-stone-700 text-xs font-medium">
                    <FiImage className="w-3.5 h-3.5" /> JPG, PNG, WEBP up to 10MB
                  </span>
                </div>
              </motion.div>
            )}

            {/* ---------------- STATE 2: BUFFERING STATE ---------------- */}
            {state === 'buffering' && (
              <motion.div
                key="buffering"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center py-6 text-center"
              >
                {/* Uploaded Thumbnail Preview */}
                {imagePreview && (
                  <div className="relative mb-6">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl shadow-md border border-stone-200"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded-full font-mono shadow">
                      JPG
                    </div>
                  </div>
                )}

                {/* Pure CSS Loader from Reference Code */}
                <div className="flex items-center justify-center h-16 gap-1.5 my-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="pure-loader-span bg-stone-900"
                      style={{
                        animationDelay: `${(i + 1) * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Claude-style Dynamic AI Reasoning Word Switcher */}
                <div className="h-10 flex items-center justify-center mt-2 overflow-hidden px-4">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={thinkingIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-stone-600 font-mono text-xs sm:text-sm tracking-wide text-center"
                    >
                      {CLAUDE_THINKING_PHRASES[thinkingIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ---------------- STATE 3: FINAL STATE (Response Ready) ---------------- */}
            {state === 'final' && (
              <motion.div
                key="final"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* Action Toolbar Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-200 mb-6">
                  {/* Left: Mini Thumbnail & File Name */}
                  <div className="flex items-center gap-3">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Thumbnail"
                        className="w-10 h-10 object-cover rounded-lg border border-stone-300"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-sm">
                        <FiZap className="w-4 h-4 text-amber-600" />
                        Response Ready
                      </div>
                      <p className="text-xs text-stone-500 truncate max-w-[160px] sm:max-w-xs">
                        {imageName || 'Uploaded Image'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Reupload & Retry Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReupload}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                      title="Upload a new image"
                    >
                      <FiUpload className="w-4 h-4" />
                      <span>Reupload</span>
                    </button>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-sm"
                      title="Re-run response generation"
                    >
                      <FiRotateCcw className="w-4 h-4" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>

                {/* Staggered Delayed Captions list */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.15 },
                    },
                  }}
                  className="flex flex-col gap-4"
                >
                  {MOCK_CAPTIONS.map((item) => {
                    const isCopied = copiedId === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 16 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                        }}
                        className="group relative bg-stone-50 border border-stone-200/90 hover:border-stone-400 rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-200/60 px-2.5 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <button
                            onClick={() => handleCopy(item.id, item.text)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-all cursor-pointer shadow-xs"
                            title="Copy caption"
                          >
                            {isCopied ? (
                              <>
                                <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 text-[11px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-3.5 h-3.5 text-stone-600" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-stone-800 text-sm sm:text-base leading-relaxed pr-2">
                          {item.text}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
