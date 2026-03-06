import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock, Unlock, RotateCcw } from 'lucide-react';
import { JogWheel } from './JogWheel';
import { PerformancePads } from './PerformancePads';
import { TransportButtons } from './TransportButtons';
import { WaveformDisplay } from './WaveformDisplay';
import { Knob } from './Knob';

export const PioneerDeck = ({
  deckId = 'A',
  isPlaying,
  isLoading,
  currentStation,
  volume,
  analyserData,
  waveformData,
  pitch,
  onTogglePlay,
  onPitchChange,
  onVolumeChange,
}) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const [bpm, setBpm] = useState(128);
  const [keyLock, setKeyLock] = useState(false);
  const [slipMode, setSlipMode] = useState(false);
  const [quantize, setQuantize] = useState(true);
  const [vinylMode, setVinylMode] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loopActive, setLoopActive] = useState(false);
  const [loopSize, setLoopSize] = useState(4);

  // Simulated BPM detection
  useEffect(() => {
    if (isPlaying && analyserData.length > 0) {
      const bassEnergy = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      const baseBpm = 85 + Math.floor(bassEnergy / 4);
      setBpm(Math.min(180, Math.max(70, baseBpm)));
    }
  }, [isPlaying, analyserData]);

  // Elapsed time counter
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div 
      className="flex flex-col gap-3 p-4 rounded-xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10"
      data-testid={`pioneer-deck-${deckId.toLowerCase()}`}
    >
      {/* Top section - Mode buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* SLIP */}
          <button
            onClick={() => setSlipMode(!slipMode)}
            className={`px-2 py-1 text-[8px] font-mono rounded ${slipMode ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/60'}`}
          >
            SLIP
          </button>
          {/* QUANTIZE */}
          <button
            onClick={() => setQuantize(!quantize)}
            className={`px-2 py-1 text-[8px] font-mono rounded ${quantize ? 'bg-[#FF6600] text-white' : 'bg-white/10 text-white/60'}`}
          >
            QUANTIZE
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          {/* VINYL MODE */}
          <button
            onClick={() => setVinylMode(!vinylMode)}
            className={`px-2 py-1 text-[8px] font-mono rounded ${vinylMode ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}
          >
            VINYL
          </button>
          {/* JOG MODE */}
          <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">
            CDJ
          </button>
        </div>
      </div>

      {/* Waveform display */}
      <WaveformDisplay
        waveformData={waveformData}
        analyserData={analyserData}
        isPlaying={isPlaying}
        deckId={deckId}
        bpm={bpm}
        currentTime={elapsedTime}
        trackName={currentStation?.name || 'NO SIGNAL'}
      />

      {/* Loop section */}
      <div className="flex items-center gap-2 p-2 rounded bg-black/30 border border-white/10">
        <span className="text-[8px] font-mono text-white/40">LOOP</span>
        <button
          onClick={() => setLoopActive(!loopActive)}
          className={`p-1.5 rounded ${loopActive ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/60'}`}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <div className="flex gap-1 flex-1">
          {[1, 2, 4, 8, 16, 32].map(size => (
            <button
              key={size}
              onClick={() => setLoopSize(size)}
              className={`flex-1 py-1 text-[8px] font-mono rounded ${loopSize === size && loopActive ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/60'}`}
            >
              {size}
            </button>
          ))}
        </div>
        <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">IN</button>
        <button className="px-2 py-1 text-[8px] font-mono rounded bg-white/10 text-white/60">OUT</button>
      </div>

      {/* Main deck area */}
      <div className="flex gap-4">
        {/* Left side - Tempo + Sync */}
        <div className="flex flex-col items-center gap-2">
          {/* BEAT SYNC */}
          <button
            className="px-3 py-2 rounded text-[9px] font-mono font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/30"
          >
            <Zap className="w-3 h-3 inline mr-1" />
            SYNC
          </button>
          
          {/* Master Tempo */}
          <button
            onClick={() => setKeyLock(!keyLock)}
            className={`px-2 py-1 text-[8px] font-mono rounded flex items-center gap-1 ${keyLock ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/60'}`}
          >
            {keyLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            KEY
          </button>

          {/* Tempo slider */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono text-white/40">TEMPO</span>
            <div className="relative w-6 h-32 bg-black/50 rounded border border-white/10">
              <input
                type="range"
                min="-8"
                max="8"
                step="0.1"
                value={(pitch || 0) * 8}
                onChange={(e) => onPitchChange?.(parseFloat(e.target.value) / 8)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
              />
              <div 
                className="absolute left-1/2 -translate-x-1/2 w-4 h-3 rounded bg-white/80"
                style={{ bottom: `${((pitch || 0) + 1) / 2 * 80 + 10}%` }}
              />
            </div>
            <span className="text-[10px] font-mono" style={{ color: deckColor }}>
              {((pitch || 0) * 8).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Center - Jog wheel */}
        <div className="flex-1 flex justify-center">
          <JogWheel
            isPlaying={isPlaying}
            analyserData={analyserData}
            deckId={deckId}
          />
        </div>

        {/* Right side - Transport + track controls */}
        <div className="flex flex-col items-center gap-3">
          {/* Track search */}
          <div className="flex gap-1">
            <button className="px-2 py-1 text-[7px] font-mono rounded bg-white/10 text-white/40">TRACK</button>
            <button className="px-2 py-1 text-[7px] font-mono rounded bg-white/10 text-white/40">SEARCH</button>
          </div>
          
          {/* Direction/REV */}
          <button className="px-3 py-1 text-[8px] font-mono rounded bg-[#FF003C]/30 text-[#FF003C] border border-[#FF003C]/50">
            REV
          </button>

          {/* Transport buttons */}
          <TransportButtons
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlay={onTogglePlay}
            deckId={deckId}
            disabled={!currentStation}
          />
        </div>
      </div>

      {/* Performance pads */}
      <PerformancePads deckId={deckId} />
    </div>
  );
};

export default PioneerDeck;
