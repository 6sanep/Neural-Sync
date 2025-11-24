"use client";

import { useEffect, useState } from "react";

export function GlitchHeader() {
  const [text, setText] = useState("NEURAL SYNC");
  const fullText = "NEURAL SYNC";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";
  
  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const startScramble = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        setText((prev) =>
          prev
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return fullText[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("")
        );

        if (iteration >= fullText.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 30);
    };

    startScramble();
    
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        iteration = 0;
        startScramble();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="relative py-6">
      <div className="relative flex flex-col">
        {/* Main Header */}
        <h1 className="relative z-10 font-sans text-6xl font-black tracking-tighter md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-bio-green via-bio-cyan to-bio-purple select-none">
          {text}
          <span className="animate-pulse text-bio-green">_</span>
        </h1>
        
        {/* Bio-Glitch Layers */}
        <h1 
          className="absolute top-0 left-0 z-0 font-sans text-6xl font-black tracking-tighter md:text-8xl text-bio-purple/50 mix-blend-screen select-none blur-[2px]"
          style={{ animation: "float-organic 4s infinite ease-in-out" }}
        >
          {text}
        </h1>
      </div>

      {/* DNA Decoration Bottom */}
      <div className="mt-2 flex items-center gap-4 font-mono text-xs text-bio-green/60">
        <span className="inline-block h-2 w-2 rounded-full bg-bio-green animate-pulse" />
        <span>PLEASE CONNECT WITH THE CORE</span>
      </div>
    </div>
  );
}
