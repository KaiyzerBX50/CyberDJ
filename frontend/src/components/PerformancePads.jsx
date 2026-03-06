import { useState } from 'react';
import { motion } from 'framer-motion';

// Pioneer-style colorful performance pads
const PAD_COLORS = [
  '#FF0044', // Red
  '#FFAA00', // Orange/Yellow
  '#00AAFF', // Blue
  '#00FF44', // Green
  '#FF0044', // Red
  '#FFAA00', // Orange/Yellow
  '#00AAFF', // Blue
  '#00FF44', // Green
];

const PAD_MODES = ['HOT CUE', 'BEAT LOOP', 'SLIP LOOP', 'BEAT JUMP'];

export const PerformancePads = ({ deckId = 'A', onPadTrigger, onModeChange }) => {
  const [activeMode, setActiveMode] = useState(0);
  const [activePads, setActivePads] = useState([]);
  const [pressedPad, setPressedPad] = useState(null);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    onModeChange?.(PAD_MODES[mode]);
  };

  const handlePadPress = (padIndex) => {
    setPressedPad(padIndex);
    
    if (activeMode === 0) { // Hot Cue mode - toggle
      setActivePads(prev => 
        prev.includes(padIndex) 
          ? prev.filter(p => p !== padIndex)
          : [...prev, padIndex]
      );
    }
    
    onPadTrigger?.(padIndex, PAD_MODES[activeMode]);
  };

  const handlePadRelease = () => {
    setPressedPad(null);
  };

  return (
    <div 
      className="space-y-2"
      data-testid={`performance-pads-${deckId.toLowerCase()}`}
    >
      {/* Mode selector buttons */}
      <div className="flex gap-1">
        {PAD_MODES.map((mode, i) => (
          <button
            key={mode}
            onClick={() => handleModeChange(i)}
            className={`
              flex-1 py-1 px-1 text-[7px] md:text-[8px] font-mono font-bold rounded
              transition-all duration-150
              ${activeMode === i 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
              }
            `}
            data-testid={`pad-mode-${mode.toLowerCase().replace(' ', '-')}-${deckId.toLowerCase()}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Performance pads grid - 2 rows of 4 */}
      <div className="grid grid-cols-4 gap-1.5">
        {[...Array(8)].map((_, i) => {
          const isActive = activePads.includes(i);
          const isPressed = pressedPad === i;
          const color = PAD_COLORS[i];
          
          return (
            <motion.button
              key={i}
              data-testid={`pad-${i + 1}-${deckId.toLowerCase()}`}
              onMouseDown={() => handlePadPress(i)}
              onMouseUp={handlePadRelease}
              onMouseLeave={handlePadRelease}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square rounded-md overflow-hidden"
              style={{
                background: isActive || isPressed 
                  ? color 
                  : `${color}30`,
                boxShadow: isActive || isPressed 
                  ? `0 0 20px ${color}, inset 0 0 20px ${color}50` 
                  : `inset 0 2px 10px rgba(0,0,0,0.5)`,
                border: `2px solid ${color}`,
                transition: 'all 0.1s ease',
              }}
            >
              {/* Pad number */}
              <span 
                className={`
                  absolute inset-0 flex items-center justify-center
                  text-sm md:text-base font-bold font-mono
                  ${isActive || isPressed ? 'text-white' : 'text-white/60'}
                `}
              >
                {i + 1}
              </span>
              
              {/* Active indicator dot */}
              {isActive && activeMode === 0 && (
                <div 
                  className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white"
                  style={{ boxShadow: '0 0 6px white' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PerformancePads;
