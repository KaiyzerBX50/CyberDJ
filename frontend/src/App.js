import { useState, useEffect, useRef, useCallback } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Play, Pause, Zap, Lock, RotateCcw, Mic, Radio } from "lucide-react";
import { StationBrowser } from "./components/StationBrowser";
import { useAudioDeck } from "./hooks/useAudioDeck";
import { useRecorder } from "./hooks/useRecorder";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// ============== VINYL TURNTABLE WITH TONEARM ==============
const VinylTurntable = ({ isPlaying, analyserData, deckId, currentStation, rotation }) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const bassLevel = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;
  const tonearmAngle = isPlaying ? -8 : -35;

  return (
    <div className="relative flex flex-col items-center">
      {/* Deck label */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ background: isPlaying ? '#39FF14' : '#333' }} />
        <span className="text-xs font-['Orbitron']" style={{ color: deckColor }}>DECK {deckId}</span>
      </div>

      <div className="relative" style={{ width: 220, height: 220 }}>
        {/* Turntable base/platter */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
          boxShadow: `inset 0 0 40px rgba(0,0,0,0.8), 0 0 ${isPlaying ? 25 : 10}px ${deckColor}30`,
          border: `3px solid ${deckColor}30`,
        }} />

        {/* Outer ring glow */}
        <div className="absolute inset-2 rounded-full" style={{
          background: `conic-gradient(${deckColor}20, ${deckColor}50, ${deckColor}20, ${deckColor}50, ${deckColor}20)`,
          opacity: isPlaying ? 0.6 : 0.2,
          filter: 'blur(2px)',
        }} />

        {/* Vinyl record */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{ rotate: rotation }}
        >
          {/* Vinyl grooves */}
          <div className="absolute inset-0 rounded-full" style={{
            background: `conic-gradient(from ${rotation}deg, #111, #1a1a1a, #111, #181818, #111, #1a1a1a, #111, #181818)`,
          }} />
          
          {/* Groove rings */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/5" style={{ inset: `${5 + i * 6}%` }} />
          ))}

          {/* Center label */}
          <div className="absolute rounded-full flex items-center justify-center" style={{
            inset: '30%',
            background: deckId === 'A'
              ? 'linear-gradient(135deg, #00F0FF 0%, #0066FF 100%)'
              : 'linear-gradient(135deg, #FF003C 0%, #FF6600 100%)',
            boxShadow: `0 0 20px ${deckColor}50`,
          }}>
            <div className="text-center">
              <div className="text-[8px] font-bold text-white uppercase tracking-wider">
                {currentStation?.name?.slice(0, 8) || 'DECK ' + deckId}
              </div>
              <div className="text-[6px] text-white/70">{isPlaying ? 'ON AIR' : 'READY'}</div>
            </div>
            <div className="absolute w-3 h-3 rounded-full bg-black" />
          </div>

          {/* Position marker */}
          <div className="absolute top-2 left-1/2 w-1.5 h-4 -translate-x-1/2 rounded-full" style={{
            background: deckColor,
            boxShadow: `0 0 8px ${deckColor}`,
          }} />
        </motion.div>

        {/* Tonearm */}
        <motion.div
          className="absolute -right-4 top-[15%] origin-top-right"
          animate={{ rotate: tonearmAngle }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* Tonearm base */}
          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full" style={{
            background: 'linear-gradient(145deg, #333, #1a1a1a)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }} />
          
          {/* Arm */}
          <div className="w-[120px] h-1.5 rounded-full" style={{
            background: 'linear-gradient(to bottom, #555, #333)',
          }} />
          
          {/* Headshell */}
          <div className="absolute left-0 top-0 w-6 h-3 -translate-x-5" style={{
            background: 'linear-gradient(to bottom, #444, #222)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 70%, 0 30%)',
          }}>
            <div className={`absolute bottom-0.5 left-1 w-1 h-1 rounded-full ${isPlaying ? 'bg-[#39FF14]' : 'bg-[#333]'}`}
              style={{ boxShadow: isPlaying ? '0 0 4px #39FF14' : 'none' }} />
          </div>
        </motion.div>

        {/* Status LEDs */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{
              background: isPlaying && analyserData[i * 20] > 100 ? deckColor : '#222',
              boxShadow: isPlaying && analyserData[i * 20] > 100 ? `0 0 6px ${deckColor}` : 'none',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== SPECTRUM VISUALIZER ==============
const SpectrumVisualizer = ({ deckAData, deckBData, isPlayingA, isPlayingB }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    let frame;
    const draw = () => {
      ctx.fillStyle = 'rgba(8, 8, 8, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const isPlaying = isPlayingA || isPlayingB;
      if (!isPlaying) {
        ctx.strokeStyle = '#00F0FF30';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        frame = requestAnimationFrame(draw);
        return;
      }

      // Combine both decks
      const combined = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        const a = deckAData[i * 2] || 0;
        const b = deckBData[i * 2] || 0;
        combined[i] = Math.max(a, b);
      }

      const barW = (width / 64) - 2;
      for (let i = 0; i < 64; i++) {
        const val = combined[i] / 255;
        const barH = val * height * 0.85;
        const x = i * (barW + 2);
        const y = height - barH;

        // Color: bass=magenta, mid=cyan, high=green
        let color;
        if (i < 20) color = '#FF003C';
        else if (i < 42) color = '#00F0FF';
        else color = '#39FF14';

        const gradient = ctx.createLinearGradient(x, height, x, y);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(0.6, color + 'CC');
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barW, barH);

        // Peak
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 3, barW, 2);
      }

      // Waveform overlay
      ctx.strokeStyle = '#00F0FF80';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveData = isPlayingA ? deckAData : deckBData;
      for (let i = 0; i < waveData.length; i++) {
        const x = (i / waveData.length) * width;
        const y = ((waveData[i] - 128) / 128) * 30 + 25;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [deckAData, deckBData, isPlayingA, isPlayingB]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#080808]">
      <div className="absolute top-2 left-3 flex items-center gap-4 text-[10px] font-mono z-10">
        <span className={`flex items-center gap-1 ${isPlayingA ? 'text-[#00F0FF]' : 'text-white/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isPlayingA ? 'bg-[#00F0FF] animate-pulse' : 'bg-white/20'}`} />
          DECK A
        </span>
        <span className={`flex items-center gap-1 ${isPlayingB ? 'text-[#FF003C]' : 'text-white/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isPlayingB ? 'bg-[#FF003C] animate-pulse' : 'bg-white/20'}`} />
          DECK B
        </span>
      </div>
      <div className="absolute bottom-2 left-3 flex gap-3 text-[9px] font-mono text-white/50">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF003C]" />BASS</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00F0FF]" />MID</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#39FF14]" />HIGH</span>
      </div>
      <canvas ref={canvasRef} width={700} height={140} className="w-full h-[120px]" />
    </div>
  );
};

// ============== PIONEER-STYLE DETAILED KNOB ==============
const PioneerKnob = ({ label, value = 50, color = '#888', size = 50, onChange }) => {
  const rotation = ((value / 100) * 270) - 135;
  const notchCount = 24;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-mono text-white/60 uppercase tracking-wider">{label}</span>
      
      <div className="relative" style={{ width: size, height: size }}>
        {/* Notches around the knob */}
        {[...Array(notchCount)].map((_, i) => {
          const angle = (i / notchCount) * 270 - 135;
          const isActive = angle <= rotation;
          return (
            <div
              key={i}
              className="absolute w-0.5 h-1.5 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                background: isActive ? color : '#333',
                transform: `rotate(${angle}deg) translateY(-${size / 2 + 3}px)`,
                transformOrigin: 'center',
                boxShadow: isActive ? `0 0 3px ${color}` : 'none',
              }}
            />
          );
        })}

        {/* Knob body */}
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #4a4a4a, #2a2a2a)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute w-0.5 h-3 rounded-full top-1.5 left-1/2"
            style={{
              background: color,
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: `50% ${(size - 8) / 2}px`,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
          
          {/* Center cap */}
          <div className="absolute inset-[30%] rounded-full" style={{
            background: 'radial-gradient(#3a3a3a, #222)',
          }} />
        </div>
      </div>
      
      {/* Value display */}
      <span className="text-[10px] font-mono" style={{ color }}>{value}%</span>
    </div>
  );
};

// ============== CROSSFADER ==============
const Crossfader = ({ value, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-black/40 border border-white/10">
      <div className="flex justify-between w-full text-[9px] font-mono">
        <span className="text-[#00F0FF]">DECK A</span>
        <span className="text-white/40">CROSSFADE</span>
        <span className="text-[#FF003C]">DECK B</span>
      </div>
      
      <div className="relative w-full h-6 rounded bg-black/60 border border-white/10">
        <div className="absolute inset-y-1 left-2 right-2 rounded" style={{
          background: 'linear-gradient(to right, #00F0FF30, transparent 30%, transparent 70%, #FF003C30)',
        }} />
        <div className="absolute top-1/2 left-1/2 w-px h-3 -translate-y-1/2 bg-white/30" />
        
        <div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-5 rounded cursor-grab"
          style={{
            left: `calc(${(value + 1) / 2 * 100}% - 20px)`,
            background: 'linear-gradient(to bottom, #555, #333)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 space-y-0.5">
            <div className="h-px bg-white/30" />
            <div className="h-px bg-white/30" />
            <div className="h-px bg-white/30" />
          </div>
        </div>
      </div>

      {/* Level indicators */}
      <div className="flex justify-between w-full">
        <div className="flex gap-0.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-3 rounded-sm" style={{
              background: value <= 0 && i < Math.round((1 + value) * 3 + 3) ? '#00F0FF' : '#222',
            }} />
          ))}
        </div>
        <div className="flex gap-0.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-3 rounded-sm" style={{
              background: value >= 0 && i < Math.round((1 - value) * 3 + 3) ? '#FF003C' : '#222',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== DECK PANEL ==============
const DeckPanel = ({ deck, deckId }) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const [loopActive, setLoopActive] = useState(false);
  const [activePads, setActivePads] = useState([]);
  
  const bpm = deck.isPlaying ? Math.floor(85 + deck.analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 32) : 128;
  const level = deck.isPlaying ? deck.analyserData.reduce((a, b) => a + b, 0) / deck.analyserData.length / 255 : 0;

  return (
    <div className={`rounded-xl p-3 border transition-all`} style={{
      background: 'linear-gradient(180deg, #151515, #0a0a0a)',
      borderColor: deckColor + '40',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${deck.isPlaying ? 'animate-pulse' : ''}`} style={{ background: deck.isPlaying ? '#39FF14' : '#333' }} />
          <span className="text-xs font-['Orbitron'] font-bold" style={{ color: deckColor }}>DECK {deckId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/50">
            {deck.currentStation ? '0:00' : ''}
          </span>
          <div className="px-2 py-0.5 rounded bg-black/50 border border-white/10">
            <span className="text-xl font-['Orbitron'] font-bold" style={{ color: deckColor }}>{bpm}</span>
            <span className="text-[8px] text-white/40 ml-1">BPM</span>
          </div>
        </div>
      </div>

      {/* Track name */}
      <div className="text-[11px] font-mono text-white/60 mb-2 truncate">
        {deck.currentStation?.name || 'NO SIGNAL'}
      </div>

      {/* Waveform */}
      <div className="h-12 rounded bg-black/40 border border-white/5 mb-3 relative overflow-hidden">
        {deck.currentStation && (
          <>
            <div className="absolute inset-0 flex items-center justify-center gap-px px-1">
              {deck.waveformData.slice(0, 80).map((v, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{
                  height: `${Math.max(10, Math.abs(v - 128) / 128 * 100)}%`,
                  background: deckColor,
                  opacity: deck.isPlaying ? 0.7 : 0.3,
                }} />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/80" />
          </>
        )}
      </div>

      {/* Transport */}
      <div className="flex items-center justify-between mb-3">
        <button className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#FF6600]/30 text-[#FF6600] border border-[#FF6600]/50">CUE</button>
        
        <button
          onClick={deck.togglePlayPause}
          disabled={!deck.currentStation}
          className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-40"
          style={{
            background: deck.isPlaying ? '#FF003C' : '#39FF14',
            boxShadow: `0 0 20px ${deck.isPlaying ? '#FF003C50' : '#39FF1450'}`,
          }}
        >
          {deck.isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
        </button>
        
        <button className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 flex items-center gap-1">
          <Zap className="w-3 h-3" />SYNC
        </button>
      </div>

      {/* Loop */}
      <div className="flex items-center gap-1 mb-3 p-1.5 rounded bg-black/30">
        <span className="text-[8px] text-white/40 mr-1">LOOP</span>
        <button onClick={() => setLoopActive(!loopActive)} className={`p-1 rounded ${loopActive ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/50'}`}>
          <RotateCcw className="w-3 h-3" />
        </button>
        {[1, 2, 4, 8, 16, 32].map(n => (
          <button key={n} className="flex-1 py-1 text-[8px] font-mono rounded bg-white/10 text-white/50 hover:bg-white/20">{n}</button>
        ))}
      </div>

      {/* Pads - SMALLER */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[1,2,3,4,5,6,7,8].map(n => (
          <button
            key={n}
            onClick={() => setActivePads(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n])}
            className="py-2 rounded text-[10px] font-bold transition-all"
            style={{
              background: activePads.includes(n) ? '#444' : '#222',
              border: '1px solid #333',
              color: activePads.includes(n) ? '#fff' : '#666',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Pitch slider */}
      <div className="flex items-center gap-2 mb-3 px-2">
        <span className="text-[8px] text-white/40">PITCH</span>
        <Lock className="w-3 h-3 text-white/30" />
        <div className="flex-1 h-2 bg-black/50 rounded-full relative">
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/80 left-1/2 -translate-x-1/2" style={{ background: deckColor }} />
        </div>
        <span className="text-[10px] font-mono" style={{ color: deckColor }}>0.0%</span>
      </div>

      {/* EQ - PIONEER STYLE KNOBS */}
      <div className="flex justify-around mb-3 py-2 px-1 rounded bg-black/30">
        <PioneerKnob label="HIGH" value={50} color="#39FF14" size={42} />
        <PioneerKnob label="MID" value={50} color="#FFD700" size={42} />
        <PioneerKnob label="LOW" value={50} color="#FF003C" size={42} />
      </div>

      {/* VU + Gain */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex gap-1">
          {/* L VU */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex flex-col-reverse gap-px">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-3 h-1.5 rounded-sm" style={{
                  background: level > i / 10 ? (i < 6 ? '#39FF14' : i < 8 ? '#FFD700' : '#FF003C') : '#1a1a1a',
                }} />
              ))}
            </div>
            <span className="text-[7px] text-white/30">L</span>
          </div>
          {/* R VU */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex flex-col-reverse gap-px">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-3 h-1.5 rounded-sm" style={{
                  background: level > i / 10 ? (i < 6 ? '#39FF14' : i < 8 ? '#FFD700' : '#FF003C') : '#1a1a1a',
                }} />
              ))}
            </div>
            <span className="text-[7px] text-white/30">R</span>
          </div>
        </div>
        
        <PioneerKnob label="GAIN" value={50} color="#FF6600" size={42} />
        
        {/* Volume fader */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[7px] text-white/30">VOL</span>
          <div className="w-4 h-16 bg-black/50 rounded relative border border-white/10">
            <div className="absolute bottom-0 left-0 right-0 rounded-b" style={{ height: `${deck.volume * 100}%`, background: `${deckColor}40` }} />
            <div className="absolute left-1/2 -translate-x-1/2 w-6 h-2.5 bg-gray-400 rounded" style={{ bottom: `${deck.volume * 80}%` }} />
          </div>
        </div>
      </div>

      {/* FX Rack */}
      <div className="p-2 rounded bg-black/30">
        <span className="text-[8px] text-white/40 block mb-2">FX RACK</span>
        <div className="flex justify-around">
          <PioneerKnob label="ECHO" value={0} color="#FFD700" size={32} />
          <PioneerKnob label="REVERB" value={0} color="#FF6600" size={32} />
          <PioneerKnob label="FILTER" value={50} color="#9900FF" size={32} />
          <PioneerKnob label="DRY/WET" value={50} color="#39FF14" size={32} />
        </div>
      </div>
    </div>
  );
};

// ============== MAIN APP ==============
function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState('A');
  const [crossfade, setCrossfade] = useState(0);
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);

  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');
  const recorder = useRecorder();

  // Rotation animation
  useEffect(() => {
    let frame;
    let last = performance.now();
    const animate = (t) => {
      const d = (t - last) / 1000;
      last = t;
      if (deckA.isPlaying) setRotationA(r => (r + 180 * d) % 360);
      if (deckB.isPlaying) setRotationB(r => (r + 180 * d) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [deckA.isPlaying, deckB.isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); (activeDeck === 'A' ? deckA : deckB).togglePlayPause(); }
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
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-black border-b border-white/10">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-[#00F0FF]" />
          <Disc3 className="w-5 h-5 text-[#FF003C] -ml-3" />
          <span className="font-['Orbitron'] text-sm tracking-wider">CYBERDECK</span>
        </div>
        
        {(deckA.currentStation || deckB.currentStation) && (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#FF003C]/20 border border-[#FF003C]/40">
            <Radio className="w-3 h-3 text-[#39FF14] animate-pulse" />
            <span className="text-[10px] text-white">
              {deckA.currentStation?.name || deckB.currentStation?.name}
            </span>
          </div>
        )}
        
        <StationBrowser
          onSelectStation={handleStation}
          currentStation={(activeDeck === 'A' ? deckA : deckB).currentStation}
          isOpen={isStationBrowserOpen}
          onOpenChange={setIsStationBrowserOpen}
        />
      </header>

      {/* Turntables + Visualizer */}
      <div className="p-4 bg-gradient-to-b from-[#0a0a0a] to-[#080808]">
        <div className="max-w-5xl mx-auto">
          {/* Turntables row */}
          <div className="flex justify-between items-center mb-4">
            <VinylTurntable
              isPlaying={deckA.isPlaying}
              analyserData={deckA.analyserData}
              deckId="A"
              currentStation={deckA.currentStation}
              rotation={rotationA}
            />
            
            {/* Visualizer */}
            <div className="flex-1 mx-6">
              <SpectrumVisualizer
                deckAData={deckA.analyserData}
                deckBData={deckB.analyserData}
                isPlayingA={deckA.isPlaying}
                isPlayingB={deckB.isPlaying}
              />
            </div>
            
            <VinylTurntable
              isPlaying={deckB.isPlaying}
              analyserData={deckB.analyserData}
              deckId="B"
              currentStation={deckB.currentStation}
              rotation={rotationB}
            />
          </div>

          {/* Crossfader */}
          <Crossfader value={crossfade} onChange={setCrossfade} />

          {/* Recording */}
          <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-[#FF003C]" />
              <span className="text-[10px] font-mono text-white/50">RECORD MIX</span>
              {recorder.isRecording && (
                <span className="text-[10px] font-mono text-[#FF003C] animate-pulse">
                  {recorder.formatDuration(recorder.recordingDuration)}
                </span>
              )}
            </div>
            <button
              onClick={() => recorder.isRecording ? recorder.stopRecording() : recorder.startRecording()}
              className={`w-full py-2 rounded text-[11px] font-bold ${
                recorder.isRecording
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FF003C]/30 text-[#FF003C] border border-[#FF003C]/50'
              }`}
            >
              {recorder.isRecording ? '■ STOP RECORDING' : '● START RECORDING'}
            </button>
          </div>
        </div>
      </div>

      {/* Deck Panels */}
      <div className="px-4 pb-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">
          <DeckPanel deck={deckA} deckId="A" />
          <DeckPanel deck={deckB} deckId="B" />
        </div>
      </div>

      {/* Empty state */}
      {!deckA.currentStation && !deckB.currentStation && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsStationBrowserOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00F0FF]/20 to-[#FF003C]/20 border border-white/20 hover:border-white/40"
          >
            <span className="text-sm">LOAD A STATION TO BEGIN</span>
          </button>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
