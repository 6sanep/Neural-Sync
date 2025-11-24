"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CapsuleColor = "red" | "blue";

const fluidColors: Record<CapsuleColor, string> = {
  red: "from-red-600 via-rose-500 to-red-800",
  blue: "from-cyan-500 via-blue-500 to-blue-700",
};

const glowColors: Record<CapsuleColor, string> = {
  red: "shadow-[0_0_20px_rgba(220,38,38,0.5)] border-red-500/30",
  blue: "shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-500/30",
};

export function CapsuleButton({
  color,
  label,
  disabled,
  active,
  onClick,
}: {
  color: CapsuleColor;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative h-20 w-52 overflow-hidden rounded-full border-2 bg-black/60 backdrop-blur-sm transition-all duration-300",
        glowColors[color],
        disabled && "opacity-40 grayscale cursor-not-allowed",
        active && "ring-2 ring-white ring-offset-2 ring-offset-black scale-105"
      )}
    >
      {/* Liquid Fill */}
      <motion.div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t opacity-80 transition-all duration-500",
          fluidColors[color]
        )}
        initial={{ height: "30%" }}
        whileHover={{ height: "80%" }}
        animate={{ height: active ? "100%" : "40%" }}
      >
         {/* Bubbles with fixed positions to avoid hydration mismatch */}
         <div className="absolute inset-0 overflow-hidden">
            {[
              { size: 4, left: 20, delay: 0 },
              { size: 3, left: 50, delay: 0.5 },
              { size: 5, left: 80, delay: 1 },
              { size: 2, left: 35, delay: 1.5 },
              { size: 6, left: 65, delay: 0.8 },
            ].map((bubble, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{ 
                    width: bubble.size, 
                    height: bubble.size,
                    left: `${bubble.left}%`,
                    bottom: -10
                }}
                animate={{ bottom: "120%", opacity: 0 }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    delay: bubble.delay 
                }}
              />
            ))}
         </div>
      </motion.div>

      {/* Glass Highlights */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] pointer-events-none">
          <div className="absolute top-2 left-4 h-3 w-20 rotate-[-5deg] rounded-full bg-gradient-to-r from-white/40 to-transparent blur-[1px]" />
          <div className="absolute bottom-2 right-4 h-2 w-10 rotate-[-5deg] rounded-full bg-white/10 blur-[2px]" />
      </div>

      {/* Label */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold tracking-widest text-white drop-shadow-md">
            {label}
        </span>
      </div>
    </motion.button>
  );
}
