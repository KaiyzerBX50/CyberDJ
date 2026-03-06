import { motion } from 'framer-motion';

export const Crossfader = ({ value, onChange }) => {
  // value: -1 = full deck A, 0 = center, 1 = full deck B
  const handleDrag = (e) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = (percentage * 2 - 1);
    onChange(Math.max(-1, Math.min(1, newValue)));
  };

  const handleMouseDown = (e) => {
    const handleMove = (moveEvent) => {
      const rect = e.currentTarget.parentElement.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const percentage = x / rect.width;
      const newValue = (percentage * 2 - 1);
      onChange(Math.max(-1, Math.min(1, newValue)));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // Calculate deck volumes based on crossfader position
  const deckAVolume = value <= 0 ? 1 : 1 - value;
  const deckBVolume = value >= 0 ? 1 : 1 + value;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="crossfader">
      {/* Deck indicators */}
      <div className="flex justify-between w-full text-[10px] font-mono">
        <span className="text-[#00F0FF]" style={{ opacity: 0.3 + deckAVolume * 0.7 }}>
          DECK A
        </span>
        <span className="text-white/40">CROSSFADE</span>
        <span className="text-[#FF003C]" style={{ opacity: 0.3 + deckBVolume * 0.7 }}>
          DECK B
        </span>
      </div>

      {/* Crossfader track */}
      <div 
        className="relative w-full h-8 rounded-lg cursor-pointer"
        style={{
          background: 'linear-gradient(to right, #00F0FF20, transparent 30%, transparent 70%, #FF003C20)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={handleDrag}
      >
        {/* Track groove */}
        <div 
          className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 rounded-full"
          style={{
            background: 'linear-gradient(to right, #00F0FF, #444 50%, #FF003C)',
          }}
        />

        {/* Center marker */}
        <div className="absolute top-1/2 left-1/2 w-0.5 h-4 -translate-x-1/2 -translate-y-1/2 bg-white/30" />

        {/* Fader knob */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-6 rounded cursor-grab active:cursor-grabbing"
          style={{
            left: `calc(${(value + 1) / 2 * 100}% - 20px)`,
            background: 'linear-gradient(to bottom, #444, #222)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
          }}
          onMouseDown={handleMouseDown}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Grip lines */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <div className="h-px bg-white/20" />
            <div className="h-px bg-white/20" />
            <div className="h-px bg-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Volume meters */}
      <div className="flex justify-between w-full px-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-3 rounded-sm transition-all duration-100"
              style={{
                background: i / 5 < deckAVolume ? '#00F0FF' : '#333',
                boxShadow: i / 5 < deckAVolume ? '0 0 6px #00F0FF' : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-3 rounded-sm transition-all duration-100"
              style={{
                background: i / 5 < deckBVolume ? '#FF003C' : '#333',
                boxShadow: i / 5 < deckBVolume ? '0 0 6px #FF003C' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Crossfader;
