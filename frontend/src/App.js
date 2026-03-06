import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Play, Pause, RotateCcw, Zap, Lock } from "lucide-react";
import { StationBrowser } from "./components/StationBrowser";
import { useAudioDeck } from "./hooks/useAudioDeck";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// Compact Jog Wheel
const JogWheel = ({ isPlaying, analyserData, deckId, rotation }) => {
  const color = deckId === 'A' ? '#00F0FF' : '#FF003C';
  return (
    <div className="relative" style={{ width: 180, height: 180 }}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(#1a1a1a, #080808)', boxShadow: `inset 0 0 30px #000, 0 0 ${isPlaying ? 20 : 5}px ${color}30` }} />
      <div className="absolute inset-1 rounded-full" style={{ background: `conic-gradient(${color}30, ${color}60, ${color}30)`, opacity: isPlaying ? 0.7 : 0.2, filter: 'blur(2px)' }} />
      <div className="absolute inset-2 rounded-full" style={{ background: '#111' }}>
        <motion.div className="absolute inset-2 rounded-full" style={{ rotate: rotation }}>
          {[...Array(15)].map((_, i) => <div key={i} className="absolute rounded-full border border-white/5" style={{ inset: `${i * 5}%` }} />)}
          <div className="absolute rounded-full" style={{ inset: '28%', background: `conic-gradient(from ${rotation}deg, #FF0044, #FF6600, #FFDD00, #00FF44, #00DDFF, #0066FF, #AA00FF, #FF0044)` }}>
            <div className="absolute rounded-full bg-black flex items-center justify-center" style={{ inset: '32%' }}>
              <span className="text-lg font-bold text-white/80">{deckId}</span>
            </div>
          </div>
          <div className="absolute top-1 left-1/2 w-1 h-4 -translate-x-1/2 rounded" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        </motion.div>
      </div>
      {[...Array(16)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full" style={{ top: '50%', left: '50%', transform: `rotate(${i * 22.5}deg) translateY(-87px)`, background: isPlaying && analyserData[i * 8] > 120 ? color : '#222', boxShadow: isPlaying && analyserData[i * 8] > 120 ? `0 0 4px ${color}` : 'none' }} />
      ))}
    </div>
  );
};

// Compact Knob
const Knob = ({ size = 28, color = '#888', value = 0.5 }) => (
  <div className="relative rounded-full" style={{ width: size, height: size, background: 'linear-gradient(145deg, #3a3a3a, #1a1a1a)', boxShadow: 'inset 0 1px 3px #000' }}>
    <div className="absolute top-1 left-1/2 w-0.5 h-2 -translate-x-1/2 rounded" style={{ background: color, transform: `translateX(-50%) rotate(${value * 270 - 135}deg)`, transformOrigin: `50% ${size/2 - 4}px` }} />
  </div>
);

// Compact Fader
const Fader = ({ value = 0.75, color, height = 80 }) => (
  <div className="relative rounded" style={{ width: 16, height, background: '#0a0a0a', border: '1px solid #222' }}>
    <div className="absolute bottom-0 left-0 right-0 rounded-b" style={{ height: `${value * 100}%`, background: `linear-gradient(to top, ${color}50, ${color}20)` }} />
    <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2.5 rounded bg-gradient-to-b from-gray-300 to-gray-500" style={{ bottom: `${value * 75}%` }} />
  </div>
);

// VU Meter
const VU = ({ level = 0 }) => (
  <div className="flex flex-col-reverse gap-px">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="w-1.5 h-1 rounded-sm" style={{ background: level > i/8 ? (i < 5 ? '#39FF14' : i < 7 ? '#FFD700' : '#FF003C') : '#1a1a1a' }} />
    ))}
  </div>
);

// Performance Pad
const Pad = ({ num, color, active, onClick }) => (
  <button onClick={onClick} className="aspect-square rounded text-xs font-bold transition-all" style={{ background: active ? color : `${color}30`, border: `1px solid ${color}`, color: active ? '#fff' : color, boxShadow: active ? `0 0 10px ${color}` : 'none' }}>
    {num}
  </button>
);

// Transport Button
const Transport = ({ isPlaying, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40" style={{ background: '#1a1a1a', border: `2px solid ${isPlaying ? '#39FF14' : '#39FF1450'}`, boxShadow: isPlaying ? '0 0 15px #39FF1450' : 'none' }}>
    {isPlaying ? <Pause className="w-4 h-4 text-white/80" /> : <Play className="w-4 h-4 text-white/80 ml-0.5" />}
  </button>
);

function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState('A');
  const [crossfade, setCrossfade] = useState(0);
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);
  const [activePadsA, setActivePadsA] = useState([]);
  const [activePadsB, setActivePadsB] = useState([]);

  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');

  const padColors = ['#FF0044', '#FFAA00', '#00AAFF', '#00FF44', '#FF0044', '#FFAA00', '#00AAFF', '#00FF44'];

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

  const levelA = deckA.isPlaying ? deckA.analyserData.reduce((a,b) => a+b, 0) / deckA.analyserData.length / 255 : 0;
  const levelB = deckB.isPlaying ? deckB.analyserData.reduce((a,b) => a+b, 0) / deckB.analyserData.length / 255 : 0;
  const bpmA = deckA.isPlaying ? Math.floor(85 + deckA.analyserData.slice(0,8).reduce((a,b)=>a+b,0)/32) : 128;
  const bpmB = deckB.isPlaying ? Math.floor(85 + deckB.analyserData.slice(0,8).reduce((a,b)=>a+b,0)/32) : 128;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black border-b border-white/10">
        <div className="flex items-center gap-2">
          <Disc3 className="w-4 h-4 text-[#00F0FF]" />
          <span className="text-xs font-['Orbitron']">CYBERDECK</span>
        </div>
        <div className="flex gap-2">
          {deckA.currentStation && <span className="text-[9px] px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF]">A: {deckA.currentStation.name?.slice(0,12)}</span>}
          {deckB.currentStation && <span className="text-[9px] px-2 py-0.5 rounded bg-[#FF003C]/20 text-[#FF003C]">B: {deckB.currentStation.name?.slice(0,12)}</span>}
        </div>
        <StationBrowser onSelectStation={handleStation} currentStation={(activeDeck === 'A' ? deckA : deckB).currentStation} isOpen={isStationBrowserOpen} onOpenChange={setIsStationBrowserOpen} />
      </div>

      {/* Waveforms */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-black">
        {[{ d: deckA, id: 'A', c: '#FF8800', bpm: bpmA }, { d: deckB, id: 'B', c: '#00AAFF', bpm: bpmB }].map(({ d, id, c, bpm }) => (
          <div key={id} className="bg-[#0a0a0a] rounded overflow-hidden border border-white/5">
            <div className="flex items-center justify-between px-2 py-1 bg-black/50">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold" style={{ color: c }}>{id}</span>
                <span className="text-[9px] text-white/50 truncate max-w-[80px]">{d.currentStation?.name || 'NO TRACK'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-['Orbitron'] font-bold" style={{ color: c }}>{bpm}</span>
                <span className="text-[7px] text-white/40">BPM</span>
              </div>
            </div>
            <div className="h-10 relative flex items-center justify-center gap-px px-1">
              {d.waveformData.slice(0, 80).map((v, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${Math.max(8, Math.abs(v - 128) / 128 * 100)}%`, background: c, opacity: d.isPlaying ? 0.7 : 0.2 }} />
              ))}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/80" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Controller */}
      <div className="flex-1 p-2">
        <div className="h-full rounded-lg bg-gradient-to-b from-[#151515] to-[#0a0a0a] border border-white/10 p-2">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 h-full">
            
            {/* DECK A */}
            <div className={`rounded-lg p-2 bg-black/40 border transition-all cursor-pointer ${activeDeck === 'A' ? 'border-[#00F0FF]/40' : 'border-transparent'}`} onClick={() => setActiveDeck('A')}>
              {/* Top row */}
              <div className="flex justify-between items-center mb-1">
                <div className="flex gap-0.5">
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white/10 text-white/50">SLIP</button>
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-[#FF6600] text-white">QTZ</button>
                </div>
                <div className="flex gap-0.5">
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white text-black">VNL</button>
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white/10 text-white/50">CDJ</button>
                </div>
              </div>
              
              {/* Loop */}
              <div className="flex gap-0.5 mb-2">
                <button className="p-1 rounded bg-white/10"><RotateCcw className="w-2.5 h-2.5 text-white/50" /></button>
                {[1,2,4,8,16,32].map(n => <button key={n} className="flex-1 py-0.5 text-[7px] rounded bg-white/10 text-white/50">{n}</button>)}
              </div>

              {/* Main area */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <button className="px-2 py-1 rounded text-[7px] font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF]"><Zap className="w-2.5 h-2.5 inline" /> SYNC</button>
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white/10 text-white/50 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />KEY</button>
                  <div className="w-3 h-16 bg-black/50 rounded relative mt-1">
                    <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2 bg-gray-400 rounded" style={{ top: '45%' }} />
                  </div>
                  <span className="text-[8px] text-[#00F0FF]">0.0%</span>
                </div>
                
                <JogWheel isPlaying={deckA.isPlaying} analyserData={deckA.analyserData} deckId="A" rotation={rotationA} />
                
                <div className="flex flex-col items-center gap-2">
                  <button className="px-2 py-0.5 text-[7px] rounded bg-[#FF003C]/30 text-[#FF003C] border border-[#FF003C]/40">REV</button>
                  <div className="flex gap-1.5">
                    <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1a1a1a', border: '2px solid #39FF1450' }}><span className="text-[8px] text-white/70">CUE</span></button>
                    <Transport isPlaying={deckA.isPlaying} onClick={deckA.togglePlayPause} disabled={!deckA.currentStation} />
                  </div>
                </div>
              </div>

              {/* Pads */}
              <div className="mt-2">
                <div className="flex gap-0.5 mb-1">
                  {['HOT CUE', 'BEAT LP', 'SLIP LP', 'BEAT JP'].map((m, i) => <button key={m} className={`flex-1 py-0.5 text-[6px] rounded ${i === 0 ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`}>{m}</button>)}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {padColors.map((c, i) => <Pad key={i} num={i+1} color={c} active={activePadsA.includes(i)} onClick={() => setActivePadsA(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])} />)}
                </div>
              </div>
            </div>

            {/* MIXER */}
            <div className="w-36 rounded-lg p-2 bg-black/40 border border-white/5">
              <div className="flex justify-center gap-3 mb-2">
                <div className="text-center"><span className="text-[6px] text-white/40 block">MASTER</span><Knob size={32} color="#FF003C" value={0.8} /></div>
                <div className="text-center"><span className="text-[6px] text-white/40 block">BOOTH</span><Knob size={32} color="#FF6600" value={0.5} /></div>
              </div>
              
              <div className="flex gap-0.5 mb-2">
                {['SPC', 'FLT', 'CRS', 'NSE'].map(f => <button key={f} className="flex-1 py-0.5 text-[6px] bg-white/10 text-white/40 rounded">{f}</button>)}
              </div>

              <div className="flex justify-center gap-3">
                {/* CH1 */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-bold text-[#00F0FF]">CH1</span>
                  {['TRM', 'HI', 'MID', 'LOW'].map(l => <div key={l} className="text-center"><span className="text-[5px] text-white/30 block">{l}</span><Knob size={22} /></div>)}
                  <div className="text-center"><span className="text-[5px] text-[#FFD700] block">CLR</span><Knob size={22} color="#FFD700" /></div>
                  <div className="flex gap-1 items-end mt-1">
                    <VU level={levelA} />
                    <Fader value={deckA.volume} color="#00F0FF" height={60} />
                  </div>
                  <button className="w-full py-0.5 mt-1 text-[7px] rounded bg-[#FF6600]/40 text-[#FF6600]">CUE</button>
                </div>

                {/* CH2 */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-bold text-[#FF003C]">CH2</span>
                  {['TRM', 'HI', 'MID', 'LOW'].map(l => <div key={l} className="text-center"><span className="text-[5px] text-white/30 block">{l}</span><Knob size={22} /></div>)}
                  <div className="text-center"><span className="text-[5px] text-[#FFD700] block">CLR</span><Knob size={22} color="#FFD700" /></div>
                  <div className="flex gap-1 items-end mt-1">
                    <VU level={levelB} />
                    <Fader value={deckB.volume} color="#FF003C" height={60} />
                  </div>
                  <button className="w-full py-0.5 mt-1 text-[7px] rounded bg-[#FF6600]/40 text-[#FF6600]">CUE</button>
                </div>
              </div>

              {/* Crossfader */}
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="flex justify-between text-[6px] text-white/30 mb-0.5"><span>A</span><span>B</span></div>
                <div className="relative h-4 bg-black/50 rounded">
                  <div className="absolute top-1/2 -translate-y-1/2 w-8 h-3 bg-gradient-to-b from-gray-300 to-gray-500 rounded cursor-grab" style={{ left: `calc(${(crossfade + 1) / 2 * 100}% - 16px)` }} />
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-2 pt-2 border-t border-white/10">
                <div className="text-center"><span className="text-[5px] text-white/30 block">MIX</span><Knob size={20} color="#00F0FF" /></div>
                <div className="text-center"><span className="text-[5px] text-white/30 block">LVL</span><Knob size={20} color="#00F0FF" /></div>
              </div>
            </div>

            {/* DECK B */}
            <div className={`rounded-lg p-2 bg-black/40 border transition-all cursor-pointer ${activeDeck === 'B' ? 'border-[#FF003C]/40' : 'border-transparent'}`} onClick={() => setActiveDeck('B')}>
              {/* Top row */}
              <div className="flex justify-between items-center mb-1">
                <div className="flex gap-0.5">
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white/10 text-white/50">SLIP</button>
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-[#FF6600] text-white">QTZ</button>
                </div>
                <div className="flex gap-0.5">
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white text-black">VNL</button>
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white/10 text-white/50">CDJ</button>
                </div>
              </div>
              
              {/* Loop */}
              <div className="flex gap-0.5 mb-2">
                <button className="p-1 rounded bg-white/10"><RotateCcw className="w-2.5 h-2.5 text-white/50" /></button>
                {[1,2,4,8,16,32].map(n => <button key={n} className="flex-1 py-0.5 text-[7px] rounded bg-white/10 text-white/50">{n}</button>)}
              </div>

              {/* Main area */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2">
                  <button className="px-2 py-0.5 text-[7px] rounded bg-[#FF003C]/30 text-[#FF003C] border border-[#FF003C]/40">REV</button>
                  <div className="flex gap-1.5">
                    <Transport isPlaying={deckB.isPlaying} onClick={deckB.togglePlayPause} disabled={!deckB.currentStation} />
                    <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1a1a1a', border: '2px solid #39FF1450' }}><span className="text-[8px] text-white/70">CUE</span></button>
                  </div>
                </div>
                
                <JogWheel isPlaying={deckB.isPlaying} analyserData={deckB.analyserData} deckId="B" rotation={rotationB} />
                
                <div className="flex flex-col items-center gap-1">
                  <button className="px-2 py-1 rounded text-[7px] font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF]"><Zap className="w-2.5 h-2.5 inline" /> SYNC</button>
                  <button className="px-1.5 py-0.5 text-[7px] rounded bg-white/10 text-white/50 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />KEY</button>
                  <div className="w-3 h-16 bg-black/50 rounded relative mt-1">
                    <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2 bg-gray-400 rounded" style={{ top: '45%' }} />
                  </div>
                  <span className="text-[8px] text-[#FF003C]">0.0%</span>
                </div>
              </div>

              {/* Pads */}
              <div className="mt-2">
                <div className="flex gap-0.5 mb-1">
                  {['HOT CUE', 'BEAT LP', 'SLIP LP', 'BEAT JP'].map((m, i) => <button key={m} className={`flex-1 py-0.5 text-[6px] rounded ${i === 0 ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`}>{m}</button>)}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {padColors.map((c, i) => <Pad key={i} num={i+1} color={c} active={activePadsB.includes(i)} onClick={() => setActivePadsB(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!deckA.currentStation && !deckB.currentStation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button onClick={() => setIsStationBrowserOpen(true)} className="px-4 py-2 text-sm rounded bg-white/10 border border-white/20 hover:bg-white/20">LOAD STATION</button>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
