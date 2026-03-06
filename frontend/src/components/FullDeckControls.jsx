import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Zap, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Knob } from './Knob';
import { VUMeter } from './VUMeter';

export const FullDeckControls = ({
  deckId = 'A',
  isPlaying,
  isLoading,
  volume,
  bass,
  mid,
  treble,
  echo,
  reverb,
  filter,
  pitch,
  analyserData,
  waveformData,
  onTogglePlay,
  onVolumeChange,
  onBassChange,
  onMidChange,
  onTrebleChange,
  onEchoChange,
  onReverbChange,
  onFilterChange,
  onPitchChange,
  currentStation,
  isActive,
  onActivate,
  onCue,
  onSync,
}) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const leftData = analyserData.filter((_, i) => i % 2 === 0);
  const rightData = analyserData.filter((_, i) => i % 2 === 1);
  
  // Local state for deck features
  const [bpm, setBpm] = useState(128);
  const [loopActive, setLoopActive] = useState(false);
  const [loopSize, setLoopSize] = useState(4);
  const [activeHotCue, setActiveHotCue] = useState(null);
  const [keyLock, setKeyLock] = useState(false);
  const [eqKill, setEqKill] = useState({ low: false, mid: false, high: false });
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const waveformCanvasRef = useRef(null);

  // Simulated BPM detection based on bass frequencies
  useEffect(() => {
    if (isPlaying && analyserData.length > 0) {
      const bassEnergy = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      // Simulate BPM variance based on energy
      const baseBpm = 85 + Math.floor(bassEnergy / 4);
      setBpm(Math.min(180, Math.max(70, baseBpm)));
    }
  }, [isPlaying, analyserData]);

  // Elapsed time counter
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Draw detailed waveform
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw waveform
    if (waveformData.length > 0) {
      ctx.strokeStyle = deckColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      const sliceWidth = width / waveformData.length;
      for (let i = 0; i < waveformData.length; i++) {
        const v = (waveformData[i] - 128) / 128;
        const y = (height / 2) + (v * height / 2 * 0.8);
        
        if (i === 0) {
          ctx.moveTo(0, y);
        } else {
          ctx.lineTo(i * sliceWidth, y);
        }
      }
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = deckColor;
      ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Playhead
      const playheadX = (elapsedTime % 60) / 60 * width;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [waveformData, deckColor, elapsedTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loopSizes = [1, 2, 4, 8, 16, 32];

  return (
    <div 
      className={`cyber-panel p-3 transition-all duration-300 cursor-pointer ${isActive ? 'ring-2' : ''}`}
      style={{ 
        borderColor: isActive ? deckColor : 'transparent',
        boxShadow: isActive ? `0 0 30px ${deckColor}30` : 'none'
      }}
      onClick={onActivate}
      data-testid={`full-deck-controls-${deckId.toLowerCase()}`}
    >
      {/* Header with deck info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ background: isPlaying ? deckColor : '#333', boxShadow: isPlaying ? `0 0 10px ${deckColor}` : 'none' }}
          />
          <span className="text-sm font-['Orbitron'] tracking-widest" style={{ color: deckColor }}>
            DECK {deckId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/40">
            {formatTime(elapsedTime)}
          </span>
          <div className="px-2 py-0.5 rounded bg-black/50 border border-white/10">
            <span className="text-lg font-['Orbitron'] font-bold" style={{ color: deckColor }}>
              {bpm}
            </span>
            <span className="text-[8px] text-white/40 ml-1">BPM</span>
          </div>
        </div>
      </div>

      {/* Station name */}
      <div className="text-xs font-['Rajdhani'] text-white/60 truncate mb-2 px-1">
        {currentStation?.name || 'NO SIGNAL'}
      </div>

      {/* Waveform display */}
      <div className="relative mb-3 rounded overflow-hidden border border-white/10">
        <canvas
          ref={waveformCanvasRef}
          width={400}
          height={60}
          className="w-full h-[60px]"
          data-testid={`waveform-${deckId.toLowerCase()}`}
        />
        {/* Beat markers */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-white/10"
              style={{
                background: i % 4 === 0 ? `${deckColor}40` : 'transparent'
              }}
            />
          ))}
        </div>
      </div>

      {/* Transport + Sync Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Cue Button */}
        <motion.button
          data-testid={`cue-btn-${deckId.toLowerCase()}`}
          onClick={(e) => { e.stopPropagation(); onCue?.(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 rounded text-[10px] font-mono font-bold bg-[#FF6600]/20 border border-[#FF6600]/50 text-[#FF6600] hover:bg-[#FF6600]/30"
        >
          CUE
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          data-testid={`play-pause-${deckId.toLowerCase()}`}
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
          disabled={isLoading || !currentStation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{
            background: isPlaying ? '#FF003C' : '#39FF14',
            boxShadow: `0 0 20px ${isPlaying ? 'rgba(255,0,60,0.5)' : 'rgba(57,255,20,0.5)'}`,
          }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-black ml-0.5" />
          )}
        </motion.button>

        {/* Sync Button */}
        <motion.button
          data-testid={`sync-btn-${deckId.toLowerCase()}`}
          onClick={(e) => { e.stopPropagation(); onSync?.(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 rounded text-[10px] font-mono font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/30"
        >
          <Zap className="w-3 h-3 inline mr-1" />
          SYNC
        </motion.button>
      </div>

      {/* Loop Controls */}
      <div className="flex items-center gap-1 mb-3 p-2 rounded bg-black/30 border border-white/5">
        <span className="text-[8px] font-mono text-white/40 mr-2">LOOP</span>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setLoopActive(!loopActive); }}
          whileTap={{ scale: 0.95 }}
          className={`px-2 py-1 rounded text-[9px] font-mono ${loopActive ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/60'}`}
          data-testid={`loop-toggle-${deckId.toLowerCase()}`}
        >
          <Repeat className="w-3 h-3" />
        </motion.button>
        {loopSizes.map(size => (
          <motion.button
            key={size}
            onClick={(e) => { e.stopPropagation(); setLoopSize(size); }}
            whileTap={{ scale: 0.95 }}
            className={`px-2 py-1 rounded text-[9px] font-mono ${loopSize === size && loopActive ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >
            {size}
          </motion.button>
        ))}
      </div>

      {/* Hot Cue Pads */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
          <motion.button
            key={num}
            data-testid={`hotcue-${num}-${deckId.toLowerCase()}`}
            onClick={(e) => { e.stopPropagation(); setActiveHotCue(activeHotCue === num ? null : num); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`py-2 rounded text-[10px] font-mono font-bold transition-all ${
              activeHotCue === num 
                ? 'text-black' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            style={{
              background: activeHotCue === num ? deckColor : undefined,
              boxShadow: activeHotCue === num ? `0 0 10px ${deckColor}` : 'none'
            }}
          >
            {num}
          </motion.button>
        ))}
      </div>

      {/* Pitch/Tempo Slider */}
      <div className="flex items-center gap-3 mb-3 p-2 rounded bg-black/30 border border-white/5">
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-mono text-white/40">PITCH</span>
          <motion.button
            onClick={(e) => { e.stopPropagation(); setKeyLock(!keyLock); }}
            whileTap={{ scale: 0.95 }}
            className={`p-1 rounded ${keyLock ? 'text-[#39FF14]' : 'text-white/40'}`}
            data-testid={`keylock-${deckId.toLowerCase()}`}
          >
            {keyLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </motion.button>
        </div>
        <div className="flex-1 relative h-8">
          <input
            type="range"
            min="-8"
            max="8"
            step="0.1"
            value={(pitch || 0) * 8}
            onChange={(e) => { onPitchChange?.(parseFloat(e.target.value) / 8); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-2 appearance-none bg-white/10 rounded cursor-pointer accent-cyan-400"
            style={{ accentColor: deckColor }}
            data-testid={`pitch-slider-${deckId.toLowerCase()}`}
          />
          <div className="absolute top-4 left-0 right-0 flex justify-between text-[7px] font-mono text-white/30">
            <span>-8%</span>
            <span>0</span>
            <span>+8%</span>
          </div>
        </div>
        <span className="text-xs font-mono w-12 text-right" style={{ color: deckColor }}>
          {((pitch || 0) * 8).toFixed(1)}%
        </span>
      </div>

      {/* EQ Section with Kill Switches */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-2 rounded bg-black/30 border border-white/5">
        <div className="text-center">
          <Knob
            label="HIGH"
            value={treble}
            onChange={onTrebleChange}
            min={-1}
            max={1}
            size={40}
            color="#39FF14"
            testId={`eq-high-${deckId.toLowerCase()}`}
          />
          <motion.button
            onClick={(e) => { e.stopPropagation(); setEqKill(prev => ({...prev, high: !prev.high})); }}
            whileTap={{ scale: 0.95 }}
            className={`mt-1 px-2 py-0.5 rounded text-[8px] font-mono ${eqKill.high ? 'bg-[#FF003C] text-white' : 'bg-white/10 text-white/40'}`}
          >
            KILL
          </motion.button>
        </div>
        <div className="text-center">
          <Knob
            label="MID"
            value={mid || 0}
            onChange={onMidChange}
            min={-1}
            max={1}
            size={40}
            color="#FFD700"
            testId={`eq-mid-${deckId.toLowerCase()}`}
          />
          <motion.button
            onClick={(e) => { e.stopPropagation(); setEqKill(prev => ({...prev, mid: !prev.mid})); }}
            whileTap={{ scale: 0.95 }}
            className={`mt-1 px-2 py-0.5 rounded text-[8px] font-mono ${eqKill.mid ? 'bg-[#FF003C] text-white' : 'bg-white/10 text-white/40'}`}
          >
            KILL
          </motion.button>
        </div>
        <div className="text-center">
          <Knob
            label="LOW"
            value={bass}
            onChange={onBassChange}
            min={-1}
            max={1}
            size={40}
            color="#FF003C"
            testId={`eq-low-${deckId.toLowerCase()}`}
          />
          <motion.button
            onClick={(e) => { e.stopPropagation(); setEqKill(prev => ({...prev, low: !prev.low})); }}
            whileTap={{ scale: 0.95 }}
            className={`mt-1 px-2 py-0.5 rounded text-[8px] font-mono ${eqKill.low ? 'bg-[#FF003C] text-white' : 'bg-white/10 text-white/40'}`}
          >
            KILL
          </motion.button>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* VU Meters */}
        <div className="flex gap-1">
          <VUMeter analyserData={leftData} isPlaying={isPlaying} label="L" />
          <VUMeter analyserData={rightData} isPlaying={isPlaying} label="R" />
        </div>

        {/* Volume + Gain */}
        <div className="flex items-end gap-3">
          <Knob
            label="GAIN"
            value={volume}
            onChange={onVolumeChange}
            min={0}
            max={1.5}
            size={50}
            color={deckColor}
            testId={`gain-${deckId.toLowerCase()}`}
          />
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-white/40 mb-1">VOL</span>
            <div className="w-3 h-20 bg-black/50 rounded-full relative overflow-hidden border border-white/10">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full"
                style={{ 
                  height: `${volume * 100 / 1.5}%`,
                  background: `linear-gradient(to top, ${deckColor}, ${deckColor}80)`,
                  boxShadow: `0 0 10px ${deckColor}50`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Effects Section */}
      <div className="p-2 rounded bg-black/30 border border-white/5">
        <div className="text-[8px] font-mono text-white/40 mb-2">FX RACK</div>
        <div className="flex items-end justify-center gap-4">
          <Knob
            label="ECHO"
            value={echo}
            onChange={onEchoChange}
            min={0}
            max={1}
            size={35}
            color="#FFD700"
            testId={`fx-echo-${deckId.toLowerCase()}`}
          />
          <Knob
            label="REVERB"
            value={reverb}
            onChange={onReverbChange}
            min={0}
            max={1}
            size={35}
            color="#FF6600"
            testId={`fx-reverb-${deckId.toLowerCase()}`}
          />
          <Knob
            label="FILTER"
            value={filter}
            onChange={onFilterChange}
            min={-1}
            max={1}
            size={35}
            color="#9900FF"
            testId={`fx-filter-${deckId.toLowerCase()}`}
          />
          <Knob
            label="DRY/WET"
            value={0.5}
            onChange={() => {}}
            min={0}
            max={1}
            size={35}
            color="#00FF88"
            testId={`fx-drywet-${deckId.toLowerCase()}`}
          />
        </div>
      </div>
    </div>
  );
};

export default FullDeckControls;
