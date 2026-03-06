import { Play, Pause, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Knob } from './Knob';
import { VUMeter } from './VUMeter';

export const DeckControls = ({
  deckId = 'A',
  isPlaying,
  isLoading,
  volume,
  bass,
  treble,
  echo,
  reverb,
  filter,
  analyserData,
  onTogglePlay,
  onVolumeChange,
  onBassChange,
  onTrebleChange,
  onEchoChange,
  onReverbChange,
  onFilterChange,
  currentStation,
  isActive,
  onActivate,
}) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const leftData = analyserData.filter((_, i) => i % 2 === 0);
  const rightData = analyserData.filter((_, i) => i % 2 === 1);

  return (
    <div 
      className={`cyber-panel p-3 md:p-4 transition-all duration-300 cursor-pointer ${isActive ? 'ring-2' : ''}`}
      style={{ 
        borderColor: isActive ? deckColor : 'transparent',
        boxShadow: isActive ? `0 0 20px ${deckColor}20` : 'none'
      }}
      onClick={onActivate}
      data-testid={`deck-controls-${deckId.toLowerCase()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ background: isPlaying ? deckColor : '#333' }}
          />
          <span 
            className="text-xs font-['Orbitron'] tracking-widest"
            style={{ color: deckColor }}
          >
            DECK {deckId}
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/40 truncate max-w-[80px]">
          {currentStation?.name?.substring(0, 12) || 'NO SIGNAL'}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* VU Meters */}
        <div className="flex gap-1 scale-90">
          <VUMeter analyserData={leftData} isPlaying={isPlaying} label="L" />
          <VUMeter analyserData={rightData} isPlaying={isPlaying} label="R" />
        </div>

        {/* Play button */}
        <motion.button
          data-testid={`play-pause-deck-${deckId.toLowerCase()}`}
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
          disabled={isLoading || !currentStation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{
            background: isPlaying ? '#FF003C' : '#39FF14',
            boxShadow: `0 0 15px ${isPlaying ? 'rgba(255,0,60,0.5)' : 'rgba(57,255,20,0.5)'}`,
          }}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-black ml-0.5" />
          )}
        </motion.button>

        {/* Main knobs */}
        <div className="flex items-end gap-2">
          <Knob
            label="VOL"
            value={volume}
            onChange={onVolumeChange}
            min={0}
            max={1}
            size={45}
            color={deckColor}
            testId={`knob-volume-${deckId.toLowerCase()}`}
          />
          <Knob
            label="BASS"
            value={bass}
            onChange={onBassChange}
            min={-1}
            max={1}
            size={40}
            color="#FF003C"
            testId={`knob-bass-${deckId.toLowerCase()}`}
          />
          <Knob
            label="TREB"
            value={treble}
            onChange={onTrebleChange}
            min={-1}
            max={1}
            size={40}
            color="#39FF14"
            testId={`knob-treble-${deckId.toLowerCase()}`}
          />
        </div>
      </div>

      {/* Effects row */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-mono tracking-widest text-white/40">FX</span>
        </div>
        <div className="flex items-end gap-3 justify-center">
          <Knob
            label="ECHO"
            value={echo}
            onChange={onEchoChange}
            min={0}
            max={1}
            size={35}
            color="#FFD700"
            testId={`knob-echo-${deckId.toLowerCase()}`}
          />
          <Knob
            label="REVERB"
            value={reverb}
            onChange={onReverbChange}
            min={0}
            max={1}
            size={35}
            color="#FF6600"
            testId={`knob-reverb-${deckId.toLowerCase()}`}
          />
          <Knob
            label="FILTER"
            value={filter}
            onChange={onFilterChange}
            min={-1}
            max={1}
            size={35}
            color="#9900FF"
            testId={`knob-filter-${deckId.toLowerCase()}`}
          />
        </div>
      </div>
    </div>
  );
};

export default DeckControls;
