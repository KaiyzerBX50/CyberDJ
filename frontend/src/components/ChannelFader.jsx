import { motion } from 'framer-motion';

export const ChannelFader = ({ value = 0.75, onChange, deckId = 'A', label }) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  
  const handleChange = (e) => {
    onChange?.(parseFloat(e.target.value));
  };

  return (
    <div 
      className="flex flex-col items-center gap-1"
      data-testid={`channel-fader-${deckId.toLowerCase()}`}
    >
      {label && (
        <span className="text-[8px] font-mono text-white/50 uppercase tracking-wider">
          {label}
        </span>
      )}
      
      {/* Fader track */}
      <div 
        className="relative w-8 h-32 md:h-40 rounded-lg"
        style={{
          background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Track groove */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #333, #111)' }}
        />
        
        {/* Level fill */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bottom-4 w-1 rounded-full"
          style={{
            height: `${value * (100 - 25)}%`,
            background: `linear-gradient(to top, ${deckColor}, ${deckColor}80)`,
            boxShadow: `0 0 10px ${deckColor}50`,
          }}
        />
        
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 w-2 h-px bg-white/20"
            style={{ bottom: `${4 + tick * 0.72}%` }}
          />
        ))}
        
        {/* Fader knob */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-10 h-6 rounded cursor-grab active:cursor-grabbing"
          style={{
            bottom: `${value * 72 + 4}%`,
            transform: 'translateX(-50%) translateY(50%)',
            background: 'linear-gradient(to bottom, #555, #333)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Grip lines */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 space-y-0.5">
            <div className="h-px bg-white/30" />
            <div className="h-px bg-white/30" />
            <div className="h-px bg-white/30" />
          </div>
        </motion.div>
        
        {/* Invisible range input for interaction */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ 
            writingMode: 'bt-lr',
            WebkitAppearance: 'slider-vertical',
          }}
        />
      </div>
      
      {/* Value display */}
      <span 
        className="text-[10px] font-mono"
        style={{ color: deckColor }}
      >
        {Math.round(value * 100)}
      </span>
    </div>
  );
};

export default ChannelFader;
