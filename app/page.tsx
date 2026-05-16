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

export default function AnniversaryApp() {
  const [step, setStep] = useState<"lock" | "unlocking" | "letter" | "final">("lock");
  const [passcode, setPasscode] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const ytPlayerRef = useRef<any>(null);

  // Fix Hydration Error: Only generate random attributes on the client side after mount
  useEffect(() => {
    const items = ["🌸", "💖", "🌹", "❤️", "❀", "✨", "💕", "💗"];
    const generated: FloatingItem[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      rotate: Math.random() * 360,
      scale: Math.random() * 1.6 + 0.9, // Slightly bigger elements for a lush feeling
      duration: Math.random() * 14 + 10,
      delay: Math.random() * 5,
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
    setStep("unlocking");
    setIsMuted(false);

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
    }, 1400);
  };

  // Helper to render new floating characters
  const FloatingCharacters = () => {
    return characterAssets.map((asset, index) => {
      const xPos = 10 + (index * 15) % 80;
      const baseDelay = index * 2;
      return (
        <motion.div
          key={index}
          className="absolute drop-shadow-[0_0_20px_rgba(244,63,94,0.3)] select-none pointer-events-none"
          initial={{
            x: `${xPos}%`,
            y: "115%",
            rotate: Math.random() * 20 - 10,
            opacity: 0,
          }}
          animate={{
            y: "-15%",
            rotate: Math.random() * 40 - 20,
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: baseDelay + Math.random() * 3,
          }}
          style={{ left: `${xPos}%` }}
        >
          {asset.type === 'image' ? (
            <img 
              src={asset.src} 
              alt={asset.alt} 
              width={asset.width} 
              height={asset.height} 
              className="opacity-90"
            />
          ) : (
            <span className="text-5xl">{asset.char}</span>
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
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4"
          >
            <div className="absolute w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[4000ms]" />

            <motion.div
              animate={error ? { x: [-12, 12, -12, 12, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md rounded-[2.5rem] bg-stone-900/40 backdrop-blur-2xl border border-rose-500/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_30px_rgba(159,18,57,0.2)] flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Background Floating elements inside lock screen */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
                {floatingItems.slice(0, 15).map((item) => (
                  <motion.div
                    key={item.id}
                    className="absolute selection:bg-transparent select-none text-xl"
                    initial={{ x: item.x, y: "110%", rotate: item.rotate, opacity: 0 }}
                    animate={{ y: "-10%", rotate: item.rotate + 180, opacity: [0, 0.5, 0] }}
                    transition={{ duration: item.duration * 0.8, repeat: Infinity, ease: "linear", delay: item.delay }}
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
                Welcome, Shyraon
              </h1>
              <p className="text-xs mt-2 text-rose-300/60 italic tracking-widest font-light z-10">YOUR SPECIAL SPACE</p>

              {/* Password Indicator Dots */}
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

              {/* Keypad */}
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
                <span className="font-light">Hint: Adit’s birthday + Shyraon’s birthday ❤️</span>
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
              animate={{ scale: [0.8, 1.2, 45], opacity: [1, 1, 0] }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden"
          >
            {/* New floating characters and extra hearts */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <FloatingCharacters />
            </div>

            <div className="text-center mb-10 space-y-2 z-10 relative">
              <span className="text-xs tracking-[0.3em] uppercase font-bold text-rose-300 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-400/20 backdrop-blur-md shadow-lg">
                🔒 Security Bypassed
              </span>
              <h2 className="text-4xl font-serif text-stone-100 font-bold tracking-wide mt-4">You have a sweet message waiting</h2>
            </div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 1, boxShadow: "0 0 50px rgba(244, 63, 94, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("final")}
              className="cursor-pointer group relative w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-br from-rose-50 to-stone-200 text-stone-800 p-8 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-2 border-white transition-all overflow-hidden z-10"
            >
              {/* Inner Luxury Card Accents */}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative z-10 min-h-screen w-full flex flex-col items-center py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-rose-950/20 to-black/40"
          >
            {/* Extended floating elements including new characters for the final page */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {floatingItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="absolute drop-shadow-[0_0_15px_rgba(244,63,94,0.4)] selection:bg-transparent select-none text-3xl"
                  initial={{ x: item.x, y: "110%", rotate: item.rotate, scale: item.scale, opacity: 0 }}
                  animate={{ y: "-10%", rotate: item.rotate + 360, opacity: [0, 0.7, 0.7, 0] }}
                  transition={{ duration: item.duration * 1.3, repeat: Infinity, ease: "linear", delay: item.delay }}
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
            <div className="w-full max-w-2xl bg-stone-900/60 backdrop-blur-3xl border border-rose-500/20 shadow-[0_0_80px_rgba(0,0,0,0.6),_0_0_40px_rgba(159,18,57,0.2)] rounded-[3rem] p-8 md:p-14 space-y-20 relative z-10">
              
              {/* Big Floating background decor hearts */}
              <div className="absolute top-10 left-10 text-rose-500/5 text-8xl pointer-events-none select-none font-serif">♥</div>
              <div className="absolute bottom-20 right-10 text-rose-500/5 text-9xl pointer-events-none select-none font-serif">♥</div>

              {/* Spectacular Header */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                  className="inline-block p-4 bg-rose-500/10 rounded-full text-rose-400 mb-2 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                >
                  <Heart className="fill-rose-500 text-rose-500 animate-pulse" size={32} />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 font-serif tracking-tight leading-tight">
                  To My Love, Shyraon ❤️
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

              {/* High-Fidelity Journey Timeline */}
              <div className="space-y-12">
                <h3 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-200 text-center tracking-wider">
                  Our Beautiful Journey
                </h3>
                
                <div className="relative border-l-2 border-rose-500/30 pl-8 ml-2 md:ml-12 space-y-12">
                  
                  {/* Timeline 1 */}
                  <div className="relative group">
                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-stone-900 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                      <Calendar size={14} />
                      <span>The Day We Met</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-100 font-serif">Sparking the First Conversation</h4>
                    <p className="text-base text-stone-300/80 mt-1 font-light">A simple Mobile Legends game turned into something much bigger a heartbeat duo that just clicked instantly. From that moment, it felt like my universe finally found its missing piece… you..</p>
                  </div>

                  {/* Timeline 2 */}
                  <div className="relative group">
                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-stone-900 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                      <Calendar size={14} />
                      <span>Growing Closer</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-100 font-serif">Late Nights & Endless Talks</h4>
                    <p className="text-base text-stone-300/80 mt-1 font-light">From random late-night chats to playing games for hours Roblox, Sky, MLBB and everything in between.
We fought sometimes, we annoyed each other, but somehow we always found our way back.
You became my safe place, my comfort, and my favorite person to escape to.</p>
                  </div>

                  {/* Timeline 3 */}
                  <div className="relative group">
                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-stone-900 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                      <Calendar size={14} />
                      <span>Today & Beyond</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-100 font-serif">Celebrating Today</h4>
                    <p className="text-base text-stone-300/80 mt-1 font-light">Now here we are still together, still choosing each other every day.
Through games, calls, silence, laughs, and everything in between… it’s always been you.</p>
                  </div>

                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

              {/* Signature Couple Quote Showcase */}
              <div className="bg-gradient-to-br from-rose-950/40 to-stone-900/40 rounded-3xl p-8 border border-rose-500/20 text-center space-y-4 shadow-inner relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-rose-500/5 text-7xl select-none font-serif">“</div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-rose-400">Words I Live By</span>
                <p className="text-xl md:text-2xl font-serif italic text-stone-200 leading-relaxed max-w-md mx-auto relative z-10">
                  "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."
                </p>
                <div className="text-xs text-rose-300/60 tracking-widest font-mono relative z-10">— Maya Angelou</div>
              </div>

              {/* End Closing Sign-off */}
              <div className="text-center pt-6 space-y-3">
                <p className="text-sm text-rose-300/50 italic tracking-wide">I love you so much, more than words can say</p>
                <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-100 to-pink-300 tracking-widest">
                  Forever Yours, Adit 🌹
                </h2>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
