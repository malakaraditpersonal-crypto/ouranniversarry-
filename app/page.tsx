"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Heart, Mail, Volume2, VolumeX, Calendar, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface FloatingItem {
  id: number;
  x: string;
  rotate: number;
  scale: number;
  duration: number;
  delay: number;
  char: string;
}

interface HiddenNote {
  id: number;
  text: string;
  x: number;
  y: number;
}

// Data for new floating character elements
const characterAssets = [
  {
    type: 'image',
    src: 'https://static.wikia.nocookie.net/chiikawa/images/4/43/YahaUsagi.png/revision/latest/thumbnail/width/360/height/360?cb=20240709065537',
    width: 72,
    height: 72,
    alt: 'Yaha Usagi',
  },
  {
    type: 'image',
    src: 'https://images.squarespace-cdn.com/content/v1/5b0e8599af2096a0df635bd1/1540852799938-A3GUAAYNDCXAQWYDFVMJ/Pompompurin+2.png?format=1500w',
    width: 70,
    height: 70,
    alt: 'Pompompurin',
  },
  {
    type: 'image',
    src: 'https://static.wikia.nocookie.net/hellokitty/images/a/a5/Mv-cinnamon.png/revision/latest?cb=20250930161135',
    width: 78,
    height: 78,
    alt: 'Cinnamoroll',
  },
  { type: 'emoji', char: '💖' },
  { type: 'emoji', char: '✨' },
  { type: 'emoji', char: '💕' },
];

const reasons = [
  "You became my favorite part of the day.",
  "Your voice makes everything feel calmer.",
  "Even far away, you still feel like home."
];

// Interactive Reason Card Component
const ReasonCard = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      onClick={() => setOpen(!open)}
      className="cursor-pointer group relative h-32 rounded-2xl bg-stone-900/40 border border-rose-500/20 backdrop-blur-md flex items-center justify-center p-6 text-center shadow-[0_0_20px_rgba(159,18,57,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="icon"
            exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="text-rose-400 flex flex-col items-center gap-2 relative z-10"
          >
            <Heart size={28} className="animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] fill-rose-500/20" />
            <p className="text-[10px] text-rose-300/50 font-mono tracking-widest uppercase">Tap to reveal</p>
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="text-rose-100 font-serif italic text-[15px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10"
          >
            "{text}"
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AnniversaryApp() {
  const [step, setStep] = useState<"lock" | "unlocking" | "letter" | "final">("lock");
  const [passcode, setPasscode] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [justUnlocked, setJustUnlocked] = useState<boolean>(false);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [hiddenNotes, setHiddenNotes] = useState<HiddenNote[]>([]);
  const ytPlayerRef = useRef<any>(null);
  const HEART_ANIM_MS = 6800;

  // Fix Hydration Error: Only generate random attributes on the client side after mount
  useEffect(() => {
    const items = ["🌸", "💖", "🌹", "❤️", "❀", "✨", "💕", "💗"];
    const generated: FloatingItem[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      rotate: Math.random() * 360,
      scale: Math.random() * 1.6 + 0.9,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 3,
      char: items[Math.floor(Math.random() * items.length)],
    }));
    setFloatingItems(generated);
  }, []);

  // Handle Background Audio Flow
  useEffect(() => {
    const player = ytPlayerRef.current;
    if (player && typeof player.playVideo === "function") {
      try {
        if (isMuted && typeof player.mute === "function") player.mute();
        else if (!isMuted && typeof player.unMute === "function") player.unMute();
      } catch (err) {
        console.log("YT mute toggle error:", err);
      }

      if (!isMuted && step !== "lock") {
        try {
          player.playVideo();
        } catch (err) {
          console.log("YT play blocked:", err);
        }
      } else {
        try {
          player.pauseVideo();
        } catch (err) {
          console.log("YT pause error:", err);
        }
      }
    }
  }, [isMuted, step]);

  // Initialize YouTube IFrame Player API (client-side only)
  useEffect(() => {
    let mounted = true;

    const loadPlayer = () => {
      const YT = (window as any).YT;
      if (!YT || !YT.Player) return;

      ytPlayerRef.current = new YT.Player("yt-player", {
        height: "0",
        width: "0",
        videoId: "J36z7AnhvOM",
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            if (isMuted) event.target.mute();
            else event.target.unMute();

            if (!isMuted && step !== "lock") {
              try {
                event.target.playVideo();
              } catch (err) {
                console.log("YT play on ready blocked:", err);
              }
            }
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (!YT) return;
            if (e.data === YT.PlayerState.ENDED) {
              try {
                e.target.seekTo(0);
                e.target.playVideo();
              } catch (err) {
                console.log("YT loop error:", err);
              }
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      loadPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        if (!mounted) return;
        loadPlayer();
      };
    }

    return () => {
      mounted = false;
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") ytPlayerRef.current.destroy();
      } catch (e) {}
    };
  }, []); 

  const handleKeyPress = (num: string) => {
    if (passcode.length < 4) {
      const newPass = passcode + num;
      setPasscode(newPass);
      if (newPass === "1617") {
        triggerUnlockSequence();
      } else if (newPass.length === 4) {
        setTimeout(() => {
          setError(true);
          setTimeout(() => {
            setPasscode("");
            setError(false);
          }, 800);
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setPasscode(passcode.slice(0, -1));
  };

  const triggerUnlockSequence = () => {
    setJustUnlocked(true);
    setIsMuted(false);
    setStep("unlocking");

    const colors = ["#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1bd"];

    confetti({
      particleCount: 12,
      angle: 60,
      spread: 55,
      origin: { x: 0.18, y: 0.62 },
      colors,
      scalar: 1.1,
      gravity: 0.8,
    });
    confetti({
      particleCount: 12,
      angle: 120,
      spread: 55,
      origin: { x: 0.82, y: 0.62 },
      colors,
      scalar: 1.1,
      gravity: 0.8,
    });

    setTimeout(() => {
      setStep("letter");
    }, HEART_ANIM_MS + 150);

    setTimeout(() => setJustUnlocked(false), 600);
  };

  // Subtle Hidden Interaction Handler
  const handleFloatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    confetti({
      particleCount: 15,
      spread: 45,
      origin: { x, y },
      colors: ["#f43f5e", "#fb7185", "#fecdd3", "#fff1f2"],
      ticks: 60,
      gravity: 0.5,
      scalar: 0.8,
      zIndex: 100,
    });

    // 40% chance to drop a hidden love note
    if (Math.random() > 0.6) {
      const notes = [
        "You're perfect ✨",
        "I miss you 🥺",
        "My whole world 🌍",
        "Thinking of you...",
        "Always yours ❤️",
        "So beautiful 💖"
      ];
      const text = notes[Math.floor(Math.random() * notes.length)];
      const newNote = { id: Date.now(), text, x: e.clientX, y: e.clientY };
      setHiddenNotes((prev) => [...prev, newNote]);

      setTimeout(() => {
        setHiddenNotes((prev) => prev.filter((n) => n.id !== newNote.id));
      }, 2500);
    }
  };

  const FloatingCharacters = () => {
    return characterAssets.map((asset, index) => {
      const xPos = 10 + (index * 15) % 80;
      const baseDelay = index * 2;
      return (
          <motion.div
            key={index}
            onClick={handleFloatingClick}
            className="absolute drop-shadow-[0_0_20px_rgba(244,63,94,0.3)] select-none pointer-events-auto cursor-pointer hover:scale-110 hover:brightness-110 transition-all z-20"
            initial={{
              x: `${xPos}%`,
              y: "115%",
              rotate: Math.random() * 20 - 10,
              scale: 0.84,
              opacity: 0,
            }}
            animate={{
              y: "-15%",
              rotate: Math.random() * 40 - 20,
              scale: [1.05, 0.95, 1],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: baseDelay + Math.random() * 2,
            }}
            style={{ left: `${xPos}%` }}
          >
          {asset.type === 'image' ? (
            <img 
              src={asset.src} 
              alt={asset.alt} 
              width={asset.width} 
              height={asset.height} 
              className="opacity-90 pointer-events-none"
            />
          ) : (
            <span className="text-5xl pointer-events-none">{asset.char}</span>
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#1a0005] via-[#4c0519] to-[#881337] overflow-x-hidden font-sans text-stone-100 selection:bg-rose-500/30 selection:text-rose-200">
      
      <div id="yt-player" className="hidden" />

      {/* Primary Transition Controller Container */}
      <AnimatePresence mode="wait">
        
        {/* STAGE 1: LOCK SCREEN */}
        {step === "lock" && (
          <motion.div
            key="lock"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4"
          >
            <div className="absolute w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5200ms]" />

            <motion.div
              animate={
                error
                  ? { x: [-12, 12, -12, 12, 0] }
                  : justUnlocked
                  ? { scale: [1, 1.18, 0.94, 1], rotate: [0, -8, 8, 0] }
                  : {}
              }
              transition={
                error
                  ? { duration: 0.65, ease: "easeInOut" }
                  : justUnlocked
                  ? { duration: 1.1, ease: "easeOut" }
                  : { duration: 0.85, ease: "easeInOut" }
              }
              className="w-full max-w-md rounded-[2.5rem] bg-stone-900/40 backdrop-blur-2xl border border-rose-500/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_30px_rgba(159,18,57,0.2)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
                {floatingItems.slice(0, 15).map((item) => (
                  <motion.div
                    key={item.id}
                    className="absolute selection:bg-transparent select-none text-xl"
                    initial={{ x: item.x, y: "110%", rotate: item.rotate, scale: 0.88, opacity: 0 }}
                    animate={{ y: "-10%", rotate: item.rotate + 180, scale: [0.98, 1.04, 0.98], opacity: [0, 0.5, 0] }}
                    transition={{ duration: item.duration * 1.1, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                    style={{ left: item.x }}
                  >
                    {item.char}
                  </motion.div>
                ))}
              </div>

              <div className="relative mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500/20 to-pink-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)] border border-rose-500/30 animate-bounce duration-[3000ms] z-10">
                <Lock size={32} />
              </div>

              <h1 className="text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 font-serif z-10">
                Welcome, Shyaron
              </h1>
              <p className="text-xs mt-2 text-rose-300/60 italic tracking-widest font-light z-10">Only You Could Unlock This</p>

              <div className="flex gap-5 my-8 z-10">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-300 border shadow-[0_0_10px_rgba(244,63,94,0.4)] ${
                      passcode.length > i 
                        ? "bg-gradient-to-r from-rose-400 to-pink-500 scale-125 border-rose-300" 
                        : "bg-transparent border-rose-500/40"
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-5 w-full max-w-[290px] mb-8 z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="w-16 h-16 mx-auto rounded-full bg-rose-950/20 border border-rose-500/10 flex items-center justify-center text-2xl font-light text-stone-200 hover:bg-rose-500/20 hover:border-rose-400/40 shadow-inner transition-all active:scale-90 duration-200"
                  >
                    {num}
                  </button>
                ))}
                <button className="w-16 h-16" disabled />
                <button
                  onClick={() => handleKeyPress("0")}
                  className="w-16 h-16 mx-auto rounded-full bg-rose-950/20 border border-rose-500/10 flex items-center justify-center text-2xl font-light text-stone-200 hover:bg-rose-500/20 hover:border-rose-400/40 transition-all active:scale-90"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="w-16 h-16 mx-auto flex items-center justify-center text-lg text-rose-400/70 hover:text-rose-300 transition-colors active:scale-90"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-rose-200/90 flex items-center gap-2 bg-gradient-to-r from-rose-950/40 to-pink-950/40 px-5 py-3 rounded-2xl border border-rose-500/20 shadow-sm backdrop-blur-md z-10">
                <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" />
                <span className="font-light">Hint: Adit’s birthday + Shyaron’s birthday ❤️</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 2: HEART TRANSITION PORTAL */}
        {step === "unlocking" && (
          <motion.div
            key="unlocking"
            className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: [0.6, 1.18, 12, 45], opacity: [0, 1, 1, 0] }}
              transition={{ duration: HEART_ANIM_MS / 1000, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="text-rose-500 filter drop-shadow-[0_0_50px_rgba(244,63,94,0.8)]"
            >
              <Heart size={100} className="fill-rose-600 text-rose-600" />
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 3: INTERACTIVE ENVELOPE */}
        {step === "letter" && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.08 }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none z-0">
              <FloatingCharacters />
            </div>

            <div className="text-center mb-10 space-y-2 z-10 relative pointer-events-none">
              <span className="text-xs tracking-[0.3em] uppercase font-bold text-rose-300 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-400/20 backdrop-blur-md shadow-lg">
                🔒 Security Bypassed
              </span>
              <h2 className="text-4xl font-serif text-stone-100 font-bold tracking-wide mt-4">You have a sweet message waiting</h2>
            </div>

            <motion.div
              whileHover={{ scale: 1.14, rotate: 3, boxShadow: "0 0 70px rgba(244, 63, 94, 0.5)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setStep("final")}
              className="cursor-pointer group relative w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-br from-rose-50 to-stone-200 text-stone-800 p-8 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-2 border-white transition-all overflow-hidden z-10"
            >
              <div className="absolute inset-4 border border-rose-200/60 rounded-2xl pointer-events-none" />
              
              <div className="w-full flex justify-between items-start z-10">
                <Mail size={38} className="text-rose-500 group-hover:scale-110 transition-transform duration-300" />
                <Sparkles size={24} className="text-amber-500 animate-pulse" />
              </div>

              <div className="flex flex-col items-center text-center my-auto space-y-3 z-10 relative">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-3xl shadow-inner animate-pulse">
                  ❤️
                </div>
                <p className="font-serif italic text-stone-600 text-lg group-hover:text-rose-700 transition-colors">
                  Tap to unfold your letter
                </p>
              </div>

              <div className="w-full flex justify-between items-end text-xs tracking-widest text-stone-400 font-mono z-10">
                <span>SEALED WITH LOVE</span>
                <span className="font-bold text-rose-600">FROM ADIT 🌹</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 4: MAIN SCROLLABLE CINEMATIC LOVE LETTER PAGE */}
        {step === "final" && (
          <motion.div
              key="final"
              initial={{ opacity: 0, y: 38, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.1 }}
              className="relative z-10 min-h-screen w-full flex flex-col items-center py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-rose-950/20 to-black/40"
            >
            
            {/* Global Hidden Notes Layer */}
            <AnimatePresence>
              {hiddenNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }}
                  className="fixed z-[999] pointer-events-none text-sm font-serif font-bold text-rose-100 bg-rose-950/80 px-4 py-2 rounded-full border border-rose-400/40 shadow-[0_0_20px_rgba(244,63,94,0.5)] backdrop-blur-md whitespace-nowrap"
                  style={{ left: note.x, top: note.y, transform: 'translate(-50%, -100%)' }}
                >
                  {note.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Background Decor & Interactive Floating Layers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-10 left-10 text-rose-500/5 text-8xl pointer-events-none select-none font-serif">♥</div>
              <div className="absolute bottom-[20%] right-10 text-rose-500/5 text-9xl pointer-events-none select-none font-serif">♥</div>
            </div>

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
              {floatingItems.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={handleFloatingClick}
                  className="absolute drop-shadow-[0_0_15px_rgba(244,63,94,0.4)] selection:bg-transparent select-none text-3xl pointer-events-auto cursor-pointer hover:scale-125 transition-transform"
                  initial={{ x: item.x, y: "110%", rotate: item.rotate, scale: item.scale, opacity: 0 }}
                  animate={{ y: "-10%", rotate: item.rotate + 360, scale: [0.96, 1.04, 0.98], opacity: [0, 0.7, 0.7, 0] }}
                  transition={{ duration: item.duration * 1.2, repeat: Infinity, ease: "linear", delay: item.delay }}
                  style={{ left: item.x }}
                >
                  {item.char}
                </motion.div>
              ))}
              <FloatingCharacters />
            </div>

            {/* Music Action Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="fixed top-6 right-6 z-50 p-4 rounded-full bg-rose-500/10 backdrop-blur-xl border border-rose-400/30 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:bg-rose-500/20 hover:scale-110 active:scale-95 transition-all duration-300"
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} className="animate-pulse" />}
            </button>

            {/* Extravagant Deep Romantic Aesthetic Wrapper */}
            <div className="w-full max-w-2xl bg-stone-900/60 backdrop-blur-3xl border border-rose-500/20 shadow-[0_0_80px_rgba(0,0,0,0.6),_0_0_40px_rgba(159,18,57,0.2)] rounded-[3rem] p-8 md:p-14 space-y-20 relative z-30">
              
              {/* Spectacular Header */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.5 }}
                  className="inline-block p-4 bg-rose-500/10 rounded-full text-rose-400 mb-2 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                >
                  <Heart className="fill-rose-500 text-rose-500 animate-pulse" size={32} />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 font-serif tracking-tight leading-tight">
                  To My Love, Shyaron ❤️
                </h1>
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-rose-400/80 bg-rose-950/50 inline-block px-5 py-2 rounded-full border border-rose-500/10">
                  ❀ Happy Anniversary ❀
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

              {/* Heartfelt Letter Body */}
              <div className="space-y-8 text-rose-100/90 leading-relaxed font-serif text-lg md:text-2xl italic text-center max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-rose-400 first-letter:float-left first-letter:mr-2">
                  "Happy anniversary to us, my love ❤️. I still get happy every single time I talk to you."
                </p>
                <p>
                  "Thank you for being my peace, my favorite person, and the absolute prettiest part of my days. Every second spent dreaming of our future brings me a comfort I can't fully express in words."
                </p>
                <p>
                  "No matter where life takes us, you are my home. Looking forward to creating thousands of more memories together."
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

              {/* NEW: Reasons I Love You Section */}
              <div className="space-y-10">
                <h3 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-200 text-center tracking-wider">
                  Reasons I Love You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reasons.map((reason, i) => (
                    <ReasonCard key={i} text={reason} />
                  ))}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

              {/* High-Fidelity Journey Timeline */}
              <div className="space-y-12">
                <h3 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-200 text-center tracking-wider">
                  Our Beautiful Journey
                </h3>
                
                <div className="relative border-l-2 border-rose-500/30 pl-8 ml-2 md:ml-12 space-y-12">
                  
                  <div className="relative group">
                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-stone-900 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                      <Calendar size={14} />
                      <span>The Day We Met</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-100 font-serif">Sparking the First Conversation</h4>
                    <p className="text-base text-stone-300/80 mt-1 font-light">It began so simple—just a random game of Mobile Legends. I didn’t think much of it at the time, but looking back, that was the exact moment everything changed. We became this instant heartbeat duo, completely in sync from the very first match. It honestly felt like my universe finally shifted into place, like I’d found the missing piece I didn’t even know I was looking for… you.</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-stone-900 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                      <Calendar size={14} />
                      <span>Growing Closer</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-100 font-serif">Late Nights & Endless Talks</h4>
                    <p className="text-base text-stone-300/80 mt-1 font-light">Suddenly, my favorite part of the day became the hours we spent losing track of time. Late-night talks that bled into early mornings, jumping from Roblox to Sky, back to MLBB, and just talking about absolutely nothing. We’ve had our moments—we’ve argued, we’ve gotten under each other’s skin—but we always, always found our way back. You became my quiet space. My comfort. The person I run to when the rest of the world gets too loud.</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-stone-900 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                      <Calendar size={14} />
                      <span>Today & Beyond</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-100 font-serif">Celebrating Today</h4>
                    <p className="text-base text-stone-300/80 mt-1 font-light">Now here we are still together, still choosing each other every day. Through games, calls, silence, laughs, and everything in between… it’s always been you.</p>
                  </div>

                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

              {/* Updated Custom Quote */}
              <div className="bg-gradient-to-br from-rose-950/40 to-stone-900/40 rounded-3xl p-8 border border-rose-500/20 text-center space-y-4 shadow-inner relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-rose-500/5 text-7xl select-none font-serif">“</div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-rose-400">A Thought For You</span>
                <p className="text-xl md:text-2xl font-serif italic text-stone-200 leading-relaxed max-w-md mx-auto relative z-10">
                  "It’s crazy how someone so far away can still feel like home."
                </p>
                <div className="text-xs text-rose-300/60 tracking-widest font-mono relative z-10">— Always on my mind</div>
              </div>

              {/* Cinematic Ending Sequence */}
              <div className="relative text-center pt-24 pb-16 space-y-10 overflow-hidden">
                
                {/* Local floating particles rising gently inside the ending area */}
                <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-40">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      className="absolute text-rose-400/50"
                      initial={{ y: 80, opacity: 0, scale: 0.5 }}
                      animate={{ y: -180, opacity: [0, 1, 0], scale: 1.5 }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35, ease: "easeOut" }}
                      style={{ left: `${30 + Math.random() * 40}%`, fontSize: `${Math.random() * 10 + 10}px` }}
                    >
                      {i % 2 === 0 ? "✨" : "♥"}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 2 }}
                  className="relative z-10 space-y-3"
                >
                  <p className="text-sm text-rose-300/50 italic tracking-wide">
                    I love you so much, more than words can say
                  </p>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-100 to-pink-300 tracking-widest">
                    Forever Yours, Adit 🌹
                  </h2>
                </motion.div>

                {/* Gentle fade-in for the final cinematic line */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 3.5, delay: 1.2 }}
                  className="pt-16 relative z-10"
                >
                  <p className="text-sm md:text-lg font-light tracking-[0.3em] text-rose-300/60 uppercase font-serif drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                    And this is only the beginning.
                  </p>
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
