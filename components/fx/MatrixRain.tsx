"use client";

import { useEffect, useRef } from "react";

/**
 * Full-viewport Matrix "digital rain" rendered on a canvas. Sits behind all
 * content (fixed, pointer-events-none). Reads the active theme's neon color from
 * CSS so it recolors when the theme changes. Disabled for reduced-motion users.
 */
export function MatrixRain({ opacity = 0.12 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs =
      "ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEFｸｹ<>[]{}#$%".split("");
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const neonColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--neon").trim() ||
      "0 255 128";

    function resize() {
      const parent = canvas as HTMLCanvasElement;
      parent.width = window.innerWidth;
      parent.height = window.innerHeight;
      columns = Math.floor(parent.width / fontSize);
      drops = Array(columns).fill(1);
    }
    resize();

    let raf = 0;
    let last = 0;
    const frameMs = 55; // throttle for a slower, readable cascade

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (now - last < frameMs) return;
      last = now;

      const c = canvas as HTMLCanvasElement;
      const g = ctx as CanvasRenderingContext2D;
      // Trailing fade.
      g.fillStyle = "rgba(3, 6, 4, 0.09)";
      g.fillRect(0, 0, c.width, c.height);

      g.fillStyle = `rgb(${neonColor()})`;
      g.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        g.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > c.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ opacity }}
    />
  );
}
