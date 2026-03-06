import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { motion } from "framer-motion";
import { Disc3, Play, Pause, Zap, Lock, Unlock, RotateCcw, Mic, Radio } from "lucide-react";
import { StationBrowser } from "./components/StationBrowser";
import { useAudioDeck } from "./hooks/useAudioDeck";
import { useRecorder } from "./hooks/useRecorder";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

/* ======= VINYL TURNTABLE ======= */
const VinylTurntable = ({ isPlaying, analyserData, deckId, currentStation, rotation }) => {
  const c = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const arm = isPlaying ? -8 : -35;
  return (
    <div className="relative" data-testid={`turntable-${deckId.toLowerCase()}`}>
      <div className="relative" style={{ width: 190, height: 190 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)', boxShadow: `inset 0 0 30px rgba(0,0,0,0.8), 0 0 ${isPlaying ? 22 : 8}px ${c}30`, border: `2px solid ${c}25` }} />
        <div className="absolute inset-2 rounded-full" style={{ background: `conic-gradient(${c}15, ${c}40, ${c}15, ${c}40, ${c}15)`, opacity: isPlaying ? 0.5 : 0.15, filter: 'blur(2px)' }} />
        <motion.div className="absolute inset-3 rounded-full" style={{ rotate: rotation }}>
          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from ${rotation}deg, #111, #1a1a1a, #111, #181818, #111, #1a1a1a, #111, #181818)` }} />
          {[...Array(10)].map((_, i) => <div key={i} className="absolute rounded-full border border-white/5" style={{ inset: `${6 + i * 6}%` }} />)}
          <div className="absolute rounded-full flex items-center justify-center" style={{ inset: '30%', background: deckId === 'A' ? 'linear-gradient(135deg, #00F0FF, #0066FF)' : 'linear-gradient(135deg, #FF003C, #FF6600)', boxShadow: `0 0 15px ${c}50` }}>
            <div className="text-center">
              <div className="text-[7px] font-bold text-white uppercase tracking-wider">{currentStation?.name?.slice(0, 8) || 'DECK ' + deckId}</div>
              <div className="text-[5px] text-white/70">{isPlaying ? 'ON AIR' : 'READY'}</div>
            </div>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-black" />
          </div>
          <div className="absolute top-1.5 left-1/2 w-1 h-3 -translate-x-1/2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
        </motion.div>
        {/* Tonearm — contained inside the turntable box */}
        <motion.div className="absolute -right-1 top-[16%] origin-top-right" animate={{ rotate: arm }} transition={{ type: 'spring', stiffness: 80, damping: 15 }}>
          <div className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full" style={{ background: 'linear-gradient(145deg, #333, #1a1a1a)', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }} />
          <div className="w-[90px] h-1 rounded-full" style={{ background: 'linear-gradient(to bottom, #555, #333)' }} />
          <div className="absolute left-0 top-0 w-4 h-2 -translate-x-3" style={{ background: 'linear-gradient(to bottom, #444, #222)', clipPath: 'polygon(100% 0, 100% 100%, 0 70%, 0 30%)' }}>
            <div className={`absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full ${isPlaying ? 'bg-[#39FF14]' : 'bg-[#333]'}`} style={{ boxShadow: isPlaying ? '0 0 4px #39FF14' : 'none' }} />
          </div>
        </motion.div>
        {/* LED dots inside the turntable at the bottom */}
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
const Knob = ({ label, value = 50, color = '#888', size = 36 }) => {
  const rot = ((value / 100) * 270) - 135;
  return (
    <div className="flex flex-col items-center">
      <span className="text-[7px] font-mono text-white/45 uppercase tracking-wider">{label}</span>
      <div className="relative" style={{ width: size, height: size }}>
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
const Crossfader = ({ value }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/8" data-testid="crossfader">
    <span className="text-[8px] font-mono text-[#00F0FF] font-bold">A</span>
    <div className="relative flex-1 h-5 rounded bg-black/60 border border-white/10">
      <div className="absolute inset-y-0.5 left-1 right-1 rounded" style={{ background: 'linear-gradient(to right, #00F0FF25, transparent 30%, transparent 70%, #FF003C25)' }} />
      <div className="absolute top-1/2 left-1/2 w-px h-3 -translate-y-1/2 bg-white/25" />
      <div className="absolute top-1/2 -translate-y-1/2 w-8 h-4 rounded cursor-grab" style={{ left: `calc(${(value + 1) / 2 * 100}% - 16px)`, background: 'linear-gradient(to bottom, #555, #333)', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 space-y-px"><div className="h-px bg-white/30" /><div className="h-px bg-white/30" /></div>
      </div>
    </div>
    <span className="text-[8px] font-mono text-[#FF003C] font-bold">B</span>
  </div>
);

/* ======= CENTER MIXER STRIP ======= */
const CenterMixer = ({ deckA, deckB }) => {
  const levelA = deckA.isPlaying ? deckA.analyserData.reduce((a, b) => a + b, 0) / deckA.analyserData.length / 255 : 0;
  const levelB = deckB.isPlaying ? deckB.analyserData.reduce((a, b) => a + b, 0) / deckB.analyserData.length / 255 : 0;
  const masterLevel = Math.max(levelA, levelB);

  return (
    <div className="flex flex-col gap-1 px-1 py-1.5 rounded-lg bg-[#0c0c0c] border border-white/8 w-[130px] shrink-0" data-testid="center-mixer">
      {/* Master section */}
      <div className="text-center">
        <span className="text-[6px] font-mono text-white/30 uppercase tracking-widest">MASTER</span>
        <div className="flex justify-center gap-0.5 mt-0.5">
          {['L', 'R'].map(ch => (
            <div key={ch} className="flex flex-col items-center">
              <div className="flex flex-col-reverse gap-px">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 h-1 rounded-sm transition-all" style={{
                    background: masterLevel > i / 8 ? (i < 5 ? '#39FF14' : i < 7 ? '#FFD700' : '#FF003C') : '#151515',
                  }} />
                ))}
              </div>
              <span className="text-[5px] text-white/20">{ch}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-around">
        <Knob label="MSTR" value={75} color="#FF003C" size={22} />
        <Knob label="BOOTH" value={50} color="#FFD700" size={22} />
      </div>

      <div className="h-px bg-white/8" />

      {/* Channel strips side by side */}
      <div className="flex gap-1">
        {/* CH A */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[6px] font-['Orbitron'] text-[#00F0FF]">CH 1</span>
          <Knob label="TRIM" value={50} color="#00F0FF" size={20} />
          <Knob label="HI" value={50} color="#39FF14" size={20} />
          <Knob label="MID" value={50} color="#FFD700" size={20} />
          <Knob label="LOW" value={50} color="#FF003C" size={20} />
          <div className="flex gap-px">
            {['L', 'R'].map(ch => (
              <div key={ch} className="flex flex-col-reverse gap-px">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-sm" style={{
                    background: levelA > i / 6 ? (i < 4 ? '#39FF14' : i < 5 ? '#FFD700' : '#FF003C') : '#151515',
                  }} />
                ))}
              </div>
            ))}
          </div>
          <div className="w-2.5 h-10 bg-black/60 rounded relative border border-white/8">
            <div className="absolute bottom-0 left-0 right-0 rounded-b" style={{ height: `${deckA.volume * 100}%`, background: '#00F0FF25' }} />
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-1.5 bg-gray-400 rounded" style={{ bottom: `${deckA.volume * 85}%` }} />
          </div>
        </div>

        {/* CH B */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[6px] font-['Orbitron'] text-[#FF003C]">CH 2</span>
          <Knob label="TRIM" value={50} color="#FF003C" size={20} />
          <Knob label="HI" value={50} color="#39FF14" size={20} />
          <Knob label="MID" value={50} color="#FFD700" size={20} />
          <Knob label="LOW" value={50} color="#FF003C" size={20} />
          <div className="flex gap-px">
            {['L', 'R'].map(ch => (
              <div key={ch} className="flex flex-col-reverse gap-px">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-sm" style={{
                    background: levelB > i / 6 ? (i < 4 ? '#39FF14' : i < 5 ? '#FFD700' : '#FF003C') : '#151515',
                  }} />
                ))}
              </div>
            ))}
          </div>
          <div className="w-2.5 h-10 bg-black/60 rounded relative border border-white/8">
            <div className="absolute bottom-0 left-0 right-0 rounded-b" style={{ height: `${deckB.volume * 100}%`, background: '#FF003C25' }} />
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-1.5 bg-gray-400 rounded" style={{ bottom: `${deckB.volume * 85}%` }} />
          </div>
        </div>
      </div>

      {/* Headphones */}
      <div className="flex justify-around">
        <Knob label="CUE" value={50} color="#00F0FF" size={20} />
        <Knob label="LVL" value={60} color="#FFD700" size={20} />
      </div>
    </div>
  );
};

/* ======= DECK PANEL ======= */
const DeckPanel = ({ deck, deckId }) => {
  const c = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const [loopActive, setLoopActive] = useState(false);
  const [activePads, setActivePads] = useState([]);
  const [padMode, setPadMode] = useState('HOT CUE');
  const [keyLock, setKeyLock] = useState(false);
  const bpm = deck.isPlaying ? Math.floor(85 + deck.analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 32) : null;
  const [activeSampler, setActiveSampler] = useState(null);
  const elapsed = deck.isPlaying ? Math.floor(performance.now() / 1000) % 600 : 0;
  const keys = ['Am', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Bm', 'Ab'];
  const detectedKey = deck.isPlaying ? keys[Math.floor(deck.analyserData[10] / 32)] : null;

  const padModes = ['HOT CUE', 'BEAT LOOP', 'SLIP LOOP', 'BEAT JUMP'];

  return (
    <div className="flex-1 rounded-lg border p-2.5 flex flex-col gap-2 min-h-0 overflow-hidden" data-testid={`deck-panel-${deckId.toLowerCase()}`} style={{ background: 'linear-gradient(180deg, #131313, #0a0a0a)', borderColor: c + '25' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <div className="flex items-center justify-between gap-2">
        <button data-testid={`cue-btn-${deckId.toLowerCase()}`} className="px-3 py-1.5 rounded text-[9px] font-bold bg-[#FF6600]/25 text-[#FF6600] border border-[#FF6600]/40 hover:bg-[#FF6600]/35">CUE</button>
        <button data-testid={`play-pause-${deckId.toLowerCase()}`} onClick={deck.togglePlayPause} disabled={!deck.currentStation}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
          style={{ background: deck.isPlaying ? '#FF003C' : '#39FF14', boxShadow: `0 0 16px ${deck.isPlaying ? '#FF003C50' : '#39FF1450'}` }}>
          {deck.isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
        </button>
        <button data-testid={`sync-btn-${deckId.toLowerCase()}`} className="px-3 py-1.5 rounded text-[9px] font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 hover:bg-[#00F0FF]/25 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" />SYNC
        </button>
      </div>

      {/* Loop + Pitch */}
      <div className="flex gap-2">
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

      {/* Pad Mode Selector */}
      <div className="flex gap-1">
        {padModes.map(mode => (
          <button key={mode} onClick={() => setPadMode(mode)}
            className={`flex-1 py-1 rounded text-[7px] font-mono font-bold transition-all ${padMode === mode ? 'text-black' : 'bg-white/5 text-white/35 hover:bg-white/10'}`}
            style={padMode === mode ? { background: c, boxShadow: `0 0 8px ${c}50` } : {}}>
            {mode}
          </button>
        ))}
      </div>

      {/* Pads */}
      <div className="grid grid-cols-4 gap-1 flex-1 min-h-0">
        {[1,2,3,4,5,6,7,8].map(n => (
          <button key={n} data-testid={`pad-${n}-${deckId.toLowerCase()}`}
            onClick={() => setActivePads(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n])}
            className="rounded text-xs font-bold transition-all flex items-center justify-center"
            style={{ background: activePads.includes(n) ? '#3a3a3a' : '#151515', border: `1px solid ${activePads.includes(n) ? '#555' : '#252525'}`, color: activePads.includes(n) ? '#fff' : '#444' }}>
            {n}
          </button>
        ))}
      </div>

      {/* FX Rack */}
      <div className="py-1.5 px-2 rounded bg-black/25 shrink-0">
        <span className="text-[7px] text-white/30 block mb-0.5">FX RACK</span>
        <div className="flex justify-around">
          <Knob label="ECHO" value={0} color="#FFD700" size={28} />
          <Knob label="REVERB" value={0} color="#FF6600" size={28} />
          <Knob label="FILTER" value={50} color="#9900FF" size={28} />
          <Knob label="DRY/WET" value={50} color="#39FF14" size={28} />
        </div>
      </div>

      {/* Sampler */}
      <div className="shrink-0">
        <span className="text-[6px] text-white/25 block mb-0.5">SAMPLER</span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 1, label: 'HORN', color: '#FF6600' },
            { id: 2, label: 'SIREN', color: '#FF003C' },
            { id: 3, label: 'DROP', color: '#9900FF' },
            { id: 4, label: 'AIRHORN', color: '#FFD700' },
          ].map(s => (
            <button
              key={s.id}
              data-testid={`sampler-${s.id}-${deckId.toLowerCase()}`}
              onClick={() => setActiveSampler(activeSampler === s.id ? null : s.id)}
              className="py-1.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: activeSampler === s.id ? s.color + '40' : '#111',
                border: `1px solid ${activeSampler === s.id ? s.color : '#222'}`,
                color: activeSampler === s.id ? s.color : '#3a3a3a',
                boxShadow: activeSampler === s.id ? `0 0 8px ${s.color}30` : 'none',
              }}
            >
              {s.label}
            </button>
          ))}
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
    </div>
  );
};

/* ======= MAIN APP ======= */
function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState('A');
  const [crossfade, setCrossfade] = useState(0);
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);

  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');
  const recorder = useRecorder();

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
    <div className="h-screen flex flex-col overflow-hidden bg-[#080808] text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-1.5 bg-black/80 border-b border-white/8 shrink-0" data-testid="app-header">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-[#00F0FF]" />
          <Disc3 className="w-5 h-5 text-[#FF003C] -ml-3" />
          <span className="font-['Orbitron'] text-sm tracking-wider">CYBERDECK</span>
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
          <StationBrowser onSelectStation={handleStation} currentStation={(activeDeck === 'A' ? deckA : deckB).currentStation} isOpen={isStationBrowserOpen} onOpenChange={setIsStationBrowserOpen} />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 px-3 py-3 gap-3">
        {/* TOP ROW: Turntables + Visualizer + Crossfader */}
        <div className="shrink-0 flex items-center justify-center gap-6">
          <VinylTurntable isPlaying={deckA.isPlaying} analyserData={deckA.analyserData} deckId="A" currentStation={deckA.currentStation} rotation={rotationA} />
          <div className="flex-1 max-w-[520px] flex flex-col items-stretch justify-center" style={{ height: 190 }}>
            <SpectrumVisualizer deckAData={deckA.analyserData} deckBData={deckB.analyserData} isPlayingA={deckA.isPlaying} isPlayingB={deckB.isPlaying} />
            <div>
              <Crossfader value={crossfade} onChange={setCrossfade} />
            </div>
          </div>
          <VinylTurntable isPlaying={deckB.isPlaying} analyserData={deckB.analyserData} deckId="B" currentStation={deckB.currentStation} rotation={rotationB} />
        </div>

        {/* BOTTOM ROW: Deck A | Center Mixer | Deck B */}
        <div className="flex-1 flex gap-2 min-h-0">
          <DeckPanel deck={deckA} deckId="A" />
          <CenterMixer deckA={deckA} deckB={deckB} />
          <DeckPanel deck={deckB} deckId="B" />
        </div>
      </div>

      {/* Empty state */}
      {!deckA.currentStation && !deckB.currentStation && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <button data-testid="load-station-btn" onClick={() => setIsStationBrowserOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00F0FF]/20 to-[#FF003C]/20 border border-white/20 hover:border-white/40 text-sm font-['Orbitron'] tracking-wide">
            LOAD A STATION TO BEGIN
          </button>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
