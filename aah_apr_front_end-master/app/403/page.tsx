"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

// اصلاح آدرس‌ها با تصاویر واقعی و باکیفیت مرتبط با ارگان Action Against Hunger
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
};

interface Page403Props {
  showAnimation?: boolean;
}

const Page403: React.FC<Page403Props> = ({ showAnimation = true }) => {
  const router = useRouter();
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(false);
  const [imagePositions, setImagePositions] = useState<ImagePos[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const redirectToLogin = () => router.push("/login");
  const back = () => router.back();

  useEffect(() => {
    if (!showAnimation) {
      setShow(false);
      setVisible(true);
      return;
    }

    const count = 45;
    const size = 120;
    const positions: ImagePos[] = Array(count)
      .fill(0)
      .map((_, i) => {
        const rotate = Math.random() * 24 - 12;
        const scale = 0.85 + Math.random() * 0.35;
        return {
          src: sampleImages[i % sampleImages.length],
          left:
            Math.random() *
            (typeof window !== "undefined" ? window.innerWidth - size : 1000),
          top:
            Math.random() *
            (typeof window !== "undefined" ? window.innerHeight - size : 800),
          rotate,
          scale,
        };
      });

    setImagePositions(positions);
    const fadeIn = setTimeout(() => setVisible(true), 100);

    return () => clearTimeout(fadeIn);
  }, [showAnimation]);

  if (!show) return null;
  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden transition-all duration-700 ease-out select-none",
        visible ? "opacity-100 scale-100" : "opacity-0 scale-105"
      )}
    >
      {/* Background Scattered Mosaic Stream with Valid Image Node Assets */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity pointer-events-none scale-105 filter blur-[0.5px]">
        {imagePositions.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={`acf-bg-${i}`}
            className="absolute rounded-xl shadow-2xl object-cover border border-white/5 transition-transform duration-500 hover:scale-110"
            style={{
              width: 130,
              height: 130,
              left: `${img.left}px`,
              top: `${img.top}px`,
              transform: `rotate(${img.rotate}deg) scale(${img.scale})`,
            }}
          />
        ))}
      </div>

      {/* Modern Action Against Hunger Accent Tonal Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-emerald-950/80 via-emerald-800/60 to-cyan-950/80 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none" />

      {/* Central Glassmorphic Control Interface */}
      <div
        className={cn(
          "relative z-20 text-center text-white flex flex-col items-center max-w-md w-full mx-4 p-8 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-2xl transition-all duration-500 delay-150",
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
      >
        {/* Brand Identity / Shield Accent */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <img
            src="/AAHLogo.png"
            alt="Action Against Hunger Logo"
            className="relative w-28 h-28 object-contain brightness-110 drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="hidden w-20 h-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldAlert className="w-10 h-10" />
          </div>
        </div>

        {/* Error Messaging */}
        <div className="space-y-2 mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Error 403
          </span>
          <h1 className="text-3xl font-bold tracking-tight mt-3">
            Access Restricted
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-xs mx-auto">
            Your current account credentials do not have permission parameters
            to view this portal.
          </p>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <Button
            onClick={back}
            variant="outline"
            className="flex-1 order-2 sm:order-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all gap-2 h-11"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={redirectToLogin}
            className="flex-1 order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all gap-2 h-11 font-medium"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page403;
