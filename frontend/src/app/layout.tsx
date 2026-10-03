import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instagram AI Caption Generator for Gen Z | Free Image to Caption",
  description: "Upload your image and see the magic for free! The #1 Instagram AI caption generator for Gen Z to find viral aesthetic captions, slang quotes, and social media hooks instantly.",
  keywords: ["Instagram caption generator", "Gen Z caption generator", "AI caption generator from image", "Instagram AI captions", "aesthetic captions"],
};

import { CustomCursor } from "@/components/CustomCursor";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
