import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Keyboard, Radio, Play, Pause, RotateCcw, Zap, Lock, Unlock } from "lucide-react";
import { StationBrowser } from "./components/StationBrowser";
import { useAudioDeck } from "./hooks/useAudioDeck";
import { useRecorder } from "./hooks/useRecorder";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// ============== HUGE JOG WHEEL ==============
const HugeJogWheel = ({ isPlaying, analyserData, deckId, rotation }) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const bassLevel = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;

  return (
    <div className="relative" style={{ width: '280px', height: '280px' }}>
      {/* Outer housing - dark metallic */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a)',
          boxShadow: `inset 0 0 50px rgba(0,0,0,0.8), 0 0 ${isPlaying ? 40 : 20}px ${deckColor}30`,
        }}
      />
      
      {/* Outer LED ring */}
      <div 
        className="absolute inset-2 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${deckColor}40, ${deckColor}80, ${deckColor}40, ${deckColor}80, ${deckColor}40)`,
          opacity: isPlaying ? 0.8 : 0.3,
          filter: 'blur(3px)',
        }}
      />

      {/* Main platter */}
      <div 
        className="absolute inset-4 rounded-full"
        style={{
          background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
          boxShadow: 'inset 0 2px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Rotating vinyl part */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{ rotate: rotation }}
        >
          {/* Vinyl grooves */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{ 
                inset: `${i * 4}%`,
                borderColor: `rgba(255,255,255,${0.02 + (i % 3) * 0.01})`,
              }}
            />
          ))}
          
          {/* Rainbow center - Pioneer style */}
          <div 
            className="absolute rounded-full overflow-hidden"
            style={{
              inset: '25%',
              background: `conic-gradient(from ${rotation}deg, 
                #FF0044, #FF6600, #FFDD00, #00FF44, 
                #00DDFF, #0066FF, #AA00FF, #FF0044
              )`,
              boxShadow: `0 0 30px ${deckColor}40`,
            }}
          >
            {/* Center black circle */}
            <div 
              className="absolute rounded-full bg-black flex items-center justify-center"
              style={{ inset: '30%' }}
            >
              <span className="text-2xl font-['Orbitron'] font-bold text-white/90">{deckId}</span>
            </div>
          </div>
          
          {/* Position marker */}
          <div 
            className="absolute top-3 left-1/2 w-2 h-6 -translate-x-1/2 rounded-full"
            style={{ background: deckColor, boxShadow: `0 0 10px ${deckColor}` }}
          />
        </motion.div>
      </div>

      {/* Edge LEDs */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * 360;
        const isActive = isPlaying && analyserData[i * 5] > 100;
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateY(-135px) translateX(-50%)`,
              background: isActive ? deckColor : '#222',
              boxShadow: isActive ? `0 0 8px ${deckColor}` : 'none',
              transition: 'all 0.1s',
            }}
          />
        );
      })}
    </div>
  );
};

// ============== PERFORMANCE PADS ==============
const PerformancePads = ({ deckId }) => {
  const [activePads, setActivePads] = useState([]);
  const [mode, setMode] = useState('HOT CUE');
  
  // Pioneer colors: Red, Yellow/Orange top row; Blue, Green bottom row (repeated)
  const padColors = [
    '#FF0044', '#FFAA00', '#00AAFF', '#00FF44',
    '#FF0044', '#FFAA00', '#00AAFF', '#00FF44',
  ];
  
  const modes = ['HOT CUE', 'BEAT LOOP', 'SLIP LOOP', 'BEAT JUMP'];

  return (
    <div className="space-y-2">
      {/* Mode buttons */}
      <div className="flex gap-1">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-[8px] font-bold rounded transition-all ${
              mode === m ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      
      {/* 4x2 Pad Grid */}
      <div className="grid grid-cols-4 gap-2">
        {padColors.map((color, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActivePads(prev => 
              prev.includes(i) ? prev.filter(p => p !== i) : [...prev, i]
            )}
            className="aspect-square rounded-lg text-lg font-bold transition-all"
            style={{
              background: activePads.includes(i) ? color : `${color}40`,
              boxShadow: activePads.includes(i) 
                ? `0 0 25px ${color}, inset 0 0 20px ${color}60` 
                : `inset 0 2px 10px rgba(0,0,0,0.5)`,
              border: `2px solid ${color}`,
              color: activePads.includes(i) ? '#fff' : `${color}`,
            }}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ============== TRANSPORT CONTROLS ==============
const TransportControls = ({ isPlaying, isLoading, onPlay, onCue, disabled }) => {
  const [cueActive, setCueActive] = useState(false);
  
  return (
    <div className="flex items-center gap-3">
      {/* CUE Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onMouseDown={() => setCueActive(true)}
        onMouseUp={() => setCueActive(false)}
        onMouseLeave={() => setCueActive(false)}
        disabled={disabled}
        className="relative w-16 h-16 rounded-full disabled:opacity-50"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: cueActive 
            ? '0 0 30px rgba(57,255,20,0.5), inset 0 0 20px rgba(57,255,20,0.3)'
            : 'inset 0 2px 15px rgba(0,0,0,0.5)',
        }}
      >
        <div 
          className="absolute inset-1.5 rounded-full flex items-center justify-center"
          style={{
            border: `3px solid ${cueActive ? '#39FF14' : '#39FF1450'}`,
            boxShadow: cueActive ? '0 0 20px #39FF14' : 'none',
          }}
        >
          <span className="text-xs font-bold text-white/80">CUE</span>
        </div>
      </motion.button>

      {/* PLAY Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onPlay}
        disabled={disabled || isLoading}
        className="relative w-16 h-16 rounded-full disabled:opacity-50"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: isPlaying 
            ? '0 0 30px rgba(57,255,20,0.5), inset 0 0 20px rgba(57,255,20,0.3)'
            : 'inset 0 2px 15px rgba(0,0,0,0.5)',
        }}
      >
        <div 
          className="absolute inset-1.5 rounded-full flex items-center justify-center"
          style={{
            border: `3px solid ${isPlaying ? '#39FF14' : '#39FF1450'}`,
            boxShadow: isPlaying ? '0 0 20px #39FF14' : 'none',
          }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white/80" />
          ) : (
            <Play className="w-5 h-5 text-white/80 ml-0.5" />
          )}
        </div>
      </motion.button>
    </div>
  );
};

// ============== MIXER KNOB ==============
const MixerKnob = ({ label, value, onChange, color = '#fff', size = 50 }) => {
  const rotation = (value * 270) - 135;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-mono text-white/50 uppercase">{label}</span>
      <div 
        className="relative rounded-full cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Knob body */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #444, #222)',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3), 0 2px 5px rgba(0,0,0,0.3)',
          }}
        />
        {/* Indicator */}
        <div 
          className="absolute top-2 left-1/2 w-1 h-3 -translate-x-1/2 rounded-full"
          style={{ 
            background: color,
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: `50% ${size/2 - 8}px`,
            boxShadow: `0 0 5px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

// ============== CHANNEL STRIP ==============
const ChannelStrip = ({ deckId, volume, high, mid, low, analyserData, isPlaying, onVolumeChange }) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const level = isPlaying ? analyserData.reduce((a, b) => a + b, 0) / analyserData.length / 255 : 0;
  
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-black/40 rounded-lg border border-white/10">
      <span className="text-[10px] font-['Orbitron'] font-bold" style={{ color: deckColor }}>
        CH {deckId === 'A' ? '1' : '2'}
      </span>
      
      <MixerKnob label="TRIM" value={0.5} color="#fff" size={40} />
      <MixerKnob label="HI" value={0.5 + high/2} color="#fff" size={35} />
      <MixerKnob label="MID" value={0.5 + mid/2} color="#fff" size={35} />
      <MixerKnob label="LOW" value={0.5 + low/2} color="#fff" size={35} />
      <MixerKnob label="COLOR" value={0.5} color="#FFD700" size={35} />
      
      {/* VU Meter + Fader */}
      <div className="flex items-end gap-2">
        {/* VU Meter */}
        <div className="flex flex-col-reverse gap-0.5 p-1 bg-black/50 rounded">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-1.5 rounded-sm"
              style={{
                background: level > i/12 
                  ? i < 7 ? '#39FF14' : i < 10 ? '#FFD700' : '#FF003C'
                  : '#222',
                boxShadow: level > i/12 ? `0 0 4px ${i < 7 ? '#39FF14' : i < 10 ? '#FFD700' : '#FF003C'}` : 'none',
              }}
            />
          ))}
        </div>
        
        {/* Fader */}
        <div className="relative w-6 h-32 bg-black/50 rounded border border-white/10">
          <div 
            className="absolute bottom-0 left-0 right-0 rounded-b"
            style={{ 
              height: `${volume * 100}%`,
              background: `linear-gradient(to top, ${deckColor}40, ${deckColor}20)`,
            }}
          />
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-8 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded shadow-lg"
            style={{ bottom: `${volume * 85}%` }}
          >
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 space-y-0.5">
              <div className="h-px bg-white/40" />
              <div className="h-px bg-white/40" />
            </div>
          </div>
        </div>
      </div>
      
      {/* CUE Button */}
      <button className="w-full py-1.5 rounded text-[10px] font-bold bg-[#FF6600]/40 text-[#FF6600] border border-[#FF6600]/50 hover:bg-[#FF6600]/60">
        CUE
      </button>
    </div>
  );
};

// ============== MAIN APP ==============
function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeDeck, setActiveDeck] = useState('A');
  const [crossfade, setCrossfade] = useState(0);
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);

  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');
  const recorder = useRecorder();

  const getActiveDeck = () => activeDeck === 'A' ? deckA : deckB;

  // Rotation animation
  useEffect(() => {
    let animFrame;
    let lastTime = performance.now();
    
    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      
      if (deckA.isPlaying) {
        setRotationA(prev => (prev + 180 * delta) % 360);
      }
      if (deckB.isPlaying) {
        setRotationB(prev => (prev + 180 * delta) % 360);
      }
      
      animFrame = requestAnimationFrame(animate);
    };
    
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [deckA.isPlaying, deckB.isPlaying]);

  // Hide intro
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); getActiveDeck().togglePlayPause(); break;
        case 'a': setActiveDeck('A'); break;
        case 'b': setActiveDeck('B'); break;
        case 'q': deckA.togglePlayPause(); break;
        case 'w': deckB.togglePlayPause(); break;
        case 's': setIsStationBrowserOpen(true); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [deckA, deckB, activeDeck]);

  const handleSelectStation = async (station) => {
    const deck = getActiveDeck();
    try {
      await deck.playStation(station);
      toast.success(`Deck ${activeDeck}: ${station.name}`);
    } catch (err) {
      toast.error("Failed to play station");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <div className="flex gap-4">
              <Disc3 className="w-12 h-12 text-[#00F0FF] animate-spin" />
              <Disc3 className="w-12 h-12 text-[#FF003C] animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Screen Display */}
      <div className="bg-black border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-[#00F0FF]" />
              <span className="font-['Orbitron'] text-sm">CYBERDECK DJ</span>
            </div>
            
            {/* Now Playing */}
            <div className="flex items-center gap-3">
              {deckA.currentStation && (
                <div className="px-3 py-1 rounded bg-[#00F0FF]/20 border border-[#00F0FF]/40">
                  <span className="text-[10px] text-[#00F0FF]">A: {deckA.currentStation.name}</span>
                </div>
              )}
              {deckB.currentStation && (
                <div className="px-3 py-1 rounded bg-[#FF003C]/20 border border-[#FF003C]/40">
                  <span className="text-[10px] text-[#FF003C]">B: {deckB.currentStation.name}</span>
                </div>
              )}
            </div>
            
            <StationBrowser
              onSelectStation={handleSelectStation}
              currentStation={getActiveDeck().currentStation}
              isOpen={isStationBrowserOpen}
              onOpenChange={setIsStationBrowserOpen}
            />
          </div>
          
          {/* Waveform Display */}
          <div className="grid grid-cols-2 gap-4">
            {[{ deck: deckA, id: 'A', color: '#FF8800' }, { deck: deckB, id: 'B', color: '#00AAFF' }].map(({ deck, id, color }) => (
              <div key={id} className="bg-[#111] rounded border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-black/50 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-['Orbitron']" style={{ color }}>{id}</span>
                    <span className="text-[10px] text-white/60 truncate max-w-[100px]">
                      {deck.currentStation?.name || 'NO TRACK'}
                    </span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-black/50">
                    <span className="text-lg font-['Orbitron'] font-bold" style={{ color }}>
                      {deck.isPlaying ? Math.floor(85 + deck.analyserData.slice(0,8).reduce((a,b)=>a+b,0)/32) : 128}
                    </span>
                    <span className="text-[8px] text-white/40 ml-1">BPM</span>
                  </div>
                </div>
                <div className="h-16 relative">
                  {/* Waveform bars */}
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-2">
                    {deck.waveformData.slice(0, 64).map((v, i) => {
                      const height = Math.abs(v - 128) / 128 * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1"
                          style={{
                            height: `${Math.max(5, height)}%`,
                            background: color,
                            opacity: deck.isPlaying ? 0.8 : 0.3,
                          }}
                        />
                      );
                    })}
                  </div>
                  {/* Playhead */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white" />
                </div>
                {/* Beat markers */}
                <div className="flex h-2">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-white/10"
                      style={{ background: i % 4 === 0 ? `${color}40` : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Controller */}
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
            
            {/* ============ DECK A ============ */}
            <div 
              className={`p-4 rounded-xl bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border transition-all cursor-pointer ${
                activeDeck === 'A' ? 'border-[#00F0FF]/50 shadow-[0_0_30px_#00F0FF20]' : 'border-white/10'
              }`}
              onClick={() => setActiveDeck('A')}
            >
              {/* Top controls row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">SLIP</button>
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-[#FF6600] text-white">QUANTIZE</button>
                </div>
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white text-black">VINYL</button>
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">CDJ</button>
                </div>
              </div>

              {/* Loop controls */}
              <div className="flex items-center gap-1 mb-4 p-2 rounded bg-black/40 border border-white/5">
                <button className="p-1.5 rounded bg-white/10 text-white/60"><RotateCcw className="w-3 h-3" /></button>
                {[1, 2, 4, 8, 16, 32].map(n => (
                  <button key={n} className="flex-1 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">{n}</button>
                ))}
                <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">IN</button>
                <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">OUT</button>
              </div>

              {/* Main section: Tempo + Jog + Transport */}
              <div className="flex items-center gap-4">
                {/* Left - Sync + Tempo */}
                <div className="flex flex-col items-center gap-2">
                  <button className="px-3 py-2 rounded text-[9px] font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF]">
                    <Zap className="w-3 h-3 inline mr-1" />SYNC
                  </button>
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> KEY
                  </button>
                  <div className="text-[8px] text-white/40">TEMPO</div>
                  <div className="w-4 h-24 bg-black/50 rounded relative border border-white/10">
                    <div className="absolute left-1/2 -translate-x-1/2 w-6 h-3 bg-gray-400 rounded" style={{ top: '45%' }} />
                  </div>
                  <span className="text-[10px] text-[#00F0FF]">0.0%</span>
                </div>

                {/* Center - Jog Wheel */}
                <HugeJogWheel 
                  isPlaying={deckA.isPlaying}
                  analyserData={deckA.analyserData}
                  deckId="A"
                  rotation={rotationA}
                />

                {/* Right - Transport */}
                <div className="flex flex-col items-center gap-3">
                  <button className="px-3 py-1 text-[8px] font-mono rounded bg-[#FF003C]/30 text-[#FF003C] border border-[#FF003C]/50">REV</button>
                  <TransportControls
                    isPlaying={deckA.isPlaying}
                    isLoading={deckA.isLoading}
                    onPlay={deckA.togglePlayPause}
                    disabled={!deckA.currentStation}
                  />
                </div>
              </div>

              {/* Performance Pads */}
              <div className="mt-4">
                <PerformancePads deckId="A" />
              </div>
            </div>

            {/* ============ CENTER MIXER ============ */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-white/10">
              {/* Master controls */}
              <div className="flex justify-center gap-4 mb-4">
                <MixerKnob label="MASTER" value={0.8} color="#FF003C" size={45} />
                <MixerKnob label="BOOTH" value={0.5} color="#FF6600" size={45} />
              </div>
              
              {/* FX Buttons */}
              <div className="flex gap-1 mb-4">
                {['SPACE', 'FILTER', 'CRUSH', 'NOISE'].map(fx => (
                  <button key={fx} className="flex-1 py-1 text-[7px] font-mono bg-white/10 hover:bg-white/20 rounded text-white/60">
                    {fx}
                  </button>
                ))}
              </div>
              
              {/* Channel Strips */}
              <div className="flex gap-3">
                <ChannelStrip
                  deckId="A"
                  volume={deckA.volume}
                  high={deckA.treble}
                  mid={deckA.mid || 0}
                  low={deckA.bass}
                  analyserData={deckA.analyserData}
                  isPlaying={deckA.isPlaying}
                  onVolumeChange={deckA.updateVolume}
                />
                <ChannelStrip
                  deckId="B"
                  volume={deckB.volume}
                  high={deckB.treble}
                  mid={deckB.mid || 0}
                  low={deckB.bass}
                  analyserData={deckB.analyserData}
                  isPlaying={deckB.isPlaying}
                  onVolumeChange={deckB.updateVolume}
                />
              </div>
              
              {/* Crossfader */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-[8px] text-white/40 mb-1">
                  <span>A</span>
                  <span>CROSSFADER</span>
                  <span>B</span>
                </div>
                <div className="relative h-6 bg-black/50 rounded">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-12 h-5 bg-gradient-to-b from-gray-400 to-gray-600 rounded cursor-grab"
                    style={{ left: `calc(${(crossfade + 1) / 2 * 100}% - 24px)` }}
                  />
                </div>
              </div>
              
              {/* Headphones */}
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-center gap-4">
                <MixerKnob label="MIX" value={0.5} color="#00F0FF" size={35} />
                <MixerKnob label="LEVEL" value={0.7} color="#00F0FF" size={35} />
              </div>
            </div>

            {/* ============ DECK B ============ */}
            <div 
              className={`p-4 rounded-xl bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border transition-all cursor-pointer ${
                activeDeck === 'B' ? 'border-[#FF003C]/50 shadow-[0_0_30px_#FF003C20]' : 'border-white/10'
              }`}
              onClick={() => setActiveDeck('B')}
            >
              {/* Top controls row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">SLIP</button>
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-[#FF6600] text-white">QUANTIZE</button>
                </div>
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white text-black">VINYL</button>
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">CDJ</button>
                </div>
              </div>

              {/* Loop controls */}
              <div className="flex items-center gap-1 mb-4 p-2 rounded bg-black/40 border border-white/5">
                <button className="p-1.5 rounded bg-white/10 text-white/60"><RotateCcw className="w-3 h-3" /></button>
                {[1, 2, 4, 8, 16, 32].map(n => (
                  <button key={n} className="flex-1 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">{n}</button>
                ))}
                <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">IN</button>
                <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">OUT</button>
              </div>

              {/* Main section: Tempo + Jog + Transport */}
              <div className="flex items-center gap-4">
                {/* Left - Transport */}
                <div className="flex flex-col items-center gap-3">
                  <button className="px-3 py-1 text-[8px] font-mono rounded bg-[#FF003C]/30 text-[#FF003C] border border-[#FF003C]/50">REV</button>
                  <TransportControls
                    isPlaying={deckB.isPlaying}
                    isLoading={deckB.isLoading}
                    onPlay={deckB.togglePlayPause}
                    disabled={!deckB.currentStation}
                  />
                </div>

                {/* Center - Jog Wheel */}
                <HugeJogWheel 
                  isPlaying={deckB.isPlaying}
                  analyserData={deckB.analyserData}
                  deckId="B"
                  rotation={rotationB}
                />

                {/* Right - Sync + Tempo */}
                <div className="flex flex-col items-center gap-2">
                  <button className="px-3 py-2 rounded text-[9px] font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF]">
                    <Zap className="w-3 h-3 inline mr-1" />SYNC
                  </button>
                  <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> KEY
                  </button>
                  <div className="text-[8px] text-white/40">TEMPO</div>
                  <div className="w-4 h-24 bg-black/50 rounded relative border border-white/10">
                    <div className="absolute left-1/2 -translate-x-1/2 w-6 h-3 bg-gray-400 rounded" style={{ top: '45%' }} />
                  </div>
                  <span className="text-[10px] text-[#FF003C]">0.0%</span>
                </div>
              </div>

              {/* Performance Pads */}
              <div className="mt-4">
                <PerformancePads deckId="B" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!deckA.currentStation && !deckB.currentStation && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsStationBrowserOpen(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00F0FF]/20 to-[#FF003C]/20 border border-white/20"
          >
            LOAD A STATION TO BEGIN
          </button>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
