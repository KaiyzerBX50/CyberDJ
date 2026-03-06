import { useState } from 'react';
import { Play, Pause, SkipBack } from 'lucide-react';
import { motion } from 'framer-motion';

export const TransportButtons = ({ 
  isPlaying, 
  isLoading, 
  onPlay, 
  onCue, 
  deckId = 'A',
  disabled = false 
}) => {
  const [cuePressed, setCuePressed] = useState(false);
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';

  return (
    <div 
      className="flex items-center gap-2"
      data-testid={`transport-${deckId.toLowerCase()}`}
    >
      {/* CUE Button - Pioneer style green ring */}
      <motion.button
        data-testid={`cue-btn-${deckId.toLowerCase()}`}
        onMouseDown={() => { setCuePressed(true); onCue?.(); }}
        onMouseUp={() => setCuePressed(false)}
        onMouseLeave={() => setCuePressed(false)}
        whileTap={{ scale: 0.95 }}
        disabled={disabled}
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full disabled:opacity-50"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: cuePressed 
            ? `0 0 20px #39FF1480, inset 0 0 10px #39FF1440`
            : 'inset 0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        {/* Outer ring */}
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            border: `3px solid ${cuePressed ? '#39FF14' : '#39FF1460'}`,
            boxShadow: cuePressed ? `0 0 15px #39FF14, inset 0 0 15px #39FF1440` : 'none',
            transition: 'all 0.1s ease',
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white/80">
          CUE
        </span>
      </motion.button>

      {/* PLAY/PAUSE Button - Pioneer style green ring */}
      <motion.button
        data-testid={`play-btn-${deckId.toLowerCase()}`}
        onClick={onPlay}
        whileTap={{ scale: 0.95 }}
        disabled={disabled || isLoading}
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full disabled:opacity-50"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: isPlaying 
            ? `0 0 20px #39FF1480, inset 0 0 10px #39FF1440`
            : 'inset 0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        {/* Outer ring */}
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            border: `3px solid ${isPlaying ? '#39FF14' : '#39FF1460'}`,
            boxShadow: isPlaying ? `0 0 15px #39FF14, inset 0 0 15px #39FF1440` : 'none',
            transition: 'all 0.1s ease',
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white/80" />
          ) : (
            <Play className="w-5 h-5 text-white/80 ml-0.5" />
          )}
        </span>
      </motion.button>
    </div>
  );
};

export default TransportButtons;
