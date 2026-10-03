'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  vx: number;
  vy: number;
  color: string;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Disable on touch / mobile devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking & particle trail state
    const mouse = {
      x: width / 2,
      y: height / 2,
      lastX: width / 2,
      lastY: height / 2,
      isHovered: false,
      isClicking: false,
    };

    const particles: Particle[] = [];
    const maxParticles = 32;

    const handleMouseMove = (e: MouseEvent) => {
      const vx = (e.clientX - mouse.lastX) * 0.15;
      const vy = (e.clientY - mouse.lastY) * 0.15;

      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn liquid trail particles along cursor path
      const baseRadius = mouse.isHovered ? 24 : 14;
      const particleColor = mouse.isHovered ? '#10b981' : '#ffffff';

      particles.push({
        x: mouse.x,
        y: mouse.y,
        radius: baseRadius,
        maxRadius: baseRadius,
        alpha: 1,
        vx,
        vy,
        color: particleColor,
      });

      if (particles.length > maxParticles) {
        particles.shift();
      }

      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    };

    const handleMouseDown = () => {
      mouse.isClicking = true;
      // Burst of liquid droplets on click
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const speed = 2 + Math.random() * 2;
        particles.push({
          x: mouse.x,
          y: mouse.y,
          radius: 12,
          maxRadius: 12,
          alpha: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#34d399',
        });
      }
    };

    const handleMouseUp = () => {
      mouse.isClicking = false;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, [role="button"], label, input[type="file"]')) {
        mouse.isHovered = true;
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, [role="button"], label, input[type="file"]')) {
        mouse.isHovered = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // 60fps Liquid Fluid Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render main cursor head drop
      const headRadius = mouse.isClicking ? 10 : mouse.isHovered ? 28 : 16;
      ctx.fillStyle = mouse.isHovered ? '#10b981' : '#ffffff';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Render & update liquid trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.radius *= 0.92; // Shrink liquid droplets
        p.alpha -= 0.035; // Fade opacity

        if (p.alpha <= 0 || p.radius <= 1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      {/* Liquid Gooey SVG Filter */}
      <svg className="pointer-events-none fixed inset-0 w-0 h-0 invisible">
        <defs>
          <filter id="liquid-cursor-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* 2D Liquid Canvas with Gooey Filter Applied */}
      <canvas
        ref={canvasRef}
        style={{ filter: 'url(#liquid-cursor-goo)' }}
        className="pointer-events-none fixed inset-0 z-[9999] w-full h-full"
      />
    </>
  );
}
