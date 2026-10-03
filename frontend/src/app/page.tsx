import { ImageCursorTrail } from '@/components/ImageCursorTrail';
import { WhyDifferentSection } from '@/components/WhyDifferentSection';
import { CaptionInputSection } from '@/components/CaptionInputSection';
import { FancyGsapCursor } from '@/components/FancyGsapCursor';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#050505] bg-mesh-gradient bg-grid-pattern text-zinc-100 overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Fancy GSAP Fluid Cursor */}
      <FancyGsapCursor />

      {/* Hero Section with Interactive Cursor Trail */}
      <ImageCursorTrail />

      {/* Why CAPTION Is Different - High-End Comparison & Real-Time Engine */}
      <WhyDifferentSection />

      {/* Interactive Caption Generator Input & Results Engine */}
      <CaptionInputSection />
    </main>
  );
}


