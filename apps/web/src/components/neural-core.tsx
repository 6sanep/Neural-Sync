"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Pill } from "@/store/neural-session";

type Phase = "idle" | "ready" | "encrypting" | "waiting" | "decrypting" | "synced" | "desynced" | "error";

const phaseColors: Record<Phase, string> = {
  idle: "shadow-[0_0_30px_rgba(100,116,139,0.2)] border-slate-800 bg-slate-900/50",
  ready: "shadow-[0_0_60px_rgba(57,255,20,0.3)] border-bio-green/50 bg-bio-green/10",
  encrypting: "shadow-[0_0_80px_rgba(176,38,255,0.5)] border-bio-purple/50 bg-bio-purple/10",
  waiting: "shadow-[0_0_80px_rgba(0,255,255,0.4)] border-bio-cyan/50 bg-bio-cyan/10",
  decrypting: "shadow-[0_0_100px_rgba(255,255,255,0.4)] border-white/50 bg-white/10",
  synced: "shadow-[0_0_120px_rgba(57,255,20,0.6)] border-bio-green bg-bio-green/20",
  desynced: "shadow-[0_0_120px_rgba(220,38,38,0.6)] border-red-600 bg-red-900/20",
  error: "shadow-[0_0_50px_rgba(220,38,38,0.4)] border-red-800 bg-red-950/50",
};

const getPhaseColor = (phase: Phase, systemChoice: Pill | null) => {
  if (phase === "desynced") {
    // Failure: Effect matches the SYSTEM's choice (what we failed to match)
    if (systemChoice === "BLUE") {
      return "shadow-[0_0_120px_rgba(6,182,212,0.6)] border-bio-cyan bg-bio-cyan/20";
    } else if (systemChoice === "RED") {
      return "shadow-[0_0_120px_rgba(220,38,38,0.6)] border-red-600 bg-red-900/20";
    }
  }
  if (phase === "synced") {
    // Success: Unified "Five-color Halo" - Calm and Prismatic
    // Using a subtle white/rainbow base
    return "shadow-[0_0_100px_rgba(255,255,255,0.4)] border-white/50 bg-white/5";
  }
  return phaseColors[phase];
};

const fract = (value: number) => value - Math.floor(value);

const PARTICLE_VARIANTS = Array.from({ length: 12 }, (_, index) => {
  const seed = index + 1;
  const xSeed = Math.sin(seed * 12.9898) * 43758.5453;
  const ySeed = Math.sin(seed * 78.233) * 24634.6345;
  return {
    x: fract(xSeed) * 240 - 120,
    y: fract(ySeed) * 240 - 120,
    duration: 2 + fract(xSeed * 1.3) * 3,
    delay: fract(ySeed * 1.7) * 2,
  };
});

const BIG_BANG_PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * 360; // Even distribution
  const radius = 100 + Math.random() * 100; // Random distance
  return {
    angle,
    distance: radius,
    size: 2 + Math.random() * 6, // Varied shard sizes
    delay: Math.random() * 0.2,
    duration: 0.8 + Math.random() * 0.5,
    rotation: Math.random() * 720 - 360, // Wild rotation
  };
});

export function NeuralCore({ phase, systemChoice }: { phase: Phase; systemChoice: Pill | null }) {
  const isBlue = systemChoice === "BLUE";
  const isRed = systemChoice === "RED";
  
  // Dynamic color classes based on system choice
  const tentacleColor = 
    phase === "desynced"
      ? (isBlue ? "via-bio-cyan" : "via-red-600")
      : phase === "synced" ? "via-white/50" // Synced uses white/prismatic tentacles
      : phase === "encrypting" ? "via-bio-purple"
      : phase === "waiting" ? "via-bio-cyan"
      : "via-bio-green";

  const nucleusColor =
    phase === "desynced"
      ? (isBlue ? "bg-bio-cyan shadow-[0_0_50px_#00FFFF]" : "bg-red-600 shadow-[0_0_50px_#DC2626]")
      : phase === "synced" ? "bg-white shadow-[0_0_60px_rgba(255,255,255,0.8)]" // Synced uses pure light
      : phase === "encrypting" ? "bg-bio-purple shadow-[0_0_30px_#B026FF]"
      : phase === "waiting" ? "bg-bio-cyan shadow-[0_0_30px_#00FFFF]"
      : "bg-bio-green/50 shadow-[0_0_30px_#39FF14]";

  const particleColor = 
    phase === "desynced"
      ? (isBlue ? "bg-bio-cyan" : "bg-red-500")
      : phase === "synced" ? "bg-white" // Synced uses white particles
      : "bg-bio-green";

  return (
    <div className="relative flex h-80 w-80 items-center justify-center md:h-96 md:w-96">
      {/* Organic Membrane (SVG Filter Effect) */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="organic-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      
      {/* Synced "Five-color Halo" Aura */}
      {phase === "synced" && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-60 blur-3xl"
          style={{
            background: "conic-gradient(from 0deg, #ff0080, #7928ca, #ff0080, #00ffff, #ff0080)"
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Outer Tentacles/Synapses */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-40"
        animate={{ 
          rotate: 360,
          scale: phase === "synced" ? [1, 1.1, 1] : 1,
        }}
        transition={{ 
          rotate: { duration: phase === "synced" ? 30 : 60, ease: "linear", repeat: Infinity },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {[...Array(phase === "synced" ? 12 : 6)].map((_, i) => (
          <div 
            key={i}
            className={cn(
              "absolute left-1/2 top-1/2 h-[140%] w-1 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent to-transparent",
              tentacleColor
            )}
            style={{ transform: `rotate(${i * (phase === "synced" ? 30 : 60)}deg) translateY(-50%)` }}
          />
        ))}
      </motion.div>

      {/* Big Bang Explosion (Desynced Only) */}
      {phase === "desynced" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {/* Shockwaves */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`shockwave-${i}`}
              className={cn(
                "absolute rounded-full border-2 opacity-0",
                isBlue ? "border-bio-cyan shadow-[0_0_50px_#06b6d4]" : "border-red-500 shadow-[0_0_50px_#ef4444]"
              )}
              initial={{ width: 0, height: 0, opacity: 1, borderWidth: 4 }}
              animate={{ width: "200%", height: "200%", opacity: 0, borderWidth: 0 }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, ease: "easeOut" }}
            />
          ))}

          {/* Debris Field */}
          {BIG_BANG_PARTICLES.map((p, i) => (
            <motion.div
              key={`shard-${i}`}
              className={cn(
                "absolute origin-center",
                isBlue ? "bg-bio-cyan" : "bg-red-600"
              )}
              style={{
                width: p.size,
                height: p.size * (1 + Math.random()), // Elongated shards
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond/Shard shape
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos(p.angle * Math.PI / 180) * p.distance,
                y: Math.sin(p.angle * Math.PI / 180) * p.distance,
                opacity: 0,
                scale: [0, 1.5, 0],
                rotate: p.rotation
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Central Blinding Flash */}
          <motion.div
            className="absolute h-16 w-16 rounded-full bg-white blur-xl"
            animate={{ scale: [1, 3, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
      )}

      {/* Standard Core (Hidden when Desynced) */}
      {phase !== "desynced" && (
        <motion.div
          key={phase}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: phase === "synced" ? [1, 1.2, 1] : 
                   phase === "encrypting" ? [1, 1.1, 0.95, 1.05, 1] : 
                   [1, 1.05, 1],
            opacity: 1 
          }}
          transition={{ 
            scale: { 
              repeat: Infinity, 
              duration: phase === "synced" ? 2 : phase === "encrypting" ? 0.5 : 4, 
              ease: "easeInOut" 
            },
            opacity: { duration: 0.5 }
          }}
          className={cn(
            "relative z-10 flex h-48 w-48 items-center justify-center rounded-full border-4 backdrop-blur-sm transition-all duration-500",
            getPhaseColor(phase, systemChoice)
          )}
          style={{ filter: "url(#organic-blur)" }}
        >
          {/* Nucleus */}
          <motion.div
            className={cn(
              "h-24 w-24 rounded-full shadow-inner transition-colors duration-500",
              nucleusColor
            )}
            animate={{
              scale: phase === "synced" ? [1, 1.3, 1] : [1, 1.2, 1],
              filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
            }}
            transition={{ repeat: Infinity, duration: phase === "encrypting" ? 0.2 : 3 }}
          />
          
          {/* DNA Helix Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay">
            <div className={cn(
              "h-32 w-32 border-4 border-dotted border-white rounded-full",
              phase === "synced" ? "animate-spin-fast" : "animate-spin-slow"
            )} />
          </div>
        </motion.div>
      )}
      
      {/* Desynced Core Remnant (Small imploded center) */}
      {phase === "desynced" && (
        <motion.div
           className={cn(
             "relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black border-2 border-white shadow-[0_0_50px_rgba(255,255,255,0.8)]",
             isBlue ? "shadow-bio-cyan" : "shadow-red-600"
           )}
           animate={{ scale: [1, 0.8, 1.2, 0.9, 1] }}
           transition={{ duration: 0.1, repeat: Infinity }}
        />
      )}

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLE_VARIANTS.map((variant, i) => (
          <motion.div
            key={i}
            className={cn(
                "absolute h-2 w-2 rounded-full transition-colors duration-500",
                particleColor
            )}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ 
              x: variant.x * (phase === "synced" ? 1.5 : 1), 
              y: variant.y * (phase === "synced" ? 1.5 : 1), 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: phase === "desynced" ? variant.duration * 0.2 : variant.duration,
              delay: variant.delay,
              ease: "easeInOut"
            }}
            style={{ left: "50%", top: "50%" }}
          />
        ))}
      </div>
    </div>
  );
}
