import { ImageCursorTrail } from '@/components/ImageCursorTrail';
import { CaptionInputSection } from '@/components/CaptionInputSection';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#F5F2EB] overflow-x-hidden">
      {/* Section 1: Image Cursor Trail (100% width, 60% height) */}
      <section className="w-full h-[60vh] bg-black">
        <ImageCursorTrail />
      </section>

      {/* Section 2: Caption Input Section (3 States, Light Beige theme) */}
      <CaptionInputSection />
    </main>
  );
}

