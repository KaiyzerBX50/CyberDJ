import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { motion } from "framer-motion";
import { Disc3, Play, Pause, Zap, Lock, Unlock, RotateCcw, Radio, Flame, Keyboard } from "lucide-react";
import { StationBrowser } from "./components/StationBrowser";
import { useAudioDeck } from "./hooks/useAudioDeck";
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
  const peaksRef = useRef(new Float32Array(80));
  const peakDecayRef = useRef(new Float32Array(80));
  const prevRef = useRef(new Float32Array(80));
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const BARS = 80;
    const peaks = peaksRef.current;
    const peakDecay = peakDecayRef.current;
    const prev = prevRef.current;
    let frame;

    const getColor = (i, v) => {
      const t = i / BARS;
      if (t < 0.25) return { r: 255, g: 0, b: 60 };
      if (t < 0.45) return { r: 255 - (t - 0.25) * 1275, g: (t - 0.25) * 1200, b: 60 + (t - 0.25) * 975 };
      if (t < 0.7) return { r: 0, g: 240, b: 255 };
      return { r: (t - 0.7) * 190, g: 240 + (t - 0.7) * 50, b: 255 - (t - 0.7) * 850 };
    };

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // BG fade with subtle trail
      ctx.fillStyle = 'rgba(4,4,8,0.25)';
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(0,240,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const midY = H * 0.55;
      const barH = midY - 8;
      const reflectH = H - midY - 2;

      if (!isPlayingA && !isPlayingB) {
        // Idle: breathing center line
        const breath = Math.sin(t * 1.5) * 0.3 + 0.5;
        ctx.strokeStyle = `rgba(0,240,255,${breath * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

        // Idle particles
        for (let i = 0; i < 5; i++) {
          const px = (Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5) * W;
          const py = midY + Math.sin(t * 0.8 + i) * 8;
          ctx.fillStyle = `rgba(0,240,255,${0.15 + Math.sin(t + i) * 0.1})`;
          ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        frame = requestAnimationFrame(draw); return;
      }

      // Combine deck data
      const combined = new Float32Array(BARS);
      for (let i = 0; i < BARS; i++) {
        const a = deckAData[Math.floor(i * deckAData.length / BARS)] || 0;
        const b = deckBData[Math.floor(i * deckBData.length / BARS)] || 0;
        const raw = Math.max(a, b) / 255;
        // Smooth
        prev[i] += (raw - prev[i]) * 0.35;
        combined[i] = prev[i];
      }

      const bw = (W / BARS) - 1.2;
      const gap = 1.2;

      // === MAIN BARS ===
      for (let i = 0; i < BARS; i++) {
        const v = combined[i];
        const h = v * barH;
        const x = i * (bw + gap);
        const y = midY - h;
        const { r, g, b } = getColor(i, v);

        // Glow behind bar
        if (v > 0.3) {
          ctx.shadowBlur = 12 + v * 18;
          ctx.shadowColor = `rgba(${r},${g},${b},${v * 0.6})`;
        }

        // Main bar gradient
        const grad = ctx.createLinearGradient(x, midY, x, y);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
        grad.addColorStop(0.3, `rgba(${r},${g},${b},0.6)`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},0.9)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},1)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, bw, h);

        // Hot top cap
        ctx.fillStyle = `rgba(255,255,255,${0.3 + v * 0.5})`;
        ctx.fillRect(x, y - 1.5, bw, 2);

        ctx.shadowBlur = 0;

        // === PEAK HOLD ===
        if (v > peaks[i]) {
          peaks[i] = v;
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += 0.008;
          peaks[i] = Math.max(0, peaks[i] - peakDecay[i] * 0.02);
        }
        const peakY = midY - peaks[i] * barH;
        ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 4 + i) * 0.2})`;
        ctx.fillRect(x, peakY - 2, bw, 2);

        // === REFLECTION ===
        const rh = h * 0.35;
        const rGrad = ctx.createLinearGradient(x, midY + 2, x, midY + 2 + rh);
        rGrad.addColorStop(0, `rgba(${r},${g},${b},0.25)`);
        rGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = rGrad;
        ctx.fillRect(x, midY + 2, bw, rh);
      }

      // === DUAL WAVEFORM OVERLAY ===
      const drawWave = (data, color, off) => {
        if (!data || data.length === 0) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = (i / data.length) * W;
          const y = ((data[i] - 128) / 128) * 18 + 16 + off;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      if (isPlayingA) drawWave(deckAData, 'rgba(0,240,255,0.7)', 0);
      if (isPlayingB) drawWave(deckBData, 'rgba(255,0,60,0.5)', 6);

      // === CENTER DIVIDER LINE ===
      const divGrad = ctx.createLinearGradient(0, 0, W, 0);
      divGrad.addColorStop(0, 'rgba(255,0,60,0.6)');
      divGrad.addColorStop(0.5, 'rgba(0,240,255,0.8)');
      divGrad.addColorStop(1, 'rgba(57,255,20,0.6)');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, midY + 1); ctx.lineTo(W, midY + 1); ctx.stroke();

      // === FLOATING PARTICLES ===
      const energy = combined.reduce((a, b) => a + b, 0) / BARS;
      const pCount = Math.floor(energy * 12);
      for (let i = 0; i < pCount; i++) {
        const px = (Math.sin(t * (0.5 + i * 0.13) + i * 2.1) * 0.5 + 0.5) * W;
        const py = (Math.cos(t * (0.7 + i * 0.09) + i * 1.3) * 0.5 + 0.5) * midY;
        const { r, g, b } = getColor(Math.floor(px / W * BARS), 1);
        const size = 1 + energy * 2;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + energy * 0.4})`;
        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
      }

      // === DB SCALE on right edge ===
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.font = '7px monospace';
      ctx.textAlign = 'right';
      for (let db = 0; db >= -48; db -= 12) {
        const y = midY - ((-db / 48) * barH * -1 + barH);
        ctx.fillText(`${db}dB`, W - 4, y + 3);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W - 30, y); ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [deckAData, deckBData, isPlayingA, isPlayingB]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-[#040408]" style={{ border: '1px solid rgba(0,240,255,0.15)', boxShadow: '0 0 20px rgba(0,240,255,0.05), inset 0 0 30px rgba(0,0,0,0.5)' }} data-testid="spectrum-visualizer">
      <div className="absolute top-2 left-3 flex items-center gap-3 text-[9px] font-mono z-10">
        <span className={`flex items-center gap-1 ${isPlayingA ? 'text-[#00F0FF]' : 'text-white/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isPlayingA ? 'bg-[#00F0FF] animate-pulse' : 'bg-white/15'}`} style={isPlayingA ? { boxShadow: '0 0 6px #00F0FF' } : {}} />DECK A
        </span>
        <span className={`flex items-center gap-1 ${isPlayingB ? 'text-[#FF003C]' : 'text-white/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isPlayingB ? 'bg-[#FF003C] animate-pulse' : 'bg-white/15'}`} style={isPlayingB ? { boxShadow: '0 0 6px #FF003C' } : {}} />DECK B
        </span>
      </div>
      <div className="absolute top-2 right-3 text-[7px] font-mono text-white/20 z-10">SPECTRUM</div>
      <canvas ref={canvasRef} width={800} height={200} className="w-full h-[160px]" />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, #FF003C60, #00F0FF80, #39FF1460)' }} />
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

  const heat = Math.min(100, (levelA + levelB) * 50 + (levelA > 0.3 ? 15 : 0) + (levelB > 0.3 ? 15 : 0));

  return (
    <div className="flex flex-col gap-1.5 px-2 py-2 rounded-lg bg-[#0c0c0c] border border-white/8 w-[180px] shrink-0" data-testid="center-mixer">
      {/* Heat Meter */}
      <div className="flex items-center gap-1.5 px-1">
        <Flame className="w-3 h-3" style={{ color: heat > 60 ? '#FF003C' : heat > 30 ? '#FFD700' : '#39FF14' }} />
        <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div className="h-full rounded-full transition-all duration-300" style={{
            width: `${heat}%`,
            background: heat > 60 ? 'linear-gradient(90deg, #FFD700, #FF003C)' : heat > 30 ? 'linear-gradient(90deg, #39FF14, #FFD700)' : '#39FF14',
            boxShadow: heat > 60 ? '0 0 8px #FF003C80' : 'none',
          }} />
        </div>
        <span className="text-[7px] font-mono" style={{ color: heat > 60 ? '#FF003C' : '#FFD700' }}>{Math.round(heat)}</span>
      </div>

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

  const [tapTimes, setTapTimes] = useState([]);
  const [tappedBpm, setTappedBpm] = useState(null);
  const handleTap = () => {
    const now = Date.now();
    setTapTimes(prev => {
      const recent = [...prev, now].filter(t => now - t < 3000);
      if (recent.length >= 3) {
        const intervals = [];
        for (let i = 1; i < recent.length; i++) intervals.push(recent[i] - recent[i-1]);
        const avg = intervals.reduce((a,b) => a+b, 0) / intervals.length;
        setTappedBpm(Math.round(60000 / avg));
      }
      return recent;
    });
  };

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
      css: `@keyframes bass-pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.15}50%{transform:translate(-50%,-50%) scale(1.6);opacity:0.5}}@keyframes head-nod{0%,100%{transform:scaleY(0.3)}25%{transform:scaleY(1)}50%{transform:scaleY(0.5)}75%{transform:scaleY(0.9)}}@keyframes crackle{0%,100%{opacity:0.05}50%{opacity:0.15}}@keyframes boom-flash{0%,90%,100%{opacity:0}92%{opacity:0.3}}.vibe-808{position:absolute;left:50%;top:55%;border-radius:50%;animation:bass-pulse ease-in-out infinite;pointer-events:none}.vibe-bar{position:absolute;bottom:0;animation:head-nod ease-in-out infinite;transform-origin:bottom;pointer-events:none;border-radius:2px 2px 0 0}.vibe-crackle{position:absolute;border-radius:50%;animation:crackle linear infinite;pointer-events:none}.vibe-flash{position:absolute;inset:0;animation:boom-flash ease-in-out infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0 overflow-hidden">
        {/* 808 bass rings */}
        {[...Array(4)].map((_,i)=>(<div key={'r'+i} className="vibe-808" style={{width:300+i*200,height:300+i*200,border:`${3-i*0.5}px solid ${ac}${['60','40','25','15'][i]}`,boxShadow:`0 0 ${40-i*8}px ${ac}${['50','35','20','10'][i]}, inset 0 0 ${30-i*6}px ${ac}${['30','20','10','05'][i]}`,animationDuration:`${0.8+i*0.15}s`,animationDelay:`${i*0.1}s`}}/>))}
        {/* Head-nod bounce bars */}
        {[...Array(24)].map((_,i)=>(<div key={'b'+i} className="vibe-bar" style={{left:`${8+i*3.6}%`,width:'2.5%',height:`${15+Math.random()*35}%`,background:`linear-gradient(to top, ${ac}60, ${ac}20)`,boxShadow:`0 0 6px ${ac}30`,animationDuration:`${0.5+Math.random()*0.3}s`,animationDelay:`${(i%4)*0.125}s`}}/>))}
        {/* Vinyl crackle dust */}
        {[...Array(30)].map((_,i)=>(<div key={'c'+i} className="vibe-crackle" style={{width:1+Math.random()*2,height:1+Math.random()*2,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,background:ac,animationDuration:`${0.3+Math.random()*0.5}s`,animationDelay:`${Math.random()*2}s`}}/>))}
        {/* Boom flash */}
        <div className="vibe-flash" style={{background:`radial-gradient(ellipse at 50% 60%, ${ac}20, transparent 60%)`,animationDuration:'1.6s'}}/>
      </div>),
    },
    2: {
      css: `@keyframes neon-flicker{0%,18%,22%,25%,53%,57%,100%{opacity:0.8;text-shadow:none}20%,24%,55%{opacity:0.2}}@keyframes graffiti-drip{0%{height:0;opacity:0}20%{opacity:0.7}100%{height:100%;opacity:0.3}}@keyframes boombox-pulse{0%,100%{transform:scale(1);opacity:0.2}50%{transform:scale(1.15);opacity:0.5}}@keyframes spotlight-sweep{0%{transform:translateX(-100%) rotate(-15deg)}100%{transform:translateX(200%) rotate(-15deg)}}.vibe-neon{position:absolute;animation:neon-flicker ease-in-out infinite;pointer-events:none}.vibe-drip{position:absolute;top:0;width:3px;animation:graffiti-drip ease-in infinite;pointer-events:none;border-radius:0 0 3px 3px}.vibe-boom{position:absolute;border-radius:50%;animation:boombox-pulse ease-in-out infinite;pointer-events:none}.vibe-spot{position:absolute;animation:spotlight-sweep linear infinite;pointer-events:none}`,
      render: () => {const neons=['#FF00FF','#00FFFF','#FFFF00','#FF003C','#39FF14'];return(<div className="absolute inset-0 overflow-hidden">
        {/* Neon graffiti streaks */}
        {[...Array(8)].map((_,i)=>(<div key={'n'+i} className="vibe-neon" style={{left:`${5+i*12}%`,top:`${10+Math.random()*30}%`,width:Math.random()*120+40,height:3,background:neons[i%5],boxShadow:`0 0 12px ${neons[i%5]}, 0 0 30px ${neons[i%5]}60`,borderRadius:2,transform:`rotate(${-20+Math.random()*40}deg)`,animationDuration:`${2+Math.random()*3}s`,animationDelay:`${Math.random()*2}s`}}/>))}
        {/* Graffiti drip lines */}
        {[...Array(16)].map((_,i)=>(<div key={'d'+i} className="vibe-drip" style={{left:`${3+i*6}%`,background:`linear-gradient(to bottom, ${neons[i%5]}80, ${neons[i%5]}00)`,animationDuration:`${3+Math.random()*4}s`,animationDelay:`${Math.random()*5}s`}}/>))}
        {/* Boombox bass circles */}
        {[...Array(3)].map((_,i)=>(<div key={'bm'+i} className="vibe-boom" style={{width:120+i*80,height:120+i*80,left:`${20+i*20}%`,top:`${30+i*15}%`,border:`2px solid ${ac}40`,boxShadow:`0 0 ${20+i*10}px ${ac}30, inset 0 0 ${15+i*8}px ${ac}15`,animationDuration:`${1.2+i*0.3}s`,animationDelay:`${i*0.2}s`}}/>))}
        {/* Breakdance spotlight sweep */}
        <div className="vibe-spot" style={{top:'20%',width:'30%',height:'120%',background:`linear-gradient(90deg, transparent, ${ac}15, ${ac}30, ${ac}15, transparent)`,animationDuration:'4s'}}/>
        <div className="vibe-spot" style={{top:'10%',width:'20%',height:'120%',background:`linear-gradient(90deg, transparent, #FFFF0010, #FFFF0020, #FFFF0010, transparent)`,animationDuration:'6s',animationDelay:'2s'}}/>
      </div>);},
    },
    3: {
      css: `@keyframes wave-move{0%{transform:translateX(-100%) skewY(-2deg)}100%{transform:translateX(100%) skewY(2deg)}}.vibe-wave{position:absolute;width:200%;height:40%;animation:wave-move ease-in-out infinite alternate;pointer-events:none;border-radius:50%}`,
      render: () => (<div className="absolute inset-0 overflow-hidden">{[...Array(5)].map((_,i)=>(<div key={i} className="vibe-wave" style={{top:`${15+i*16}%`,background:`linear-gradient(90deg,transparent,${ac}30,${ac}50,${ac}30,transparent)`,animationDuration:`${4+i*1.5}s`,animationDelay:`${i*0.4}s`}}/>))}</div>),
    },
    4: {
      css: `@keyframes disco-sparkle{0%,100%{opacity:0.1;transform:scale(0.5)}50%{opacity:0.8;transform:scale(1.2)}}.vibe-sparkle{position:absolute;border-radius:50%;animation:disco-sparkle ease-in-out infinite;pointer-events:none}`,
      render: () => {const cols=['#FF69B4','#FFD700','#00F0FF','#39FF14','#FF003C','#9B59B6'];return(<div className="absolute inset-0">{[...Array(40)].map((_,i)=>(<div key={i} className="vibe-sparkle" style={{width:4+Math.random()*7,height:4+Math.random()*7,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,background:cols[i%6],boxShadow:`0 0 ${6+Math.random()*10}px ${cols[i%6]}80`,animationDuration:`${1+Math.random()*2}s`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);},
    },
    5: {
      css: `@keyframes laser-sweep{0%{transform:rotate(-60deg) scaleY(0.5);opacity:0.3}25%{opacity:0.8}50%{transform:rotate(60deg) scaleY(1);opacity:0.6}75%{opacity:0.8}100%{transform:rotate(-60deg) scaleY(0.5);opacity:0.3}}@keyframes strobe{0%,94%,96%,98%,100%{opacity:0}95%{opacity:0.15}97%{opacity:0.25}99%{opacity:0.1}}@keyframes floor-pulse{0%,100%{opacity:0.08}50%{opacity:0.25}}@keyframes kick-ring{0%{transform:translate(-50%,-50%) scale(0.3);opacity:0.6}100%{transform:translate(-50%,-50%) scale(2.5);opacity:0}}.vibe-laser{position:absolute;transform-origin:50% 100%;animation:laser-sweep ease-in-out infinite;pointer-events:none}.vibe-strobe{position:absolute;inset:0;animation:strobe linear infinite;pointer-events:none}.vibe-floor{position:absolute;animation:floor-pulse ease-in-out infinite;pointer-events:none}.vibe-kick{position:absolute;left:50%;top:50%;border-radius:50%;animation:kick-ring ease-out infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0 overflow-hidden">
        {/* Laser beams from ceiling */}
        {[...Array(6)].map((_,i)=>(<div key={'l'+i} className="vibe-laser" style={{left:`${10+i*15}%`,top:0,width:2,height:'70%',background:`linear-gradient(to bottom, ${ac}90, ${ac}30, transparent)`,boxShadow:`0 0 8px ${ac}60, 0 0 20px ${ac}30`,animationDuration:`${2+i*0.5}s`,animationDelay:`${i*0.35}s`}}/>))}
        {/* 4-on-the-floor kick rings */}
        {[...Array(5)].map((_,i)=>(<div key={'k'+i} className="vibe-kick" style={{width:200,height:200,border:`2px solid ${ac}${['60','45','30','20','10'][i]}`,animationDuration:'1s',animationDelay:`${i*0.2}s`}}/>))}
        {/* Warehouse floor grid */}
        {[...Array(10)].map((_,i)=>(<div key={'fg'+i} className="vibe-floor" style={{left:0,right:0,top:`${i*10}%`,height:1,background:`linear-gradient(90deg, transparent 5%, ${ac}20 20%, ${ac}35 50%, ${ac}20 80%, transparent 95%)`,animationDuration:`${0.5}s`,animationDelay:`${i*0.05}s`}}/>))}
        {[...Array(10)].map((_,i)=>(<div key={'fv'+i} className="vibe-floor" style={{top:0,bottom:0,left:`${i*10}%`,width:1,background:`linear-gradient(to bottom, transparent 5%, ${ac}15 20%, ${ac}25 50%, ${ac}15 80%, transparent 95%)`,animationDuration:'0.5s',animationDelay:`${i*0.05}s`}}/>))}
        {/* Strobe flash */}
        <div className="vibe-strobe" style={{background:'white',animationDuration:'4s'}}/>
      </div>),
    },
    6: {
      css: `@keyframes scan-down{0%{top:-10%}100%{top:110%}}.vibe-scan{position:absolute;left:0;right:0;height:2px;animation:scan-down linear infinite;pointer-events:none}`,
      render: () => (<div className="absolute inset-0 overflow-hidden">{[...Array(8)].map((_,i)=>(<div key={i} className="vibe-scan" style={{background:`linear-gradient(90deg,transparent 5%,${ac}70 30%,${ac}BB 50%,${ac}70 70%,transparent 95%)`,boxShadow:`0 0 14px ${ac}60`,animationDuration:`${1.5+i*0.4}s`,animationDelay:`${i*0.3}s`}}/>))}</div>),
    },
    7: {
      css: `@keyframes diag-flow{0%{background-position:0% 0%}100%{background-position:200% 200%}}.vibe-diag{position:absolute;inset:0;animation:diag-flow linear infinite;pointer-events:none}`,
      render: () => (<div className="vibe-diag" style={{backgroundImage:`repeating-linear-gradient(45deg,transparent,transparent 60px,${ac}30 60px,${ac}50 100px,transparent 100px)`,backgroundSize:'200% 200%',animationDuration:'6s'}}/>),
    },
    8: {
      css: `@keyframes djembe-ring{0%{transform:translate(-50%,-50%) scale(0.2);opacity:0.7;border-width:3px}100%{transform:translate(-50%,-50%) scale(3);opacity:0;border-width:1px}}@keyframes sun-breathe{0%,100%{transform:translate(-50%,-50%) scale(0.9);opacity:0.15}50%{transform:translate(-50%,-50%) scale(1.1);opacity:0.35}}@keyframes tribal-bar{0%,100%{transform:scaleY(0.4);opacity:0.3}33%{transform:scaleY(1);opacity:0.7}66%{transform:scaleY(0.6);opacity:0.5}}@keyframes heat-shimmer{0%{transform:translateY(0) scaleX(1)}50%{transform:translateY(-8px) scaleX(1.02)}100%{transform:translateY(0) scaleX(1)}}.vibe-djembe{position:absolute;left:50%;top:50%;border-radius:50%;border-style:solid;animation:djembe-ring ease-out infinite;pointer-events:none}.vibe-sun{position:absolute;left:50%;top:35%;border-radius:50%;animation:sun-breathe ease-in-out infinite;pointer-events:none}.vibe-tribal{position:absolute;bottom:0;animation:tribal-bar ease-in-out infinite;transform-origin:bottom;pointer-events:none}.vibe-shimmer{position:absolute;left:0;right:0;animation:heat-shimmer ease-in-out infinite;pointer-events:none}`,
      render: () => {const warm=['#E67E22','#F39C12','#D35400','#E74C3C','#27AE60'];return(<div className="absolute inset-0 overflow-hidden">
        {/* Sun glow */}
        <div className="vibe-sun" style={{width:400,height:400,background:`radial-gradient(circle, ${ac}40, ${ac}15, transparent 70%)`,boxShadow:`0 0 80px ${ac}25`,animationDuration:'3s'}}/>
        {/* Djembe pulse rings */}
        {[...Array(6)].map((_,i)=>(<div key={'dj'+i} className="vibe-djembe" style={{width:180,height:180,borderColor:warm[i%5]+'60',animationDuration:`${1.5}s`,animationDelay:`${i*0.25}s`}}/>))}
        {/* Tribal rhythm bars */}
        {[...Array(20)].map((_,i)=>(<div key={'tb'+i} className="vibe-tribal" style={{left:`${3+i*4.8}%`,width:'3%',height:`${20+Math.random()*40}%`,background:`linear-gradient(to top, ${warm[i%5]}60, ${warm[i%5]}15)`,borderRadius:'2px 2px 0 0',animationDuration:`${0.6+Math.random()*0.4}s`,animationDelay:`${(i%3)*0.2}s`}}/>))}
        {/* Heat shimmer waves */}
        {[...Array(4)].map((_,i)=>(<div key={'sh'+i} className="vibe-shimmer" style={{top:`${20+i*18}%`,height:2,background:`linear-gradient(90deg, transparent, ${ac}25, ${ac}40, ${ac}25, transparent)`,animationDuration:`${2+i*0.5}s`,animationDelay:`${i*0.3}s`}}/>))}
      </div>);},
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

  const [showShortcuts, setShowShortcuts] = useState(false);

  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');

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
      if (e.key === '?') setShowShortcuts(s => !s);
      if (e.key === 'a') setActiveDeck('A');
      if (e.key === 'b') setActiveDeck('B');
      if (e.key === 's') setIsStationBrowserOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeDeck, deckA, deckB]);

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
          <button onClick={() => setShowShortcuts(true)} className="p-1.5 rounded bg-white/5 border border-white/8 text-white/30 hover:text-white/60" title="Keyboard shortcuts">
            <Keyboard className="w-3.5 h-3.5" />
          </button>
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

      {/* Shortcuts Overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#0c0c0c] border border-white/15 rounded-xl p-6 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-['Orbitron'] text-white/80 mb-4">KEYBOARD SHORTCUTS</h3>
            <div className="space-y-2 text-[11px] font-mono">
              {[
                ['Space', 'Play / Pause active deck'],
                ['A / B', 'Switch active deck'],
                ['S', 'Open station browser'],
                ['?', 'Toggle this overlay'],
              ].map(([k, d]) => (
                <div key={k} className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white/70 min-w-[36px] text-center">{k}</kbd>
                  <span className="text-white/50">{d}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-1.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60">CLOSE</button>
          </div>
        </div>
      )}

            <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
