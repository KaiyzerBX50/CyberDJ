import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { Knob } from './Knob';
import { VUMeter } from './VUMeter';
import { Button } from '../components/ui/button';

export const ControlPanel = ({
  isPlaying,
  isLoading,
  volume,
  bass,
  treble,
  analyserData,
  onTogglePlay,
  onVolumeChange,
  onBassChange,
  onTrebleChange,
  currentStation,
}) => {
  // Split analyser data for L/R VU meters (simulated stereo)
  const leftData = analyserData.filter((_, i) => i % 2 === 0);
  const rightData = analyserData.filter((_, i) => i % 2 === 1);

  return (
    <div 
      className="cyber-panel p-4 md:p-6"
      data-testid="control-panel"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`led ${isPlaying ? 'led-on' : 'led-off'}`} />
          <span className="text-xs font-mono tracking-[0.2em] text-white/50 uppercase">
            MIXER CONTROL
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#00F0FF]/60">
          {currentStation?.name?.substring(0, 20) || 'NO SIGNAL'}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {/* VU Meters - Left */}
        <div className="flex gap-2">
          <VUMeter analyserData={leftData} isPlaying={isPlaying} label="L" />
          <VUMeter analyserData={rightData} isPlaying={isPlaying} label="R" />
        </div>

        {/* Transport Controls */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase">
            TRANSPORT
          </span>
          <div className="flex items-center gap-3">
            <motion.button
              data-testid="play-pause-button"
              onClick={onTogglePlay}
              disabled={isLoading || !currentStation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                transition-all duration-300 disabled:opacity-50
                ${isPlaying 
                  ? 'bg-[#FF003C] shadow-[0_0_20px_rgba(255,0,60,0.5)]' 
                  : 'bg-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.5)]'
                }
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-black ml-1" />
              )}
            </motion.button>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {isPlaying ? 'PLAYING' : 'STOPPED'}
          </span>
        </div>

        {/* Knobs */}
        <div className="flex items-end gap-6">
          <Knob
            label="VOLUME"
            value={volume}
            onChange={onVolumeChange}
            min={0}
            max={1}
            size={70}
            color="#00F0FF"
            testId="knob-volume"
          />
          <Knob
            label="BASS"
            value={bass}
            onChange={onBassChange}
            min={-1}
            max={1}
            size={60}
            color="#FF003C"
            testId="knob-bass"
          />
          <Knob
            label="TREBLE"
            value={treble}
            onChange={onTrebleChange}
            min={-1}
            max={1}
            size={60}
            color="#39FF14"
            testId="knob-treble"
          />
        </div>

        {/* Additional LED indicators */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase text-center">
            SIGNAL
          </span>
          <div className="flex gap-1">
            {[...Array(8)].map((_, i) => {
              const threshold = (i + 1) * 32;
              const avgLevel = analyserData.reduce((a, b) => a + b, 0) / analyserData.length;
              const isActive = isPlaying && avgLevel > threshold;
              return (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-sm transition-all duration-75 ${
                    isActive 
                      ? i < 5 ? 'bg-[#39FF14]' : i < 7 ? 'bg-[#FFD700]' : 'bg-[#FF003C]'
                      : 'bg-white/10'
                  }`}
                  style={{
                    boxShadow: isActive 
                      ? `0 0 6px ${i < 5 ? '#39FF14' : i < 7 ? '#FFD700' : '#FF003C'}`
                      : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {volume > 0 ? (
              <Volume2 className="w-4 h-4 text-white/40" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#FF003C]" />
            )}
            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#00F0FF]"
                style={{ width: `${volume * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/30">
          CYBERDECK AUDIO v1.0
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
