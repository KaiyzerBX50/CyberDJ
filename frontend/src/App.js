import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { motion } from "framer-motion";
import { Disc3, Play, Pause, Zap, Lock, Unlock, RotateCcw, Mic, Radio } from "lucide-react";
import { StationBrowser } from "./components/StationBrowser";
import { useAudioDeck } from "./hooks/useAudioDeck";
import { useRecorder } from "./hooks/useRecorder";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";


/* ======= ERA VIBES ======= */
const VIBES = [
  { id: 1, label: 'BOOM BAP', era: "'90s NYC", padColor: '#DAA520',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A1000 0%, #0D0800 50%, #050300 100%)', accent: '#DAA520', glow: '#FFD70060', overlay: 'linear-gradient(180deg, #DAA52008 0%, transparent 40%)' }},
  { id: 2, label: 'HIP HOP', era: "Modern", padColor: '#9B59B6',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A0028 0%, #0A0014 50%, #050008 100%)', accent: '#9B59B6', glow: '#8E44AD60', overlay: 'linear-gradient(180deg, #9B59B608 0%, transparent 40%)' }},
  { id: 3, label: 'DANCEHALL', era: "Caribbean", padColor: '#00FF41',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #001A00 0%, #000D00 50%, #000500 100%)', accent: '#00FF41', glow: '#00FF4160', overlay: 'linear-gradient(180deg, #FFD70008 0%, #FF003C05 50%, transparent 100%)' }},
  { id: 4, label: 'DISCO', era: "'70s Funk", padColor: '#FF69B4',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A0020 0%, #100015 50%, #08000A 100%)', accent: '#FF69B4', glow: '#FF69B460', overlay: 'linear-gradient(180deg, #FFD70008 0%, #FF69B408 50%, transparent 100%)' }},
  { id: 5, label: 'HOUSE', era: "Chicago", padColor: '#FF6600',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A0D00 0%, #0D0500 50%, #050200 100%)', accent: '#FF6600', glow: '#FF660060', overlay: 'linear-gradient(180deg, #FF660008 0%, transparent 40%)' }},
  { id: 6, label: 'TECHNO', era: "Detroit", padColor: '#FF003C',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A0005 0%, #0D0003 50%, #080808 100%)', accent: '#FF003C', glow: '#FF003C50', overlay: 'linear-gradient(180deg, #FF003C06 0%, transparent 40%)' }},
  { id: 7, label: 'REGGAETON', era: "Latin Fire", padColor: '#FF1493',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A0008 0%, #140005 50%, #080002 100%)', accent: '#FF1493', glow: '#FF149360', overlay: 'linear-gradient(180deg, #FF660008 0%, #FF149308 50%, transparent 100%)' }},
  { id: 8, label: 'AFROBEATS', era: "Global Wave", padColor: '#E67E22',
    theme: { bg: 'radial-gradient(ellipse at 50% 0%, #1A1200 0%, #0D0800 50%, #050300 100%)', accent: '#E67E22', glow: '#27AE6060', overlay: 'linear-gradient(180deg, #27AE6008 0%, #E67E2208 50%, transparent 100%)' }},
];

const playSampleSound = (audioCtx, type) => {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  if (type === 'HORN') {
    const osc = audioCtx.createOscillator(); const osc2 = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(480, now + 0.05);
    osc2.type = 'square'; osc2.frequency.setValueAtTime(443, now);
    gain.gain.setValueAtTime(0.25, now); gain.gain.setValueAtTime(0.25, now + 0.4); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc2.start(now); osc.stop(now + 0.7); osc2.stop(now + 0.7);
  }
  if (type === 'SIREN') {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
    osc.frequency.linearRampToValueAtTime(600, now + 0.8); osc.frequency.linearRampToValueAtTime(1200, now + 1.2);
    gain.gain.setValueAtTime(0.2, now); gain.gain.setValueAtTime(0.2, now + 1.0); gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 1.3);
  }
  if (type === 'DROP') {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
    gain.gain.setValueAtTime(0.35, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.8);
  }
  if (type === 'AIRHORN') {
    [0, 0.15, 0.30].forEach(offset => {
      const osc = audioCtx.createOscillator(); const osc2 = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(820, now + offset);
      osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(824, now + offset);
      gain.gain.setValueAtTime(0, now + offset); gain.gain.linearRampToValueAtTime(0.2, now + offset + 0.02);
      gain.gain.setValueAtTime(0.2, now + offset + 0.08); gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
      osc.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now + offset); osc2.start(now + offset); osc.stop(now + offset + 0.12); osc2.stop(now + offset + 0.12);
    });
  }
};

/* ======= VINYL TURNTABLE ======= */
const VinylTurntable = ({ isPlaying, analyserData, deckId, currentStation, rotation }) => {
  const c = deckId === 'A' ? '#00F0FF' : '#FF003C';
  return (
    <div className="relative" data-testid={`turntable-${deckId.toLowerCase()}`}>
      <div className="relative" style={{ width: 190, height: 190 }}>
        {/* Platter base */}
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)', boxShadow: `inset 0 0 30px rgba(0,0,0,0.8), 0 0 ${isPlaying ? 22 : 8}px ${c}30`, border: `2px solid ${c}25` }} />
        <div className="absolute inset-2 rounded-full" style={{ background: `conic-gradient(${c}15, ${c}40, ${c}15, ${c}40, ${c}15)`, opacity: isPlaying ? 0.5 : 0.15, filter: 'blur(2px)' }} />
        {/* Spinning vinyl */}
        <motion.div className="absolute inset-3 rounded-full" style={{ rotate: rotation }}>
          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from ${rotation}deg, #111, #1a1a1a, #111, #181818, #111, #1a1a1a, #111, #181818)` }} />
          {[...Array(10)].map((_, i) => <div key={i} className="absolute rounded-full border border-white/5" style={{ inset: `${6 + i * 6}%` }} />)}
          {/* Center label */}
          <div className="absolute rounded-full flex items-center justify-center" style={{ inset: '30%', background: deckId === 'A' ? 'linear-gradient(135deg, #00F0FF, #0066FF)' : 'linear-gradient(135deg, #FF003C, #FF6600)', boxShadow: `0 0 15px ${c}50` }}>
            <div className="text-center">
              <div className="text-[7px] font-bold text-white uppercase tracking-wider">{currentStation?.name?.slice(0, 8) || 'DECK ' + deckId}</div>
              <div className="text-[5px] text-white/70">{isPlaying ? 'ON AIR' : 'READY'}</div>
            </div>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-black" />
          </div>
          <div className="absolute top-1.5 left-1/2 w-1 h-3 -translate-x-1/2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
        </motion.div>

        {/* LED dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: isPlaying && analyserData[i * 20] > 100 ? c : '#222', boxShadow: isPlaying && analyserData[i * 20] > 100 ? `0 0 4px ${c}` : 'none' }} />)}
        </div>
      </div>
    </div>
  );
};

/* ======= SPECTRUM VISUALIZER ======= */
const SpectrumVisualizer = ({ deckAData, deckBData, isPlayingA, isPlayingB }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    let frame;
    const draw = () => {
      ctx.fillStyle = 'rgba(8,8,8,0.3)';
      ctx.fillRect(0, 0, width, height);
      if (!isPlayingA && !isPlayingB) {
        ctx.strokeStyle = '#00F0FF18';
        ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
        frame = requestAnimationFrame(draw); return;
      }
      const combined = new Uint8Array(64);
      for (let i = 0; i < 64; i++) combined[i] = Math.max(deckAData[i * 2] || 0, deckBData[i * 2] || 0);
      const bw = (width / 64) - 1.5;
      for (let i = 0; i < 64; i++) {
        const v = combined[i] / 255, bh = v * height * 0.9, x = i * (bw + 1.5), y = height - bh;
        const col = i < 20 ? '#FF003C' : i < 42 ? '#00F0FF' : '#39FF14';
        const g = ctx.createLinearGradient(x, height, x, y);
        g.addColorStop(0, col + '30'); g.addColorStop(0.6, col + 'BB'); g.addColorStop(1, col);
        ctx.fillStyle = g; ctx.fillRect(x, y, bw, bh);
        ctx.fillStyle = col; ctx.fillRect(x, y - 2, bw, 1.5);
      }
      ctx.strokeStyle = '#00F0FF50'; ctx.lineWidth = 1.5; ctx.beginPath();
      const w = isPlayingA ? deckAData : deckBData;
      for (let i = 0; i < w.length; i++) {
        const x = (i / w.length) * width, y = ((w[i] - 128) / 128) * 25 + 22;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [deckAData, deckBData, isPlayingA, isPlayingB]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#080808]" data-testid="spectrum-visualizer">
      <div className="absolute top-2 left-3 flex items-center gap-3 text-[9px] font-mono z-10">
        <span className={`flex items-center gap-1 ${isPlayingA ? 'text-[#00F0FF]' : 'text-white/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isPlayingA ? 'bg-[#00F0FF] animate-pulse' : 'bg-white/15'}`} />DECK A
        </span>
        <span className={`flex items-center gap-1 ${isPlayingB ? 'text-[#FF003C]' : 'text-white/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isPlayingB ? 'bg-[#FF003C] animate-pulse' : 'bg-white/15'}`} />DECK B
        </span>
      </div>
      <canvas ref={canvasRef} width={700} height={150} className="w-full h-[120px]" />
    </div>
  );
};

/* ======= PIONEER KNOB ======= */
const Knob = ({ label, value = 50, color = '#888', size = 36, onChange }) => {
  const valRef = useRef(value);
  valRef.current = value;
  const rot = ((Math.min(100, Math.max(0, value)) / 100) * 270) - 135;
  const handleDragStart = (startY) => {
    if (!onChange) return;
    let lastY = startY;
    const onMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = (lastY - clientY) * 0.8;
      lastY = clientY;
      const newVal = Math.min(100, Math.max(0, valRef.current + delta));
      onChange(newVal);
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); document.addEventListener('touchmove', onMove); document.addEventListener('touchend', onUp);
  };
  return (
    <div className="flex flex-col items-center">
      <span className="text-[7px] font-mono text-white/45 uppercase tracking-wider">{label}</span>
      <div className="relative" style={{ width: size, height: size, cursor: onChange ? 'ns-resize' : 'default' }}
        onMouseDown={(e) => { e.preventDefault(); handleDragStart(e.clientY); }}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}>
        {[...Array(20)].map((_, i) => {
          const a = (i / 20) * 270 - 135;
          return <div key={i} className="absolute w-px h-1 rounded-full" style={{ top: '50%', left: '50%', background: a <= rot ? color : '#252525', transform: `rotate(${a}deg) translateY(-${size / 2 + 2}px)`, transformOrigin: 'center', boxShadow: a <= rot ? `0 0 2px ${color}` : 'none' }} />;
        })}
        <div className="absolute inset-0.5 rounded-full" style={{ background: 'linear-gradient(145deg, #4a4a4a, #282828)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.4)' }}>
          <div className="absolute w-px h-2.5 rounded-full top-1 left-1/2" style={{ background: color, transform: `translateX(-50%) rotate(${rot}deg)`, transformOrigin: `50% ${(size - 4) / 2}px`, boxShadow: `0 0 3px ${color}` }} />
          <div className="absolute inset-[32%] rounded-full" style={{ background: 'radial-gradient(#3a3a3a, #202020)' }} />
        </div>
      </div>
    </div>
  );
};

/* ======= CROSSFADER ======= */
const Crossfader = ({ value, onChange }) => {
  const trackRef = useRef(null);
  const handleInteraction = (clientX) => {
    const track = trackRef.current;
    if (!track || !onChange) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(pct * 2 - 1);
  };
  const startDrag = (clientX) => {
    handleInteraction(clientX);
    const onMove = (e) => handleInteraction(e.touches ? e.touches[0].clientX : e.clientX);
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); document.addEventListener('touchmove', onMove); document.addEventListener('touchend', onUp);
  };
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/8" data-testid="crossfader">
      <span className="text-[8px] font-mono text-[#00F0FF] font-bold">A</span>
      <div ref={trackRef} className="relative flex-1 h-5 rounded bg-black/60 border border-white/10 cursor-pointer"
        onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX); }}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}>
        <div className="absolute inset-y-0.5 left-1 right-1 rounded pointer-events-none" style={{ background: 'linear-gradient(to right, #00F0FF25, transparent 30%, transparent 70%, #FF003C25)' }} />
        <div className="absolute top-1/2 left-1/2 w-px h-3 -translate-y-1/2 bg-white/25 pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 w-8 h-4 rounded pointer-events-none" style={{ left: `calc(${(value + 1) / 2 * 100}% - 16px)`, background: 'linear-gradient(to bottom, #555, #333)', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 space-y-px"><div className="h-px bg-white/30" /><div className="h-px bg-white/30" /></div>
        </div>
      </div>
      <span className="text-[8px] font-mono text-[#FF003C] font-bold">B</span>
    </div>
  );
};

/* ======= CENTER MIXER STRIP ======= */
const CenterMixer = ({ deckA, deckB }) => {
  const levelA = deckA.isPlaying ? deckA.analyserData.reduce((a, b) => a + b, 0) / deckA.analyserData.length / 255 : 0;
  const levelB = deckB.isPlaying ? deckB.analyserData.reduce((a, b) => a + b, 0) / deckB.analyserData.length / 255 : 0;
  const masterLevel = Math.max(levelA, levelB);
  const anyPlaying = deckA.isPlaying || deckB.isPlaying;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!anyPlaying) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [anyPlaying]);
  const wobble = (base, speed, phase, amp = 15) => anyPlaying ? Math.round(base + Math.sin(tick * speed + phase) * amp) : base;

  return (
    <div className="flex flex-col gap-1.5 px-2 py-2 rounded-lg bg-[#0c0c0c] border border-white/8 w-[180px] shrink-0" data-testid="center-mixer">
      {/* Master section — prominent */}
      <div className="text-center">
        <span className="text-[8px] font-['Orbitron'] text-white/40 uppercase tracking-widest">MASTER</span>
        <div className="flex justify-center gap-1.5 mt-1">
          {['L', 'R'].map(ch => (
            <div key={ch} className="flex flex-col items-center">
              <div className="flex flex-col-reverse gap-px">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-3 h-1.5 rounded-sm transition-all" style={{
                    background: masterLevel > i / 12 ? (i < 7 ? '#39FF14' : i < 10 ? '#FFD700' : '#FF003C') : '#151515',
                    boxShadow: masterLevel > i / 12 && i >= 10 ? '0 0 4px #FF003C' : 'none',
                  }} />
                ))}
              </div>
              <span className="text-[5px] text-white/25 mt-0.5">{ch}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-around">
        <Knob label="MASTER" value={wobble(75, 0.08, 0, 8)} color="#FF003C" size={32} />
        <Knob label="BOOTH" value={wobble(50, 0.06, 1.5, 10)} color="#FFD700" size={32} />
      </div>

      <div className="h-px bg-white/8" />

      {/* Channel strips */}
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[7px] font-['Orbitron'] text-[#00F0FF]">CH 1</span>
          <Knob label="TRIM" value={wobble(50, 0.12, 0)} color="#00F0FF" size={22} />
          <Knob label="HI" value={wobble(50, 0.09, 1.0)} color="#39FF14" size={22} />
          <Knob label="MID" value={wobble(50, 0.11, 2.0)} color="#FFD700" size={22} />
          <Knob label="LOW" value={wobble(50, 0.07, 3.0)} color="#FF003C" size={22} />
          <div className="flex gap-px">
            {['L', 'R'].map(ch => (
              <div key={ch} className="flex flex-col-reverse gap-px">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1 rounded-sm" style={{ background: levelA > i / 8 ? (i < 5 ? '#39FF14' : i < 7 ? '#FFD700' : '#FF003C') : '#151515' }} />
                ))}
              </div>
            ))}
          </div>
          <div className="w-3 h-14 bg-black/60 rounded relative border border-white/8">
            <div className="absolute bottom-0 left-0 right-0 rounded-b" style={{ height: `${deckA.volume * 100}%`, background: '#00F0FF25' }} />
            <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2 bg-gray-400 rounded" style={{ bottom: `${deckA.volume * 85}%` }} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[7px] font-['Orbitron'] text-[#FF003C]">CH 2</span>
          <Knob label="TRIM" value={wobble(50, 0.10, 4.0)} color="#FF003C" size={22} />
          <Knob label="HI" value={wobble(50, 0.13, 5.0)} color="#39FF14" size={22} />
          <Knob label="MID" value={wobble(50, 0.08, 6.0)} color="#FFD700" size={22} />
          <Knob label="LOW" value={wobble(50, 0.11, 7.0)} color="#FF003C" size={22} />
          <div className="flex gap-px">
            {['L', 'R'].map(ch => (
              <div key={ch} className="flex flex-col-reverse gap-px">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1 rounded-sm" style={{ background: levelB > i / 8 ? (i < 5 ? '#39FF14' : i < 7 ? '#FFD700' : '#FF003C') : '#151515' }} />
                ))}
              </div>
            ))}
          </div>
          <div className="w-3 h-14 bg-black/60 rounded relative border border-white/8">
            <div className="absolute bottom-0 left-0 right-0 rounded-b" style={{ height: `${deckB.volume * 100}%`, background: '#FF003C25' }} />
            <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2 bg-gray-400 rounded" style={{ bottom: `${deckB.volume * 85}%` }} />
          </div>
        </div>
      </div>

      <div className="h-px bg-white/8" />
      <div className="flex justify-around">
        <Knob label="CUE" value={wobble(50, 0.14, 8.0)} color="#00F0FF" size={22} />
        <Knob label="LVL" value={wobble(60, 0.09, 9.0)} color="#FFD700" size={22} />
      </div>
    </div>
  );
};

/* ======= DECK PANEL ======= */
const DeckPanel = ({ deck, deckId, activeVibe, onVibeChange, onPlaySample }) => {
  const c = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const [loopActive, setLoopActive] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keyLock, setKeyLock] = useState(false);
  const [fxTick, setFxTick] = useState(0);
  useEffect(() => {
    if (!deck.isPlaying) return;
    const id = setInterval(() => setFxTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [deck.isPlaying]);
  const fxWobble = (base, speed, phase, amp = 20) => deck.isPlaying ? Math.round(base + Math.sin(fxTick * speed + phase) * amp) : base;
  const [flashingSampler, setFlashingSampler] = useState(null);
  const bpm = deck.isPlaying ? Math.floor(85 + deck.analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 32) : null;
  const elapsed = deck.isPlaying ? Math.floor(performance.now() / 1000) % 600 : 0;
  const keys = ['Am', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Bm', 'Ab'];
  const detectedKey = deck.isPlaying ? keys[Math.floor(deck.analyserData[10] / 32)] : null;

  const handleSampler = (s) => {
    onPlaySample(s.label);
    setFlashingSampler(s.id);
    setTimeout(() => setFlashingSampler(null), 300);
  };

  return (
    <div className="flex-1 rounded-lg border p-2.5 flex flex-col gap-2 min-h-0 overflow-y-auto" data-testid={`deck-panel-${deckId.toLowerCase()}`} style={{ background: 'linear-gradient(180deg, #131313, #0a0a0a)', borderColor: c + '25' }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${deck.isPlaying ? 'animate-pulse' : ''}`} style={{ background: deck.isPlaying ? '#39FF14' : '#333' }} />
          <span className="text-[10px] font-['Orbitron'] font-bold" style={{ color: c }}>DECK {deckId}</span>
          <span className="text-[8px] font-mono text-white/40 truncate max-w-[120px]">{deck.currentStation?.name || ''}</span>
        </div>
        <div className="flex items-center gap-2">
          {!deck.currentStation && <span className="text-[8px] font-mono text-white/25">NO SIGNAL</span>}
          {bpm && <div className="px-1.5 py-px rounded bg-black/60 border border-white/10">
            <span className="text-base font-['Orbitron'] font-bold" style={{ color: c }}>{bpm}</span>
            <span className="text-[6px] text-white/35 ml-0.5">BPM</span>
          </div>}
        </div>
      </div>

      {/* Waveform */}
      <div className="h-8 rounded bg-black/50 border border-white/5 relative overflow-hidden shrink-0" data-testid={`waveform-${deckId.toLowerCase()}`}>
        {deck.currentStation && deck.isPlaying ? (
          <>
            <div className="absolute inset-0 flex items-end px-0.5">
              {[...Array(60)].map((_, i) => {
                const val = deck.waveformData[i * 2] || 128;
                const h = Math.abs(val - 128) / 128 * 100;
                return <div key={i} className="flex-1 mx-px rounded-t" style={{ height: `${Math.max(4, h)}%`, background: c, opacity: 0.65 }} />;
              })}
            </div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/70" />
          </>
        ) : <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/6" /></div>}
      </div>

      {/* Transport */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <button onClick={() => { if (deck.cueToStart) deck.cueToStart(); else if (deck.audioRef?.current) deck.audioRef.current.currentTime = 0; }}
          className="px-3 py-1.5 rounded text-[9px] font-bold bg-[#FF6600]/25 text-[#FF6600] border border-[#FF6600]/40 hover:bg-[#FF6600]/50 active:bg-[#FF6600]/70 active:scale-95 transition-all">CUE</button>
        <button data-testid={`play-pause-${deckId.toLowerCase()}`} onClick={deck.togglePlayPause} disabled={!deck.currentStation}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
          style={{ background: deck.isPlaying ? '#FF003C' : '#39FF14', boxShadow: `0 0 16px ${deck.isPlaying ? '#FF003C50' : '#39FF1450'}` }}>
          {deck.isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
        </button>
        <button onClick={() => { if (deck.syncBpm) deck.syncBpm(); setSynced(true); setTimeout(() => setSynced(false), 800); }}
          className={`px-2.5 py-1.5 rounded text-[9px] font-bold flex items-center gap-1 border transition-all active:scale-95 ${synced ? 'bg-[#39FF14]/30 text-[#39FF14] border-[#39FF14]/50' : 'bg-white/8 text-white/45 border-white/10 hover:bg-white/12'}`}>
          <Zap className={`w-2.5 h-2.5 ${synced ? 'animate-pulse' : ''}`} />SYNC
        </button>
      </div>

      {/* Loop + Pitch */}
      <div className="flex gap-2 shrink-0">
        <div className="flex items-center gap-1 flex-1 p-1.5 rounded bg-black/25">
          <span className="text-[7px] text-white/35 mr-0.5">LOOP</span>
          <button onClick={() => setLoopActive(!loopActive)} className={`p-1 rounded ${loopActive ? 'bg-[#39FF14] text-black' : 'bg-white/8 text-white/40'}`}>
            <RotateCcw className="w-3 h-3" />
          </button>
          {[1, 2, 4, 8, 16, 32].map(n => <button key={n} className="flex-1 py-1 text-[8px] font-mono rounded bg-white/6 text-white/35 hover:bg-white/12">{n}</button>)}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-black/25 w-[100px] shrink-0">
          <span className="text-[7px] text-white/35">PITCH</span>
          <button onClick={() => setKeyLock(!keyLock)} className={keyLock ? 'text-[#39FF14]' : 'text-white/25'}>
            {keyLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <div className="flex-1 h-1.5 bg-black/50 rounded-full relative">
            <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full left-1/2 -translate-x-1/2" style={{ background: c }} />
          </div>
        </div>
      </div>

      {/* ERA VIBES */}
      <div className="shrink-0 rounded-lg border border-white/10 bg-black/30 p-2">
        <span className="text-[9px] font-['Orbitron'] tracking-[0.15em] text-white/70 block mb-1.5">ERA VIBES</span>
        <div className="grid grid-cols-4 gap-1.5">
          {VIBES.map(v => {
            const isActive = activeVibe === v.id;
            return (
              <button key={v.id} onClick={() => onVibeChange(isActive ? null : v.id)}
                className="py-2.5 px-1.5 rounded-md text-center transition-all"
                style={{
                  background: isActive ? v.padColor + '45' : v.padColor + '15',
                  border: `1.5px solid ${isActive ? v.padColor : v.padColor + '35'}`,
                  boxShadow: isActive ? `0 0 14px ${v.padColor}50, inset 0 0 8px ${v.padColor}20` : 'none',
                }}>
                <div className="text-[10px] font-bold font-['Orbitron'] tracking-wide" style={{ color: isActive ? '#fff' : v.padColor + '90' }}>{v.label}</div>
                <div className="text-[8px] font-mono mt-0.5" style={{ color: isActive ? 'rgba(255,255,255,0.6)' : v.padColor + '50' }}>{v.era}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FX Rack */}
      <div className="py-1.5 px-2 rounded bg-black/25 shrink-0">
        <span className="text-[9px] font-['Orbitron'] tracking-[0.1em] text-white/50 block mb-1">FX RACK</span>
        <div className="flex justify-around">
          <Knob label="ECHO" value={fxWobble(30, 0.15, 0, 25)} color="#FFD700" size={28} />
          <Knob label="REVERB" value={fxWobble(25, 0.10, 1.5, 20)} color="#FF6600" size={28} />
          <Knob label="FILTER" value={fxWobble(50, 0.12, 3.0, 30)} color="#9900FF" size={28} />
          <Knob label="DRY/WET" value={fxWobble(50, 0.08, 4.5, 15)} color="#39FF14" size={28} />
        </div>
      </div>

      {/* Sampler */}
      <div className="shrink-0">
        <span className="text-[8px] text-white/30 block mb-0.5">SAMPLER</span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 1, label: 'HORN', color: '#FF6600' },
            { id: 2, label: 'SIREN', color: '#FF003C' },
            { id: 3, label: 'DROP', color: '#9900FF' },
            { id: 4, label: 'AIRHORN', color: '#FFD700' },
          ].map(s => {
            const isFlashing = flashingSampler === s.id;
            return (
              <button key={s.id} onClick={() => handleSampler(s)}
                className="py-2 rounded text-[7px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: isFlashing ? s.color + '80' : s.color + '20',
                  border: `1px solid ${isFlashing ? s.color : s.color + '50'}`,
                  color: isFlashing ? '#fff' : s.color,
                  boxShadow: isFlashing ? `0 0 16px ${s.color}60` : 'none',
                }}>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Track Info Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded bg-black/40 border border-white/5 shrink-0" data-testid={`track-info-${deckId.toLowerCase()}`}>
        {deck.isPlaying ? (
          <>
            <div className="flex items-center gap-2">
              <div className="px-1.5 py-px rounded text-[8px] font-mono font-bold" style={{ background: c + '20', color: c, border: `1px solid ${c}30` }}>
                {detectedKey}
              </div>
              <span className="text-[7px] font-mono text-white/30">{deck.currentStation?.tags?.[0] || 'HIP HOP'}</span>
            </div>
            <div className="flex items-center gap-3 text-[8px] font-mono">
              <span className="text-white/50">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-2.5 rounded-sm" style={{
                    background: deck.analyserData[i * 16] > 120 ? c : '#1a1a1a',
                    opacity: 0.8,
                  }} />
                ))}
              </div>
              <span className="text-white/30">-{Math.floor((600 - elapsed) / 60)}:{((600 - elapsed) % 60).toString().padStart(2, '0')}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[7px] font-mono text-white/15">KEY ---</span>
            <div className="flex gap-0.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1 h-2 rounded-sm bg-white/5" />
              ))}
            </div>
            <span className="text-[7px] font-mono text-white/15">--:--</span>
          </div>
        )}
      </div>

      {/* Station / Artist Info */}
      <div className="flex-1 min-h-[60px] rounded-lg border border-white/5 bg-black/30 flex flex-col items-center justify-center px-3 py-2 gap-1 relative overflow-hidden">
        {deck.currentStation ? (
          <>
            <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at 50% 100%, ${c}40, transparent 70%)` }} />
            <div className="flex items-center gap-1.5 relative z-10">
              <Radio className="w-3 h-3 animate-pulse" style={{ color: c }} />
              <span className="text-[7px] font-['Orbitron'] tracking-[0.2em] text-white/40 uppercase">Now Playing</span>
            </div>
            <span className="text-[13px] font-['Orbitron'] font-bold tracking-wide truncate max-w-full text-center relative z-10" style={{ color: c, textShadow: `0 0 12px ${c}50` }}>
              {deck.currentStation.name}
            </span>
            {deck.currentStation.tags && (
              <span className="text-[9px] font-mono text-white/35 truncate max-w-full text-center relative z-10">
                {typeof deck.currentStation.tags === 'string' ? deck.currentStation.tags : deck.currentStation.tags.join(' \u00B7 ')}
              </span>
            )}
            {deck.isPlaying && bpm && (
              <span className="text-[8px] font-mono text-white/25 relative z-10">{bpm} BPM \u00B7 {detectedKey}</span>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-30">
            <Disc3 className="w-5 h-5 text-white/20" />
            <span className="text-[8px] font-['Orbitron'] tracking-wider text-white/25">NO STATION LOADED</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ======= VIBE BACKGROUND ANIMATIONS ======= */
const VibeBackground = ({ activeVibe }) => {
  if (!activeVibe) return null;
  const vibe = VIBES.find(v => v.id === activeVibe);
  if (!vibe) return null;
  const ac = vibe.padColor;
  const animations = {
    1: {
      css: `@keyframes dust-float{0%{transform:translateY(100vh) scale(0.3);opacity:0}30%{opacity:0.6}100%{transform:translateY(-20vh) scale(1);opacity:0}}.vibe-p{position:absolute;border-radius:50%;animation:dust-float linear infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0">{[...Array(20)].map((_,i)=>(<div key={i} className="vibe-p" style={{width:2+Math.random()*4,height:2+Math.random()*4,left:`${Math.random()*100}%`,background:`radial-gradient(${ac},${ac}00)`,boxShadow:`0 0 ${4+Math.random()*8}px ${ac}60`,animationDuration:`${6+Math.random()*8}s`,animationDelay:`${Math.random()*8}s`}}/>))}</div>),
    },
    2: {
      css: `@keyframes pulse-ring{0%{transform:translate(-50%,-50%) scale(0.1);opacity:0.7;border-width:3px}100%{transform:translate(-50%,-50%) scale(3);opacity:0;border-width:1px}}.vibe-ring{position:absolute;left:50%;top:50%;border-radius:50%;border-style:solid;animation:pulse-ring ease-out infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0">{[...Array(4)].map((_,i)=>(<div key={i} className="vibe-ring" style={{width:200,height:200,borderColor:ac+'50',animationDuration:'4s',animationDelay:`${i}s`}}/>))}</div>),
    },
    3: {
      css: `@keyframes wave-move{0%{transform:translateX(-100%) skewY(-2deg)}100%{transform:translateX(100%) skewY(2deg)}}.vibe-wave{position:absolute;width:200%;height:40%;animation:wave-move ease-in-out infinite alternate;pointer-events:none;border-radius:50%}`,
      render: () => (<div className="absolute inset-0 overflow-hidden">{[...Array(3)].map((_,i)=>(<div key={i} className="vibe-wave" style={{top:`${30+i*20}%`,background:`linear-gradient(90deg,transparent,${ac}08,${ac}15,${ac}08,transparent)`,animationDuration:`${5+i*2}s`,animationDelay:`${i*0.5}s`}}/>))}</div>),
    },
    4: {
      css: `@keyframes disco-sparkle{0%,100%{opacity:0.1;transform:scale(0.5)}50%{opacity:0.8;transform:scale(1.2)}}.vibe-sparkle{position:absolute;border-radius:50%;animation:disco-sparkle ease-in-out infinite;pointer-events:none}`,
      render: () => {const cols=['#FF69B4','#FFD700','#00F0FF','#39FF14','#FF003C','#9B59B6'];return(<div className="absolute inset-0">{[...Array(25)].map((_,i)=>(<div key={i} className="vibe-sparkle" style={{width:3+Math.random()*5,height:3+Math.random()*5,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,background:cols[i%6],boxShadow:`0 0 ${6+Math.random()*10}px ${cols[i%6]}80`,animationDuration:`${1+Math.random()*2}s`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);},
    },
    5: {
      css: `@keyframes ripple-expand{0%{transform:translate(-50%,-50%) scale(0.2);opacity:0.5}100%{transform:translate(-50%,-50%) scale(4);opacity:0}}.vibe-ripple{position:absolute;left:50%;top:60%;border-radius:50%;border:1px solid;animation:ripple-expand linear infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0">{[...Array(5)].map((_,i)=>(<div key={i} className="vibe-ripple" style={{width:120,height:120,borderColor:ac+'40',animationDuration:'5s',animationDelay:`${i}s`}}/>))}</div>),
    },
    6: {
      css: `@keyframes scan-down{0%{top:-10%}100%{top:110%}}.vibe-scan{position:absolute;left:0;right:0;height:2px;animation:scan-down linear infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0 overflow-hidden">{[...Array(6)].map((_,i)=>(<div key={i} className="vibe-scan" style={{background:`linear-gradient(90deg,transparent 5%,${ac}50 30%,${ac}90 50%,${ac}50 70%,transparent 95%)`,boxShadow:`0 0 8px ${ac}40`,animationDuration:`${2+i*0.5}s`,animationDelay:`${i*0.4}s`}}/>))}</div>),
    },
    7: {
      css: `@keyframes diag-flow{0%{background-position:0% 0%}100%{background-position:200% 200%}}.vibe-diag{position:absolute;inset:0;animation:diag-flow linear infinite;pointer-events:none}`,
      render: () => (<div className="vibe-diag" style={{backgroundImage:`repeating-linear-gradient(45deg,transparent,transparent 80px,${ac}08 80px,${ac}15 120px,transparent 120px)`,backgroundSize:'200% 200%',animationDuration:'8s'}}/>),
    },
    8: {
      css: `@keyframes orb-float{0%{transform:translate(0,0) scale(1);opacity:0.3}33%{transform:translate(30px,-50px) scale(1.3);opacity:0.5}66%{transform:translate(-20px,-30px) scale(0.8);opacity:0.2}100%{transform:translate(0,0) scale(1);opacity:0.3}}.vibe-orb{position:absolute;border-radius:50%;animation:orb-float ease-in-out infinite;pointer-events:none;filter:blur(20px)}`,
      render: () => (<div className="absolute inset-0">{[...Array(6)].map((_,i)=>(<div key={i} className="vibe-orb" style={{width:60+Math.random()*80,height:60+Math.random()*80,left:`${10+Math.random()*80}%`,top:`${10+Math.random()*80}%`,background:`radial-gradient(${ac}40,${ac}00)`,animationDuration:`${6+Math.random()*6}s`,animationDelay:`${Math.random()*4}s`}}/>))}</div>),
    },
  };
  const anim = animations[activeVibe];
  if (!anim) return null;
  return (<><style>{anim.css}</style><div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">{anim.render()}</div></>);
};

/* ======= MAIN APP ======= */
function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState('A');
  const [crossfade, setCrossfade] = useState(0);
  const [activeVibe, setActiveVibe] = useState(null);
  const [masterVolume, setMasterVolume] = useState(0.75);
  const sfxCtxRef = useRef(null);
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);

  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');
  const recorder = useRecorder();

  const currentTheme = activeVibe ? VIBES.find(v => v.id === activeVibe)?.theme : null;

  const handleVibeChange = (vibeId) => {
    setActiveVibe(vibeId);
    if (vibeId) {
      const vibe = VIBES.find(v => v.id === vibeId);
      if (vibe) toast(`${vibe.label} \u2014 ${vibe.era}`, { duration: 1500 });
    }
  };

  const handlePlaySample = (type) => {
    if (!sfxCtxRef.current) sfxCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (sfxCtxRef.current.state === 'suspended') sfxCtxRef.current.resume();
    playSampleSound(sfxCtxRef.current, type);
  };

  useEffect(() => {
    let frame, last = performance.now();
    const animate = (t) => {
      const d = (t - last) / 1000; last = t;
      if (deckA.isPlaying) setRotationA(r => (r + 180 * d) % 360);
      if (deckB.isPlaying) setRotationB(r => (r + 180 * d) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [deckA.isPlaying, deckB.isPlaying]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); (activeDeck === 'A' ? deckA : deckB).togglePlayPause(); }
      if (e.key === 'a') setActiveDeck('A');
      if (e.key === 'b') setActiveDeck('B');
      if (e.key === 's') setIsStationBrowserOpen(true);
      if (e.key === 'r') recorder.isRecording ? recorder.stopRecording() : recorder.startRecording();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeDeck, deckA, deckB, recorder]);

  const handleStation = async (s) => {
    try {
      await (activeDeck === 'A' ? deckA : deckB).playStation(s);
      toast.success(`Deck ${activeDeck}: ${s.name}`);
    } catch { toast.error("Failed to load station"); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden text-white relative" style={{ background: currentTheme?.bg || '#080808', transition: 'background 0.6s ease' }}>
      <VibeBackground activeVibe={activeVibe} />
      {currentTheme && <div className="absolute inset-0 pointer-events-none z-0" style={{ background: currentTheme.overlay, transition: 'background 0.6s ease' }} />}
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-1.5 bg-black/80 border-b border-white/8 shrink-0 relative z-10" data-testid="app-header">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-[#00F0FF]" />
          <Disc3 className="w-5 h-5 text-[#FF003C] -ml-3" />
          <span className="font-['Orbitron'] text-sm tracking-wider">CYBERDECK</span>
          {activeVibe && (() => { const v = VIBES.find(x => x.id === activeVibe); return v ? (<span className="ml-1 px-2 py-0.5 rounded text-[8px] font-['Orbitron'] tracking-wider animate-pulse" style={{ background: v.padColor + '25', color: v.padColor, border: `1px solid ${v.padColor}40` }}>{v.label}</span>) : null; })()}
        </div>
        {(deckA.currentStation || deckB.currentStation) && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FF003C]/15 border border-[#FF003C]/25">
            <Radio className="w-3 h-3 text-[#39FF14] animate-pulse" />
            <span className="text-[9px] text-white/80">{deckA.currentStation?.name || deckB.currentStation?.name}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button data-testid="record-btn" onClick={() => recorder.isRecording ? recorder.stopRecording() : recorder.startRecording()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold border ${recorder.isRecording ? 'bg-[#FF003C]/25 border-[#FF003C]/40 text-[#FF003C]' : 'bg-white/5 border-white/8 text-white/40 hover:text-white/70'}`}>
            <Mic className="w-3 h-3" />
            {recorder.isRecording ? <span className="animate-pulse">{recorder.formatDuration(recorder.recordingDuration)}</span> : 'REC'}
          </button>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
            <button onClick={() => setActiveDeck('A')}
              className="px-2 py-0.5 rounded text-[9px] font-['Orbitron'] font-bold transition-all"
              style={{
                background: activeDeck === 'A' ? '#00F0FF25' : 'transparent',
                color: activeDeck === 'A' ? '#00F0FF' : '#ffffff40',
                border: activeDeck === 'A' ? '1px solid #00F0FF50' : '1px solid transparent',
                boxShadow: activeDeck === 'A' ? '0 0 8px #00F0FF30' : 'none',
              }}>DECK A</button>
            <button onClick={() => setActiveDeck('B')}
              className="px-2 py-0.5 rounded text-[9px] font-['Orbitron'] font-bold transition-all"
              style={{
                background: activeDeck === 'B' ? '#FF003C25' : 'transparent',
                color: activeDeck === 'B' ? '#FF003C' : '#ffffff40',
                border: activeDeck === 'B' ? '1px solid #FF003C50' : '1px solid transparent',
                boxShadow: activeDeck === 'B' ? '0 0 8px #FF003C30' : 'none',
              }}>DECK B</button>
          </div>
          <StationBrowser onSelectStation={handleStation} currentStation={(activeDeck === 'A' ? deckA : deckB).currentStation} isOpen={isStationBrowserOpen} onOpenChange={setIsStationBrowserOpen} />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 px-6 py-3 gap-3 relative z-10">
        {/* TOP ROW: Turntables + Visualizer + Crossfader */}
        <div className="shrink-0 flex items-center justify-center gap-10">
          <VinylTurntable isPlaying={deckA.isPlaying} analyserData={deckA.analyserData} deckId="A" currentStation={deckA.currentStation} rotation={rotationA} />
          <div className="flex-1 max-w-[480px] flex flex-col items-stretch justify-center gap-1.5" style={{ height: 190 }}>
            <SpectrumVisualizer deckAData={deckA.analyserData} deckBData={deckB.analyserData} isPlayingA={deckA.isPlaying} isPlayingB={deckB.isPlaying} />
            <div>
              <Crossfader value={crossfade} onChange={setCrossfade} />
            </div>
          </div>
          <VinylTurntable isPlaying={deckB.isPlaying} analyserData={deckB.analyserData} deckId="B" currentStation={deckB.currentStation} rotation={rotationB} />
        </div>

        {/* BOTTOM ROW: Deck A | Center Mixer | Deck B */}
        <div className="flex-1 flex gap-2 min-h-0 relative z-10">
          <DeckPanel deck={deckA} deckId="A" activeVibe={activeVibe} onVibeChange={handleVibeChange} onPlaySample={handlePlaySample} />
          <CenterMixer deckA={deckA} deckB={deckB} />
          <DeckPanel deck={deckB} deckId="B" activeVibe={activeVibe} onVibeChange={handleVibeChange} onPlaySample={handlePlaySample} />
        </div>
      </div>

      {/* Empty state */}
      {!deckA.currentStation && !deckB.currentStation && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
          <button data-testid="load-station-btn" onClick={() => setIsStationBrowserOpen(true)}
            className="px-3 py-1.5 rounded bg-gradient-to-r from-[#00F0FF]/15 to-[#FF003C]/15 border border-white/15 hover:border-white/30 text-[10px] font-['Orbitron'] tracking-wide text-white/60 hover:text-white/80">
            LOAD STATION
          </button>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
