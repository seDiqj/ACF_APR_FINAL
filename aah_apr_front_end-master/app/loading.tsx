"use client";

import React, { useEffect, useState } from "react";

// Updated with public production asset paths pointing to Action Against Hunger (ACF) operations
const sampleImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
];

type ImagePos = {
  src: string;
  left: number;
  top: number;
  rotate: number;
  scale: number;
  delay: number; // Staggered entry animation delay
};

const Preloader: React.FC<{ duration?: number }> = ({ duration = 4000 }) => {
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(false);
  const [imagePositions, setImagePositions] = useState<ImagePos[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reduced density count from 100 to 45 for elite hardware performance and clean UX canvas scattering
    const count = 45;
    const size = 140;
    
    const positions: ImagePos[] = Array(count)
      .fill(0)
      .map((_, i) => {
        const rotate = Math.random() * 30 - 15;
        const scale = 0.7 + Math.random() * 0.5;
        const delay = Math.random() * 600; // Multi-tiered cascading delay setup
        
        return {
          src: sampleImages[i % sampleImages.length],
          left: Math.random() * (window.innerWidth - size),
          top: Math.random() * (window.innerHeight - size),
          rotate,
          scale,
          delay,
        };
      });
      
    setImagePositions(positions);

    // Dynamic execution timers sequence loop
    const fadeIn = setTimeout(() => setVisible(true), 100);
    const fadeOut = setTimeout(() => setVisible(false), duration - 500);
    const hide = setTimeout(() => setShow(false), duration);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [duration]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950 overflow-hidden transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-700 ${
        visible ? "opacity-100 backdrop-blur-md" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background scattered images */}
      {imagePositions.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={`acf-operations-${i}`}
          className={`absolute rounded-xl shadow-2xl object-cover border border-white/10 grayscale-[30%] opacity-40 transition-all cubic-bezier(0.34, 1.56, 0.64, 1) duration-1000 ${
            visible ? "translate-y-0 scale-100" : "translate-y-12 scale-75 opacity-0"
          }`}
          style={{
            width: 140,
            height: 140,
            left: img.left,
            top: img.top,
            transform: visible ? `rotate(${img.rotate}deg) scale(${img.scale})` : "none",
            transitionDelay: `${img.delay}ms`,
          }}
        />
      ))}

      {/* Modern mix-blend screen overlay utilizing your exact system primary violet colors */}
      <div 
        className={`absolute inset-0 bg-primary/20 mix-blend-color-dodge transition-opacity duration-500 ${
          visible ? "opacity-60" : "opacity-0"
        }`} 
      />

      {/* Center logo layout node wrapper */}
      <div 
        className={`relative z-10 p-6 rounded-full bg-background/80 border border-border/40 backdrop-blur-xl shadow-2xl shadow-primary/20 transition-all cubic-bezier(0.34, 1.56, 0.64, 1) duration-700 ${
          visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <img
          src="/AAHLogo.png"
          alt="ACF System Logo"
          className="w-28 h-28 brightness-110 contrast-105 rounded-full object-cover shadow-inner"
        />
      </div>
    </div>
  );
};

export default Preloader;
